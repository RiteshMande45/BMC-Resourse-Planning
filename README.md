<div align="center">

# 🗂️ BMC Resource Planning System

### Intelligent Resource & Project Management Platform

**Elliot Systems Pvt Ltd** — Internal Enterprise Tool

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)]()

</div>

---

## 📌 Overview

The **BMC Resource Planning System** is a backend REST API built for Elliot Systems to manage:

- 👥 **Employee & Intern profiles** with skills and availability
- 📁 **Projects & Client tracking** with resource allocations
- 📊 **Dashboard views** for managers and owners
- 🕐 **Timesheets & Task management**
- 📋 **HR workflows** — resource requests and approvals
- 🔔 **Notifications & Audit logging**

---

## ⚙️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | v18+ |
| Framework | Express.js | 4.18.2 |
| Database | PostgreSQL | 17 |
| DB Driver | node-postgres (pg) | 8.11.3 |
| Security | Helmet + JWT | — |
| Dev Tool | Nodemon | 3.1.0 |

---

## 📁 Project Structure

```
bmc-resource-planning/
├── backend/
│   ├── src/
│   │   ├── server.js                   # 🚀 Entry point
│   │   ├── app.js                      # Express configuration
│   │   ├── config/
│   │   │   ├── database.js             # PostgreSQL connection pool
│   │   │   └── env.js                  # Environment validation
│   │   ├── middleware/
│   │   │   ├── errorHandler.js         # Global error handling
│   │   │   └── notFound.js             # 404 handler
│   │   ├── routes/
│   │   │   └── index.js                # API route definitions
│   │   └── db/
│   │       ├── migrations/
│   │       │   └── 001_initial_schema.sql  # 23-table schema
│   │       └── seeds/                      # Data population scripts
│   ├── .env.example                    # Environment template
│   ├── .gitignore
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- ✅ [Node.js v18+](https://nodejs.org/en/download)
- ✅ [PostgreSQL 17](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
- ✅ [pgAdmin 4](https://www.pgadmin.org/download/) *(optional but recommended)*

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Harshita-Pawar/bmc-resource-planning.git
cd bmc-resource-planning/backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment

```bash
cp .env.example .env
```

Open `.env` and update with your credentials:

```env
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bmc_resource_planning
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
```

### 4️⃣ Create the Database

1. Open **pgAdmin 4**
2. Create a new database: `bmc_resource_planning`
3. Open **Query Tool** → Load file:
   ```
   backend/src/db/migrations/001_initial_schema.sql
   ```
4. Press **F5** to run — this creates all **23 tables**

### 5️⃣ Seed Initial Data *(optional)*

```bash
node src/db/seeds/seed_projects_and_allocations.js
node src/db/seeds/seed_sample_data.js
```

### 6️⃣ Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

> ✅ Server running at: **http://localhost:8000**

---

## 🔗 API Endpoints

### Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status & version info |
| `GET` | `/health` | Health check with uptime |

### Coming Soon

| Module | Endpoints |
|--------|-----------|
| 🔐 Auth | `POST /api/auth/login`, `POST /api/auth/logout` |
| 👤 Employees | `GET /api/employees`, availability & skill matching |
| 📁 Projects | `GET/POST /api/projects`, allocations |
| 📊 Dashboard | Manager & owner views |
| 🧾 HR | Resource requests & approvals |
| ⏱️ Tasks | Timesheets, tasks, time entries |

---

## 🗄️ Database Schema

**23 tables** across 6 domains:

```
👥 People        →  users, employees, employee_skills, skills
📁 Projects      →  clients, deals, projects, project_skills, allocations
⏱️  Work          →  tasks, time_entries, timesheet_weeks, leaves
🧑‍💼 HR            →  resource_requests, resource_request_lines, request_events
💰 Finance       →  invoices, certificates, learning_logs
⚙️  System        →  notifications, audit_log, sync_runs, documents
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 8000) | No |
| `NODE_ENV` | `development` or `production` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | Token expiry duration | No |

---

## 💻 Frontend (React + Material UI)

A standalone React 18 frontend dashboard suite located in `frontend/`.

### Prerequisites & Tech Stack
- React 18 + Vite (JavaScript)
- Material UI (MUI v5) + Emotion
- Recharts (visualizations & metrics)
- Dayjs, Axios, React Router v6

### 1️⃣ Installation & Environment
```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=true
```

- `VITE_USE_MOCK=true` *(default)*: Runs with comprehensive mock data simulating all 5 roles, PRD calculations, and 100% allocation rule checks.
- `VITE_USE_MOCK=false`: Connects directly to the Express backend via Axios.

### 2️⃣ Development & Testing
```bash
# Start local dev server (port 3000)
npm run dev

# Run Vitest test suite (calculations & business rules)
npm test

# Build production bundle
npm run build
```

### 3️⃣ Demo Accounts (Mock Mode)
Password for all demo accounts: **`Test@1234`**

| Role | Email | Name | Default Landing |
|---|---|---|---|
| **Owner** | `owner@test.com` | Test Owner | `/owner` |
| **Sales** | `sales@test.com` | Test Sales | `/sales` |
| **Manager / TL** | `manager@test.com` | Durgadas Barhate | `/manager` |
| **Employee** | `employee@test.com` | Test Employee | `/employee` |
| **HR** | `hr@test.com` | Test HR | `/hr` |

*(Note: Click any demo card on the login screen to auto-fill credentials.)*

### 4️⃣ Endpoints to Confirm with Backend Team
The following endpoints were proposed to support frontend feature completeness and should be aligned with backend:
- `POST /api/auth/login` and `GET /api/me` response shape
- `POST /api/projects/:id/documents` multipart upload
- `GET, POST /api/certificates`, `POST /api/certificates/:id/verify`, `POST /api/certificates/:id/reject`
- `GET /api/leaves`, `POST /api/leaves/sync`
- `GET, POST /api/deals` (Sales opportunity pipeline)
- `GET, POST /api/clients` (Client directory)
- `GET /api/users`, `PATCH /api/users/:id/role`, `PATCH /api/users/:id/active`
- `GET /api/audit-log` (System event audit log)
- `GET /api/notifications`

---

<div align="center">

**Elliot Systems Pvt Ltd** 

</div>
