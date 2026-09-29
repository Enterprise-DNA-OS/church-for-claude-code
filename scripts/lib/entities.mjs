export const fields = {
 families:['name','address'],
 people:['name','email','phone','family_id','status','is_child','joined_on','contact_allowed'],
 groups:['name','leader_id','meeting_day','capacity'],
 memberships:['person_id','group_id','joined_on'],
 services:['name','service_date','location','status'],
 'service-items':['service_id','position','title','minutes','leader_id'],
 roles:['name','safeguarding_required','jurisdiction'],
 rosters:['service_id','role_id','person_id','response'],
 attendance:['service_id','person_id','present'],
 checks:['person_id','jurisdiction','checked_on','expires_on','outcome','verified_by','evidence','check_reference'],
 funds:['name','country','currency','tax_eligible','eligibility_evidence','organisation_name','tax_number','charity_number'],
 giving:['person_id','fund_id','donated_on','amount_cents','gift','reference'],
 'care-tasks':['person_id','owner_id','title','due_on','status','detail'],
 notes:['person_id','note','author']
};
export const relations={family_id:'families',person_id:'people',leader_id:'people',owner_id:'people',group_id:'groups',service_id:'services',role_id:'roles',fund_id:'funds'};
export const tableName = name => {if(!fields[name])throw Error(`Unknown entity ${name}. Choose: ${Object.keys(fields).join(', ')}`);return name.replaceAll('-','_');};
