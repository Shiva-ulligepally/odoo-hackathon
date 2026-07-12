# EcoSphere AI - Autonomous ESG Operating System

EcoSphere AI is a production-ready, gamified ESG audit and carbon footprint monitoring software platform designed to manage and verify sustainability goals for enterprises.

This repository is split into:
- `client/`: Next.js frontend application.
- `server/`: Node.js, Express, MongoDB Atlas, and Mongoose backend API server.

---

## 1. Project Setup & Environment Configurations

### Backend Setup (`server/.env`)
Create a `.env` file under the `/server/` directory:
```ini
PORT=5000
MONGODB_URI=mongodb+srv://ushiva87906:shiva%4087906@genai.tcuglja.mongodb.net/
JWT_SECRET=your_super_secret_jwt_key_for_enterprise_production_123!
JWT_EXPIRES_IN=7d

# Cloudinary credentials (optional, falls back to local uploads if empty)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

### Frontend Setup (`client/.env.local`)
Create a `.env.local` file under the `/client/` directory:
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api
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

## 3. Running the Application

### Phase 1: Boot Backend
```bash
cd server
npm install
npm run seed     # Seeds DB with mock organization, users, and emission logs
npm run dev      # Starts Express dev server on port 5000
```

### Phase 2: Boot Frontend
```bash
cd client
npm install
npm run dev      # Starts Next.js dev server on port 3000
```