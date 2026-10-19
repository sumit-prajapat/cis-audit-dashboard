# 📚 Documentation Index

Welcome to the CIS Audit Dashboard documentation!

---

## 🚀 Getting Started

- **[Quick Start Guide](../README.md#quick-start)** - Get up and running in 5 minutes
- **[Installation](../README.md#backend-setup)** - Detailed installation instructions
- **[Configuration](../README.md#configuration)** - Environment variables and settings

---

## 📖 Deployment Guides

Located in `deployment/` folder:

### Main Guides
- **[START_HERE.md](deployment/START_HERE.md)** - Complete deployment overview
- **[FINAL_FIX.md](deployment/FINAL_FIX.md)** - Production deployment checklist
- **[RENDER_DEPLOYMENT.md](deployment/RENDER_DEPLOYMENT.md)** - Deploy backend to Render.com

### Platform-Specific
- **[DEPLOYMENT.md](deployment/DEPLOYMENT.md)** - Vercel frontend deployment
- **[DEPLOY_NOW.md](deployment/DEPLOY_NOW.md)** - Quick deployment reference

### Troubleshooting
- **[TROUBLESHOOT_405.md](deployment/TROUBLESHOOT_405.md)** - Fix 405 errors
- **[FIX_DATABASE_ERROR.md](deployment/FIX_DATABASE_ERROR.md)** - Database connection issues
- **[FIX_SUPABASE_CONNECTION.md](deployment/FIX_SUPABASE_CONNECTION.md)** - Supabase-specific fixes

### Reference
- **[CHECK_RENDER_ENV.md](deployment/CHECK_RENDER_ENV.md)** - Environment variables checklist
- **[ARCHITECTURE.md](deployment/ARCHITECTURE.md)** - System architecture documentation
- **[CODE_QUALITY_REVIEW.md](deployment/CODE_QUALITY_REVIEW.md)** - Code quality guidelines

---

## 🏗️ Architecture

- **[System Architecture](deployment/ARCHITECTURE.md)** - Complete system design
- **[Database Schema](deployment/ARCHITECTURE.md#database-schema-overview)** - Data models
- **[API Endpoints](deployment/ARCHITECTURE.md#api-endpoints-overview)** - REST API reference
- **[Security](deployment/ARCHITECTURE.md#security-layers)** - Security implementation

---

## 🔧 Development

### Backend (FastAPI)
- Located in: `backend/`
- Language: Python 3.11+
- Framework: FastAPI
- Database: PostgreSQL with SQLAlchemy
- Authentication: JWT tokens
- Testing: pytest

### Frontend (React)
- Located in: `frontend/`
- Language: JavaScript (ES6+)
- Framework: React 18
- Build Tool: Vite
- UI Library: Ant Design
- Testing: Vitest

### Agent (Scanner)
- Located in: `agent/`
- Language: Python 3.11+
- Platforms: Windows, Linux
- Checks: CIS Benchmarks

---

## 📋 API Documentation

Interactive API documentation available when backend is running:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

**Production API**: https://cis-audit-api.onrender.com/api/docs

---

## 🛠️ Configuration Reference

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `SECRET_KEY` | JWT signing key | Yes | - |
| `APP_ENV` | Environment (development/production) | No | development |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | Yes | - |
| `COOKIE_SECURE` | Use secure cookies (HTTPS) | No | true |
| `COOKIE_SAMESITE` | Cookie SameSite policy | No | lax |
| `RESEND_API_KEY` | Resend email API key | No | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | No | - |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | - |

---

## 🧪 Testing Guide

### Run Backend Tests
```bash
cd backend
pytest
pytest --cov=. --cov-report=html
```

### Run Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

---

## 🚀 Deployment Checklist

Before deploying to production:

### Backend
- [ ] Set all environment variables
- [ ] Run database migrations (`alembic upgrade head`)
- [ ] Test database connection
- [ ] Verify SECRET_KEY is strong and unique
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS (HTTPS)
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

### Frontend
- [ ] Set VITE_API_URL to production backend
- [ ] Build for production (`npm run build`)
- [ ] Test production build locally
- [ ] Verify API calls work
- [ ] Check browser console for errors
- [ ] Test on multiple browsers
- [ ] Optimize assets (images, fonts)

### Database
- [ ] PostgreSQL 15+ installed
- [ ] Strong password set
- [ ] SSL enabled
- [ ] Backups configured
- [ ] Connection pooling enabled
- [ ] Firewall rules configured

### Security
- [ ] HTTPS everywhere
- [ ] Secure cookies enabled
- [ ] CSRF protection active
- [ ] Rate limiting configured
- [ ] SQL injection prevention (use ORM)
- [ ] XSS protection headers
- [ ] Strong password policy
- [ ] JWT token expiry set
- [ ] Audit logging enabled

---

## 📊 Monitoring & Logs

### Backend Logs
- **Render**: Dashboard → Your Service → Logs
- **Local**: Check console output

### Frontend Logs
- **Vercel**: Dashboard → Your Project → Deployments → Logs
- **Browser**: F12 → Console tab

### Database Monitoring
- **Render**: Dashboard → PostgreSQL → Metrics
- Connection pool status
- Query performance
- Storage usage

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check logs for error messages
- Test database connection

**Frontend shows Network Error**
- Verify VITE_API_URL is set
- Check backend is running
- Test backend health endpoint
- Check browser console for CORS errors

**Database connection fails**
- Check DATABASE_URL format
- Verify password encoding (`@` → `%40`)
- Test network connectivity
- Check firewall rules

**401 Unauthorized errors**
- Check JWT token is valid
- Verify token not expired
- Check Authorization header is sent
- Test `/auth/refresh` endpoint

---

## 🔄 Update & Maintenance

### Update Dependencies

**Backend**:
```bash
pip install --upgrade -r requirements.txt
```

**Frontend**:
```bash
npm update
```

### Database Migrations

**Create migration**:
```bash
alembic revision --autogenerate -m "description"
```

**Apply migrations**:
```bash
alembic upgrade head
```

**Rollback migration**:
```bash
alembic downgrade -1
```

---

## 📞 Need Help?

- **GitHub Issues**: [Report bugs or request features](https://github.com/sumit-prajapat/cis-audit-dashboard/issues)
- **Documentation**: You're reading it!
- **Deployment Guides**: See `deployment/` folder

---

**Last Updated**: August 21, 2026  
**Version**: 3.0.0
