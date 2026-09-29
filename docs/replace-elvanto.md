# Move church office records from Elvanto

The people import is one command. It does not claim to move every Elvanto feature or history type. Source checked 29 September 2026: [Elvanto export instructions](https://support.tithe.ly/hc/en-us/articles/31915738862871-Elvanto-Export-Instructions).

## Export people

In Elvanto's Admin Area open Reports, Add Custom Report, Standard Report. Display Individuals and include all relevant People Categories. Include Member ID and the fields you need, then Save & Generate and Export as CSV. Reconcile archived/contact records separately if your report filters omit them.

Include First Name and Last Name, or Full Name. The importer recognises Email or Email Address, Mobile or Mobile Phone or Phone, Status and Is Child. Custom reports choose their own headings; compare the actual file before import. The fixtures are synthetic examples of a selected report, not a vendor-provided sample.

## Import to an empty database

Use Node 20 or newer. npm install, then npm run migrate. Never seed a live church database with demo people.

```bash
npm run church -- import elvanto ./people.csv --dry-run --json
npm run church -- import elvanto ./people.csv --json
```

For different headings supply --map=./mapping.json. A mapping is an object such as {"source_id":"Member Number","name":"Display Name","is_child":"Child"}. Allowed keys are source_id, name, first, last, email, phone, status and is_child. The dry run executes the same inserts and rolls back.

Every row needs a nonempty Member ID and name. Member IDs remain source identifiers, never names or email addresses. Exact repeat rows skip. Changed rows fail for an explicit reviewed correction; they never silently overwrite local edits. Duplicate source IDs in a file, malformed CSV and invalid statuses fail the entire batch. Unknown columns are preserved in raw import history but are not mapped into working fields.

Missing Status becomes contact, not active. Missing Is Child becomes false and needs explicit review before use; imports never record contact permission. Review and correct child classification before activating a person, adding them to a roster or drafting contact. Names, email and telephone are mapped; households, memberships and assignments are not guessed from surnames.

## What needs separate mapping

Elvanto also documents a Financial, Reports, Batches CSV export with all transactions, tax and non-tax entries, Member ID and Full Name. Keep that original export. This base does not import it automatically: fund mapping, amounts, currencies, transaction IDs, tax treatment and reconciliation need a reviewed importer extension. No giving history should be represented as migrated until totals reconcile by fund and currency.

Groups, household relationships, historical attendance, service schedules, pastoral workflows, custom field meaning, files, messages and safeguarding originals need separate exports and mapping. No recurring payment tokens, bank connections, SMS service, child check-in or member login is recreated. Keep those services running until the agreed replacement process is tested. /customise adds a mapping for the church's actual files; Enterprise DNA handles it as part of a scoped migration.

## Verify and switch

Compare people and category totals, source IDs, a sample of names and contacts, child classification and all retained raw columns. Review permissions before activating contacts. Test one Sunday roster and one giving reconciliation alongside Elvanto. Confirm required history and document originals are retained before changing the subscription.

```bash
npm run church -- people --json
npm run church -- export ./church-export
```

Export contains every business entity, raw import row and audit row as JSON plus CSV. JSON preserves exact values; CSV neutralises text that spreadsheets could treat as formulas. It is an interchange snapshot, not a restoration tool. Back up the actual database and any original attachments with a tested restore procedure.
