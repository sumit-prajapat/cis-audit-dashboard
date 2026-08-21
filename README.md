# 🛡️ CIS Audit Dashboard

**Enterprise-grade security compliance auditing platform** for Windows and Linux systems based on CIS Benchmarks.

[![Deploy Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://cis-audit-dashboard.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Features

### 🔐 Security & Compliance
- **CIS Benchmark Auditing** - Windows & Linux system compliance checks
- **Multi-Tenant SaaS** - Organization-based access control with RBAC
- **Audit Logging** - Complete trail of all system activities
- **Automated Scans** - Schedule and run compliance checks

### 📊 Dashboard & Reporting
- **Real-time Dashboard** - Live compliance status and metrics
- **PDF Reports** - Professional audit reports with evidence
- **Historical Tracking** - Compliance trends over time
- **Device Management** - Centralized asset inventory

### 👥 Team Collaboration
- **Organization Management** - Multi-user workspace support
- **Role-Based Access** - Owner, Admin, Member, Read-only roles
- **Team Invitations** - Invite members via email
- **Activity Monitoring** - Track team member actions

### 💳 Subscription & Billing
- **Stripe Integration** - Secure payment processing
- **Multiple Plans** - Free, Professional, Enterprise tiers
- **Usage Tracking** - Monitor device limits and scans
- **Automatic Billing** - Recurring subscriptions

---

## 🚀 Quick Start

### 🎯 For End Users (Easiest!)

**Just want to scan your computer?**

1. **Register**: https://cis-audit-dashboard.vercel.app/register
2. **Click "Quick Scan"** button in dashboard
3. **Download launcher** for your OS (Windows/Linux)
4. **Run the file** - Results appear automatically!

✅ No Python installation  
✅ No command line needed  
✅ Works like any other app

**See [QUICK_START.md](QUICK_START.md) for detailed instructions.**

---

### 🛠️ For Developers

#### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database
- Stripe account (for billing)
- Resend account (for emails)

#### 1. Clone Repository
```bash
git clone https://github.com/sumit-prajapat/cis-audit-dashboard.git
cd cis-audit-dashboard
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment template
cp .env .env.local
# Edit .env.local with your API URL

# Start frontend dev server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

---

## 📦 Project Structure

```
cis-audit-dashboard/
├── backend/               # FastAPI backend application
│   ├── alembic/          # Database migrations
│   ├── middleware/       # Security & auth middlewares
│   ├── models.py         # SQLAlchemy database models
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic layer
│   ├── database.py       # Database configuration
│   ├── main.py           # FastAPI app entry point
│   └── requirements.txt  # Python dependencies
│
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client services
│   │   └── App.jsx      # Main app component
│   ├── package.json     # Node dependencies
│   └── vite.config.js   # Vite configuration
│
├── agent/                # CIS compliance scanning agent
│   ├── checks/          # Platform-specific checks
│   ├── scanner.py       # Main scanner
│   └── reporter.py      # Results reporter
│
├── docs/                 # Documentation
│   └── deployment/      # Deployment guides
│
├── render.yaml          # Render.com deployment config
├── vercel.json          # Vercel deployment config
└── README.md            # This file
```

---

## 🌐 Production Deployment

### Current Production Setup

**Frontend**: Vercel  
**Backend**: Render.com  
**Database**: Render PostgreSQL  

**Live URLs**:
- Frontend: https://cis-audit-dashboard.vercel.app
- Backend API: https://cis-audit-api.onrender.com

### Deploy Your Own

#### 1. Deploy Backend to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

1. Create account on [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see `.env.example`)
6. Deploy!

#### 2. Deploy Frontend to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Create account on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL
5. Deploy!

#### 3. Create Database

On Render:
1. Click "New +" → "PostgreSQL"
2. Create free database
3. Copy Internal Database URL
4. Add to backend environment as `DATABASE_URL`

**📚 Detailed deployment guide**: See `docs/deployment/`

---

## 🔧 Configuration

### Backend Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Security
SECRET_KEY=your-secret-key-here
APP_ENV=production

# Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Cookies
COOKIE_SECURE=true
COOKIE_SAMESITE=lax

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# Payments (Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Frontend Environment Variables

```bash
# Backend API URL
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL with SQLAlchemy 2.0
- **Authentication**: JWT tokens with refresh token rotation
- **Migrations**: Alembic
- **PDF Generation**: ReportLab
- **Payments**: Stripe
- **Email**: Resend
- **Security**: CORS, CSRF, Rate limiting, bcrypt

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **UI Library**: Ant Design 5
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Charts**: Recharts

### DevOps
- **Backend Hosting**: Render.com
- **Frontend Hosting**: Vercel
- **Database**: Render PostgreSQL
- **CI/CD**: GitHub Actions
- **Monitoring**: Render logs, Vercel Analytics

---

## 📖 API Documentation

Interactive API documentation available at:
- **Swagger UI**: `/api/docs`
- **ReDoc**: `/api/redoc`

### Key Endpoints

```
Authentication
POST   /auth/register           Register new user
POST   /auth/login              Login
POST   /auth/refresh            Refresh access token
GET    /auth/me                 Get current user

Scans
GET    /api/scans               List all scans
POST   /api/scans               Create new scan
GET    /api/scans/{id}          Get scan details

Reports
GET    /api/reports             List reports
GET    /api/reports/{id}/pdf    Download PDF report

Organizations
GET    /orgs/me                 Get organization
POST   /orgs/invite             Invite team member

Billing
GET    /billing/status          Subscription status
POST   /billing/checkout        Create checkout session
```

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

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **CIS Benchmarks** - Security configuration guidelines
- **FastAPI** - Modern Python web framework
- **React** - UI library
- **Ant Design** - Component library
- **Render & Vercel** - Hosting platforms

---

## 📞 Support

- **Documentation**: `/docs`
- **Issues**: [GitHub Issues](https://github.com/sumit-prajapat/cis-audit-dashboard/issues)
- **Email**: support@example.com

---

## 🎯 Roadmap

- [ ] Multi-cloud support (AWS, Azure, GCP)
- [ ] API for third-party integrations
- [ ] Mobile app (iOS & Android)
- [ ] Advanced analytics & ML predictions
- [ ] Compliance frameworks (HIPAA, SOC 2, ISO 27001)
- [ ] Automated remediation suggestions
- [ ] Real-time notifications
- [ ] SSO integration (SAML, OAuth)

---

**Built with ❤️ for security teams worldwide**

**[Live Demo](https://cis-audit-dashboard.vercel.app)** | **[Documentation](docs/)** | **[Report Bug](issues)** | **[Request Feature](issues)**
