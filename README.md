# P2P Learning Platform

A collaborative academic platform where students can share learning resources, schedule peer tutoring sessions, and participate in subject-wise discussions.

## Tech Stack

### Backend
- Django 5.x + Django REST Framework
- Django Channels (WebSockets)
- PostgreSQL + Redis
- JWT Authentication

### Frontend
- React 18 + TypeScript
- Vite
- TanStack Query + Zustand
- Tailwind CSS + shadcn/ui

For local development:
docker compose down -v
docker compose up --build

### With Docker (Recommended)

```bash
docker-compose up --build
```

Backend: http://localhost:8000
Frontend: http://localhost:5173

### Without Docker

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements/development.txt

# Create .env file
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start dev server
npm run dev
```

## Railway Deployment

### Backend

1. Create a new project on Railway
2. Add PostgreSQL and Redis services
3. Connect your GitHub repository
4. Set environment variables:

```
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<generate-secret-key>
DEBUG=False
ALLOWED_HOSTS=<railway-domain>
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
REDIS_URL=${{Redis.REDIS_URL}}
CORS_ALLOWED_ORIGINS=<frontend-url>
```

5. Set Root Directory: `backend`

### Frontend

1. Create a new service in the same project
2. Set environment variables:

```
VITE_API_URL=<backend-url>
```

3. Set Root Directory: `frontend`

## Project Structure

```
p2p/
├── backend/
│   ├── config/           # Django settings
│   ├── apps/
│   │   ├── users/        # Authentication, profiles
│   │   ├── materials/    # Study materials
│   │   ├── sessions/     # Tutoring sessions
│   │   ├── forum/        # Discussion forum
│   │   ├── support/      # Support queries
│   │   └── notifications/# WebSocket notifications
│   └── requirements/
├── frontend/
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Page components
│       ├── services/     # API clients
│       ├── stores/       # Zustand stores
│       └── types/        # TypeScript types
└── docker-compose.yml
```

## API Endpoints

- `POST /api/auth/register/` - Registration
- `POST /api/auth/login/` - Login (JWT)
- `GET /api/auth/me/` - Current user
- `GET /api/materials/` - Study materials
- `GET /api/sessions/` - Tutoring sessions
- `GET /api/discussions/` - Forum discussions
- `POST /api/support/` - Support form
- `WS /ws/notifications/` - WebSocket notifications
