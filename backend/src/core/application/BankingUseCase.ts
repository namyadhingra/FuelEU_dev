import { ICompliancePort } from "../ports/compliancePort";
import { IBankingPort } from "../ports/bankingPort";

/**
 * Banks surplus CB (positive carbon balance) for later use.
 * 
 * @param params - Banking parameters
 * @param params.shipId - The ship identifier
 * @param params.year - The compliance year
 * @param params.amount - Amount to bank (must be positive)
 * @param ports - Port dependencies
 * @param ports.compliancePort - Compliance port to check current CB
 * @param ports.bankingPort - Banking port to insert bank entry
 * @returns Promise that resolves when banking is complete
 * @throws Error if validation fails
 */
export async function bankSurplus(
  params: {
    shipId: string;
    year: number;
    amount: number;
  },
  ports: {
    compliancePort: ICompliancePort;
    bankingPort: IBankingPort;
  }
): Promise<void> {
  // Validate amount is positive
  if (params.amount <= 0) {
    throw new Error("Amount to bank must be positive");
  }

  // Get latest CB to validate surplus
  const latestCB = await ports.compliancePort.findLatestCB(params.shipId, params.year);

  if (!latestCB) {
    throw new Error(`No compliance data found for ship ${params.shipId} in year ${params.year}`);
  }

  // Validate that there is a surplus (positive CB)
  if (latestCB.cb_gco2eq <= 0) {
    throw new Error("Cannot bank: CB must be positive (surplus required)");
  }

  // Validate that amount doesn't exceed available surplus
  if (params.amount > latestCB.cb_gco2eq) {
    throw new Error(
      `Cannot bank: Amount (${params.amount}) exceeds available CB (${latestCB.cb_gco2eq})`
    );
  }

  // Insert bank entry (positive amount for deposit)
  await ports.bankingPort.insertBankEntry({
    shipId: params.shipId,
    year: params.year,
    amount_gco2eq: params.amount,
  });
}

/**
 * Applies banked CB to reduce a deficit.
 * 
 * @param params - Application parameters
 * @param params.shipId - The ship identifier
 * @param params.year - The compliance year
 * @param params.amount - Amount to apply (must be positive)
 * @param ports - Port dependencies
 * @param ports.bankingPort - Banking port to check and insert entries
 * @returns Promise resolving to the new banked sum after application
 * @throws Error if validation fails
 */
export async function applyBanked(
  params: {
    shipId: string;
    year: number;
    amount: number;
  },
  ports: {
    bankingPort: IBankingPort;
  }
): Promise<number> {
  // Validate amount is positive
  if (params.amount <= 0) {
    throw new Error("Amount to apply must be positive");
  }

  // Get current banked sum
  const bankedSum = await ports.bankingPort.getBankedSum(params.shipId, params.year);

  // Validate that there is banked CB available
  if (bankedSum <= 0) {
    throw new Error("No banked CB available to apply");
  }

  // Validate that amount doesn't exceed banked sum
  if (params.amount > bankedSum) {
    throw new Error(`Cannot apply: Amount (${params.amount}) exceeds banked CB (${bankedSum})`);
  }

  // Insert negative bank entry to represent application (consumption)
  await ports.bankingPort.insertBankEntry({
    shipId: params.shipId,
    year: params.year,
    amount_gco2eq: -params.amount, // Negative for consumption
  });

  // Return new banked sum after application
  const newBankedSum = await ports.bankingPort.getBankedSum(params.shipId, params.year);
  return newBankedSum;
}
