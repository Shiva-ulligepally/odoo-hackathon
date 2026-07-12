# 🌿 EcoSphere AI — Autonomous ESG Operating System

> **"From ESG Reporting to ESG Decision Intelligence"**

EcoSphere AI is an enterprise-grade, autonomous AI operating system that ingests corporate disclosures, validates ESG data, maps entity relationships, predicts carbon emissions, audits governance, verifies CSR activities, and generates board-ready executive summaries — all automatically triggered when a document is uploaded.

---

## 🏗️ Monorepo Architecture

```
odoo-hackathon/
├── server/          ← Node.js + Express backend (CRUD APIs, Auth, MongoDB)
├── ai-service/      ← Python FastAPI AI Intelligence Layer (Port 8000)
├── frontend/        ← React + Vite frontend (Port 3000)
├── shared/          ← Shared TypeScript types
└── backend/         ← TypeScript model definitions (legacy bootstrap)
```

---

## 👥 Team & Ownership

| Engineer | Responsibility | Port |
|---|---|---|
| **Shiva** | Node.js Backend — CRUD, Auth, MongoDB, APIs | 5000 |
| **Mahek** | React Frontend — Dashboard, Uploads, Charts | 3000 |
| **Adithya** | Python AI Layer — OCR, Agents, RAG, KG, Embeddings | 8000 |

---

## 🚀 Quick Start

### 1. Node.js Backend
```bash
cd server
cp .env.example .env      # Fill MONGODB_URI, JWT_SECRET, CLOUDINARY_*
npm install
npm run seed              # Seed demo data
npm run dev               # Starts on http://localhost:5000
```

### 2. Python AI Service
```bash
cd ai-service
cp .env.example .env      # Fill GEMINI_API_KEY, MONGODB_URI
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# Or: python main.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev               # Starts on http://localhost:3000
```

### 4. Verify Everything
```bash
# Node.js health
curl http://localhost:5000/health

# AI Service health
curl http://localhost:8000/health

# Run AI integration tests
cd ai-service
python tests/test_ai_pipeline.py
```

---

## 📁 Folder & File Reference

### `server/` — Node.js + Express Backend

```
server/
├── server.js                      Main Express application entry point
├── package.json                   Dependencies (express, mongoose, bcryptjs, etc.)
│
├── config/
│   ├── db.js                      MongoDB Atlas connection
│   └── cloudinary.js              Cloudinary file storage config
│
├── middleware/
│   ├── auth.js                    JWT authentication guard
│   ├── errorHandler.js            Global error handler
│   ├── rateLimiter.js             API rate limiter (express-rate-limit)
│   ├── upload.js                  Multer file upload middleware
│   └── validator.js               Request body validator
│
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
│   ├── ConfidenceScore.js         AI data trust scores
│   ├── ActivityLog.js             Audit trail of all actions
│   ├── Report.js                  Generated ESG reports
│   ├── Notification.js            System notifications
│   ├── Badge.js                   Employee achievement badges
│   ├── Reward.js                  Employee ESG rewards
│   └── Challenge.js               ESG challenge records
│
├── repositories/                  Repository pattern — DB abstraction layer
│   ├── BaseRepository.js          CRUD base: find, create, update, delete, count
│   ├── UserRepository.js
│   ├── OrganizationRepository.js
│   ├── DepartmentRepository.js
│   ├── EmployeeRepository.js
│   ├── CarbonRecordRepository.js
│   ├── EnergyBillRepository.js
│   ├── PolicyRepository.js
│   ├── CSRActivityRepository.js
│   ├── UploadedDocumentRepository.js
│   ├── AIRecommendationRepository.js
│   ├── ConfidenceScoreRepository.js
│   ├── ActivityLogRepository.js
│   ├── ReportRepository.js
│   ├── NotificationRepository.js
│   ├── BadgeRepository.js
│   ├── RewardRepository.js
│   └── ChallengeRepository.js
│
├── controllers/                   Request handlers
│   ├── auth.controller.js         Register, login, JWT token
│   ├── organization.controller.js CRUD for org
│   ├── department.controller.js   CRUD for departments
│   ├── employee.controller.js     CRUD for employees
│   ├── carbon.controller.js       Carbon record management
│   ├── policy.controller.js       Policy management
│   ├── report.controller.js       Report generation
│   ├── upload.controller.js       File upload handler
│   ├── dashboard.controller.js    Dashboard data aggregation
│   └── ai.controller.js           ← AI GATEWAY: proxies to Python AI service
│
├── routes/                        Express route definitions
│   ├── auth.routes.js             POST /api/auth/register, /api/auth/login
│   ├── organization.routes.js     GET/PUT /api/organization
│   ├── department.routes.js       CRUD /api/departments
│   ├── employee.routes.js         CRUD /api/employees
│   ├── carbon.routes.js           CRUD /api/carbon
│   ├── policy.routes.js           CRUD /api/policies
│   ├── report.routes.js           CRUD /api/reports
│   ├── upload.routes.js           POST /api/upload/document
│   ├── dashboard.routes.js        GET /api/dashboard
│   └── ai.routes.js               ← AI ROUTES: /api/ai/* → Python port 8000
│
├── services/
│   ├── auth.service.js            Auth business logic
│   ├── upload.service.js          Upload + AI pipeline trigger (non-blocking)
│   ├── carbon.service.js          Carbon aggregation
│   ├── dashboard.service.js       Dashboard aggregation
│   ├── department.service.js
│   ├── employee.service.js
│   ├── notification.service.js
│   ├── organization.service.js
│   ├── policy.service.js
│   └── report.service.js
│
├── validators/                    Input validation rules
├── utils/
│   ├── customError.js             Custom error class
│   ├── response.js                Standard sendResponse() helper
│   └── logger.js                  Structured logger
│
├── jobs/
│   └── cronJobs.js                Scheduled jobs (daily reports, reminders)
│
├── scripts/
│   └── seed.js                    Seed script for demo data
│
└── docs/
    └── swagger.json               API documentation
```

---

### `ai-service/` — Python FastAPI AI Intelligence Layer

```
ai-service/
├── main.py                        FastAPI app — all 8 AI endpoints + health
├── config.py                      Pydantic Settings — env var loader
├── database.py                    MongoDB helpers — save reasoning, recommendations, confidence
├── requirements.txt               Python dependencies
├── .env.example                   Environment variable template
│
├── ai/
│   ├── prompts/
│   │   └── prompt_templates.py    Curated Gemini prompts for every agent
│   │
│   ├── ocr/
│   │   └── ocr_engine.py          Document OCR — Gemini multimodal + pdfplumber fallback
│   │
│   ├── validation/
│   │   └── validator.py           ESG data validation — units, outliers, duplicates, dates
│   │
│   ├── graph/
│   │   └── knowledge_graph.py     NetworkX KG — org→dept→emp→bills→policies→CSR
│   │
│   ├── embeddings/
│   │   └── embeddings_pipeline.py Gemini embeddings → ChromaDB (dedup, incremental)
│   │
│   ├── rag/
│   │   └── rag_pipeline.py        ChromaDB retrieval → Gemini grounded QA
│   │
│   ├── agents/
│   │   ├── orchestrator.py        Master pipeline controller — 10-stage sequential runner
│   │   ├── carbon_intelligence.py Scope 1/2/3 analysis + forecasting + strategies
│   │   ├── governance.py          Policy audit — expired, missing, compliance risk
│   │   ├── csr_verification.py    CSR certificate verification + employee points
│   │   └── executive_decision.py  Board-level executive summary generator
│   │
│   ├── recommendations/
│   │   └── recommendation_engine.py ESG recommendations → stored to AIRecommendation
│   │
│   └── utils/
│       ├── confidence_engine.py   Evidence-based trust score → stored to ConfidenceScore
│       └── fallbacks.py           Rule-based fallbacks for every agent
│
└── tests/
    └── test_ai_pipeline.py        Integration tests — all endpoints + graceful fallbacks
```

---

### `shared/` — Shared TypeScript Types

```
shared/
└── types/
    └── index.ts    Domain interfaces: Organization, ESGMetric, DataDisclosure,
                    AIAnalysis, AIFinding, AIRecommendation, AuditLog
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
          │ graph_result →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 4: Embedding Pipeline                                │
    │  → Chunks document text (1000 tokens, 200 overlap)         │
    │  → Gemini Embedding-001 → ChromaDB (dedup by hash)        │
    └─────┬──────────────────────────────────────────────────────┘
          │ embedding_result →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 5: Confidence Engine                                 │
    │  → 5-factor scoring: OCR quality, freshness, validation,   │
    │    evidence count, conflict detection                       │
    │  → Persists to ConfidenceScore collection                  │
    └─────┬──────────────────────────────────────────────────────┘
          │ confidence_result →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 6: Carbon Intelligence Agent                         │
    │  → Scope 1 (fuel), Scope 2 (electricity), Scope 3 (travel) │
    │  → Linear forecast: next month/quarter/year                │
    │  → Reduction strategies with ROI & CO2 savings             │
    └─────┬──────────────────────────────────────────────────────┘
          │ carbon_analysis →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 7: Governance Agent                                  │
    │  → Audits all policies from MongoDB                        │
    │  → Detects: expired, draft, missing types                  │
    │  → Generates compliance score + risk level                 │
    └─────┬──────────────────────────────────────────────────────┘
          │ governance_findings →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 8: CSR Verification Agent                            │
    │  → Scores CSR activities from MongoDB                      │
    │  → Allocates employee CSR points by activity type          │
    │  → Duplicate detection, certificate authenticity           │
    └─────┬──────────────────────────────────────────────────────┘
          │ csr_result →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 9: Recommendation Engine                             │
    │  → Uses ALL prior outputs as context for Gemini            │
    │  → Generates 5-8 prioritized recommendations               │
    │  → Persists each to AIRecommendation collection            │
    └─────┬──────────────────────────────────────────────────────┘
          │ recommendations →
    ┌─────┴──────────────────────────────────────────────────────┐
    │  Stage 10: Executive Decision Agent                         │
    │  → Board-level summary: ESG score, risks, opportunities    │
    │  → Department comparison, monthly outlook, ROI             │
    └─────┬──────────────────────────────────────────────────────┘
          │
          ▼
    MongoDB writes:
    ├── AIReasoning (per stage)
    ├── ConfidenceScore
    ├── AIRecommendation (multiple)
    └── UploadedDocument.verificationStatus = "Verified"
          │
          ▼
    Dashboard auto-refreshes ✅
```

---

## 🌐 API Reference

### Node.js Endpoints (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register admin + create org |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/dashboard` | Full dashboard aggregation |
| POST | `/api/upload/document` | Upload file → triggers AI pipeline |
| GET | `/api/carbon` | Carbon records |
| POST | `/api/carbon` | Log emission record |
| GET | `/api/departments` | List departments |
| GET | `/api/employees` | List employees |
| GET | `/api/policies` | List policies |
| GET | `/api/reports` | List reports |
| GET | `/health` | Server health |
| POST | `/api/ai/*` | **Proxied to Python AI Service** |

### Python AI Endpoints (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | AI service health + DB status |
| POST | `/api/ai/process-document` | Trigger full 10-stage pipeline |
| GET | `/api/ai/status?documentId=X` | Pipeline progress tracking |
| POST | `/api/ai/validate` | OCR + ESG data validation |
| POST | `/api/ai/confidence` | Calculate data trust score |
| POST | `/api/ai/predict` | Carbon Scope 1/2/3 + forecast |
| POST | `/api/ai/recommend` | Generate ESG recommendations |
| POST | `/api/ai/governance` | Policy compliance audit |
| POST | `/api/ai/csr` | CSR verification + scoring |
| POST | `/api/ai/chat` | RAG-powered ESG Q&A |

---

## 🗄️ MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | Authentication accounts |
| `organizations` | Company entities |
| `departments` | Org departments |
| `employees` | Employee records |
| `carbonrecords` | Scope 1/2/3 emission entries |
| `energybills` | Utility bills (electricity/gas/water/diesel) |
| `policies` | ESG governance policies |
| `csractivities` | CSR programme records |
| `uploadeddocuments` | Uploaded file metadata + AI status |
| `airecommendations` | **AI-generated recommendations** |
| `confidencescores` | **AI data trust scores** |
| `activitylogs` | Audit trail |
| `aireasoning` | **AI reasoning logs (per agent, per stage)** |
| `notifications` | System alerts |
| `reports` | Generated ESG reports |
| `badges` | Employee achievement badges |
| `rewards` | ESG reward records |
| `challenges` | ESG challenges |

---

## 🔐 Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecosphere_ai
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AI_SERVICE_URL=http://localhost:8000
```

### `ai-service/.env`
```env
PORT=8000
ENVIRONMENT=development
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_PRO_MODEL=gemini-1.5-pro
GEMINI_EMBEDDING_MODEL=models/embedding-001
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecosphere_ai
MONGODB_DB_NAME=ecosphere_ai
CHROMA_PERSIST_DIR=./chroma_db
CHROMA_COLLECTION=ecosphere_documents
```

---

## 🧪 Testing the AI Layer

```bash
# Start AI service first
cd ai-service
uvicorn main:app --port 8000 --reload

# Run integration tests (in another terminal)
python tests/test_ai_pipeline.py
```

**Expected output:**
```
══════════════════════════════════════════════════════════════
  EcoSphere AI Intelligence Layer — Integration Tests
══════════════════════════════════════════════════════════════

📡 Connectivity & Health
  ✅ PASS Health endpoint responds

🔍 Document Processing
  ✅ PASS Validate with mock extracted data
  ✅ PASS Validate missing file (graceful fallback)

📊 Confidence Engine
  ✅ PASS Confidence score calculation
...
  🎉 All tests passed!
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
| Network timeout | Timeout error captured, fallback returned |

**The pipeline never crashes.** Every endpoint always returns a valid JSON response.

---

## 🏆 Demo Flow (Hackathon)

```
1. Register admin account
2. Upload electricity bill PDF
   → Node.js saves file → triggers Python pipeline
3. AI pipeline runs in background:
   • OCR extracts: 12,500 kWh, $1,875.50, Scope 2
   • Validation: Valid ✓ (no errors, 1 warning)
   • Knowledge Graph: Updated (org → dept → bill)
   • Embeddings: 8 chunks stored in ChromaDB
   • Confidence: 87.4% (Verified)
   • Carbon: 10.25 MT CO2e, forecast: 123 MT/year
   • Governance: 2 missing policies detected
   • CSR: 3 activities verified, 150 employee points
   • Recommendations: 6 generated (solar, smart meters...)
   • Executive Summary: ESG score ~72, ROI $50,000/yr
4. Dashboard shows:
   • AI Confidence Score: 87%
   • Carbon Intelligence: Scope breakdown + forecast chart
   • Top Recommendations (persisted to MongoDB)
   • Governance Risk: Medium
   • Executive Summary card
5. Chat with documents:
   • "What is our Scope 2 electricity consumption?"
   • → RAG retrieves from ChromaDB → Gemini answers with evidence
```

---

## 🔧 Troubleshooting

| Issue | Fix |
|---|---|
| `GEMINI_API_KEY not set` | Add key to `ai-service/.env` |
| `MongoDB connection failed` | Check `MONGODB_URI` in both `.env` files |
| `chromadb import error` | `pip install chromadb==0.4.24` |
| `networkx not found` | `pip install networkx==3.3` |
| `pdfplumber error` | `pip install pdfplumber==0.11.1` |
| AI pipeline not triggering | Ensure AI service is running on port 8000 |
| Push rejected by git | `git pull origin <branch> --rebase` then push |

---

## 📜 License

Built for the **Odoo Hackathon 2026** by Team EcoSphere AI.
- Backend: Shiva Ulligepally
- Frontend: Mahek
- AI Layer: Adithya