# Nirṇay: Government Procurement Intelligence Platform

Nirṇay goes beyond evaluating whether a bidder meets criteria — it also evaluates how trustworthy their claims are by adding a credibility intelligence layer on top of the standard eligibility engine. It features two specialized micro-frontends backed by a scalable FastAPI backend with full Role-Based Access Control (RBAC).

## Monorepo Architecture

This project is structured as a Turborepo monorepo:

- `apps/officer-portal`: React + Vite + shadcn/ui application for procurement officers (runs on port 5173 / Docker port 5173).
- `apps/bidder-portal`: React + Vite + shadcn/ui application for bidders (runs on port 5174 / Docker port 5174).
- `packages/shared-types`: Shared TypeScript interfaces across frontends and backend.
- `backend`: FastAPI + SQLAlchemy Python backend service (runs on port 8080 / Docker port 8081).

## Getting Started

### Important: Environment Variables
Ensure you have the required environment variables. Copy the `.env.example` to `.env` in the root (for backend) and add `.env` files in `apps/officer-portal` and `apps/bidder-portal` containing your Firebase credentials:
```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
# ...
```
If Firebase configuration is missing, the application will fail to authenticate (mock data has been strictly removed to ensure actual auth is used).

---

### Running With Docker (Recommended for testing)

You can spin up the entire application stack using Docker Compose:

1. Create your `.env` file at the root level using `.env.example` as a template.
2. Run the following command:
   ```bash
   docker-compose up --build
   ```
3. Access the portals:
   - **Officer Portal:** http://localhost:5173
   - **Bidder Portal:** http://localhost:5174
   - **Backend API Docs:** http://localhost:8081/docs

---

### Running Locally Without Docker (Development Mode)

If you wish to develop on the services locally:

#### 1. Start the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8081
```

#### 2. Start the Frontends (using Turborepo)
In a new terminal window, at the root of the project:
```bash
# Install dependencies for all workspaces
npm install

# Run both frontends concurrently
npm run dev:all
```
This will start the officer portal on `http://localhost:5173` and the bidder portal on `http://localhost:5174`. 

## Features
- **Document Authenticity Scoring:** Validates fonts, metadata, and signatures to catch fraudulent documents.
- **Cross-Bidder Intelligence:** Detects shell companies and collusive bidding by surfacing overlapping data between bidders.
- **Tender Criteria Conflict Detector:** Analyzes tender criteria for impossible combinations and ambiguities.
- **Precedent Memory:** Suggests precedent from past tender ambiguities.
- **Micro-frontends:** Separate tailored experiences for government officers and bidding contractors.
