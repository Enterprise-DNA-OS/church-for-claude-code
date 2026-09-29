# Safeguarding and giving evidence

Checked 29 September 2026. These checks compare entered records with the rules below. They do not query regulators, certify suitability, replace a risk assessment or decide whether a gift qualifies for tax relief. The church determines scope and keeps original evidence under restricted access.

## NSW child-related roles

[NSW Office of the Children's Guardian](https://ocg.nsw.gov.au/working-children-check) requires organisations to identify covered roles, verify workers' checks online and retain verification records. Clearances last five years but can be barred before expiry. A number or expiry date alone is not employer verification.

For a role marked safeguarding_required with jurisdiction AU-NSW, the roster review requires a latest recorded cleared result, reviewer, evidence and an expiry covering the service date. Record the outcome after actual online employer verification. A later barred or pending outcome overrides an older clearance. Use the regulator's actual expiry, not a guessed date. This rule is NSW only; other Australian jurisdictions need their own rules.

## New Zealand roles in scope

[Oranga Tamariki safety checking guidance](https://www.orangatamariki.govt.nz/working-with-children/childrens-act-requirements/safety-checking/) describes checks for covered children's workers in government-funded regulated services, including paid workers and specified trainees. It includes identity, police vetting, interviews, referee and registration checks and a risk assessment. Renewal is every three years.

Ordinary unpaid church volunteers are not automatically in that statutory category. A church coordinator must establish applicability before using NZ-ACT. The CLI refuses a renewal date beyond three years after the completed check. Store a reference to the full assessment, not just a police vet. For a church's separate volunteer policy use POLICY with the policy's actual review dates. The demo kids-team role is a fictional in-scope example.

## Donation paperwork

[Inland Revenue receipt requirements](https://www.ird.govt.nz/roles/not-for-profits-and-charities/running-your-nfp/requirements-for-creating-donation-receipts) cover donor identity, money given, the donation date or tax year, donation wording, organisation identity and IRD number, any charities registration, official letterhead or stamp, authorised signatory details and signature, and receipt numbering and replacement labelling where applicable.

[ATO guidance on gift receipts](https://www.ato.gov.au/api/public/content/0-6ac62a70-46d8-4752-88d3-28c81bd264f3) requires a DGR gift receipt to identify the recipient, ABN if any, and the fact it is a gift. Church status alone does not establish DGR eligibility. Payments that buy a benefit are not automatically gifts.

Funds default to tax_eligible=false. Marking true requires entered eligibility evidence, organisation name and tax number. The base deliberately requires a tax number even for an Australian DGR listed by name without an ABN; a reviewed extension is needed for that exception. Giving records distinguish gifts from other contributions. Compliance lists missing evidence. No payments are collected or tax claims filed.

npm run docs makes a giving statement and individual donation receipt drafts. It does not issue, sign or number official receipts. A responsible reviewer must reconcile the amount, establish eligibility, apply the organisation's letterhead and actual signature, assign the official issue reference and retain the issued copy. Generated drafts clearly identify themselves as drafts, including when evidence is incomplete. A true receipt_review_ready flag means only that the entered fields pass the base checks.

## Office policy, not law

Attendance older than 28 days, newcomers within 30 days, renewals due within 30 days, same-day roster assignments and overdue care tasks are configurable office review rules. Empty attendance means no record, not proof of absence. Services use UTC dates without times; same-day assignments are not confirmed schedule conflicts.

The database holds sensitive personal, family, pastoral and giving information. One church per database. No member-level access controls or public directory are included. Use least-privilege database access, encrypted devices and backups, a tested restore process and an agreed retention policy before storing real records. Audit rows capture changes but are not immutable against a database administrator.
