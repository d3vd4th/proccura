Proccura

AI-Powered Procurement Platform

Proccura is a procurement platform built to simplify how organizations manage vendors, purchasing workflows, and spending.

Instead of relying on fragmented tools or heavy ERP systems, Proccura aims to provide a lightweight platform where teams can manage vendor onboarding, purchase requests, quotations, and payments in a single place.

The platform also explores how AI can assist procurement teams through features like invoice OCR, vendor discovery, and anomaly detection.

Why Proccura?

Most procurement tools used by mid-sized organizations are either:

too complex to adopt quickly

too expensive for growing companies

or built around outdated workflows

Proccura started as an attempt to build a modern procurement platform that keeps the workflow simple while still providing strong visibility and automation.

The project also serves as an experiment in building a scalable multi-tenant SaaS architecture with AI-assisted procurement insights.

What Proccura Can Do

The platform focuses on core procurement workflows.

Vendor onboarding and management

Purchase Requests (PR) and Service Requests (SR)

RFQ / RFP creation and quotation comparison

Purchase Order generation and tracking

Invoice tracking and reconciliation

Payment gateway integration

Vendor discovery based on geographic proximity (Uber H3 indexing)

AI-assisted insights such as OCR and anomaly detection

Role-based access control and audit-ready workflows

Project Status

This project is currently under active development.

Working Modules

Authentication service

Vendor onboarding and management

Purchase request workflow

RFQ / quotation comparison

In Progress

Invoice OCR pipeline

Payment gateway integration

AI recommendation engine

Vendor discovery service

High Level Architecture

The system follows a domain-based microservices architecture.

Frontend (React)
       ↓
API Gateway (FastAPI)
       ↓
Microservices (FastAPI)
       ↓
PostgreSQL | Redis | AI Services | H3 | Payment Gateway

Each microservice is responsible for a specific domain such as authentication, vendor management, procurement workflows, payments, or AI processing.

Repository Structure
proccura/
├── frontend/                 # React + TypeScript application
├── backend/
│   ├── auth-service/         # Authentication & JWT
│   ├── vendor-service/       # Vendor onboarding & management
│   ├── procurement-service/  # Purchase request workflows
│   ├── quotation-service/    # RFQ / quotation handling
│   ├── po-service/           # Purchase orders
│   ├── invoice-service/      # Invoice tracking
│   ├── payment-service/      # Payment integrations
│   ├── location-service/     # Vendor discovery using Uber H3
│   ├── ai-service/           # OCR, ML models, AI features
│   └── shared/               # Shared utilities and configs
├── infra/                    # Docker, Nginx, deployment configs
├── docs/                     # Architecture decisions and documentation
└── README.md
Tech Stack
Frontend

React + TypeScript

React Query

Redux Toolkit (authentication & roles)

React Hook Form + Zod validation

Backend

FastAPI (Python)

PostgreSQL

Redis

SQLAlchemy

JWT-based authentication

AI Components

scikit-learn / XGBoost for ML models

LLM integration (OpenAI or open-source models)

OCR using Tesseract or PaddleOCR

LangChain for AI workflows

Infrastructure

Docker & Docker Compose

Nginx (API Gateway)

GitHub Actions for CI/CD (planned)

Multi-Tenancy Model

Proccura uses a single database multi-tenant design.

All tables include a tenant_id

Tenant context is extracted from the JWT token

All queries are scoped to the tenant

Cross-tenant data access is strictly prevented

This approach keeps infrastructure simpler while still ensuring strong data isolation between organizations.

Architecture Notes

The platform is designed around domain-oriented microservices where each service owns its own logic and data boundaries.

Some key design decisions:

FastAPI was chosen for its async support and performance

Redis is used for caching and background task coordination

Uber H3 indexing enables location-based vendor discovery

JWT tokens carry tenant context for request isolation

AI services are kept separate to avoid coupling them with core procurement logic

Running the Project Locally
Prerequisites

Make sure the following are installed:

Node.js 18+

Python 3.10+

Docker

Docker Compose

Clone the Repository
git clone https://github.com/your-org/proccura.git
cd proccura
Start Infrastructure
docker-compose up -d

This starts supporting services like PostgreSQL and Redis.

Run a Backend Service

Example: authentication service

cd backend/auth-service
uvicorn app.main:app --reload
Run the Frontend
cd frontend
npm install
npm run dev
Screenshots

Screenshots of the platform UI will be added soon.

Future Improvements

Some ideas planned for future versions:

Vendor recommendation engine

Automated invoice reconciliation

Advanced spend analytics dashboards

AI-based procurement insights

CI/CD pipeline for automated deployment