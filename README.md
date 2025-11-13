# FuelEU Compliance — README
## Overview
FuelEU Compliance is a small hexagonal-style application that provides APIs and a React + Tailwind frontend for monitoring ship routes, calculating Compliance Balance (CB), and supporting baseline, banking and pooling workflows.

This repository contains two main parts:

> backend — Node/TypeScript + Express + PostgreSQL API (migrations & tests)
> frontend — React + Vite + TypeScript + Tailwind UI consuming the backend

## Architecture (hexagonal)
Core idea: separate domain/use-cases (core) from external adapters (API, DB, UI).

Top-level structure (important folders)

> backend/
src/core — domain entities, calculators, use-cases, ports
src/adapters/inbound/http — Express controllers
src/adapters/outbound/postgres — Postgres repos & db client
migrations/ & seed/
tests/ — Jest integration/unit tests
> frontend/
src/core — domain types, ports, application logic (no React)
src/adapters/infrastructure — api client implementing ports
src/adapters/ui — React components, hooks & pages
index.html, tailwind & vite configs
Key principles

> core → ports → adapters (dependency inversion)
> business logic lives in core; frameworks only in adapters
> DB schema and migration files under backend/migrations

## Setup & run (Windows)
Prerequisites

> Node.js >= 18, npm
> PostgreSQL server
> (optional) Docker for DB

1. Backend — install & configure
> Open PowerShell / cmd and go to backend folder:
cd c:\Namya\Projects\FuelEU_dev\backend

> Install:
npm install

> Create a .env (copy .env.example if present) and set DB variables:

PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
PORT (optional, default 3000)
> Create DB schema and seed:

Using psql:
psql -h <PGHOST> -U <PGUSER> -d <PGDATABASE> -f migrations/001_create_tables.sql
psql -h <PGHOST> -U <PGUSER> -d <PGDATABASE> -f seed/seed_routes.sql
Or run your migration tool if configured.
> Start backend (development):
npm run dev
(or npm start depending on package.json scripts — check backend/package.json)

2. Frontend — install & run
> Open a separate terminal, go to frontend folder:
cd c:\Namya\Projects\FuelEU_dev\frontend
> Install:
npm install
> Copy example env and set API URL:
copy .env.example .env
(edit .env VITE_API_URL=http://localhost:3000)
> Start dev server:
npm run dev
> Open browser: http://localhost:5173 (or printed Vite URL)
How to execute tests
Backend tests (Jest + ts-jest)

Ensure test DB/config is available or .env points to a test db
From backend folder:
npm test
Tests (examples) live in backend/tests:
cb.test.ts — CBCalculator unit tests
baseline.test.ts — integration test for POST /routes/:id/baseline (uses supertest)
other test files for compliance/pooling/banking may be included
Frontend tests

This frontend scaffold contains no unit test scripts by default. Use your preferred test runner (Jest/React Testing Library / Vitest). Add scripts in package.json if needed.
Implemented endpoints (quick reference)

GET /health
Health check
GET /routes
Returns all routes (camelCase properties)
POST /routes/:id/baseline
Sets the route with route_id = :id as baseline (transactional)
Other endpoints may be scaffolded (comparison, compliance, banking, pools) — verify controllers in backend/src/adapters/inbound/http.

Sample requests & responses
GET /routes
Request:
curl http://localhost:3000/routes
Example JSON response (seeded data):
[
{
"id": 1,
"routeId": "R001",
"vesselType": "Container",
"fuelType": "HFO",
"year": 2024,
"ghgIntensity": 91.0,
"fuelConsumptionT": 5000,
"distanceKm": 12000,
"totalEmissionsT": 4500,
"isBaseline": true
},
{
"id": 2,
"routeId": "R002",
"vesselType": "BulkCarrier",
"fuelType": "LNG",
"year": 2024,
"ghgIntensity": 88.0,
"fuelConsumptionT": 4800,
"distanceKm": 11500,
"totalEmissionsT": 4200,
"isBaseline": false
},
...
]
POST /routes/R002/baseline
Request:
curl -X POST http://localhost:3000/routes/R002/baseline
Success response:
{ "message": "Baseline updated" }
If route not found:
404 { "error": "Route not found" }
Compliance compute (if implemented)
GET /compliance/cb?shipId=R001&year=2024
Example (conceptual) response:
{
"shipId": "R001",
"year": 2024,
"cbBefore": -349183200,
"energyMJ": 205000000
}
Notes & troubleshooting
Database connections: backend reads PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT from environment variables.
If Express fails to start, check logs for DB connection errors (db client will test connection on startup).
Migrations: run SQL files in migrations/ against the configured database before seeding.
CORS: If serving frontend from a different origin, enable CORS in backend server or configure proxy in Vite.
Screenshots
Include screenshots of the running UI (placeholders):

Routes page (table, filters, Set Baseline button)
Routes page screenshot

Compare page (chart + compliance table)
Compare page screenshot

If you want, I can:

Add CI scripts for running migrations + tests
Add missing endpoint implementations (comparison, banking, pooling)
Add frontend tests and Docker compose for local dev
GPT-5 mini • 1x