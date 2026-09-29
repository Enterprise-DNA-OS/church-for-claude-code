# Church for Claude Code

The church office desk for Sunday rosters, people who need a follow-up, home groups, safeguarding evidence and giving records. Your records in a database you own. MIT licence. Built by Enterprise DNA.

| Do it yourself | We customise it | We run it for you |
| --- | --- | --- |
| Free source. Follow the quick start. | Your church's fields, roles, paperwork, Elvanto export mapping and volunteer screens. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Talk to Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=elvanto&utm_medium=readme) · [Instead of Elvanto](https://enterprisedna.co/omni/instead-of/elvanto?utm_source=github&utm_medium=readme&utm_campaign=elvanto)

Runs with Claude Code, Codex, OpenCode or Cursor. Read AGENTS.md and CLAUDE.md. The database is the product and the coding agent is the door.

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/church-for-claude-code.git
cd church-for-claude-code
npm install
npm run demo
npm run church -- weekly-review
npm run view
npm run docs
```

Node 20 or newer. PGlite runs on your machine with no database service. Set DATABASE_URL for Postgres with the same migrations. DATA_DIR chooses local storage. OUTPUT_DIR chooses where drafts, documents and views go. The fictional seed is idempotent and includes overdue care, stale attendance, an expired check, roster gaps and two currencies. Start real records in an empty database with npm run migrate, never demo.

Elvanto is inexpensive for small churches and its published price includes all features. This project is for ownership and an office process you can change, not a guaranteed saving. Free source still needs hosting, agent subscriptions, backups and maintenance. Compare the actual operating costs before switching.

## The church office week

- `/sunday-roster`, `/roster-gaps` and `/service-plan` prepare the weekend. Record roles, assignments, responses and the order of service.
- `/care-due`, `/missing-people` and `/newcomers` identify people for an authorised follow-up. Missing attendance means missing records, not confirmed absence.
- `/groups`, `/volunteer-load` and `/same-day-rosters` show home group capacity and volunteer workload.
- `/giving`, `/giving-months` and `/receipt-review` reconcile contributions by fund and currency. Nothing processes a payment.
- `/compliance` checks recorded safeguarding and gift evidence. `/weekly-review` combines the roster, care, findings and giving.
- `/draft-welcome` and `/draft-roster` save drafts for a person to review. Nothing sends. Welcome drafts require an adult with recorded contact permission.

The 31 commands live in .claude/commands. `npm run church -- help --json` lists every read, write and field. Reads have aligned text and --json. `add`, `update` and `log` accept actual operator facts. Relationships accept case-insensitive names, full IDs and ID prefixes. Ambiguity lists matches and exits 1. Money uses integer cents and separate currency totals. There is no deletion route.

## Checks and evidence

Roster review uses the latest recorded check for the role's jurisdiction and flags a barred, pending, absent or expired result. A clearance must cover the service date. For an assessed NZ-ACT role the CLI limits renewal to three years. AU-NSW requires actual employer verification evidence and the regulator's expiry. Ordinary NZ church volunteers are not automatically covered by the Children's Act rule. POLICY supports the church's own assessed requirements.

Read [the sourced rules](docs/compliance.md). These are record checks, not a live regulator search or a safeguarding certification. The coordinator decides applicability and retains original evidence. Checks, giving and notes are append-only through the CLI. Reviewed corrections preserve originals. Audit history records inserts and changes but is not tamper proof.

## Paperwork and views

Set business name, logo and colours in brand.json. `npm run docs` renders service run sheets, giving statements, donation receipt drafts and safeguarding review sheets. `npm run view` renders the office week, safeguarding review and giving dashboards. The outputs are read-only HTML for review and printing.

Receipt drafts are not signed or issued. Funds default to unverified tax eligibility. A responsible person reconciles gifts, confirms donee or DGR status, applies official letterhead, adds issue references and a real authorised signature where required, then retains the issued document. Missing eligibility appears in compliance. Do not claim a church's general giving is automatically tax deductible.

[Why no front end](docs/why-no-front-end.md) explains the office scope and what phone capture, child check-in and volunteer self-service need. Retain the existing collection workflow until a replacement has been tested.

## Ten questions across the church records

Elvanto has reports of its own. These are questions this free version answers today, not a claim that Elvanto cannot answer them.

1. Which Sunday roles are empty, declined or still awaiting a response? (`roster-gaps`)
2. Which assigned children's workers have a check that needs review? (`compliance`)
3. Who has more than one assignment on the same date? (`same-day-rosters`)
4. Which volunteers carry the most assignments over the next four weeks? (`volunteer-load`)
5. Which adults have no recorded attendance in four weeks, and how many overdue tasks do they have? (`missing-people`)
6. Which newcomers have no home group yet? (`newcomers`)
7. Which care tasks are due and who is responsible? (`care-due`)
8. Which home groups have space and who leads them? (`groups`)
9. How much giving is recorded by fund and currency? (`giving`)
10. Which gifts still lack the evidence needed to review a donation receipt? (`receipt-review`)

## Your first hour: ten things to ask for

1. Put our church name and logo on the run sheet.
2. Add our households without guessing family links.
3. Add our home groups and capacity limits.
4. Set up next Sunday's order of service.
5. Record the volunteers' actual responses.
6. Add the safeguarding policy our coordinator has approved.
7. Set our attendance follow-up window.
8. Map our Elvanto people export headings.
9. Add our funds and their verified eligibility evidence.
10. Print the Monday office review in our colours.

/customise adds a field or changes a rule with a migration and tests. /new-view adds a read-only report. Back up real data before applying a migration.

## Bring your history

Follow [the Elvanto replacement guide](docs/replace-elvanto.md). A Standard Report people CSV with Member ID imports in one command, with an optional column mapping. Preview rolls back; exact repeat rows skip; changed source records fail for review; invalid batches roll back in full. Raw source columns are retained. Contact permission is never assumed. Review child classification and status before use.

Giving, relationships, attendance history and attachments need separate reviewed mappings. The people import does not claim those have moved. Export writes all business records, raw imports and audit history as JSON and CSV. Use actual database backups for recovery.

## Verification and operations

npm test uses a temporary isolated database. It exercises every report, writes, latest-check precedence, blocked drafts, input validation, atomic and repeated imports, column mapping, audit history, exports, HTML escaping, documents and views. CI runs PGlite on Windows and Linux and the same tests on a disposable Postgres database. Local success does not prove CI has run.

One church per database. This is an authorised office tool without member-level permissions or tenant isolation. Anyone with database access can read its records. Before shared use configure least privilege, encrypted devices and backups, restore tests, retention rules and controlled attachment storage. Keep sensitive pastoral details out of routine notes and restrict access to giving and children records.
