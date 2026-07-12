# EcoSphere AI: Autonomous ESG Operating System

EcoSphere AI is an autonomous, enterprise-grade operating system designed to ingest corporate disclosures, evaluate environmental, social, and governance (ESG) metrics, and perform AI-driven autonomous compliance analysis.

## Monorepo Architecture

This project is structured as a monorepo containing three core services:
- **`backend/`**: Node.js + TypeScript Express REST API (Clean Architecture).
- **`frontend/`**: React + TypeScript + Vite Web Client (Vanilla CSS Modules).
- **`ai-service/`**: Python FastAPI microservice (Gemini API + LangChain/LlamaIndex agents).
- **`shared/`**: Common TypeScript contracts, types, and validation schemas.

## Developer Workspaces

To support clean separation of concerns and parallel engineering workflows, developers should operate in their respective service subdirectories:
- **Backend Engineer**: Work in the [backend/](file:///c:/odoo-hackathon/backend/) directory.
- **Frontend Engineer**: Work in the [frontend/](file:///c:/odoo-hackathon/frontend/) directory.
- **AI Engineer**: Work in the [ai-service/](file:///c:/odoo-hackathon/ai-service/) directory.

## Initial Setup & Bootstrapping

Detailed instructions for setup, starting servers, and linking API endpoints will be added sequentially as the project phases are delivered.