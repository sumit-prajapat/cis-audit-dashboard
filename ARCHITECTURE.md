# 🏗️ CIS Audit Dashboard - Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                    https://your-app.vercel.app               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ HTTPS Requests
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
┌───────────────────────────┐  ┌─────────────────────────────┐
│   VERCEL (Frontend)       │  │  RENDER.COM (Backend API)    │
│                           │  │                              │
│  React + Vite App         │  │  FastAPI Application         │
│  Static Files (JS/CSS)    │  │  Python 3.11                 │
│                           │  │  Uvicorn ASGI Server         │
│  Environment:             │  │                              │
│  - VITE_API_URL           │  │  Endpoints:                  │
│                           │  │  - /auth/* (Authentication)  │
│  Auto-deploys on push     │  │  - /api/* (Scans, Reports)   │
│  to GitHub main branch    │  │  - /orgs/* (Organizations)   │
│                           │  │  - /billing/* (Stripe)       │
│  CDN: Global Edge Network │  │  - /health (Health Checks)   │
└───────────────────────────┘  └──────────────┬───────────────┘
                                              │
                                              │ SQL Queries
                                              │
                                              ▼
                              ┌────────────────────────────────┐
                              │  SUPABASE (Database)           │
                              │                                │
                              │  PostgreSQL Database           │
                              │  Managed Service               │
                              │                                │
                              │  Tables:                       │
                              │  - users                       │
                              │  - organizations               │
                              │  - scans                       │
                              │  - devices                     │
                              │  - audit_logs                  │
                              │  - and more...                 │
                              │                                │
                              │  Connection:                   │
                              │  SSL/TLS Encrypted             │
                              └────────────────────────────────┘
```

---

## 🔄 Request Flow

### 1. User Registration/Login Flow

```
User Browser
    │
    │ 1. User fills registration form
    ▼
Vercel Frontend (React)
    │
    │ 2. POST /auth/register with email, password, org_name
    ▼
Render Backend (FastAPI)
    │
    │ 3. Validate input
    │ 4. Hash password with bcrypt
    │ 5. Create organization
    │ 6. Create user
    ▼
Supabase PostgreSQL
    │
    │ 7. Insert into organizations table
    │ 8. Insert into users table
    │ 9. Return created records
    ▼
Render Backend (FastAPI)
    │
    │ 10. Generate JWT tokens (access + refresh)
    │ 11. Create auth session
    │ 12. Set secure cookies
    ▼
Vercel Frontend (React)
    │
    │ 13. Store tokens in localStorage
    │ 14. Redirect to dashboard
    ▼
User sees Dashboard
```

### 2. API Request with Authentication

```
User Browser
    │
    │ 1. User clicks "View Scans"
    ▼
Vercel Frontend (React)
    │
    │ 2. GET /api/scans with Authorization header
    │    Headers: { Authorization: "Bearer <token>" }
    ▼
Render Backend (FastAPI)
    │
    │ 3. Extract JWT token from header
    │ 4. Verify token signature
    │ 5. Check token expiry
    │ 6. Check if token is blacklisted
    │ 7. Load user from database
    │ 8. Check user permissions
    ▼
Supabase PostgreSQL
    │
    │ 9. Query scans table
    │    WHERE org_id = user.org_id
    │ 10. Return scan records
    ▼
Render Backend (FastAPI)
    │
    │ 11. Format response as JSON
    │ 12. Add CORS headers
    ▼
Vercel Frontend (React)
    │
    │ 13. Display scans in table
    ▼
User sees Scan List
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                      │
└────────────────────────────────────────────────────────────┘

1. TRANSPORT LAYER
   ├── HTTPS/TLS on all connections
   ├── Automatic SSL certificates (Let's Encrypt)
   └── No plain HTTP allowed

2. FRONTEND SECURITY (Vercel)
   ├── CORS configured
   ├── XSS protection (Content Security Policy)
   ├── CSRF tokens for state-changing requests
   └── HttpOnly cookies for refresh tokens

3. BACKEND SECURITY (Render)
   ├── Rate Limiting (5000 req/hour per IP)
   ├── Security Headers Middleware
   │   ├── X-Content-Type-Options: nosniff
   │   ├── X-Frame-Options: DENY
   │   ├── X-XSS-Protection: 1; mode=block
   │   └── Strict-Transport-Security (HSTS)
   ├── CSRF Protection Middleware
   ├── Trusted Host Middleware
   └── Input Validation (Pydantic)

4. AUTHENTICATION & AUTHORIZATION
   ├── Password hashing (bcrypt with salt)
   ├── JWT tokens (access + refresh)
   ├── Token blacklisting on logout
   ├── Session management
   ├── Role-Based Access Control (RBAC)
   │   ├── owner (full access)
   │   ├── admin (manage org)
   │   ├── member (view + create)
   │   └── read_only (view only)
   └── Email verification (optional)

5. DATABASE SECURITY (Supabase)
   ├── SSL/TLS connections only
   ├── Connection pooling
   ├── SQL injection prevention (SQLAlchemy ORM)
   ├── Row Level Security (RLS)
   └── Automatic backups

6. AUDIT LOGGING
   ├── All auth events logged
   ├── All data modifications logged
   ├── IP address tracking
   ├── User agent tracking
   └── Timestamp tracking
```

---

## 📦 Technology Stack

### Frontend (Vercel)
```
Framework:    React 18
Build Tool:   Vite 5.x
UI Library:   Ant Design 5.x
HTTP Client:  Axios
Router:       React Router v6
Charts:       Recharts
State:        React Hooks + Context
Language:     JavaScript (ES6+)
```

### Backend (Render)
```
Framework:    FastAPI 0.104+
Server:       Uvicorn (ASGI)
ORM:          SQLAlchemy 2.x
Migrations:   Alembic
Auth:         Python-Jose (JWT), Passlib (bcrypt)
Validation:   Pydantic v2
PDF:          ReportLab
Email:        Resend API
Payment:      Stripe API
Language:     Python 3.11
```

### Database (Supabase)
```
Database:     PostgreSQL 15+
Extension:    pgcrypto, uuid-ossp
Pooling:      Supavisor
SSL:          Required
Backups:      Daily automatic
```

### DevOps
```
CI/CD:        GitHub Actions
Frontend:     Vercel (auto-deploy)
Backend:      Render (auto-deploy)
Monitoring:   Render logs, Vercel Analytics
Version:      Git (GitHub)
```

---

## 🌐 Deployment Architecture

### Environment: Production

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└───────────┬──────────────────────────────────┬──────────────┘
            │                                  │
            │                                  │
┌───────────▼─────────────┐    ┌──────────────▼──────────────┐
│   VERCEL CDN NETWORK    │    │   RENDER.COM SERVERS        │
│   (Edge Locations)      │    │   (Oregon/Frankfurt/etc)     │
│                         │    │                              │
│   - Global CDN          │    │   - Docker Containers        │
│   - Auto-scaling        │    │   - Auto-scaling             │
│   - 99.99% uptime       │    │   - Health checks            │
│   - DDoS protection     │    │   - Auto-restart on failure  │
│   - Asset optimization  │    │   - Log aggregation          │
└─────────────────────────┘    └──────────────────────────────┘
                                               │
                                               │
                                ┌──────────────▼──────────────┐
                                │   SUPABASE CLOUD            │
                                │   (AWS us-east-1)           │
                                │                             │
                                │   - Managed PostgreSQL      │
                                │   - Automatic backups       │
                                │   - Connection pooling      │
                                │   - 99.9% uptime SLA        │
                                └─────────────────────────────┘
```

---

## 📊 Data Flow & State Management

### Frontend State Management

```
User Authentication State
    ├── localStorage
    │   ├── access_token (JWT)
    │   ├── refresh_token (JWT)
    │   ├── csrf_token
    │   └── user (JSON object)
    │
    └── React Context
        ├── AuthContext (current user, isAuthenticated)
        └── Actions: login(), logout(), refreshToken()

Application Data State
    ├── API Calls (axios)
    │   ├── Request interceptor (add auth header)
    │   └── Response interceptor (handle 401, refresh token)
    │
    └── Component State (useState, useEffect)
        ├── Scans list
        ├── Devices list
        ├── Reports list
        └── Organization details
```

### Backend State Management

```
Request Lifecycle
    │
    ├── 1. Middleware Stack (sequential)
    │   ├── TrustedHostMiddleware
    │   ├── CORSMiddleware
    │   ├── SessionMiddleware
    │   ├── SecurityHeadersMiddleware
    │   ├── CSRFMiddleware
    │   └── RateLimiterMiddleware
    │
    ├── 2. Route Handler
    │   ├── Path parameters
    │   ├── Query parameters
    │   ├── Request body (Pydantic validation)
    │   └── Dependencies (Depends)
    │
    ├── 3. Authentication (if required)
    │   ├── Extract JWT from header
    │   ├── Verify signature
    │   ├── Check expiry
    │   ├── Load user from DB
    │   └── Check permissions
    │
    ├── 4. Business Logic (Service Layer)
    │   ├── AuthService
    │   ├── ScanService
    │   ├── DeviceService
    │   ├── OrganizationService
    │   └── SecurityService
    │
    ├── 5. Database Operations (SQLAlchemy)
    │   ├── Query building
    │   ├── Transaction management
    │   ├── Relationship loading
    │   └── Commit/Rollback
    │
    └── 6. Response
        ├── Pydantic model serialization
        ├── JSON encoding
        └── HTTP headers
```

---

## 🔄 Database Schema Overview

```
organizations
    ├── id (UUID, PK)
    ├── name
    ├── slug (unique)
    ├── plan (free/professional/enterprise)
    ├── device_limit
    ├── stripe_customer_id
    └── created_at

users
    ├── id (UUID, PK)
    ├── email (unique)
    ├── hashed_password
    ├── full_name
    ├── org_id (FK → organizations)
    ├── role (owner/admin/member/read_only)
    ├── email_verified
    ├── is_active
    └── created_at

devices
    ├── id (UUID, PK)
    ├── org_id (FK → organizations)
    ├── hostname
    ├── os_type (windows/linux)
    ├── os_version
    ├── last_scan_at
    └── created_at

scans
    ├── id (UUID, PK)
    ├── org_id (FK → organizations)
    ├── device_id (FK → devices)
    ├── started_by (FK → users)
    ├── status (running/completed/failed)
    ├── total_checks
    ├── passed_checks
    ├── failed_checks
    ├── score
    ├── started_at
    └── completed_at

scan_results
    ├── id (UUID, PK)
    ├── scan_id (FK → scans)
    ├── check_id
    ├── check_name
    ├── status (pass/fail/warning/manual)
    ├── severity (high/medium/low)
    ├── message
    └── evidence

auth_sessions
    ├── id (UUID, PK)
    ├── user_id (FK → users)
    ├── session_id (unique)
    ├── refresh_jti (unique)
    ├── ip_address
    ├── user_agent
    ├── remember_me
    ├── expires_at
    ├── revoked_at
    └── created_at

audit_logs
    ├── id (UUID, PK)
    ├── org_id (FK → organizations)
    ├── user_id (FK → users)
    ├── action (e.g., "auth.login", "scan.create")
    ├── resource_type
    ├── resource_id
    ├── ip_address
    ├── status (success/failure)
    └── created_at
```

---

## 🚀 Deployment Pipeline

### Continuous Deployment Flow

```
Developer
    │
    │ 1. Write code locally
    ▼
Git Commit & Push
    │
    │ 2. git push origin main
    ▼
GitHub Repository
    │
    ├─────────────────────────┬─────────────────────────┐
    │                         │                         │
    ▼                         ▼                         ▼
Vercel Webhook          Render Webhook          GitHub Actions
    │                         │                         │
    │ 3. Detect push          │ 3. Detect push          │ 3. Run CI tests
    │ 4. Clone repo           │ 4. Clone repo           │    - Linting
    │ 5. cd frontend          │ 5. cd backend           │    - Unit tests
    │ 6. npm install          │ 6. pip install          │    - Integration tests
    │ 7. npm run build        │ 7. uvicorn start        │
    │ 8. Deploy to CDN        │ 8. Deploy container     │
    ▼                         ▼                         ▼
Production                Production              ✅ Tests Pass
(Frontend)                (Backend)                   or
cis-audit-dashboard      cis-audit-api            ❌ Tests Fail
.vercel.app              .onrender.com
```

---

## 📈 Scaling Considerations

### Current Setup (Free Tier)
```
Frontend:    ∞ requests/month (Vercel CDN)
Backend:     750 hours/month (Render free tier)
Database:    500 MB storage, unlimited requests (Supabase)
Users:       ~100-500 concurrent users
```

### Scaling Path
```
Phase 1: Current (Free)
    - Good for: MVP, testing, small deployments
    - Limit: Backend spins down after 15 min

Phase 2: Paid Tier ($7-10/month)
    - Render Starter ($7/mo)
    - No spin-down
    - More RAM/CPU
    - Good for: 1,000+ users

Phase 3: Professional ($50-100/month)
    - Multiple backend instances
    - Load balancer
    - Redis for caching
    - Supabase Pro ($25/mo)
    - Good for: 10,000+ users

Phase 4: Enterprise ($500+/month)
    - Kubernetes cluster
    - Auto-scaling
    - Multi-region
    - CDN optimization
    - Database read replicas
    - Good for: 100,000+ users
```

---

## 🎯 Performance Optimizations

### Frontend
```
✅ Code splitting (Vite automatic)
✅ Lazy loading routes
✅ Image optimization
✅ Asset compression (gzip/brotli)
✅ CDN caching
✅ Tree shaking (unused code removal)
```

### Backend
```
✅ Database connection pooling
✅ Query optimization (indexes)
✅ Response caching headers
✅ Async I/O (FastAPI + uvicorn)
✅ Pydantic validation (compiled C)
✅ Minimal dependencies
```

### Database
```
✅ Indexes on foreign keys
✅ Indexes on frequently queried fields
✅ Connection pooling
✅ Prepared statements
✅ Efficient queries (JOIN vs N+1)
```

---

## 📚 API Endpoints Overview

### Authentication (`/auth`)
```
POST   /auth/register              Create new user + org
POST   /auth/login                 Login with email/password
POST   /auth/logout                Logout current session
POST   /auth/logout-all            Logout all sessions
POST   /auth/refresh               Refresh access token
GET    /auth/me                    Get current user profile
GET    /auth/sessions              List all sessions
POST   /auth/sessions/{id}/revoke  Revoke specific session
POST   /auth/password-reset/request      Request reset link
POST   /auth/password-reset/confirm      Confirm new password
POST   /auth/verify-email/request        Request verification
POST   /auth/verify-email                Verify email
```

### Scans (`/api`)
```
GET    /api/scans                  List all scans
POST   /api/scans                  Create new scan
GET    /api/scans/{id}             Get scan details
GET    /api/scans/{id}/results     Get scan results
DELETE /api/scans/{id}             Delete scan
```

### Devices (`/api`)
```
GET    /api/devices                List all devices
GET    /api/devices/{id}           Get device details
PUT    /api/devices/{id}           Update device
DELETE /api/devices/{id}           Delete device
```

### Reports (`/api`)
```
GET    /api/reports                List all reports
GET    /api/reports/{id}           Get report details
GET    /api/reports/{id}/pdf       Download PDF report
POST   /api/reports                Generate new report
```

### Organizations (`/orgs`)
```
GET    /orgs/me                    Get current org
PUT    /orgs/me                    Update org settings
GET    /orgs/members               List org members
POST   /orgs/invite                Invite new member
DELETE /orgs/members/{id}          Remove member
PUT    /orgs/members/{id}/role     Change member role
```

### Billing (`/billing`)
```
GET    /billing/status             Get subscription status
POST   /billing/checkout           Create checkout session
POST   /billing/portal             Create customer portal
POST   /billing/webhook            Stripe webhook handler
```

---

**🎉 Complete Architecture Documentation**

This architecture is designed to be:
- ✅ **Scalable**: Easy to grow from 10 to 10,000 users
- ✅ **Secure**: Multiple security layers
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Cost-effective**: $0/month for starting out
- ✅ **Reliable**: 99.9% uptime on all services
