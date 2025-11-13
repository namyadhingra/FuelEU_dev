import { Router, Request, Response } from "express";
import { bankSurplus, applyBanked } from "../../../core/application/bankingUsecase";
import { ComplianceRepo } from "../../outbound/postgres/complianceRepo";
import { BankingRepo } from "../../outbound/postgres/bankingRepo";

const router = Router();
const complianceRepo = new ComplianceRepo();
const bankingRepo = new BankingRepo();

/**
 * GET /banking/records?shipId=:shipId&year=:year
 * Lists all bank entries for a ship in a given year.
 * 
 * @query shipId - Required ship identifier
 * @query year - Required compliance year
 * @returns 200 - Array of bank entries
 * @returns 400 - { error: "Missing or invalid parameters" }
 * 
 * @example
 * GET /banking/records?shipId=R001&year=2024
 * Response: [
 *   { id: 1, amount_gco2eq: 100000, created_at: "2024-01-01T00:00:00.000Z" }
 * ]
 */
router.get("/banking/records", async (req: Request, res: Response) => {
  try {
    const shipId = req.query.shipId as string;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : null;

    if (!shipId) {
      res.status(400).json({ error: "Missing required parameter 'shipId'" });
      return;
    }

    if (!year || isNaN(year)) {
      res.status(400).json({ error: "Missing or invalid 'year' parameter" });
      return;
    }

    const entries = await bankingRepo.listEntries(shipId, year);
    res.status(200).json(entries);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error listing bank entries:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * POST /banking/bank
 * Banks surplus CB (positive carbon balance) for later use.
 * 
 * @body { shipId: string, year: number, amount: number }
 * @returns 200 - { message: "CB banked successfully", bankedSum: number }
 * @returns 400 - { error: "Invalid request" }
 * @returns 400 - { error: "Cannot bank: CB must be positive" }
 * 
 * @example
 * POST /banking/bank
 * Body: { shipId: "R001", year: 2024, amount: 100000 }
 * Response: { message: "CB banked successfully", bankedSum: 100000 }
 */
router.post("/banking/bank", async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;

    if (!shipId || !year || !amount) {
      res.status(400).json({ error: "Missing required fields: shipId, year, amount" });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Amount must be a positive number" });
      return;
    }

    // Call bankSurplus use-case with injected ports
    await bankSurplus(
      { shipId, year, amount },
      {
        compliancePort: complianceRepo,
        bankingPort: bankingRepo,
      }
    );

    // Get updated banked sum
    const bankedSum = await bankingRepo.getBankedSum(shipId, year);

    res.status(200).json({
      message: "CB banked successfully",
      bankedSum,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    if (
      errorMessage.includes("Cannot bank") ||
      errorMessage.includes("exceeds") ||
      errorMessage.includes("No compliance data")
    ) {
      res.status(400).json({ error: errorMessage });
    } else {
      console.error("Error banking CB:", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  }
});

/**
 * POST /banking/apply
 * Applies banked surplus to reduce deficit.
 * 
 * @body { shipId: string, year: number, amount: number }
 * @returns 200 - { message: "Banked CB applied successfully", bankedSum: number }
 * @returns 400 - { error: "Invalid request" }
 * @returns 400 - { error: "No banked CB available" }
 * 
 * @example
 * POST /banking/apply
 * Body: { shipId: "R002", year: 2024, amount: 50000 }
 * Response: { message: "Banked CB applied successfully", bankedSum: 50000 }
 */
router.post("/banking/apply", async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;

    if (!shipId || !year || !amount) {
      res.status(400).json({ error: "Missing required fields: shipId, year, amount" });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Amount must be a positive number" });
      return;
    }

    // Call applyBanked use-case
    const bankedSum = await applyBanked(
      { shipId, year, amount },
      {
        bankingPort: bankingRepo,
      }
    );

    res.status(200).json({
      message: "Banked CB applied successfully",
      bankedSum,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    if (
      errorMessage.includes("Cannot apply") ||
      errorMessage.includes("No banked") ||
      errorMessage.includes("exceeds")
    ) {
      res.status(400).json({ error: errorMessage });
    } else {
      console.error("Error applying banked CB:", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  }
});

export default router;
