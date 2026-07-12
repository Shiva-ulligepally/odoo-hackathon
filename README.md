# 🌿 EcoSphere AI — Autonomous ESG Operating System

> **"From ESG Reporting to ESG Decision Intelligence"**

EcoSphere AI is a production-ready, gamified, and autonomous ESG operating system. It ingests corporate disclosures, validates ESG data, maps entity relationships, predicts carbon emissions, audits governance, verifies CSR activities, and generates board-ready executive summaries — all automatically triggered when a document is uploaded.

---

## 🏗️ Monorepo Architecture

```
odoo-hackathon/
├── server/          ← Node.js + Express backend (CRUD APIs, Auth, MongoDB)
├── client/          ← Next.js frontend application (Port 3000)
├── ai-service/      ← Python FastAPI AI Intelligence Layer (Port 8000)
├── shared/          ← Shared TypeScript types
└── backend/         ← TypeScript model definitions (legacy bootstrap)
```

---

## 👥 Team & Ownership

| Engineer | Responsibility | Port |
|---|---|---|
| **Shiva** | Node.js Backend — CRUD, Auth, MongoDB, APIs | 5000 |
| **Mahek** | Next.js Frontend — Dashboard, Uploads, Charts | 3000 |
| **Adithya** | Python AI Layer — OCR, Agents, RAG, KG, Embeddings | 8000 |

---

## 🚀 Quick Start

### 1. Node.js Backend Setup
Create a `.env` file under the `/server/` directory:
```ini
PORT=5000
MONGODB_URI=mongodb+srv://ushiva87906:shiva%4087906@genai.tcuglja.mongodb.net/
JWT_SECRET=your_super_secret_jwt_key_for_enterprise_production_123!
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```
Run installation and seed script:
```bash
cd server
npm install
npm run seed              # Seed demo data (Organization, Departments, Carbon records)
npm run dev               # Starts on http://localhost:5000
```

### 2. Next.js Frontend Setup
Create a `.env.local` file under the `/client/` directory:
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Run installation and boot up:
```bash
cd client
npm install
npm run dev               # Starts on http://localhost:3000
```

### 3. Python AI Service Setup
Create a `.env` file under the `/ai-service/` directory:
```env
PORT=8000
ENVIRONMENT=development
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_PRO_MODEL=gemini-1.5-pro
GEMINI_EMBEDDING_MODEL=models/embedding-001
MONGODB_URI=mongodb+srv://ushiva87906:shiva%4087906@genai.tcuglja.mongodb.net/
MONGODB_DB_NAME=ecosphere_ai
CHROMA_PERSIST_DIR=./chroma_db
CHROMA_COLLECTION=ecosphere_documents
```
Run environment installation and boot:
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📁 Folder & File Reference

### `server/` — Node.js + Express Backend
```
server/
├── server.js                      Main Express application entry point
├── package.json                   Dependencies (express, mongoose, bcryptjs, etc.)
├── config/
│   ├── db.js                      MongoDB Atlas connection
│   └── cloudinary.js              Cloudinary file storage config
├── middleware/
│   ├── auth.js                    JWT authentication guard
│   ├── errorHandler.js            Global error handler
│   ├── rateLimiter.js             API rate limiter (express-rate-limit)
│   ├── upload.js                  Multer file upload middleware
│   └── validator.js               Request body validator
├── models/                        Mongoose MongoDB schemas
│   ├── User.js                    System user (admin/employee)
│   ├── Organization.js            Company/org record
│   ├── Department.js              Department within an org
│   ├── Employee.js                Employee linked to dept + org
│   ├── CarbonRecord.js            Scope 1/2/3 emission records
│   ├── EnergyBill.js              Electricity/gas/water/diesel bills
│   ├── Policy.js                  ESG governance policies
│   ├── CSRActivity.js             CSR initiative records
│   ├── UploadedDocument.js        Uploaded file metadata
│   ├── AIRecommendation.js        AI-generated recommendations
│   └── ConfidenceScore.js         AI data trust scores
```

---

## 🤖 AI Intelligence Layer — Deep Dive

### Pipeline Architecture

```
Document Upload (Node.js POST /api/upload/document)
          │
          ▼ [non-blocking setImmediate]
FastAPI POST /api/ai/process-document
          │
          ▼
    ┌─────────────────────────────────────┐
    │         AI ORCHESTRATOR             │
    │   (shared memory context dict)      │
    └─────────────────────────────────────┘
          │
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 1: OCR Engine                                        │
    │  → Gemini 1.5 Flash multimodal + pdfplumber fallback       │
    │  → Extracts: consumption, amount, dates, vendor, CO2e      │
    └─────┬──────────────────────────────────────────────────────┘
          │ extracted_data →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 2: Data Validation Agent                             │
    │  → Rule checks (negatives, outliers, date formats)         │
    │  → Gemini validates completeness & conflicts               │
    │  → Returns: errors, warnings, missing_fields               │
    └─────┬──────────────────────────────────────────────────────┘
          │ validation_result →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 3: Knowledge Graph (NetworkX)                        │
    │  → Reads MongoDB: org, dept, emp, carbon, bills, policies  │
    │  → Builds directed graph of ESG entity relationships       │
    └─────┬──────────────────────────────────────────────────────┘
          │
          ▼ (Additional stages including forecasting, recommendations, confidence, RAG)
```

---

## 2. API Routes Mapping Matrix

Below is the complete mapping trace from the Frontend Service to the Backend Mongoose Model:

| Frontend Service (`client/services/`) | API Endpoint | Backend Route File (`server/routes/`) | Backend Controller (`server/controllers/`) | Target Mongoose Model (`server/models/`) |
| :--- | :--- | :--- | :--- | :--- |
| `login/page.tsx` | `POST /api/auth/login` | `auth.routes.js` | `auth.controller.js` (login) | `User.js`, `Employee.js` |
| `dashboard.ts` | `GET /api/dashboard/overview` | `dashboard.routes.js` | `dashboard.controller.js` (getDashboardOverview) | `Organization.js`, `CarbonRecord.js`, `ActivityLog.js`, `Challenge.js` |
| `dashboard.ts` | `GET /api/dashboard/insights` | `dashboard.routes.js` | `dashboard.controller.js` (getAIInsights) | `AIRecommendation.js` |
| `dashboard.ts` | `PATCH /api/dashboard/insights/:id` | `dashboard.routes.js` | `dashboard.controller.js` (updateInsightStatus) | `AIRecommendation.js` |
| `carbon.ts` | `GET /api/carbon/metrics` | `carbon.routes.js` | `carbon.controller.js` (getCarbonMetrics) | `CarbonRecord.js` |
| `carbon.ts` | `GET /api/carbon/historical` | `carbon.routes.js` | `carbon.controller.js` (getHistoricalEmissions) | `CarbonRecord.js` |
| `carbon.ts` | `GET /api/carbon/facilities` | `carbon.routes.js` | `carbon.controller.js` (getFacilitiesEmissions) | `Department.js`, `CarbonRecord.js` |
| `carbon.ts` | `GET /api/carbon/energymix` | `carbon.routes.js` | `carbon.controller.js` (getEnergyMixData) | `EnergyBill.js` |
| `carbon.ts` | `GET /api/social/suppliers` | `social.routes.js` | Inline router handler | Mock Supplier ESG Array |
| `reports.ts` | `GET /api/reports` | `report.routes.js` | `report.controller.js` (getReports) | `Report.js` |
| `reports.ts` | `POST /api/reports/generate` | `report.routes.js` | `report.controller.js` (createReport) | `Report.js` |
| `upload.ts` (custom hook) | `POST /api/upload/document` | `upload.routes.js` | `upload.controller.js` (uploadDocument) | `UploadedDocument.js`, `ActivityLog.js`, `ConfidenceScore.js` |

---

## 🧪 Testing the AI Layer

```bash
# Start AI service first
cd ai-service
uvicorn main:app --port 8000 --reload

# Run integration tests (in another terminal)
python tests/test_ai_pipeline.py
```

---

## 🛡️ Graceful Fallback Design

Every AI agent has a deterministic rule-based fallback:

| Scenario | Fallback Behaviour |
|---|---|
| Gemini API key missing | Rule-based extraction + heuristic scoring |
| Gemini returns empty response | Retry → fallback to rules |
| pdfplumber can't read PDF | Return warning with partial data |
| ChromaDB unavailable | LLM answers with disclaimer |
| MongoDB write fails | Log error, pipeline continues |
| Any stage crashes | Other stages still execute |

---

## 📜 License

Built for the **Odoo Hackathon 2026** by Team EcoSphere AI.
- Backend: Shiva Ulligepally
- Frontend: Mahek
- AI Layer: Adithya
