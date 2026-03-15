# Disaster Recovery Runbook

## Scope
- Backup/restore PostgreSQL database for AMB.
- Recover API service with minimal downtime.
- Validate data integrity after restore.

## Backup Strategy
- Full logical backup every day (`pg_dump -Fc`).
- Keep at least 14 daily snapshots.
- Store backups outside runtime host (object storage or remote volume).

## Create Backup
```bash
pnpm backup:db
```

Optional environment:
- `BACKUP_DIR` (default `./backups`)
- `DATABASE_URL` or `PGHOST/PGPORT/PGUSER/PGDATABASE`

## Restore Procedure
1. Stop write traffic to API.
2. Pick the latest healthy backup.
3. Restore DB:
```bash
pnpm restore:db -- ./backups/amb-YYYYMMDD-HHMMSS.dump
```
4. Apply migrations:
```bash
pnpm db:migrate:deploy
```
5. Start API and run health check:
```bash
curl -fsS http://localhost:3334/api/health
```
6. Run smoke tests (auth + project listing + inbox).

## Recovery Validation Checklist
- `/api/health` returns `status: ok` or `degraded` with DB `up`.
- `GET /api/projects` returns expected projects.
- Authentication works for `admin@local.test`.
- Message send/inbox/ack flow works in one project.

## Drill Recommendation
- Run restore drill at least once per month.
- Record RTO/RPO after each drill.
- Update this runbook if recovery steps changed.
