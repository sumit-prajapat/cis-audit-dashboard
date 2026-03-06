<<<<<<< HEAD
# 🛡️ CIS Audit & Compliance Dashboard

A full-stack platform that runs **CIS Benchmark checks** on Windows 11 and Linux machines, displays results on a live compliance dashboard, tracks score history over time, and generates downloadable PDF reports.

---

## 🚀 Tech Stack

- **Agent:** Python 3.11 (runs CIS checks on target machine)
- **Backend:** FastAPI + PostgreSQL + SQLAlchemy
- **Frontend:** React + Vite + TailwindCSS + Recharts
- **Auth:** JWT (bcrypt password hashing)
- **Reports:** ReportLab PDF generation
- **Infra:** Docker + Docker Compose

---

## 📁 Project Structure

```
cis-audit-dashboard/
├── agent/          # Python scanner (runs on target machine)
├── backend/        # FastAPI REST API
├── frontend/       # React dashboard
├── docker-compose.yml
└── .env.example
```

---

## ⚙️ Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/cis-audit-dashboard.git
cd cis-audit-dashboard

# 2. Set up environment
cp .env.example .env
# Edit .env with your secrets

# 3. Start everything
docker-compose up --build

# 4. Open
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

---

## 🔍 Running a Scan

```bash
cd agent
pip install -r requirements.txt
python scanner.py
```

The agent runs CIS checks on the current machine and POSTs results to the API.

---

## 📊 Features

- ✅ CIS Benchmark checks for Windows 11 & Ubuntu
- ✅ Compliance score (0–100%) per device
- ✅ Historical trend tracking
- ✅ Pass / Fail / Warn per check with severity levels
- ✅ One-click PDF report download
- ✅ Multi-device support
- ✅ JWT-secured API

---

## 📸 Screenshots

*(Coming soon)*

---

## 👨‍💻 Author

Built as a resume project showcasing Cybersecurity + Full Stack + DevOps skills.
=======
# cis-audit-dashboard
>>>>>>> 30744c41273c030e5ceb0d8cf0c9a7af4cb5d81a
