# Job Board Platform

A production-ready full-stack **Job Board** web application built with **FastAPI** (backend) and **React** (frontend). Employers can post job listings and manage applications, while candidates can browse jobs, apply with resumes, and track their application status.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [License](#-license)

---

##  Features

### Authentication & Authorization
- JWT-based authentication (access + refresh tokens)
- Role-based access control: **Candidate** and **Employer**
- Secure password hashing with bcrypt
- Silent token refresh on the frontend

### Employer Features
- Create and manage a company profile
- Post, edit, and delete job listings
- View and manage applications (accept, reject, shortlist)

### Candidate Features
- Browse and search job listings with filters
- Apply to jobs with cover letter and PDF resume upload
- Track application status in real-time

### Job Listings
- Full-text search (title + description)
- Filter by remote status, job type, and salary range
- Server-side pagination

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework |
| **PostgreSQL 16** | Relational database |
| **SQLAlchemy 2.0** | Async ORM (asyncpg driver) |
| **Alembic** | Database migrations |
| **Pydantic v2** | Data validation & serialization |
| **python-jose** | JWT token handling |
| **bcrypt** | Password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite 5** | Build tool & dev server |
| **TailwindCSS v4** | Utility-first CSS |
| **React Router v6** | Client-side routing |
| **TanStack React Query** | Server state management |
| **Zustand** | Client state management |
| **Axios** | HTTP client with interceptors |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |
| **Nginx** | Frontend production server & reverse proxy |

---

## 🏗 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL   │
│  React/Nginx │     │   FastAPI    │     │   Database    │
│   :3000      │     │   :8000      │     │   :5432       │
└─────────────┘     └──────────────┘     └──────────────┘
```

**Backend Pattern:** Router → Service → Repository → Model (clean layered architecture)

**Frontend Pattern:** Pages → API Layer → Axios (with JWT interceptors) → Backend

---

##  Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/              # Config, security, exceptions, dependencies
│   │   │   ├── config.py      # Pydantic Settings (env-based)
│   │   │   ├── security.py    # Password hashing + JWT utilities
│   │   │   ├── exceptions.py  # Custom HTTP exceptions
│   │   │   └── deps.py        # Auth & role-based dependencies
│   │   ├── db/                # Database session & base model
│   │   │   ├── base.py        # Declarative Base (id, created_at, updated_at)
│   │   │   └── session.py     # Async engine + session factory
│   │   ├── models/            # SQLAlchemy ORM models
│   │   │   ├── user.py        # User (candidate/employer roles)
│   │   │   ├── company.py     # Company (one per employer)
│   │   │   ├── job.py         # Job listing
│   │   │   └── application.py # Job application
│   │   ├── schemas/           # Pydantic v2 request/response schemas
│   │   ├── repositories/      # Data access layer (async queries)
│   │   ├── services/          # Business logic layer
│   │   ├── routers/           # FastAPI route handlers
│   │   ├── utils/             # Pagination utility
│   │   └── main.py            # FastAPI app entrypoint
│   ├── alembic/               # Database migrations
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/               # API service functions
│   │   ├── components/        # Shared UI components
│   │   ├── pages/             # Page components (8 pages)
│   │   ├── stores/            # Zustand state stores
│   │   ├── lib/               # Axios instance + interceptors
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Route definitions
│   │   └── main.tsx           # React entry point
│   ├── Dockerfile             # Multi-stage build (Node → Nginx)
│   ├── nginx.conf             # Nginx config with API proxy
│   └── package.json
├── docker-compose.yml         # 3-service orchestration
└── openapi.yml                # OpenAPI 3.0 spec for Postman
```

---

##  Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/bekgm/job_finding_service.git
cd job_finding_service
```

### 2. Configure environment (optional)

Copy the example env file and adjust if needed:

```bash
cp backend/.env.example backend/.env
```

Default values work out of the box for local development.

### 3. Start all services

```bash
docker-compose up --build -d
```

This starts 3 containers:
| Service | URL | Description |
|---|---|---|
| **Frontend** | http://localhost:3000 | React app served via Nginx |
| **Backend API** | http://localhost:8000 | FastAPI with auto-docs |
| **Database** | localhost:5433 | PostgreSQL 16 |

### 4. Run database migrations

```bash
docker-compose exec api alembic upgrade head
```

### 5. Open the application

Visit **http://localhost:3000** in your browser.

### Stopping the services

```bash
docker-compose down
```

To also remove database data:

```bash
docker-compose down -v
```

---

##  API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login (returns JWT tokens) | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Companies (`/api/companies`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/companies` | Create a company | Employer |
| GET | `/api/companies/me` | Get my company | Yes |
| PATCH | `/api/companies/me` | Update my company | Employer |
| GET | `/api/companies/{id}` | Get company by ID | No |

### Jobs (`/api/jobs`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/jobs` | List jobs (filter, search, paginate) | No |
| POST | `/api/jobs` | Create a job | Employer |
| GET | `/api/jobs/employer/my-jobs` | List my posted jobs | Employer |
| GET | `/api/jobs/{id}` | Get job details | No |
| PATCH | `/api/jobs/{id}` | Update a job | Employer (owner) |
| DELETE | `/api/jobs/{id}` | Delete a job | Employer (owner) |

### Applications (`/api/applications`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/applications/jobs/{id}/apply` | Apply to a job (multipart) | Candidate |
| GET | `/api/applications/me` | My applications | Candidate |
| GET | `/api/applications/jobs/{id}` | Applications for a job | Employer (owner) |
| PATCH | `/api/applications/{id}/status` | Update application status | Employer (owner) |

>  Full OpenAPI spec available in [`openapi.yml`](openapi.yml) — import into Postman for testing.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@db:5432/jobboard` | Database connection string |
| `SECRET_KEY` | `change-me-in-production` | JWT signing secret |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `UPLOAD_DIR` | `uploads` | Resume upload directory |
| `MAX_UPLOAD_SIZE_MB` | `5` | Max resume file size |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `jobboard` | Database name |

---

## 🗄 Database Schema

```
┌──────────────┐       ┌──────────────┐
│    users     │       │  companies   │
├──────────────┤       ├──────────────┤
│ id (UUID PK) │───┐   │ id (UUID PK) │
│ email        │   │   │ name         │
│ hashed_pwd   │   │   │ description  │
│ full_name    │   ├──▶│ owner_id(FK) │ (unique, 1:1)
│ role (enum)  │   │   │ website      │
│ is_active    │   │   │ location     │
│ created_at   │   │   │ created_at   │
│ updated_at   │   │   │ updated_at   │
└──────┬───────┘   │   └──────┬───────┘
       │           │          │
       │           │          │
       ▼           │          ▼
┌──────────────┐   │   ┌──────────────┐
│ applications │   │   │    jobs      │
├──────────────┤   │   ├──────────────┤
│ id (UUID PK) │   │   │ id (UUID PK) │
│ candidate_id │◀──┘   │ title        │
│ job_id (FK)  │──────▶│ description  │
│ status(enum) │       │ location     │
│ cover_letter │       │ is_remote    │
│ resume_path  │       │ job_type     │
│ created_at   │       │ salary_min   │
│ updated_at   │       │ salary_max   │
└──────────────┘       │ is_active    │
                       │ company_id   │
                       │ created_at   │
                       │ updated_at   │
                       └──────────────┘
```

**Enums:**
- `UserRole`: `candidate`, `employer`
- `JobType`: `full_time`, `part_time`, `contract`, `internship`
- `ApplicationStatus`: `pending`, `reviewed`, `shortlisted`, `rejected`, `accepted`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
