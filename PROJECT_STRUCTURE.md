# 📁 Project Structure

**Last Updated:** October 19, 2026  
**Version:** 3.0.0

---

## 🎯 Overview

The CIS Audit Dashboard follows a clean, organized structure with three main components in the root directory:

```
cis-audit-dashboard/
├── frontend/          # React + Vite application
├── backend/           # FastAPI Python application  
└── README.md          # Project overview and quick start
```

---

## 📂 Detailed Structure

### Root Directory

```
cis-audit-dashboard/
├── .git/              # Git version control
├── .github/           # GitHub Actions workflows
├── .gitignore         # Git ignore rules
├── .vercel/           # Vercel deployment configuration
├── .vscode/           # VS Code workspace settings
├── frontend/          # Frontend application →
├── backend/           # Backend application →
├── README.md          # Main project documentation
└── render.yaml        # Render deployment configuration
```

### Frontend Directory

```
frontend/
├── public/            # Static assets
├── src/
│   ├── api/           # API client configuration
│   ├── components/    # Reusable React components
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # Business logic services
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # Application entry point
│   └── index.css      # Global styles
├── .env               # Environment variables (gitignored)
├── .env.example       # Environment template
├── index.html         # HTML entry point
├── package.json       # Node.js dependencies
├── vite.config.js     # Vite configuration
├── tailwind.config.js # TailwindCSS configuration
└── postcss.config.js  # PostCSS configuration
```

### Backend Directory

```
backend/
├── agent/             # Security scanner agent →
├── alembic/           # Database migrations
├── config/            # Configuration files →
├── docs/              # Documentation →
├── downloads/         # Scanner executables
├── middleware/        # FastAPI middleware
├── routes/            # API route handlers
├── services/          # Business logic services
├── tests/             # Unit and integration tests
├── .env               # Environment variables (gitignored)
├── .env.example       # Environment template
├── alembic.ini        # Alembic configuration
├── database.py        # Database configuration
├── Dockerfile         # Docker containerization
├── generate_secret.py # Secret key generator
├── main.py            # FastAPI application entry
├── models.py          # SQLAlchemy models
├── requirements.txt   # Python dependencies
├── schemas.py         # Pydantic schemas
├── start_server.sh    # Production startup script
└── Procfile           # Process file for deployment
```

#### Backend Subdirectories

##### agent/
```
agent/
├── checks/            # Security check modules
│   ├── windows.py     # Windows-specific checks
│   ├── linux.py       # Linux-specific checks
│   └── __init__.py
├── build/             # Build artifacts
├── dist/              # Compiled executables
├── launcher.py        # Agent launcher
├── reporter.py        # Report generator
├── scanner.py         # Main scanner logic
├── requirements.txt   # Agent dependencies
└── build_launcher.py  # Build script
```

##### config/
```
config/
├── docker-compose.yml # Docker Compose configuration
├── nixpacks.toml      # Nixpacks configuration
├── Procfile           # Alternative process file
└── render.yaml        # Backend-specific Render config
```

##### docs/
```
docs/
├── deployment/        # Deployment guides
├── DEMO_CHECKLIST.md  # Demo preparation checklist
├── DEPLOYMENT_GUIDE.md# General deployment guide
├── PRODUCTION_DEPLOYMENT.md # Production deployment
├── QUICK_FIX_SUMMARY.md # Bug fix summary
├── QUICK_START.md     # Quick start guide
├── RENDER_DEPLOY_NOW.md # Render deployment
└── USER_GUIDE.md      # End user guide
```

---

## 🔍 Key Files Explained

### Root Level

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start, and links to documentation |
| `render.yaml` | Render deployment configuration (references backend/) |
| `.gitignore` | Specifies files to ignore in version control |

### Frontend

| File | Purpose |
|------|---------|
| `src/main.jsx` | Application entry point, mounts React app |
| `src/App.jsx` | Main app component, routing configuration |
| `src/api/index.js` | Axios API client with interceptors |
| `package.json` | Dependencies and scripts |
| `.env` | Environment variables (API URL, etc.) |

### Backend

| File | Purpose |
|------|---------|
| `main.py` | FastAPI application, middleware, routing |
| `database.py` | SQLAlchemy engine and session configuration |
| `models.py` | Database table definitions |
| `schemas.py` | Pydantic request/response models |
| `requirements.txt` | Python dependencies |
| `start_server.sh` | Production startup script |
| `.env` | Environment variables (database, secrets, etc.) |

---

## 🚀 Running the Application

### Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Production

**Backend (Render):**
- Uses `render.yaml` in root
- Automatically runs `start_server.sh`
- Environment variables set in Render dashboard

**Frontend (Vercel):**
- Auto-deploys from `frontend/` directory
- Build command: `npm run build`
- Environment: `VITE_API_URL`

---

## 📝 Notes

### Why This Structure?

1. **Clean Root:** Only essential items (frontend, backend, README)
2. **Organized:** All configs, docs, and agent in appropriate subdirectories
3. **Scalable:** Easy to add new components
4. **Deploy-Friendly:** Render and Vercel recognize structure automatically
5. **Maintainable:** Clear separation of concerns

### Path References

- All backend imports use relative paths within `backend/`
- Frontend imports use `src/` as base
- Configuration files reference `backend/` from root
- Documentation links updated to new locations

### Deployment Compatibility

- **Render:** `render.yaml` in root specifies `rootDir: backend`
- **Vercel:** Configured to use `frontend/` as root directory
- **Docker:** Dockerfile in `backend/` works standalone
- **Local:** Each directory can be developed independently

---

## 🔄 Migration from Old Structure

If you're updating from the old structure:

1. ✅ All documentation moved to `backend/docs/`
2. ✅ Configuration files moved to `backend/config/`
3. ✅ Agent moved to `backend/agent/`
4. ✅ Environment files moved to respective directories
5. ✅ Root cleaned to 3 main items
6. ✅ All paths updated and tested
7. ✅ No functionality broken

---

## 📚 Additional Resources

- **Quick Start:** `backend/docs/QUICK_START.md`
- **Deployment:** `backend/docs/PRODUCTION_DEPLOYMENT.md`
- **User Guide:** `backend/docs/USER_GUIDE.md`
- **API Docs:** `http://localhost:8000/api/docs` (when running)

---

**Last Verified:** October 19, 2026  
**Structure Version:** 3.0.0  
**Status:** ✅ Production Ready
