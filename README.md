# 🛡️ CIS Audit & Compliance Dashboard

A full-stack **enterprise-grade** cybersecurity compliance platform that runs **CIS Benchmark checks** on Windows and Linux machines, displays results on a live compliance dashboard with 6 specialized views, tracks score history over time, and generates downloadable PDF reports.

**Status**: Production Architecture | Active Development  
**Version**: 1.0.0-beta

---

## ⚡ QUICK START (30 Minutes)

### Prerequisites

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))

### Windows Quick Start

```cmd
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/cis-audit-dashboard.git
cd cis-audit-dashboard

# 2. Test your setup
TEST_SETUP.bat

# 3. Start everything (opens 3 windows)
START_PROJECT.bat
```

### Manual Setup

```bash
# 1. Create .env file
copy .env.example .env
# Edit .env and change SECRET_KEY!

# 2. Start database
docker-compose up -d db

# 3. Apply database migrations
cd backend
pip install -r requirements.txt
python -m alembic upgrade head

# 4. Start backend (Terminal 1)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 5. Start frontend (Terminal 2)
cd frontend
npm install
npm run dev

# 5. Visit http://localhost:5173
```

### First Login

1. **Register**: http://localhost:5173/register
   - Email: `admin@test.com`
   - Password: `StrongPass123!@#` (min 12 chars, mixed case, numbers, symbols)
   - Full Name: `Admin User`
   - Organization: `My Company`

2. **Run a Scan**:
```bash
cd agent
pip install -r requirements.txt
python scanner.py --email admin@test.com --password "StrongPass123!@#"
```

3. **View Results**: Dashboard, Devices, Scans, Reports

---

## 🚀 Features

### ✅ Currently Working

- **Multi-Tenant SaaS**: Complete organization isolation with RBAC
- **CIS Benchmark Checks**: 18 Windows + 19 Linux controls
- **6 Enterprise Dashboards**:
  - 📊 Executive Dashboard (C-level metrics)
  - 🔒 Security Operations (SOC view)
  - ✅ Compliance Dashboard (Framework tracking)
  - 💻 Asset Dashboard (Device inventory)
  - ⚠️ Risk Dashboard (Risk matrix)
  - 📄 Reporting Dashboard (PDF generation)
- **JWT Authentication**: Secure login with refresh tokens & session management
- **RBAC**: Owner, Admin, Viewer roles with permission system
- **PDF Reports**: Branded compliance reports with ReportLab
- **Stripe Billing**: Subscription management (Starter, Growth, Team plans)
- **Email Service**: Password reset, invites, notifications (Resend integration)
- **Database Migrations**: Alembic for schema versioning
- **Health Checks**: Kubernetes-ready liveness & readiness probes
- **Security Middleware**: Rate limiting, CSRF, security headers
- **Compliance Mapping**: NIST CSF, ISO 27001, PCI DSS, SOC 2
- **Notification System**: Slack & Teams webhook integration
- **Audit Logging**: Complete action tracking
- **Real-time Charts**: Recharts visualization
- **Responsive Design**: Mobile-friendly UI
- **Docker Support**: Full containerization with docker-compose
- **Test Suite**: 19 passing tests (health, models, services)
- **CI/CD Pipeline**: GitHub Actions with automated testing

### 🚧 Future Enhancements

- Frontend testing framework (Jest/Vitest)
- Enhanced test coverage for authentication flows
- 2FA authentication
- Scheduled scanning automation
- Advanced compliance framework mapping
- Real-time websocket notifications
- Third-party integrations (Jira, Splunk, ServiceNow)
- Mobile app (React Native)
- Advanced analytics and dashboards

---

## 📁 Project Structure

```
cis-audit-dashboard/
├── agent/                  # Python scanner (runs on target machines)
│   ├── scanner.py          # Main entry point
│   ├── reporter.py         # API communication
│   └── checks/             # OS-specific CIS checks
│       ├── windows.py      # 18 Windows checks
│       └── linux.py        # 19 Linux checks
│
├── backend/                # FastAPI REST API
│   ├── main.py             # App entry point
│   ├── models.py           # SQLAlchemy ORM (14 tables)
│   ├── schemas.py          # Pydantic validation
│   ├── routes/             # API endpoints
│   │   ├── auth.py         # Authentication
│   │   ├── scans.py        # Scan management
│   │   ├── reports.py      # PDF generation
│   │   ├── billing.py      # Stripe integration
│   │   └── orgs.py         # Organization management
│   ├── services/           # Business logic
│   │   ├── auth_service.py
│   │   ├── scan_service.py
│   │   └── device_service.py
│   ├── middleware/         # Security middleware
│   │   ├── auth_middleware.py
│   │   ├── rate_limiter.py
│   │   └── security_headers.py
│   └── pdf_generator.py   # ReportLab PDF generation
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── pages/          # Dashboard pages
│   │   │   ├── ExecutiveDashboard.jsx
│   │   │   ├── SecurityOpsDashboard.jsx
│   │   │   ├── ComplianceDashboard.jsx
│   │   │   ├── AssetDashboard.jsx
│   │   │   ├── RiskDashboard.jsx
│   │   │   └── ReportingDashboard.jsx
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API client & business logic
│   │   ├── config/         # Theme & constants
│   │   └── contexts/       # React contexts
│   └── package.json
│
├── docker-compose.yml      # PostgreSQL + Services
├── .env.example            # Environment template
├── START_PROJECT.bat       # Quick start script (Windows)
└── TEST_SETUP.bat          # Verify prerequisites
```

---

## 🔍 Scanning Workflow

```
1. Agent Execution on Target Machine
   ↓
2. OS Detection (Windows/Linux)
   ↓
3. Run CIS Checks (18-19 controls)
   ↓
4. Calculate Compliance Score
   ↓
5. POST Results to API (JWT authenticated)
   ↓
6. Backend: Create/Update Device & Scan Records
   ↓
7. Dashboard: Real-time Metrics Update
   ↓
8. Generate PDF Report (on-demand)
```

---

## 🔐 Security Features

- **JWT Authentication**: Access + refresh token rotation
- **Bcrypt Password Hashing**: Industry-standard
- **RBAC**: Role-based access control
- **Multi-Tenancy**: Organization-based data isolation
- **CSRF Protection**: Token-based validation
- **Rate Limiting**: 5000 req/hour per org
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Account Lockout**: 5 failed attempts = 15min lockout
- **Audit Logging**: All actions tracked
- **Session Management**: Multi-session support with revocation

---

## 🎨 Tech Stack

**Backend**:
- FastAPI 0.115+ (async Python web framework)
- PostgreSQL 15 + SQLAlchemy 2.0+ (ORM)
- JWT (python-jose) + Bcrypt
- Pydantic v2 (validation)
- ReportLab (PDF generation)
- Stripe SDK (billing)
- Resend (email)

**Frontend**:
- React 18 + Vite 5
- TailwindCSS 3.4 + Custom theme system
- Recharts 2.12 (charts)
- Axios 1.6 (HTTP client)
- React Router 6.22
- Lucide React (icons)

**Infrastructure**:
- Docker + Docker Compose
- PostgreSQL 15 with persistent volumes
- Uvicorn (ASGI server)

---

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `GET /auth/sessions` - List sessions
- `POST /auth/sessions/{id}/revoke` - Revoke session
- `POST /auth/logout-all` - Logout all sessions
- `POST /auth/password-reset/request` - Request password reset
- `POST /auth/password-reset/confirm` - Confirm password reset

### Scans
- `POST /api/scans` - Submit scan results
- `GET /api/scans` - List scans
- `GET /api/scans/{id}` - Get scan details
- `GET /api/scans/compliance-metrics` - Org compliance metrics

### Devices
- `GET /api/devices` - List devices
- `GET /api/devices/{id}` - Get device details
- `GET /api/devices/{id}/scans` - Get device scan history
- `GET /api/devices/{id}/compliance-trend` - Compliance trend
- `GET /api/devices/stats` - Device statistics

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/{scan_id}/pdf` - Download PDF
- `GET /api/reports/archive/{report_id}/pdf` - Download archived PDF

### Organizations
- `GET /orgs/me` - Get organization
- `PUT /orgs/me` - Update organization
- `POST /orgs/invite` - Invite member
- `POST /orgs/invite/{token}/accept` - Accept invite
- `DELETE /orgs/invite/{id}` - Revoke invite
- `DELETE /orgs/members/{id}` - Remove member
- `PUT /orgs/members/{id}/role` - Change member role

### Billing
- `GET /billing/status` - Get billing status
- `POST /billing/checkout` - Create checkout session
- `POST /billing/portal` - Create customer portal
- `POST /billing/webhook` - Stripe webhook

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=. --cov-report=term

# Run specific test file
python -m pytest tests/test_services.py -v

# Frontend tests (coming soon)
cd frontend
npm test
```

**Current Test Status**: ✅ 19 passing, 1 skipped (bcrypt environment issue)

Test Coverage:
- Health checks (3 tests)
- Database models (6 tests)
- Security services (10 tests)

---

## 📖 Documentation

- **[Quick Start Guide](#-quick-start-30-minutes)** - Get running in 30 minutes
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment checklist
- **[API Documentation](http://localhost:8000/api/docs)** - Interactive API docs (when running)
- **[Project Structure](#-project-structure)** - Codebase organization
- **[Scanning Workflow](#-scanning-workflow)** - How scans work
- **[Security Features](#-security-features)** - Security implementation details
- **[Validation Script](VALIDATE_DEPLOYMENT.bat)** - Pre-deployment checks

---

## 🤝 Contributing

This is a portfolio/resume project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

Built as a comprehensive full-stack cybersecurity portfolio project showcasing:
- Enterprise SaaS architecture
- Security best practices
- Modern web development
- DevOps practices
- Cloud infrastructure

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/cis-audit-dashboard/issues)
- **Documentation**: See `/docs` folder
- **Quick Start**: Run `START_PROJECT.bat` or read `QUICK_FIX_PLAN.md`

---

**Status**: 🟢 Active Development | Last Updated: August 2026
