import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parseCsv,pick} from './csv.mjs';
import {fields,tableName} from './entities.mjs';
const aliases={source_id:['Member ID'],name:['Full Name'],first:['First Name'],last:['Last Name'],email:['Email','Email Address'],phone:['Mobile','Mobile Phone','Phone'],status:['Status'],is_child:['Is Child']};
export async function importElvanto(db,file,{dry=false,map=null}={}){
 const rows=parseCsv(fs.readFileSync(file,'utf8'));if(!rows.length)throw Error('CSV contains no people');
 if(map){for(const [key,value]of Object.entries(map)){if(!(key in aliases)||typeof value!=='string'||!value)throw Error(`Invalid mapping ${key}`);}}
 const read=(r,k)=>pick(r,...(map?.[k]?[map[k]]:aliases[k]));const sourceIds=new Set();let inserted=0,skipped=0;
 await db.exec('BEGIN');try{
 for(const [index,row]of rows.entries()){
  const source_id=read(row,'source_id').trim(),name=(read(row,'name')||[read(row,'first'),read(row,'last')].filter(Boolean).join(' ')).trim();
  if(!source_id||!name)throw Error(`CSV row ${index+2}: Member ID and name required. Use --map for different headings.`);
  if(sourceIds.has(source_id))throw Error(`Duplicate Member ID ${source_id} in CSV`);sourceIds.add(source_id);
  const sourceKey='elvanto:person:'+source_id,raw=JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b)))),hash=createHash('sha256').update(raw).digest('hex');
  const [old]=await db.query('select row_hash from import_rows where source_key=$1',[sourceKey]);
  if(old){if(old.row_hash!==hash)throw Error(`Changed source row ${source_id}: review changes before a correction migration`);skipped++;continue;}
  const rawStatus=read(row,'status').trim().toLowerCase();const status=rawStatus||'contact';if(!['active','contact','archived'].includes(status))throw Error(`Member ${source_id}: unrecognised Status ${rawStatus}`);
  const child=read(row,'is_child').trim().toLowerCase();if(child&&!['yes','no','true','false','1','0'].includes(child))throw Error(`Member ${source_id}: unrecognised Is Child value`);
  await db.query('insert into people(source_id,name,email,phone,status,is_child) values($1,$2,$3,$4,$5,$6)',[source_id,name,read(row,'email'),read(row,'phone'),status,['yes','true','1'].includes(child)]);
  await db.query('insert into import_rows(source_key,row_hash,raw) values($1,$2,$3::jsonb)',[sourceKey,hash,raw]);inserted++;
 }
 await db.exec(dry?'ROLLBACK':'COMMIT');return [{inserted,skipped,dry_run:dry,notes:'People only. Raw columns retained. Contact permission defaults to false. Review missing status and child classification before use.'}];
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
const csvCell=v=>{let s=typeof v==='object'&&v!==null?JSON.stringify(v):String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export async function exportAll(db,folder){
 const out=path.resolve(folder);if(fs.existsSync(out))throw Error('Export folder must be new');fs.mkdirSync(out,{recursive:true});
 const all={};await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{
 for(const t of [...Object.keys(fields).map(tableName),'import_rows','audit_log']){all[t]=await db.query(`select * from ${t} order by id`);}
 await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
 for(const [t,rows]of Object.entries(all)){const cols=Object.keys(rows[0]||{});fs.writeFileSync(path.join(out,t+'.csv'),cols.map(csvCell).join(',')+'\n'+rows.map(r=>cols.map(c=>csvCell(r[c])).join(',')).join('\n'));}
 fs.writeFileSync(path.join(out,'church.json'),JSON.stringify(all,null,2)+'\n');return [{folder:out,entities:Object.keys(all).length,records:Object.values(all).reduce((n,a)=>n+a.length,0),note:'JSON is lossless. Spreadsheet CSV text is formula-escaped. Use database backups for restoration.'}];
}
