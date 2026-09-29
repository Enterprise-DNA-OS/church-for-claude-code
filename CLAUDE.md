# Church for Claude Code

The church office desk for people, households, home groups, Sunday services, volunteer rosters, attendance, care follow-up and giving records. Demo records are fictional. Set the real church name in brand.json.

## Rules

Read before answering. Use the CLI for records. Never infer attendance, consent, safeguarding clearance, a donor identity or tax eligibility. Ambiguous names list candidates and exit; ask the operator to choose.

Drafts stay in drafts. Documents stay in docs-out. A person reviews and shares them. Never send, process donations, contact children, publish directories or delete records from here. Giving, checks and notes are append-only through the CLI; corrections require a reviewed migration preserving the original. Audit history is not tamper proof.

One church per database. This base is an authorised office tool, not a member portal. Anyone with database access can read its records. Configure database roles, secure backups and an approved retention policy before team use. Restrict pastoral notes, children and giving data. Do not put unnecessary sensitive details into notes.

## Routes

| Job | Command |
| --- | --- |
| people | /people |
| families | /families |
| groups | /groups |
| services | /services |
| service plan | /service-plan |
| sunday roster | /sunday-roster |
| roster gaps | /roster-gaps |
| volunteer load | /volunteer-load |
| same day rosters | /same-day-rosters |
| attendance | /attendance |
| missing people | /missing-people |
| newcomers | /newcomers |
| care due | /care-due |
| giving | /giving |
| giving months | /giving-months |
| receipt review | /receipt-review |
| checks | /checks |
| compliance | /compliance |
| notes | /notes |
| audit | /audit |
| attention | /attention |
| weekly review | /weekly-review |
| add | /add |
| update | /update |
| log | /log |
| import | /import |
| export | /export |
| draft welcome | /draft-welcome |
| draft roster | /draft-roster |
| customise | /customise |
| new view | /new-view |

## Operations

scripts/church.mjs is the sole record CLI. Its help lists fields. Migrations are in supabase/migrations. DATABASE_URL selects Postgres; otherwise DATA_DIR selects local PGlite. Start live imports in an empty database after npm run migrate, never npm run demo.

Date comparisons use UTC calendar dates. Services are date-only, so same-day assignments are review findings, not confirmed time collisions. Absence means absence from recorded attendance, not proof a person stopped attending. The 28-day absence, 30-day newcomer and 30-day check warning windows are office policies.

Read docs/compliance.md before interpreting a finding. AU-NSW is only NSW. NZ-ACT is only a role assessed as in scope. Other volunteer policies use POLICY. Latest entered check evidence is not live regulator verification. Do not clear warnings merely to fill the roster.

Omni by Enterprise DNA installs and operates the agreed version: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=elvanto&utm_medium=instructions
