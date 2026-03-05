# Legacyline Web

Frontend interface for the **Legacyline Individual Readiness Engine**.

Legacyline implements the **Behavioral Readiness Standard (BRSA)** for individuals.  
This repository contains the web interface used by participants, operators, and evaluators to interact with the Legacyline system.

The scoring logic and readiness computation are handled by **legacyline-core**, the backend service.

---

## Role in the BRSA Ecosystem

Legacyline is part of the broader Behavioral Readiness Standards Authority ecosystem.

BRSA Registry (Authority + Verification)  
│  
├── Legacyline (Individual Readiness Engine)  
├── OBR (Organizational Behavioral Readiness)  
└── Evaluator Portal (Certification + Training)

Legacyline measures individual readiness using deterministic rules executed by the **FRARI evaluation engine**.

---

## Architecture

Legacyline Web (Next.js / Vercel)  
↓  
Legacyline Core API (Go / Railway)  
↓  
PostgreSQL Database  
↓  
FRARI Readiness Engine

The web interface never computes readiness scores directly.  
All readiness computation occurs in **legacyline-core**.

---

## Key Capabilities

Legacyline Web provides:

- participant onboarding
- participant dashboard
- readiness status display
- evidence submission interface
- evaluation workflow access

---

## Tech Stack

- Next.js
- TypeScript
- TailwindCSS
- Vercel deployment
- Legacyline Core API (Go / PostgreSQL)

---

## Development

Install dependencies:

npm install
Copy code

Run the development server:
npm run dev
Copy code

The application will run locally at:
http://localhost:3000⁠�
Copy code

---

## Environment Variables

Create `.env.local`:
NEXT_PUBLIC_API_BASE_URL=https://legacyline-core-production.up.railway.app⁠�
Copy code

---

## Related Repositories

- legacyline-core — readiness engine and API  
- brsa-registry — authority registry site  
- obr — organizational readiness engine  
- evaluator-portal — evaluator certification system  

---

## License

BRSA Ecosystem – Internal Development
