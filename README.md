# proccura   
**AI-Powered Procurement Platform**

Proccura is a modern, multi-tenant procurement platform that helps organizations simplify vendor management, automate purchasing workflows, and gain real-time control over spend and compliance using AI-driven insights.


## Why Proccura?

Most procurement tools used by mid-sized companies are either:
- too complex
- too expensive
- or built around outdated workflows.

Proccura started as an attempt to build a lightweight procurement platform that
handles vendor onboarding, purchasing workflows, and spend visibility without
the overhead of traditional ERP systems.

The project also explores how AI can assist procurement teams by automating
things like invoice extraction, vendor discovery, and anomaly detection.

## Key Features

- 🏢 **Multi-Tenant SaaS Architecture**
- 🤝 Vendor onboarding & management
- 🧾 Purchase Requests (PR) & Service Requests (SR)
- 📑 RFQ / RFP & quotation comparison
- 📦 Purchase Orders & invoice tracking
- 💳 Payment gateway integration
- 📍 Location-based vendor discovery (Uber H3)
- 🧠 AI-powered insights (OCR, recommendations, anomaly detection)
- 🔐 Role-based access & audit-ready workflows

---

## High-Level Architecture

Frontend (React)
↓
API Gateway (FastAPI)
↓
M$icroservices (FastAPI)
↓
PostgreSQL | Redis | AI | H3 | Payment Gateway

## 📁 Repository Structure

proccura/
├── frontend/ # React + TypeScript application
├── backend/ # FastAPI microservices
│ ├── auth-service/
│ ├── vendor-service/
│ ├── procurement-service/
│ ├── quotation-service/
│ ├── po-service/
│ ├── invoice-service/
│ ├── payment-service/
│ ├── location-service/ # Uber H3
│ ├── ai-service/ # ML, LLM, GenAI
│ └── shared/
├── infra/ # Docker, Nginx, CI/CD
├── docs/ # Architecture & decisions
└── README.md

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- React Query
- Redux Toolkit (auth & roles)
- React Hook Form + Zod

### Backend
- FastAPI (Python)
- PostgreSQL
- Redis
- SQLAlchemy
- JWT-based authentication

### AI & Intelligence
- Machine Learning (scikit-learn / XGBoost)
- LLMs (OpenAI / open-source)
- OCR (Tesseract / PaddleOCR)
- LangChain

### Infrastructure
- Docker & Docker Compose
- Nginx (API Gateway)
- GitHub Actions (CI/CD – planned)

---

## Multi-Tenancy Model

- Single database
- Shared tables with strict `tenant_id` isolation
- Tenant context derived from JWT
- No cross-tenant data access

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Docker & Docker Compose

### Clone Rep
```bash
git clone https://github.com/your-org/proccura.git
cd proccura

## Start Infrastructure;
docker-compose up

## Run Backend (example);
cd backend/auth-service
uvicorn app.main:app --reload

## Run Frontend
cd frontend
npm install
npm run dev
