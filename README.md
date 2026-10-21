# 🛡️ CIS Audit Dashboard

Enterprise-grade security compliance platform for automated CIS benchmark auditing, real-time monitoring, and comprehensive reporting.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115-green.svg)](https://fastapi.tiangolo.com)
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://cis-audit-dashboard.vercel.app)

---

## 🌐 Live Deployment

- **Frontend**: https://cis-audit-dashboard.vercel.app
- **Backend API**: https://cis-audit-api.onrender.com
- **Health Check**: https://cis-audit-api.onrender.com/health

---

## 🚨 Quick Deployment Fix

**Having database connection issues?** See our deployment guides:

| Guide | Use Case | Time |
|-------|----------|------|
| [**MASTER_DEPLOYMENT_GUIDE.md**](MASTER_DEPLOYMENT_GUIDE.md) | Start here - Complete overview | 15 min |
| [**STEP_BY_STEP_POSTGRESQL_FIX.md**](STEP_BY_STEP_POSTGRESQL_FIX.md) | Step-by-step PostgreSQL setup | 10 min |
| [**CHECK_RENDER_SETUP.md**](CHECK_RENDER_SETUP.md) | Diagnose your current setup | 5 min |
| [**PERMANENT_POSTGRESQL_SETUP.md**](PERMANENT_POSTGRESQL_SETUP.md) | Detailed PostgreSQL guide | 15 min |

**Most common issue**: DATABASE_URL has incomplete hostname (missing `.render.com` domain suffix)

---

## 📋 Overview

CIS Audit Dashboard automates CIS (Center for Internet Security) benchmark auditing for Windows and Linux systems. Built with modern technologies, it provides real-time security posture monitoring, automated scanning, and executive-ready reporting.

### Key Features

- **Automated Security Scanning** - One-click scanner deployment
- **Real-time Monitoring** - Live compliance status tracking
- **Multi-tenant Architecture** - Organization-based isolation with RBAC
- **Comprehensive Reporting** - Executive, technical, compliance, and risk reports
- **Enterprise Security** - JWT authentication, CSRF protection, rate limiting
- **Free Tier Ready** - Optimized for Render + Vercel free tiers

---

## 🏗️ Project Structure

```
cis-audit-dashboard/
├── frontend/          # React + Vite frontend application
├── backend/           # FastAPI backend API
│   ├── agent/         # Security scanner agent
│   ├── config/        # Configuration files (render.yaml, docker-compose, etc.)
│   └── docs/          # Documentation files
├── README.md          # This file
└── render.yaml        # Render deployment configuration
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (backend)
- **Node.js 20+** (frontend)
- **PostgreSQL 15+** (production) or SQLite (development)

### Local Development

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
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend: `http://localhost:8000`  
API Docs: `http://localhost:8000/api/docs`

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env to point to backend

# Start frontend
npm run dev
```

Frontend: `http://localhost:5173`

---

## 🌐 Production Deployment

### Backend (Render)

1. Create PostgreSQL database on Render
2. Deploy web service:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `bash start_server.sh`
3. Set environment variables (see `backend/.env.example`)

### Frontend (Vercel)

1. Connect GitHub repository
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Environment Variable:** `VITE_API_URL=<your-backend-url>`

**📚 Full deployment guide:** `backend/docs/PRODUCTION_DEPLOYMENT.md`

---

## ✨ Key Technologies

### Frontend
- React 18.2 + Vite 5.4
- TailwindCSS
- Axios
- React Router

### Backend
- FastAPI 0.115
- SQLAlchemy ORM
- PostgreSQL / SQLite
- Alembic migrations
- JWT authentication

### Scanner Agent
- Python 3.11+
- Windows & Linux support
- PyInstaller (executable packaging)

---

## 📊 Features

### Security Scanning
- 18+ automated security checks
- Password policies
- Firewall configuration
- Encryption status
- System updates
- File permissions

### Dashboards
- Executive Dashboard
- Security Operations
- Compliance Dashboard
- Asset Dashboard
- Risk Dashboard

### Reporting
- PDF export
- Excel export
- CSV export
- Scheduled reports
- Custom branding

### Multi-tenancy
- Organization isolation
- Role-based access control (Owner, Admin, Member, Read-only)
- Team collaboration
- Audit logging

---

## 🔒 Security

- JWT-based authentication
- CSRF protection
- Rate limiting
- Bcrypt password hashing
- SQL injection protection
- XSS protection
- HTTPS enforcement

---

## 📖 Documentation

- **Quick Start:** `backend/docs/QUICK_START.md`
- **Production Deployment:** `backend/docs/PRODUCTION_DEPLOYMENT.md`
- **User Guide:** `backend/docs/USER_GUIDE.md`
- **Demo Checklist:** `backend/docs/DEMO_CHECKLIST.md`
- **API Documentation:** `http://localhost:8000/api/docs` (when running)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sumit Prajapat**
- GitHub: [@sumit-prajapat](https://github.com/sumit-prajapat)
- Email: mk131iasus@gmail.com

---

## 🙏 Acknowledgments

- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📈 Project Status

**Version:** 3.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 19, 2026

### Recent Updates
- ✅ Comprehensive database handling with NullPool for serverless
- ✅ Bulletproof startup script with health checks
- ✅ Production-grade error handling and logging
- ✅ Clean project structure and organization
- ✅ Complete deployment documentation

---

## 🗺️ Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] SIEM integration (Splunk, ELK)
- [ ] ML-based anomaly detection
- [ ] Custom compliance frameworks
- [ ] Automated remediation
- [ ] SSO integration (SAML, OAuth2)
- [ ] Container scanning (Docker, Kubernetes)

---

<div align="center">

**[⬆ Back to top](#-cis-audit-dashboard)**

Made with ❤️ for enterprise security teams

</div>
