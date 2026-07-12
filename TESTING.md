# EcoSphere AI Backend Testing & Verification Guide

This guide describes how to install, configure, seed, and test the EcoSphere AI backend REST APIs.

## 1. Installation

First, navigate to the `server` directory and install the required npm dependencies:

```bash
cd server
npm install
```

## 2. Environment Setup

Create a `.env` file inside the `server/` directory. You can use the provided template or paste the following credentials:

```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecosphere_ai
JWT_SECRET=your_super_secret_jwt_key_for_enterprise_production_123!
JWT_EXPIRES_IN=7d

# Optional Cloudinary Config (If omitted, server falls back to mock local file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

## 3. Database Seeding

Run the seed script to populate default data (1 Organization, 3 Departments, 4 Users, Badges, mock Carbon Records, and AI Recommendations):

```bash
npm run seed
```

## 4. Run Server

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## 5. Endpoints Verification Checklist (Postman / cURL)

### 1. Health Status Check
Check system readiness, DB connection status, and Cloudinary configuration fallback:
*   **Request**: `GET http://localhost:5000/health`
*   **Response**:
    ```json
    {
      "success": true,
      "message": "EcoSphere AI Server Healthy",
      "data": {
        "server": "Healthy",
        "version": "1.0.0",
        "database": "Running",
        "cloudinary": "Ready (Mock Fallback Active)",
        "ai": "Ready"
      },
      "meta": null,
      "timestamp": "2026-07-12T10:42:48.000Z"
    }
    ```

### 2. User Authentication
#### Admin/Organization Registration
*   **Request**: `POST http://localhost:5000/api/auth/register`
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "email": "innovator@ecosphere.com",
      "password": "securepassword",
      "organizationName": "GreenFuture Labs",
      "industry": "Clean Tech",
      "location": "Boston, MA"
    }
    ```

#### User Login
*   **Request**: `POST http://localhost:5000/api/auth/login`
*   **Headers**: `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "email": "shiva@ecosphere.ai",
      "password": "password123"
    }
    ```
    *(Note: Copy the `token` from the response to use as Bearer Token in subsequent requests)*

### 3. Aggregated Dashboard
*   **Request**: `GET http://localhost:5000/api/dashboard`
*   **Headers**: `Authorization: Bearer <your_jwt_token>`

### 4. Carbon Footprint Logging
*   **Request**: `POST http://localhost:5000/api/carbon`
*   **Headers**:
    *   `Authorization: Bearer <your_jwt_token>`
    *   `Content-Type: application/json`
*   **Body**:
    ```json
    {
      "departmentId": "<department_mongodb_id>",
      "scope": "Scope 2",
      "activityType": "Electricity",
      "value": 14.2
    }
    ```

### 5. Document Upload (ESG Evidence)
Upload files using form-data. If Cloudinary credentials are not present, it will automatically save files to `server/uploads/` and log mock AI recommendations:
*   **Request**: `POST http://localhost:5000/api/upload/document`
*   **Headers**: `Authorization: Bearer <your_jwt_token>`
*   **Body (form-data)**:
    *   `file`: *(Attach pdf/png/jpg file)*
