import request from "supertest";
import { app } from "../src/adapters/inbound/http/server";

/**
 * Jest integration test suite for baseline route functionality
 * 
 * Note: Ensure jest.config.js includes:
 * module.exports = {
 *   preset: "ts-jest",
 *   testEnvironment: "node",
 *   roots: ["<rootDir>/tests"],
 *   testMatch: ["**/*.test.ts"],
 *   moduleFileExtensions: ["ts", "js"],
 * };
 * 
 * Also requires supertest: npm install --save-dev supertest @types/supertest
 */

describe("Baseline Routes Integration Tests", () => {
  it("should set a new baseline and update existing baseline to false", async () => {
    // Step 1: Get all routes to identify current baseline
    const initialResponse = await request(app).get("/routes");
    expect(initialResponse.status).toBe(200);
    expect(Array.isArray(initialResponse.body)).toBe(true);

    const initialBaseline = initialResponse.body.find(
      (route: any) => route.isBaseline === true
    );
    expect(initialBaseline).toBeDefined();
    expect(initialBaseline.routeId).toBe("R001"); // R001 is seeded as baseline

    // Step 2: Set R002 as the new baseline
    const setBaselineResponse = await request(app).post("/routes/R002/baseline");
    expect(setBaselineResponse.status).toBe(200);
    expect(setBaselineResponse.body).toEqual({ message: "Baseline updated" });

    // Step 3: Get all routes again and verify baseline was changed
    const updatedResponse = await request(app).get("/routes");
    expect(updatedResponse.status).toBe(200);
    expect(Array.isArray(updatedResponse.body)).toBe(true);

    // Find R002 and verify it is now the baseline
    const newBaseline = updatedResponse.body.find(
      (route: any) => route.routeId === "R002"
    );
    expect(newBaseline).toBeDefined();
    expect(newBaseline.isBaseline).toBe(true);

    // Find old baseline (R001) and verify it is no longer baseline
    const oldBaseline = updatedResponse.body.find(
      (route: any) => route.routeId === "R001"
    );
    expect(oldBaseline).toBeDefined();
    expect(oldBaseline.isBaseline).toBe(false);
  });

  it("should return 404 when setting baseline for non-existent route", async () => {
    const response = await request(app).post("/routes/NONEXISTENT/baseline");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Route not found" });
  });

  it("should return 200 and update baseline when setting an existing route", async () => {
    // Set R003 as baseline
    const response = await request(app).post("/routes/R003/baseline");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Baseline updated" });

    // Verify R003 is now baseline
    const routesResponse = await request(app).get("/routes");
    const r003 = routesResponse.body.find((route: any) => route.routeId === "R003");
    expect(r003.isBaseline).toBe(true);
  });
});