# SakuraEdu · Sakura Dashboard

[![Verify](https://github.com/yanyu03/Sakura_DashBoard/actions/workflows/ci.yml/badge.svg)](https://github.com/yanyu03/Sakura_DashBoard/actions/workflows/ci.yml)

A full-stack teaching workspace exploring school organization, staff appointments and scoped timetable collaboration. **1.0Sakura** is an engineering preview built with React, TypeScript, Express, SQLite, TiDB and Cloudflare Workers.

[中文](README.md) · [Portfolio case study](docs/PORTFOLIO.md) · [Documentation](docs/README.md) · [Live entry](https://sakura.250221.xyz/?design=1.0Sakura) · [MIT](LICENSE)

## Why this project

A teacher may be a homeroom teacher, a subject-group member and a coordinator at the same time. The project separates accounts, school people, dated appointments and teaching assignments. A coordinator can discover eligible teachers without automatically gaining access to their private lesson plans or unrelated student records.

The scheduling workflow is draft → explicit sharing and submission → responsible coordinator review → official lesson. Approval rechecks current eligibility, appointment scope, record versions and teacher / class / room conflicts. Sharing a timetable does not grant access to other modules.

## Run locally without cloud credentials

Use Node.js 24 LTS (minimum 22.12) and npm:

```bash
git clone https://github.com/yanyu03/Sakura_DashBoard.git
cd Sakura_DashBoard
npm ci
npm run dev
```

Open `http://127.0.0.1:3000/?design=1.0Sakura`. Register the first application administrator on the empty installation; there is no default account. Data persists in `.local-data/portfolio/sakura_edu.sqlite`. The process listens on loopback and uses the same business application as the Worker, with native SQLite.

This local preview is not a public production server. The historical `dev:legacy` / `dev:standard` entries seed prototype examples and are explicitly separate from the empty installation.

## Implemented

- Account registration, immutable usernames, one-time CAPTCHA, Cookie sessions, CSRF and escalating authentication cooldowns.
- School organization trees, multiple dated appointments, course qualifications and a scoped coordination directory.
- Timetable drafts, department sharing, approval, self-review rejection, conflict checks and ICS export.
- Teaching records: homework, text lesson plans and revisions, assessment CSV preview / import, student records and internal communication.
- Incremental v15 migrations, production SQLite-to-TiDB transfer, parameterized HTTPS transport, bounded timeouts and no automatic replay of unknown commits.
- CF Secrets, strengthened salted scrypt with a separate HMAC pepper, encrypted Windows operator files and sensitive-log suppression.

## Verification

```bash
npm run lint
npm run cf:check
npm run build
npm run docs:check
npm run test:local
```

Local regressions use isolated databases and need no production credentials. Windows also supports `npm run test:security-hardening` for DPAPI and password boundaries. Real Worker / TiDB integration requires a separately provisioned synthetic database and operator access.

Historical evidence includes 88 SQLite regression checks, 22 TiDB business groups, 9 organization / scheduling groups, 11 security checks, 6 actual Worker security scenarios and 8 production smoke checks. These are different layers and dates, not a single current CI score or a load-test result. See [testing](docs/TESTING.md).

## Limits that matter

Login roles remain admin / teacher. Parent and student identities are not complete standalone products. School-wide public lesson plans still require stricter institution boundaries; the application is not yet a complete multi-school tenant service. Isolation is logical, not a physical database per user.

Weekly templates, alternating weeks, the complete school calendar and Key-based reporting remain roadmap work. External AI/OCR and real parent-message delivery are not enabled by default. The official TiDB HTTP driver's interactive transactions retain their experimental limitation. There is no production-scale capacity, SLA or disaster-recovery certification.

## Review the engineering

- [Architecture](docs/ARCHITECTURE.md): account / person / appointment separation, authorization, transactions and migration trade-offs.
- [Portfolio case study](docs/PORTFOLIO.md): problems, decisions, evidence and an interview demonstration.
- [Deployment](docs/DEPLOYMENT.md): your own CF account, TiDB setup, Secrets and recovery boundaries.
- [API conventions](docs/API.md), [roadmap](docs/ROADMAP.md), [contributing](CONTRIBUTING.md), [security](SECURITY.md).

The interface originated from a Google Stitch / AI Studio prototype. The author drove requirements and architectural direction; development used AI-assisted coding, investigation, testing and documentation. Capabilities are supported by executable code and evidence rather than a claim of exclusively manual authorship. See [NOTICE](NOTICE.md) for provenance and asset boundaries.
