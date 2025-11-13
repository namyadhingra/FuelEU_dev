import { Router, Request, Response } from "express";
import { createPoolGreedy } from "../../../core/application/poolingUsecase";
import { PoolingRepo } from "../../outbound/postgres/poolingRepo";

const router = Router();
const poolingRepo = new PoolingRepo();

/**
 * POST /pools
 * Creates a pool with greedy allocation of CB between members.
 * 
 * @body { year: number, members: [{ shipId: string, cb_before: number }] }
 * @returns 200 - { poolId: number, members: [{ shipId, cb_before, cb_after }] }
 * @returns 400 - { error: "Invalid request" }
 * @returns 400 - { error: "Pool validation failed" }
 * 
 * @example
 * POST /pools
 * Body: {
 *   year: 2024,
 *   members: [
 *     { shipId: "R001", cb_before: 1000000 },
 *     { shipId: "R002", cb_before: -500000 }
 *   ]
 * }
 * Response: {
 *   poolId: 1,
 *   members: [
 *     { shipId: "R001", cb_before: 1000000, cb_after: 500000 },
 *     { shipId: "R002", cb_before: -500000, cb_after: 0 }
 *   ]
 * }
 */
router.post("/pools", async (req: Request, res: Response) => {
  try {
    const { year, members } = req.body;

    if (!year || !members) {
      res.status(400).json({ error: "Missing required fields: year, members" });
      return;
    }

    if (typeof year !== "number") {
      res.status(400).json({ error: "year must be a number" });
      return;
    }

    if (!Array.isArray(members) || members.length === 0) {
      res.status(400).json({ error: "members must be a non-empty array" });
      return;
    }

    // Validate each member has required fields
    for (const member of members) {
      if (!member.shipId || typeof member.cb_before !== "number") {
        res.status(400).json({
          error: "Each member must have shipId (string) and cb_before (number)",
        });
        return;
      }
    }

    // Validate sum(cb_before) >= 0
    const sumCbBefore = members.reduce((sum, m) => sum + m.cb_before, 0);
    if (sumCbBefore < 0) {
      res.status(400).json({
        error: `Pool validation failed: Sum of cb_before (${sumCbBefore}) must be >= 0`,
      });
      return;
    }

    // Call createPoolGreedy to compute cb_after values
    const allocationResult = createPoolGreedy(members, {
      poolingPort: poolingRepo,
    });

    // Call poolingRepo.createPool with members including cb_after values
    const { poolId } = await poolingRepo.createPool(year, allocationResult.members);

    // Return poolId and members array
    res.status(200).json({
      poolId,
      members: allocationResult.members,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    if (
      errorMessage.includes("Pool validation failed") ||
      errorMessage.includes("must be") ||
      errorMessage.includes("Sum of")
    ) {
      res.status(400).json({ error: errorMessage });
    } else {
      console.error("Error creating pool:", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  }
});

export default router;

