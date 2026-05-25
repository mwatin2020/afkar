# Private Task & Idea Vault

Local-only platform for private projects, tasks, ideas, sandbox reviews, tags, and activity tracking.

## Requirements

- Python 3.11+
- Node.js 22+
- Docker Desktop
- PostgreSQL runs only through Docker Compose for this project

## Repository Structure

```text
private-task-idea-vault/
  backend/
  frontend/
  docker-compose.yml
  README.md
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`
- PostgreSQL for this workspace: `localhost:5433`

Note:
This project uses `5433` instead of `5432` because `5432` was already occupied on this machine. If your laptop has `5432` free, you can switch the port mapping back in `docker-compose.yml` and the backend `.env` values.

## Start PostgreSQL

```powershell
cd private-task-idea-vault
docker compose up -d
```

## Backend Setup

```powershell
cd private-task-idea-vault\backend
Copy-Item .env.example .env
```

Install dependencies if needed:

```powershell
pip install -e .
```

## Run Alembic Migration

```powershell
cd private-task-idea-vault\backend
alembic upgrade head
```

## Start FastAPI

Bind only to `127.0.0.1`:

```powershell
cd private-task-idea-vault\backend
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Frontend Setup

```powershell
cd private-task-idea-vault\frontend
npm install
```

## Start Next.js

```powershell
cd private-task-idea-vault\frontend
npm run dev
```

## Open The App

Open:

- `http://localhost:3000`

On first run:

1. Open `/login`
2. Create the local admin account
3. Login and use the protected app shell

## Backup Data

Logical backup:

```powershell
docker exec private-vault-postgres pg_dump -U vault_user -d private_vault > private_vault_backup.sql
```

Volume-based backup is also possible through Docker volume backup tooling, but SQL dump is the simplest portable option.

## Export JSON

After login, open:

- `GET /settings/export`

The frontend Settings page also shows the export payload preview.

## Restore PostgreSQL Backup

```powershell
Get-Content .\private_vault_backup.sql | docker exec -i private-vault-postgres psql -U vault_user -d private_vault
```

## Offline Usage Notes

- The app is designed for local-only usage on one laptop
- No remote sync is used
- No analytics, telemetry, or cloud auth is used
- After dependencies are installed, day-to-day use is fully local

## Privacy Notes

- Backend should run only on `127.0.0.1`
- JWT secret is stored locally in `backend/.env`
- Passwords are hashed
- Tokens are not logged
- No Firebase, Supabase, Clerk, Auth0, Vercel services, or other remote SaaS dependencies are used
