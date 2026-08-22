# 🛡️ CIS Audit Dashboard

Enterprise-grade security compliance platform for automated CIS benchmark auditing, real-time monitoring, and comprehensive reporting.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.3-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115-green.svg)](https://fastapi.tiangolo.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## 🌟 Overview

CIS Audit Dashboard is a comprehensive security compliance platform that automates CIS (Center for Internet Security) benchmark auditing for Windows and Linux systems. Built with modern technologies, it provides real-time security posture monitoring, automated scanning, and executive-ready reporting.

### Key Capabilities

- **Automated Security Scanning** - One-click scanner deployment with zero configuration
- **Real-time Monitoring** - Live compliance status tracking across your infrastructure
- **Multi-tenant Architecture** - Organization-based isolation with role-based access control
- **Comprehensive Reporting** - Executive, technical, compliance, and risk reports
- **Enterprise-grade Security** - JWT authentication, CSRF protection, rate limiting, and audit logging

---

## ✨ Features

### 🔍 Scanning & Assessment
- **Quick Scan** - Download and run portable scanner in under 2 minutes
- **Scheduled Scans** - Automated compliance monitoring
- **Multi-platform Support** - Windows (10, 11, Server) and Linux (Ubuntu, Debian, CentOS, RHEL)
- **18+ Security Checks** - Password policies, firewall, encryption, updates, and more

### 📊 Dashboards & Analytics
- **Executive Dashboard** - High-level compliance metrics and trends
- **Security Operations** - Real-time alerts and incident management
- **Compliance Dashboard** - Regulatory framework alignment tracking
- **Asset Dashboard** - Device inventory and vulnerability management
- **Risk Dashboard** - Risk scoring and prioritization

### 📈 Reporting
- **Quick Report Generation** - One-click executive, technical, compliance, and risk reports
- **Scheduled Reports** - Automated report delivery
- **Multiple Formats** - PDF, Excel, and CSV export options
- **Custom Branding** - White-label reports with organization logo

### 👥 Multi-tenancy & Access Control
- **Organization Management** - Isolated workspaces for each customer
- **Role-based Access** - Owner, Admin, Member, and Read-only roles
- **Team Collaboration** - Invite team members, manage permissions
- **Audit Logging** - Complete activity tracking and compliance auditing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite + React)               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Dashboards │  │  Reports   │  │  Settings  │            │
│  └─────┬──────┘  └──────┬─────┘  └──────┬─────┘            │
│        │                 │                │                  │
│        └─────────────────┴────────────────┘                  │
│                          │                                    │
│                    REST API (HTTPS)                          │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                   Backend (FastAPI + PostgreSQL)             │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │   Auth    │  │  Scans   │  │  Reports  │  │  Billing │  │
│  │  Service  │  │  Service │  │  Service  │  │  Service │  │
│  └───────────┘  └──────────┘  └───────────┘  └──────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           PostgreSQL Database (Alembic ORM)          │   │
│  │  • Users  • Organizations  • Devices  • Scans        │   │
│  │  • Reports  • Audit Logs  • Billing                  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    Scanner Agent (Python)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Windows Checks    │  Linux Checks                     │  │
│  │  • Password Policy │  • SSH Configuration              │  │
│  │  • Firewall Status │  • Firewall Rules                 │  │
│  │  • Windows Defender│  • SELinux/AppArmor               │  │
│  │  • BitLocker       │  • Package Updates                │  │
│  │  • Account Lockout │  • File Permissions               │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- React 18.3 + Vite 5.4
- TailwindCSS for styling
- Lucide React icons
- React Router for navigation
- Axios for API calls

**Backend**
- FastAPI 0.115 (Python 3.11+)
- PostgreSQL 15+ with SQLAlchemy ORM
- Alembic for database migrations
- JWT authentication (python-jose)
- Bcrypt password hashing
- CORS, CSRF, and rate limiting middleware

**Scanner Agent**
- Python 3.11+ portable executable
- Windows Registry access (winreg)
- Linux system checks (subprocess)
- PyInstaller for executable packaging

**Infrastructure**
- Frontend: Vercel (Global CDN)
- Backend: Render (Cloud hosting)
- Database: Render PostgreSQL
- CI/CD: GitHub Actions

---

## � Quick Start

### Prerequisites

- **Python 3.11+** (for backend and scanner)
- **Node.js 20+** (for frontend)
- **PostgreSQL 15+** (for database)
- **Git** (for version control)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/sumit-prajapat/cis-audit-dashboard.git
cd cis-audit-dashboard
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with backend API URL

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

#### 4. Scanner Agent Setup
```bash
cd ../agent

# Install dependencies
pip install -r requirements.txt

# Test scanner locally
python launcher.py --token YOUR_ACCESS_TOKEN
```

---

## 🌐 Deployment

### Production Deployment

#### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** Leave empty or set to `.`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.com`
4. Deploy

#### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `SECRET_KEY` (generate with `python generate_secret.py`)
   - `FRONTEND_URL` = `https://your-frontend-url.com`
5. Deploy

#### Database (Render PostgreSQL)
1. Create PostgreSQL database on Render
2. Copy connection string
3. Add to backend environment as `DATABASE_URL`
4. Run migrations:
   ```bash
   alembic upgrade head
   ```

### Scanner Distribution
Build portable executables:

**Windows:**
```bash
cd agent
python build_launcher.py
# Output: dist/cis-scanner-windows.exe
```

**Linux:**
```bash
cd agent
pyinstaller --onefile launcher.py
# Output: dist/launcher (rename to cis-scanner-linux)
```

Place executables in `backend/downloads/` for user download.

---

## � Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Architecture Overview](docs/deployment/ARCHITECTURE.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [Setup Instructions](docs/deployment/SETUP_INSTRUCTIONS.md)

### API Documentation

Interactive API docs available at:
- **Swagger UI:** `https://your-backend-url.com/docs`
- **ReDoc:** `https://your-backend-url.com/redoc`

---

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Secure HTTP-only cookies for token storage
- CSRF protection for state-changing operations
- Role-based access control (RBAC)

### Data Protection
- Bcrypt password hashing (cost factor 12)
- Database connection encryption (SSL)
- Environment variable secrets management
- Input validation and sanitization

### Compliance
- GDPR-compliant data handling
- SOC 2 security controls
- Audit logging for all critical operations
- Regular security updates

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
# Or with coverage:
pytest --cov=. --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## �‍💻 Authors

**Sumit Prajapat**
- GitHub: [@sumit-prajapat](https://github.com/sumit-prajapat)
- Email: mk131iasus@gmail.com

---

## �🙏 Acknowledgments

- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/) for security standards
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python framework
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for modern frontend tooling
- [TailwindCSS](https://tailwindcss.com/) for utility-first styling

---

## � Project Status

**Current Version:** 2.2.0  
**Status:** Production Ready  
**Last Updated:** August 22, 2026

### Recent Updates
- ✅ One-click Quick Scan feature with portable executables
- ✅ Multi-dashboard analytics (Executive, Security Ops, Compliance, Risk)
- ✅ Automated report generation and scheduling
- ✅ Enhanced security with CSRF protection and rate limiting
- ✅ Improved UI/UX with modern design system

---

## 🗺️ Roadmap

- [ ] Mobile app (iOS and Android)
- [ ] Integration with SIEM platforms (Splunk, ELK)
- [ ] Advanced ML-based anomaly detection
- [ ] Custom compliance framework builder
- [ ] Automated remediation actions
- [ ] SSO integration (SAML, OAuth2)
- [ ] Kubernetes and container scanning

---

<div align="center">

**[⬆ back to top](#-cis-audit-dashboard)**

Made with ❤️ for enterprise security teams

</div>
