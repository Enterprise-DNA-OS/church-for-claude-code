---
description: import for the church office.
---

Read CLAUDE.md. Read docs/replace-elvanto.md. Export a Standard Report as CSV with Member ID and names. Run `npm run church -- import elvanto <people.csv> --dry-run --json`. Review counts, missing statuses and child classifications. Then run without --dry-run. Use --map=mapping.json when headings differ. People only; giving and relationships need a reviewed mapping. Never seed a live database.
