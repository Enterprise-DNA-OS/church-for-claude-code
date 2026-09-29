-- One church per database. No payment handling, member portal or tenant isolation.
create table audit_log(id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, operation text not null, old_record jsonb, new_record jsonb, actor text not null default current_user, recorded_at timestamptz not null default now());
create function stamp_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create function audit_change() returns trigger language plpgsql as $$ begin
 insert into audit_log(entity,record_id,operation,old_record,new_record) values(TG_TABLE_NAME,coalesce(new.id,old.id),TG_OP,to_jsonb(old),to_jsonb(new)); return coalesce(new,old); end $$;
create table families(id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), address text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on families for each row execute function stamp_updated();
create trigger audit after insert or update or delete on families for each row execute function audit_change();
create table people(id uuid primary key default gen_random_uuid(), source_id text unique, name text not null check(length(trim(name))>0), email text not null default '', phone text not null default '', family_id uuid references families, status text not null default 'active' check(status in ('active','contact','archived')), is_child boolean not null default false, joined_on date not null default current_date, contact_allowed boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on people for each row execute function stamp_updated();
create trigger audit after insert or update or delete on people for each row execute function audit_change();
create table groups(id uuid primary key default gen_random_uuid(), name text not null unique, leader_id uuid references people, meeting_day text not null default '', capacity integer not null default 12 check(capacity>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on groups for each row execute function stamp_updated();
create trigger audit after insert or update or delete on groups for each row execute function audit_change();
create table memberships(id uuid primary key default gen_random_uuid(), person_id uuid not null references people, group_id uuid not null references groups, joined_on date not null default current_date, unique(person_id,group_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on memberships for each row execute function stamp_updated();
create trigger audit after insert or update or delete on memberships for each row execute function audit_change();
create table services(id uuid primary key default gen_random_uuid(), name text not null, service_date date not null, location text not null default '', status text not null default 'planned' check(status in ('planned','completed','cancelled')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on services for each row execute function stamp_updated();
create trigger audit after insert or update or delete on services for each row execute function audit_change();
create table service_items(id uuid primary key default gen_random_uuid(), service_id uuid not null references services, position integer not null check(position>0), title text not null, minutes integer not null default 5 check(minutes>0), leader_id uuid references people, unique(service_id,position), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on service_items for each row execute function stamp_updated();
create trigger audit after insert or update or delete on service_items for each row execute function audit_change();
create table roles(id uuid primary key default gen_random_uuid(), name text not null unique, safeguarding_required boolean not null default false, jurisdiction text not null default 'POLICY' check(jurisdiction in ('AU-NSW','NZ-ACT','POLICY')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on roles for each row execute function stamp_updated();
create trigger audit after insert or update or delete on roles for each row execute function audit_change();
create table rosters(id uuid primary key default gen_random_uuid(), service_id uuid not null references services, role_id uuid not null references roles, person_id uuid references people, response text not null default 'pending' check(response in ('pending','accepted','declined')), unique(service_id,role_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on rosters for each row execute function stamp_updated();
create trigger audit after insert or update or delete on rosters for each row execute function audit_change();
create table attendance(id uuid primary key default gen_random_uuid(), service_id uuid not null references services, person_id uuid not null references people, present boolean not null, unique(service_id,person_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on attendance for each row execute function stamp_updated();
create trigger audit after insert or update or delete on attendance for each row execute function audit_change();
create table checks(id uuid primary key default gen_random_uuid(), person_id uuid not null references people, jurisdiction text not null check(jurisdiction in ('AU-NSW','NZ-ACT','POLICY')), checked_on date not null, expires_on date not null, outcome text not null check(outcome in ('cleared','pending','barred')), verified_by text not null check(length(trim(verified_by))>0), evidence text not null check(length(trim(evidence))>0), check_reference text not null default '', check(expires_on>=checked_on), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on checks for each row execute function stamp_updated();
create trigger audit after insert or update or delete on checks for each row execute function audit_change();
create table funds(id uuid primary key default gen_random_uuid(), name text not null unique, country text not null check(country in ('NZ','AU')), currency text not null check(currency in ('NZD','AUD')), tax_eligible boolean not null default false, eligibility_evidence text not null default '', organisation_name text not null default '', tax_number text not null default '', charity_number text not null default '', check((country='NZ' and currency='NZD') or (country='AU' and currency='AUD')), check(not tax_eligible or (length(trim(eligibility_evidence))>0 and length(trim(organisation_name))>0 and length(trim(tax_number))>0)), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on funds for each row execute function stamp_updated();
create trigger audit after insert or update or delete on funds for each row execute function audit_change();
create table giving(id uuid primary key default gen_random_uuid(), source_id text unique, person_id uuid not null references people, fund_id uuid not null references funds, donated_on date not null, amount_cents integer not null check(amount_cents>0), gift boolean not null default false, reference text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on giving for each row execute function stamp_updated();
create trigger audit after insert or update or delete on giving for each row execute function audit_change();
create table care_tasks(id uuid primary key default gen_random_uuid(), person_id uuid not null references people, owner_id uuid references people, title text not null, due_on date not null, status text not null default 'open' check(status in ('open','done')), detail text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on care_tasks for each row execute function stamp_updated();
create trigger audit after insert or update or delete on care_tasks for each row execute function audit_change();
create table notes(id uuid primary key default gen_random_uuid(), person_id uuid not null references people, note text not null check(length(trim(note))>0), author text not null check(length(trim(author))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on notes for each row execute function stamp_updated();
create trigger audit after insert or update or delete on notes for each row execute function audit_change();
create table import_rows(id uuid primary key default gen_random_uuid(), source_key text not null unique, row_hash text not null, raw jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger stamp before update on import_rows for each row execute function stamp_updated();
create trigger audit after insert or update or delete on import_rows for each row execute function audit_change();

create index attendance_person on attendance(person_id);
create index giving_person on giving(person_id);
create index check_person on checks(person_id,jurisdiction,checked_on);
create view v_roster_review as
select r.id,s.name service,s.service_date,s.location,ro.name role,ro.safeguarding_required,ro.jurisdiction,p.name person,r.response,
 case when p.id is null then 'unfilled' when p.status<>'active' then 'inactive person' when r.response='declined' then 'declined'
 when ro.safeguarding_required and (c.id is null or c.outcome<>'cleared' or c.expires_on<s.service_date or c.expires_on<current_date or c.verified_by='' or c.evidence='') then 'check needs review'
 when r.response<>'accepted' then 'awaiting response' else 'ready on recorded evidence' end finding,
 c.expires_on
from rosters r join services s on s.id=r.service_id join roles ro on ro.id=r.role_id left join people p on p.id=r.person_id
left join lateral(select * from checks c where c.person_id=p.id and c.jurisdiction=ro.jurisdiction and c.checked_on<=current_date order by checked_on desc,created_at desc,id desc limit 1)c on true
where s.status='planned' and s.service_date>=current_date;
create view v_people_attention as
select p.id,p.name,p.status,p.is_child,p.joined_on,p.contact_allowed,max(s.service_date) last_attended,
 (select count(*) from memberships m where m.person_id=p.id) group_count,
 (select count(*) from care_tasks t where t.person_id=p.id and t.status='open' and t.due_on<current_date) overdue_tasks
from people p left join attendance a on a.person_id=p.id and a.present left join services s on s.id=a.service_id and s.status='completed' and s.service_date<=current_date
where p.status='active' group by p.id;
create view v_giving as
select g.id,p.name donor,f.name fund,f.country,f.currency,g.donated_on,g.amount_cents,g.gift,
 (g.gift and f.tax_eligible and f.eligibility_evidence<>'' and f.organisation_name<>'' and f.tax_number<>'') receipt_review_ready,
 f.organisation_name,f.tax_number,f.charity_number,g.reference
from giving g join people p on p.id=g.person_id join funds f on f.id=g.fund_id;
create view v_group_review as
select g.id,g.name,p.name leader,g.meeting_day,g.capacity,count(m.id) members,g.capacity-count(m.id) places_remaining
from groups g left join people p on p.id=g.leader_id left join memberships m on m.group_id=g.id group by g.id,p.name;
