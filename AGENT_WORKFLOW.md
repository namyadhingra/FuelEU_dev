# AI Agent Workflow Log

This document explains how AI agents were used during development of the FuelEU Maritime full-stack assignment.

**Agents used:**

* **Cursor Agent** — primary coding assistant (repository creation, migrations, TypeScript implementation, controllers, React UI components)
* **GitHub Copilot** — inline completions, small boilerplate autofill, quick TS fixes
* **ChatGPT (GPT-5.1)** — architecture planning, prompt engineering, step-by-step breakdowns, debugging guidance

All code was validated with tests and manual review before committing.

---

## 1. Agents Used

### Cursor Agent
* Used for generating large multi-file code blocks
* Running Tasks, editing multiple files at once
* Especially helpful for backend ports, controllers, repositories, complex use-cases, and frontend component folders

### GitHub Copilot
Used during typing inside VS Code to:
* auto-complete React component boilerplate
* suggest TS types
* complete repetitive code (e.g. mapping DB rows)
* minor refactors

### ChatGPT
Used only for:
* Prompt engineering
* Breaking assignment into actionable steps
* Planning backend/frontend architecture following hexagonal rules
* Deciding sequence of tasks
* Creating the documentation files (this one included)

---

## 2. Prompts & Outputs

Below are real prompts used during development and the generated snippets (shortened for clarity).

### Example Prompt 1 — CBCalculator (core logic)

> **Prompt:**
>
> Write a TypeScript module `src/core/domain/CBCalculator.ts` that exports a function:
>
> `export function computeCB(target: number, actual: number, fuelConsumptionT: number): { cb: number; energyMJ: number }`
>
> Requirements:
> - energyMJ = fuelConsumptionT * 41000
> - cb = (target - actual) * energyMJ
> - Use strict typing, include JSDoc comments, and throw a descriptive error if fuelConsumptionT is negative or if target/actual are NaN.
> - Add an example usage as a commented snippet at the bottom.
>
> Return only the TypeScript source file.

**Cursor Output (excerpt):**
```typescript
export function computeCB(target: number, actual: number, fuelConsumptionT: number) {
  if (!Number.isFinite(target) || !Number.isFinite(actual)) {
    throw new Error("target and actual must be valid numbers");
  }
  if (!Number.isFinite(fuelConsumptionT) || fuelConsumptionT < 0) {
    throw new Error("fuelConsumptionT must be a non-negative number");
  }
  const energyMJ = fuelConsumptionT * 41000;
  const cb = (target - actual) * energyMJ;
  return { cb, energyMJ };
}

## Manual fix after validation:
Added more descriptive JSDoc
Added toBeCloseTo tests
Renamed variables for consistency
Example Prompt 2 — Routes baseline endpoint
Prompt:
'''
Update backend/src/adapters/outbound/postgres/routesRepo.ts by adding:

async setBaseline(routeId: string): Promise<void>

Requirements:

Start a transaction

UPDATE routes SET is_baseline = FALSE for all

UPDATE routes SET is_baseline = TRUE WHERE route_id = $1

If no rows updated, throw “Route not found”

Commit if success, rollback otherwise '''

Cursor Output (excerpt):

TypeScript

async setBaseline(routeId: string): Promise<void> {
  const client = await this.pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE routes SET is_baseline = FALSE");
    const updated = await client.query(
      "UPDATE routes SET is_baseline = TRUE WHERE route_id = $1",
      [routeId]
    );
    if (updated.rowCount === 0) throw new Error("Route not found");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
Manual validation:

Wrote baseline.test.ts using Supertest

Verified DB state before/after baseline switch

Example Prompt 3 — Generate entire frontend (React + TS + Tailwind)
Prompt (abridged):

GENERATE: Full frontend project for FuelEU Maritime compliance dashboard Target: Vite + React + TypeScript + TailwindCSS Goal: complete frontend implementation per functional spec: Routes, Compare, Banking, Pooling tabs; hexagonal architecture; API integration; tests; documentation.

Cursor Output:

Created complete folder structure: core/application, core/ports, adapters/ui/pages, /components, etc.

Fully generated working:

RoutesPage, ComparePage, BankingPage, PoolingPage

CompareChart (Recharts)

RouteTable, Tabs

apiClient with typed methods

hexagonal separation

Some paths needed manual fixes.

Manual improvements:

Fixed several import paths

Replaced some any types with strict domain types

Adjusted React components to handle empty/initial states

Updated Shell commands in README

Example Prompt 4 — Pooling greedy algorithm
Prompt:

Export function createPoolGreedy(members: {shipId:string, cb_before:number}[]): PoolMember[]

Validate sum(cb_before) >= 0

Greedy allocate surplus → deficits

Ensure surplus never goes negative

Ensure deficit ships do not exit worse

Return cb_after for each ship

Generated snippet (excerpt):

TypeScript

for (const s of surpluses) {
  let avail = s.cb_after!;
  for (const d of deficits) {
    if (d.cb_after! >= 0) continue;
    const need = -d.cb_after!;
    const transfer = Math.min(avail, need);
    d.cb_after = d.cb_after! + transfer;
    avail -= transfer;
    s.cb_after = s.cb_after! - transfer;
    if (avail <= 0) break;
  }
}
Manual validation:

Wrote tests for:

exact cover

insufficient surplus (throw)

surplus leftover case

Added precision handling 1e-9 for floating-point safety

3. Validation / Corrections
Validation methods:
Jest backend tests:

cb.test.ts, computeComparison.test.ts, computeAndStoreCB.test.ts, pooling tests, banking tests

Supertest integration tests:

Verified POST /routes/:id/baseline

psql DB checks:

Validated migrations + seed data

Frontend manual testing:

Navigated through Routes → Compare → Banking → Pooling

Verified API client integration & UI rendering

Common corrections:
Converting numeric DB fields (NUMERIC) → Number()

Fixing incorrect import paths produced by agents

Adjusting SQL naming consistency

Ensuring hexagonal layering rules (no Express in core, no DB in core)

Updating React state handling for null/undefined edge cases

Fixing React keys and missing dependency arrays

4. Observations
Where agents saved time:
Rapid bootstrapping of folder structures & boilerplate

Generating repetitive SQL / repository code

Creating multiple React components quickly

Generating test suites following specification

Where agents hallucinated or made mistakes:
Missing imports or incorrect relative paths (../../ errors)

Using snake_case on frontend but camelCase expected

Not converting PG numeric fields to Number

Occasionally using incorrect TS types (any, wrong generics)

Incorrect assumptions about variable naming (routeId vs shipId)

How tools were combined effectively:
ChatGPT: for high-level architecture, precise prompts, troubleshooting strategies

Cursor: for writing whole repositories/controllers/hooks/components in one go

Copilot: for filling small gaps and in-file boilerplate (React props, TS types)

This combination produced the fastest iteration cycle: ChatGPT designs → Cursor implements → Copilot refines.

5. Best Practices Followed
Created explicit Ports in core/ports

Ensured core/application contains zero framework-specific code

Used pure functions (computeCB, compareUsecase, poolingLogic) tested in isolation

Handled transactions and safe SQL queries in repo implementations

Used supertest for endpoint verification

Created typed API clients in frontend

Kept strict TypeScript mode across both repos

Followed hexagonal separation strictly

Used React composition for reusable UI pieces (RouteTable, CompareChart, KPIBox)

Documented every major agent-assisted step in this file

6. Final Notes
AI agents accelerated development but did not replace manual review or tests

Complex domain rules required manual reasoning (pooling constraints, CB calculations)

Prompt engineering quality strongly influenced output accuracy

This workflow demonstrates how AI can be effectively integrated into full-stack engineering tasks