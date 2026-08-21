# 📁 Project Structure

Complete overview of the CIS Audit Dashboard project organization.

---

## 🏗️ Root Directory

```
cis-audit-dashboard/
├── 📁 backend/              # FastAPI backend application
├── 📁 frontend/             # React frontend application
├── 📁 agent/                # CIS compliance scanning agent
├── 📁 docs/                 # Documentation
├── 📁 .github/              # GitHub workflows (CI/CD)
├── 📄 .env                  # Local development environment
├── 📄 .env.example          # Environment template
├── 📄 .env.production       # Production environment reference
├── 📄 .gitignore            # Git ignore rules
├── 📄 docker-compose.yml    # Docker composition (optional)
├── 📄 render.yaml           # Render.com deployment config
├── 📄 vercel.json           # Vercel deployment config
├── 📄 Procfile              # Process file for Render
├── 📄 nixpacks.toml         # Nixpacks build config
├── 📄 README.md             # Main project documentation
└── 📄 PROJECT_STRUCTURE.md  # This file
```

---

## 🔙 Backend (`/backend`)

Python FastAPI application with PostgreSQL database.

```
backend/
├── 📁 alembic/                    # Database migrations
│   ├── 📁 versions/               # Migration scripts
│   │   └── e3521211cbef_*.py     # Initial schema migration
│   ├── env.py                     # Alembic environment config
│   └── script.py.mako             # Migration template
│
├── 📁 middleware/                 # Custom middlewares
│   ├── auth_middleware.py         # Authentication middleware
│   ├── csrf_protection.py         # CSRF token validation
│   ├── error_handler.py           # Global error handling
│   ├── rate_limiter.py            # Rate limiting
│   ├── security_headers.py        # Security headers (HSTS, etc)
│   └── __init__.py
│
├── 📁 routes/                     # API route handlers
│   ├── auth.py                    # Authentication endpoints
│   ├── billing.py                 # Stripe billing endpoints
│   ├── compliance.py              # Compliance reporting
│   ├── orgs.py                    # Organization management
│   ├── reports.py                 # Report generation
│   ├── scans.py                   # Scan management
│   └── __init__.py
│
├── 📁 services/                   # Business logic layer
│   ├── auth_service.py            # Authentication logic
│   ├── base_service.py            # Base service class
│   ├── device_service.py          # Device management
│   ├── email_service.py           # Email sending (Resend)
│   ├── notification_service.py    # Notifications
│   ├── organization_service.py    # Organization logic
│   ├── scan_service.py            # Scan orchestration
│   ├── security_service.py        # Security utilities
│   └── __init__.py
│
├── 📁 tests/                      # Test suite
│   ├── conftest.py                # Pytest configuration
│   ├── test_health.py             # Health check tests
│   ├── test_models.py             # Database model tests
│   ├── test_services.py           # Service layer tests
│   └── __init__.py
│
├── 📄 alembic.ini                 # Alembic configuration
├── 📄 database.py                 # Database connection & session
├── 📄 main.py                     # FastAPI app entry point
├── 📄 models.py                   # SQLAlchemy database models
├── 📄 schemas.py                  # Pydantic request/response schemas
├── 📄 pdf_generator.py            # PDF report generation
├── 📄 requirements.txt            # Python dependencies
├── 📄 pytest.ini                  # Pytest configuration
├── 📄 .env.example                # Backend environment template
├── 📄 Dockerfile                  # Docker image definition
├── 📄 Procfile                    # Process file
└── 📄 runtime.txt                 # Python version specification
```

### Key Backend Files

**`main.py`**
- FastAPI application initialization
- Middleware setup (CORS, CSRF, rate limiting, security)
- Route registration
- Startup/shutdown events
- Health check endpoints

**`models.py`**
- SQLAlchemy ORM models
- Database schema definitions
- Relationships and constraints
- Indexes for performance

**`database.py`**
- Database engine creation
- Session management
- Connection pooling
- Migration support

**`routes/`**
- API endpoint definitions
- Request validation
- Response formatting
- Authentication/authorization

**`services/`**
- Business logic
- External API integrations (Stripe, Resend)
- Complex operations
- Reusable components

---

## 🎨 Frontend (`/frontend`)

React application built with Vite and Ant Design.

```
frontend/
├── 📁 public/                     # Static assets
│   └── test-env.html             # Environment test page
│
├── 📁 src/                        # Source code
│   ├── 📁 api/                    # API client
│   │   └── index.js               # Axios instance & API calls
│   │
│   ├── 📁 components/             # React components
│   │   ├── Header.jsx             # App header
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   ├── ScanCard.jsx           # Scan result card
│   │   └── ...                    # Other components
│   │
│   ├── 📁 pages/                  # Page components
│   │   ├── Login.jsx              # Login page
│   │   ├── Register.jsx           # Registration page
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Scans.jsx              # Scans list
│   │   ├── Reports.jsx            # Reports list
│   │   ├── Settings.jsx           # User settings
│   │   └── ...                    # Other pages
│   │
│   ├── 📁 services/               # Service layer
│   │   └── apiClient.js           # API client utilities
│   │
│   ├── 📁 styles/                 # CSS styles
│   │   └── index.css              # Global styles
│   │
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── router.jsx                 # React Router config
│
├── 📄 .env                        # Local environment
├── 📄 .env.production             # Production environment
├── 📄 index.html                  # HTML template
├── 📄 package.json                # Node dependencies & scripts
├── 📄 package-lock.json           # Locked dependencies
├── 📄 vite.config.js              # Vite configuration
├── 📄 postcss.config.js           # PostCSS config
├── 📄 tailwind.config.js          # Tailwind CSS config (if used)
├── 📄 Dockerfile                  # Docker image
└── 📄 nginx.conf                  # Nginx config for production
```

### Key Frontend Files

**`src/main.jsx`**
- React app initialization
- Router setup
- Global providers

**`src/App.jsx`**
- Main app layout
- Route definitions
- Authentication context

**`src/api/index.js`**
- Axios configuration
- API request interceptors
- Response interceptors (token refresh)
- All API endpoint calls

**`src/pages/`**
- Full page components
- Route-level components
- Page-specific logic

**`src/components/`**
- Reusable UI components
- Presentational components
- Shared business components

---

## 🤖 Agent (`/agent`)

CIS Benchmark compliance scanning agent for Windows and Linux.

```
agent/
├── 📁 checks/                     # Platform-specific checks
│   ├── linux.py                   # Linux CIS checks
│   ├── windows.py                 # Windows CIS checks
│   └── __init__.py
│
├── 📄 scanner.py                  # Main scanner orchestrator
├── 📄 reporter.py                 # Results reporter
├── 📄 requirements.txt            # Python dependencies
└── 📄 .env                        # Agent configuration
```

### Agent Functionality

**`scanner.py`**
- Detects operating system
- Runs appropriate checks
- Collects results
- Sends to backend API

**`checks/linux.py`**
- Linux-specific CIS Benchmark checks
- File permissions
- Service configurations
- User/group settings

**`checks/windows.py`**
- Windows-specific CIS Benchmark checks
- Registry settings
- Group Policy
- Service configurations

**`reporter.py`**
- Formats scan results
- Sends to backend API
- Handles errors
- Logging

---

## 📚 Documentation (`/docs`)

```
docs/
├── 📄 README.md                   # Documentation index
│
└── 📁 deployment/                 # Deployment guides
    ├── ARCHITECTURE.md            # System architecture
    ├── CHECK_RENDER_ENV.md        # Environment checklist
    ├── CODE_QUALITY_REVIEW.md     # Code quality guidelines
    ├── DEPLOY_NOW.md              # Quick deployment
    ├── DEPLOYMENT.md              # Vercel deployment
    ├── DEPLOYMENT_STATUS.md       # Deployment status
    ├── FINAL_FIX.md               # Complete fix guide
    ├── FIX_DATABASE_ERROR.md      # Database troubleshooting
    ├── FIX_NOW.md                 # Quick fixes
    ├── FIX_SUPABASE_CONNECTION.md # Supabase connection
    ├── RENDER_DEPLOYMENT.md       # Render deployment guide
    ├── SETUP_INSTRUCTIONS.md      # Setup instructions
    ├── START_HERE.md              # Getting started
    ├── TROUBLESHOOT_405.md        # 405 error fixes
    └── VERCEL_SETUP_COMPLETE.md   # Vercel setup
```

---

## 🔧 Configuration Files

### Root Level

**`render.yaml`**
- Render.com service configuration
- Build and start commands
- Environment variable definitions
- Resource allocation

**`vercel.json`**
- Vercel deployment configuration
- Build settings
- Framework detection
- Output directory

**`docker-compose.yml`**
- Multi-container Docker setup
- Service definitions (backend, database)
- Volume mounts
- Network configuration

**`Procfile`**
- Process type definitions
- Start commands for Render/Heroku

**`nixpacks.toml`**
- Nixpacks build configuration
- Custom build phases
- Package installations

---

## 🌍 Environment Files

### `.env` (Local Development)
- Local PostgreSQL connection
- Development secrets
- Localhost URLs
- Debug settings

### `.env.example` (Template)
- Template for new developers
- All required variables
- Example values
- Documentation comments

### `.env.production` (Production Reference)
- Production environment reference
- Secure settings
- Production URLs
- Notes and instructions

---

## 🚀 Deployment Structure

### Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     INTERNET                             │
└───────────┬──────────────────────────────┬───────────────┘
            │                              │
            ▼                              ▼
┌──────────────────────┐      ┌────────────────────────────┐
│   VERCEL (Frontend)  │      │  RENDER.COM (Backend)      │
│   React + Vite       │──────│  FastAPI + Python          │
│   Static Hosting     │ API  │  Web Service               │
└──────────────────────┘      └─────────────┬──────────────┘
                                            │
                                            ▼
                              ┌────────────────────────────┐
                              │  RENDER POSTGRESQL         │
                              │  Database                  │
                              └────────────────────────────┘
```

---

## 📦 Dependencies

### Backend (Python)
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **psycopg** - PostgreSQL driver
- **python-jose** - JWT tokens
- **bcrypt** - Password hashing
- **stripe** - Payment processing
- **resend** - Email service
- **reportlab** - PDF generation

### Frontend (Node.js)
- **React** - UI library
- **Vite** - Build tool
- **Ant Design** - Component library
- **Axios** - HTTP client
- **React Router** - Routing
- **Recharts** - Charts

---

## 🔒 Security Files

**`.gitignore`**
- Excludes sensitive files from git
- Prevents committing secrets
- Ignores build artifacts
- Excludes dependencies

**Protected Files:**
- `.env` (local credentials)
- `.env.production` (production secrets)
- `*.pem` (SSL certificates)
- `*.key` (private keys)

---

## 📊 File Counts

```
Backend:    ~50 Python files
Frontend:   ~30 JavaScript files
Agent:      ~5 Python files
Docs:       ~15 Markdown files
Config:     ~10 configuration files
Tests:      ~10 test files
```

---

## 🎯 Key Directories

| Directory | Purpose | Language | Lines of Code |
|-----------|---------|----------|---------------|
| `backend/` | API server | Python | ~5,000 |
| `frontend/` | UI application | JavaScript | ~3,000 |
| `agent/` | Scanner | Python | ~1,000 |
| `docs/` | Documentation | Markdown | ~2,000 |

---

## 📝 Notes

1. **Backend** is the main application server (FastAPI)
2. **Frontend** is the user interface (React)
3. **Agent** runs on client systems to perform scans
4. **Docs** contain deployment and usage guides
5. All sensitive data is in `.env` files (gitignored)
6. Production secrets are managed in Render/Vercel dashboards
7. Database migrations are tracked in `backend/alembic/versions/`

---

**Last Updated**: August 21, 2026  
**Project Version**: 3.0.0  
**Total Files**: ~120  
**Total Lines of Code**: ~11,000+
