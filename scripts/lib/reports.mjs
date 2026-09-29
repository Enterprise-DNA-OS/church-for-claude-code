export const reports={
 people:"select p.id,p.name,p.email,p.phone,f.name family,p.status,p.is_child,p.contact_allowed from people p left join families f on f.id=p.family_id order by p.name",
 families:"select f.id,f.name,f.address,count(p.id) people from families f left join people p on p.family_id=f.id group by f.id order by f.name",
 groups:'select name,leader,meeting_day,capacity,members,places_remaining from v_group_review order by name',
 services:'select * from services order by service_date,name',
 'service-plan':`select s.name service,s.service_date,i.position,i.title,i.minutes,p.name leader from service_items i join services s on s.id=i.service_id left join people p on p.id=i.leader_id where s.status='planned' and s.service_date>=current_date order by s.service_date,s.name,i.position`,
 'sunday-roster':'select service,service_date,role,person,response,finding from v_roster_review order by service_date,service,role',
 'roster-gaps':"select service,service_date,role,person,finding from v_roster_review where finding<>'ready on recorded evidence' order by service_date,service,role",
 'volunteer-load':`select p.name,count(*) assignments,count(distinct s.service_date) days from rosters r join people p on p.id=r.person_id join services s on s.id=r.service_id where s.status='planned' and s.service_date between current_date and current_date+28 and r.response<>'declined' group by p.id order by count(*) desc,p.name`,
 'same-day-rosters':`select p.name,s.service_date,count(*) assignments from rosters r join people p on p.id=r.person_id join services s on s.id=r.service_id where s.status='planned' and s.service_date>=current_date and r.response<>'declined' group by p.id,s.service_date having count(*)>1 order by s.service_date,p.name`,
 attendance:`select s.name,s.service_date,count(*) filter(where a.present) present,count(*) filter(where not a.present) absent from services s left join attendance a on a.service_id=s.id where s.status='completed' group by s.id order by s.service_date desc`,
 'missing-people':`select name,last_attended,group_count,overdue_tasks,contact_allowed from v_people_attention where not is_child and joined_on<current_date-28 and (last_attended is null or last_attended<current_date-28) order by name`,
 newcomers:`select name,joined_on,group_count,overdue_tasks,contact_allowed from v_people_attention where not is_child and joined_on>=current_date-30 order by joined_on desc,name`,
 'care-due':`select t.id,p.name person,t.title,t.due_on,o.name owner,p.contact_allowed from care_tasks t join people p on p.id=t.person_id left join people o on o.id=t.owner_id where t.status='open' and t.due_on<=current_date order by t.due_on,p.name`,
 giving:`select fund,currency,count(*) gifts,sum(amount_cents)::bigint amount_cents from v_giving group by fund,currency order by currency,fund`,
 'giving-months':`select to_char(donated_on,'YYYY-MM') as giving_month,currency,sum(amount_cents)::bigint amount_cents from v_giving group by to_char(donated_on,'YYYY-MM'),currency order by giving_month,currency`,
 'receipt-review':`select donor,fund,donated_on,currency,amount_cents,case when receipt_review_ready then 'review draft and sign' else 'eligibility or gift evidence missing' end finding from v_giving order by donor,donated_on`,
 checks:`select c.id,p.name,c.jurisdiction,c.checked_on,c.expires_on,c.outcome,c.verified_by,c.evidence from checks c join people p on p.id=c.person_id order by p.name,c.checked_on desc`,
 compliance:`select 'roster safeguard' rule,person,service_date due_on,finding from v_roster_review where safeguarding_required and finding<>'ready on recorded evidence'
 union all select 'check renewal',p.name,c.expires_on,case when c.outcome<>'cleared' then c.outcome else 'expires before review horizon' end from checks c join people p on p.id=c.person_id where c.checked_on<=current_date and (c.outcome<>'cleared' or c.expires_on<=current_date+30) and not exists(select 1 from checks n where n.person_id=c.person_id and n.jurisdiction=c.jurisdiction and n.checked_on<=current_date and (n.checked_on,n.created_at,n.id)>(c.checked_on,c.created_at,c.id))
 union all select 'receipt evidence',donor,donated_on,'tax eligibility or gift evidence missing' from v_giving where not receipt_review_ready order by rule,person`,
 notes:`select n.id,p.name,n.note,n.author,n.created_at from notes n join people p on p.id=n.person_id order by n.created_at desc`,
 audit:'select entity,record_id,operation,actor,recorded_at from audit_log order by recorded_at desc limit 50'
};
export async function readReport(db,name){if(reports[name])return db.query(reports[name]);if(name==='attention'||name==='weekly-review'){const keys=name==='attention'?['roster-gaps','care-due','missing-people']:['sunday-roster','care-due','compliance','giving'];return Object.fromEntries(await Promise.all(keys.map(async k=>[k,await db.query(reports[k])])));}throw Error(`Unknown report: ${name}`);}
