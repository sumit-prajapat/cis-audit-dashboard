<div align="center">

# 🛡️ CIS Audit & Compliance Dashboard

**Automated CIS Benchmark security auditing with real-time dashboards and PDF reports**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://cis-audit-dashboard.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-HuggingFace-yellow?style=for-the-badge&logo=huggingface)](https://mk1311-cis-audit-api.hf.space/docs)
[![GitHub](https://img.shields.io/badge/GitHub-sumit--prajapat-181717?style=for-the-badge&logo=github)](https://github.com/sumit-prajapat/cis-audit-dashboard)

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)

</div>

---

## 📌 Overview

The **CIS Audit & Compliance Dashboard** is a full-stack security auditing tool that automatically scans Windows 11 and Linux systems against **CIS (Center for Internet Security) Benchmark** controls. It tracks compliance scores over time, visualizes results in a real-time dashboard, and generates professional PDF reports.

> Built as part of the **Smart India Hackathon (SIH)** — addressing the need for automated, standardized security compliance auditing in enterprise environments.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Automated Scanning** | 37 CIS Benchmark checks (18 Windows 11 + 19 Linux) |
| 📊 **Live Dashboard** | Real-time compliance scores, trend charts, device management |
| 📄 **PDF Reports** | Professional multi-page reports with remediation steps |
| 🔐 **JWT Auth** | Secure login/register with token-based authentication |
| 🌐 **Cloud Deployed** | Live on Vercel + Hugging Face Spaces + Supabase |
| 🐳 **Dockerized** | Full Docker + docker-compose local setup |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CIS Audit Dashboard                       │
├──────────────┬──────────────────┬───────────────────────────┤
│   Agent       │    Backend       │       Frontend            │
│  (Python)     │   (FastAPI)      │       (React)             │
│               │                  │                           │
│  ┌─────────┐  │  ┌────────────┐  │  ┌─────────────────────┐ │
│  │Windows  │  │  │ REST API   │  │  │  Dashboard          │ │
│  │Checks   │──┼─▶│ 8 endpoints│  │  │  Devices            │ │
│  │(18)     │  │  │            │  │  │  Scans              │ │
│  └─────────┘  │  │ PostgreSQL │  │  │  PDF Download       │ │
│  ┌─────────┐  │  │ (Supabase) │  │  └─────────────────────┘ │
│  │Linux    │  │  │            │  │                           │
│  │Checks   │  │  │ JWT Auth   │  │  Recharts  │  Tailwind   │
│  │(19)     │  │  │            │  │  Axios     │  Vite       │
│  └─────────┘  │  └────────────┘  │                           │
└──────────────┴──────────────────┴───────────────────────────┘
     Local             HF Spaces              Vercel
```

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🖥️ **Frontend Dashboard** | https://cis-audit-dashboard.vercel.app |
| ⚙️ **Backend API** | https://mk1311-cis-audit-api.hf.space |
| 📖 **API Docs (Swagger)** | https://mk1311-cis-audit-api.hf.space/docs |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — High-performance Python REST API
- **SQLAlchemy** — ORM for PostgreSQL
- **Supabase** — Managed PostgreSQL (Mumbai region)
- **ReportLab** — PDF report generation
- **JWT (python-jose)** — Authentication
- **Docker** — Containerization

### Frontend
- **React 18** + **Vite 5** — Modern frontend tooling
- **React Router v6** — Client-side routing
- **Recharts** — Data visualization
- **Axios** — HTTP client
- **Tailwind CSS** — Utility-first styling

### Agent
- **Python 3.11** — Audit script
- **psutil** — System information
- **subprocess / winreg** — Windows registry checks
- **requests** — API communication

---

## 📋 CIS Benchmark Checks

### Windows 11 (18 Checks)
| Category | Checks |
|---|---|
| Account Policies | Password length, max age, lockout threshold, lockout duration |
| User Management | Guest account, Administrator rename |
| Windows Firewall | Domain, Private, Public profiles |
| Remote Desktop | NLA authentication, RDP disabled if unused |
| Windows Update | Automatic updates enabled |
| Antivirus | Windows Defender real-time protection |
| Audit Policy | Logon events, account logon events |
| Services | Telnet, Remote Registry, SNMP disabled |

### Linux (19 Checks)
| Category | Checks |
|---|---|
| Filesystem | Separate /tmp partition, nodev/nosuid/noexec mounts |
| SSH | Root login disabled, empty passwords, protocol version |
| Authentication | Password complexity, max days, min days, warn age |
| Services | Cron daemon, auditd running |
| Network | IP forwarding, packet redirect sending |
| File Permissions | /etc/passwd, /etc/shadow permissions |

---

## 🏃 Local Setup

### Prerequisites
- Docker + Docker Compose
- Python 3.11
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/sumit-prajapat/cis-audit-dashboard.git
cd cis-audit-dashboard
```

### 2. Start Backend + Database
```bash
docker-compose up db backend --build
```
API available at: `http://localhost:8000`

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Dashboard at: `http://localhost:5173`

### 4. Run Audit Agent
```bash
cd agent
pip install -r requirements.txt
cp .env.example .env   # set API_URL=http://localhost:8000
python scanner.py
```

---

## 📁 Project Structure

```
cis-audit-dashboard/
├── 📂 agent/                    # Python audit agent
│   ├── checks/
│   │   ├── windows.py           # 18 Windows 11 CIS checks
│   │   └── linux.py             # 19 Linux CIS checks
│   ├── scanner.py               # Main scan runner
│   └── reporter.py              # API reporter
│
├── 📂 backend/                  # FastAPI backend
│   ├── routes/
│   │   ├── auth.py              # JWT auth endpoints
│   │   ├── scans.py             # Scan CRUD endpoints
│   │   └── reports.py           # PDF report endpoint
│   ├── main.py                  # App entry point
│   ├── models.py                # SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas
│   ├── database.py              # DB connection
│   ├── pdf_generator.py         # ReportLab PDF engine
│   └── Dockerfile               # HF Spaces deployment
│
├── 📂 frontend/                 # React dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Overview + stats
│   │   │   ├── Devices.jsx      # Device management
│   │   │   ├── Scans.jsx        # All scans list
│   │   │   └── ScanDetail.jsx   # Individual scan view
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation
│   │   │   ├── ScoreGauge.jsx   # Animated SVG gauge
│   │   │   ├── TrendChart.jsx   # Recharts line graph
│   │   │   ├── CheckTable.jsx   # Filterable results
│   │   │   └── SeverityBadge.jsx# Color-coded badges
│   │   └── api/index.js         # Axios API layer
│   └── vercel.json              # Vercel SPA config
│
└── docker-compose.yml           # Local dev setup
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/api/devices` | List all scanned devices |
| `GET` | `/api/scans` | List all scans |
| `GET` | `/api/scans/{id}` | Get scan with check results |
| `POST` | `/api/scans` | Submit new scan results |
| `GET` | `/api/reports/{id}/pdf` | Download PDF report |
| `GET` | `/` | Health check |

---

## 📄 PDF Report Structure

Each generated PDF report contains:
1. **Cover Page** — Device info, compliance score gauge, summary stats
2. **Failed Checks** — Detailed failures with severity and remediation steps
3. **Warnings** — Items requiring attention
4. **Complete Results Table** — All 18/19 checks with status
5. **Remediation Summary** — Action items to improve score

---

## 🔐 Environment Variables

### Backend
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-jwt-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend
```env
VITE_API_URL=https://your-backend.hf.space
```

### Agent
```env
API_URL=http://localhost:8000
```

---

## 🤝 Team

Built by a 6-member team for **Smart India Hackathon (SIH) 2026**

---

## 📜 License

MIT License — feel free to use and modify for your own projects.

---

<div align="center">

**Made with ❤️ for SIH 2026**

⭐ Star this repo if you found it useful!

</div>