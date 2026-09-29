#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {table} from './lib/format.mjs';
import {fields,relations,tableName} from './lib/entities.mjs';
import {reports,readReport} from './lib/reports.mjs';
import {importElvanto,exportAll} from './lib/transfer.mjs';
export {readReport};
export async function resolve(db,entity,value){
 const t=tableName(entity); if(typeof value!=='string'||!value.trim())throw Error(`${entity}: provide a name or ID`);
 const q=value.trim(); const label=fields[entity].includes('name')?'name':fields[entity].includes('title')?'title':'id::text';
 const exact=await db.query(`select id,${label} name from ${t} where id::text=$1 or lower(${label})=lower($1) order by id`,[q]);
 const rows=exact.length?exact:await db.query(`select id,${label} name from ${t} where left(id::text,length($1))=$1 or position(lower($1) in lower(${label}))>0 order by id`,[q]);
 if(rows.length!==1)throw Error(`${entity}: ${rows.length?'ambiguous':'no match'} for ${q}\n${rows.map(r=>`${r.id} ${r.name}`).join('\n')}`);return rows[0].id;
}
export async function writeRecord(db,op,entity,value,selector){
 const t=tableName(entity);if(!['add','update'].includes(op))throw Error('Choose add or update');
 if(op==='update'&&['giving','checks','notes'].includes(entity))throw Error(`${entity} is append-only; preserve evidence with a reviewed correction migration`);
 if(!value||typeof value!=='object'||Array.isArray(value)||!Object.keys(value).length)throw Error('Provide a nonempty JSON object');
 const data={...value};for(const [key,v] of Object.entries(data)){
  if(!fields[entity].includes(key))throw Error(`Unknown ${entity} field ${key}; allowed: ${fields[entity].join(', ')}`);
  if(relations[key]&&v!==null)data[key]=await resolve(db,relations[key],v);
  if(['is_child','contact_allowed','safeguarding_required','present','gift','tax_eligible'].includes(key)&&typeof v!=='boolean')throw Error(`${key} must be a boolean`);
  if(key.endsWith('_on')||key==='service_date'){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`${key} must be an ISO calendar date`);}
  if(['amount_cents','minutes','position','capacity'].includes(key)&&(!Number.isSafeInteger(v)||v<=0))throw Error(`${key} must be a positive integer`);
 }
 if(entity==='checks'&&data.checked_on>new Date().toISOString().slice(0,10))throw Error('Cannot record a future completed check');
 if(entity==='checks'&&data.jurisdiction==='NZ-ACT'){
  const maximum=await db.query("select ($1::date+interval '3 years')::date maximum",[data.checked_on]);
  if(data.expires_on>maximum[0].maximum)throw Error('NZ-ACT checks need renewal within three years');
 }
 const keys=Object.keys(data),vals=Object.values(data);let result;
 if(op==='add')result=await db.query(`insert into ${t}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,vals);
 else {const id=await resolve(db,entity,selector);result=await db.query(`update ${t} set ${keys.map((k,i)=>k+'=$'+(i+1)).join(',')} where id=$${keys.length+1} returning *`,[...vals,id]);}
 return result;
}
export function format(data){if(Array.isArray(data)){if(!data.length)return '  (none)';return table(data,Object.keys(data[0]).map(key=>({key,label:key,format:v=>v instanceof Date?v.toISOString():typeof v==='object'?JSON.stringify(v):v})));}return Object.entries(data).map(([k,v])=>`${k}\n${format(v)}`).join('\n\n');}
export async function run(db,args){
 const json=args.includes('--json'),dry=args.includes('--dry-run'); args=args.filter(a=>!['--json','--dry-run'].includes(a));const [cmd='help',...rest]=args;
 if(dry&&cmd!=='import')throw Error('--dry-run is only supported by import');
 const arity={add:2,update:3,log:3,'draft-welcome':1,'draft-roster':0};
 if(cmd in arity && rest.length!==arity[cmd])throw Error(`Wrong number of arguments for ${cmd}; run help`);
 if(['help','--help'].includes(cmd))return {reads:[...Object.keys(reports),'attention','weekly-review'],writes:['add <entity> <json>','update <entity> <name-or-id> <json>','log <person> <author> <note>'],transfer:['import elvanto <people.csv> [--dry-run] [--map=mapping.json]','export <folder>'],drafts:['draft-welcome <person>','draft-roster'],fields};
 if(cmd in reports||['attention','weekly-review'].includes(cmd)){if(rest.length)throw Error('Read commands take no positional arguments');return readReport(db,cmd);}
 if(cmd==='add')return writeRecord(db,'add',rest[0],JSON.parse(rest[1]||'null'));
 if(cmd==='update')return writeRecord(db,'update',rest[0],JSON.parse(rest[2]||'null'),rest[1]);
 if(cmd==='log'){if(rest.length!==3)throw Error('log <person> <author> <note>');return writeRecord(db,'add','notes',{person_id:rest[0],author:rest[1],note:rest[2]});}
 if(cmd==='import'){if(rest[0]!=='elvanto'||!rest[1])throw Error('import elvanto <people.csv>');const map=rest.find(a=>a.startsWith('--map='));if(rest.slice(2).some(a=>!a.startsWith('--map=')))throw Error('Unknown import option');return importElvanto(db,rest[1],{dry,map:map?JSON.parse(fs.readFileSync(map.slice(6),'utf8')):null});}
 if(cmd==='export'){if(rest.length!==1)throw Error('export <new-folder>');return exportAll(db,rest[0]);}
 if(cmd==='draft-welcome'||cmd==='draft-roster'){
  let body;if(cmd==='draft-welcome'){
   const id=await resolve(db,'people',rest[0]);const [p]=await db.query('select name,is_child,contact_allowed from people where id=$1',[id]);
   if(p.is_child||!p.contact_allowed)throw Error('Draft requires an adult with recorded contact permission');
   body=`# Welcome draft for ${p.name}\n\nHello ${p.name},\n\nWelcome. Would you like to hear about a home group or speak with our church coordinator? Please let us know your preferred way to stay in touch.\n\nReview the recipient and wording before sending.\n`;
  }else body='# Sunday roster review draft\n\n'+format(await readReport(db,'sunday-roster'))+'\n\nInternal planning only. Review every gap and check finding before confirming the roster.\n';
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`${cmd}-${Date.now()}.md`);fs.writeFileSync(file,body,{flag:'wx'});return [{file,status:'draft only'}];
 }
 throw Error(`Unknown command: ${cmd}. Run help.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const args=process.argv.slice(2);const result=await run(db,args);console.log(args.includes('--json')?JSON.stringify(result,null,2):format(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
