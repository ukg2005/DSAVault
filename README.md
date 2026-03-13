# DSAVault

A personal tracker for Data Structures and Algorithms practice. Log problems, track attempt history, organise work by pattern, and review a dashboard of progress and spaced-repetition reminders.

## Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Backend  | Python 3.13, Django 6, Django REST Framework |
| Frontend | React 19, TypeScript, Vite, React Router     |
| Database | SQLite (file-based, persisted via Docker volume) |
| Serving  | Gunicorn (backend), Nginx (frontend/proxy)   |

---

## Running with Docker (recommended)

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running

### Steps

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd DSAVault
   ```

2. **Create your environment file**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and set a strong `SECRET_KEY`. Leave `DEBUG=False` for production.

3. **Build and start all services**

   ```bash
   docker compose up --build
   ```

4. **Open the app**

   - Frontend: http://localhost
   - Django admin: http://localhost/admin
   - REST API: http://localhost/api

To stop the stack press `Ctrl+C`, then run:

```bash
docker compose down
```

The SQLite database is stored in a named Docker volume (`sqlite_data`) and survives container restarts.

---

## Running locally for development

### Backend

```bash
cd myproject
python -m venv ../venv
../venv/Scripts/activate      # Windows
# source ../venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API is available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite's dev server proxies `/api/*` to `http://localhost:8000`, so both servers must be running simultaneously.

---

## Deploying with Railway (backend) and Vercel (frontend)

Use this section with the env templates in `.env.example` and `frontend/.env.example`.

### 1. Deploy Django backend to Railway

1. Push this repository to GitHub.
2. In Railway, create a new project from your GitHub repo.
3. Set the Railway service Root Directory to `myproject`.
4. Add a PostgreSQL service in Railway.
5. In the backend service variables, set:

  - `SECRET_KEY` = a long random string
  - `DEBUG` = `False`
  - `ALLOWED_HOSTS` = your Railway public domain (for example `your-app.up.railway.app`)
  - `CORS_ALLOWED_ORIGINS` = your Vercel URL (for example `https://your-frontend.vercel.app`)
  - `CSRF_TRUSTED_ORIGINS` = your Vercel URL (for example `https://your-frontend.vercel.app`)
  - `DATABASE_URL` = Railway Postgres connection string

6. Deploy. Railway will run migrations at startup and serve Django with Gunicorn.

#### Railway variables (copy-paste template)

```env
SECRET_KEY=replace_with_a_long_random_secret
DEBUG=False
ALLOWED_HOSTS=your-backend.up.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
```

Notes:
- `ALLOWED_HOSTS` must be hostnames only (no protocol).
- `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` must include protocol (`https://`).
- For preview deployments, add comma-separated Vercel preview URLs to CORS/CSRF values.

### 2. Deploy React frontend to Vercel

1. In Vercel, import the same GitHub repository.
2. Set the project Root Directory to `frontend`.
3. Add environment variable:

  - `VITE_API_BASE_URL` = your Railway backend URL (for example `https://your-app.up.railway.app`)

4. Deploy.

The frontend now calls `${VITE_API_BASE_URL}/api/...` in production.

#### Vercel variable (copy-paste template)

```env
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

### 3. Verify

1. Open your Vercel URL.
2. Confirm dashboard and pattern/problem endpoints load data.
3. If requests fail with CORS/403, verify `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `ALLOWED_HOSTS` in Railway.

---

## API Reference

All endpoints are prefixed with `/api/`.

### Patterns

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/patterns/`                  | List all patterns                  |
| POST   | `/api/patterns/`                  | Create a pattern                   |
| GET    | `/api/patterns/<id>/`             | Retrieve a pattern                 |
| PUT    | `/api/patterns/<id>/`             | Full update                        |
| PATCH  | `/api/patterns/<id>/`             | Partial update                     |
| DELETE | `/api/patterns/<id>/`             | Delete a pattern                   |

### Problems

| Method | Path                                               | Description                        |
|--------|----------------------------------------------------|------------------------------------|
| GET    | `/api/patterns/<id>/problems/`                     | List problems for a pattern        |
| POST   | `/api/patterns/<id>/problems/`                     | Create a problem under a pattern   |
| GET    | `/api/patterns/<id>/problems/<id>/`                | Retrieve a problem                 |
| PUT    | `/api/patterns/<id>/problems/<id>/`                | Full update                        |
| PATCH  | `/api/patterns/<id>/problems/<id>/`                | Partial update                     |
| DELETE | `/api/patterns/<id>/problems/<id>/`                | Delete a problem                   |

### Attempts

| Method | Path                                                           | Description             |
|--------|----------------------------------------------------------------|-------------------------|
| GET    | `/api/patterns/<id>/problems/<id>/attempts/`                   | List attempts           |
| POST   | `/api/patterns/<id>/problems/<id>/attempts/`                   | Record a new attempt    |

### Misc

| Method | Path             | Description                                           |
|--------|------------------|-------------------------------------------------------|
| GET    | `/api/history/`  | All problems ordered by most recently added           |
| GET    | `/api/dashboard/`| Aggregated stats (counts, weak patterns, reminders)   |

---

## Data model

```
Pattern
  - pattern        string
  - confidence     HIGH | MEDIUM | LOW | BLIND
  - notes          text (optional)

Problem
  - problem_name   string
  - pattern        FK -> Pattern
  - difficulty     EASY | MEDIUM | HARD
  - link           URL
  - reminder       datetime (optional, for spaced repetition)
  - notes          text (optional)

Attempt
  - problem        FK -> Problem
  - solved_at      date (defaults to today)
  - status         OWN | PARTIAL | HINT | FAILED
  - notes          text (optional)
```

---

## Project structure

```
DSAVault/
  docker-compose.yml         # Orchestrates backend + frontend containers
  .env.example               # Template for environment variables
  myproject/                 # Django project
    Dockerfile
    requirements.txt
    manage.py
    db.sqlite3               # Created on first run (excluded from Docker image)
    dsa/                     # Main Django app
      models.py              # Pattern, Problem, Attempt
      serializers.py         # DRF serializers
      views.py               # API views
      urls.py                # URL routes
      admin.py               # Admin registrations
    myproject/
      settings.py            # Django settings
      urls.py                # Root URL conf
  frontend/                  # React application
    Dockerfile
    nginx.conf               # Nginx config (proxy + SPA routing)
    src/
      pages/                 # Route-level page components
      components/            # Shared UI components
      api/                   # Axios API client modules
      types.ts               # Shared TypeScript types
```
