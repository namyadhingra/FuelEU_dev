import { bankSurplus, applyBanked } from "../src/core/application/bankingUsecase";
import { ICompliancePort } from "../src/core/ports/compliancePort";
import { IBankingPort } from "../src/core/ports/bankingPort";

/**
 * Unit tests for banking use-cases
 */
describe("bankingUsecase", () => {
  describe("bankSurplus", () => {
    it("should reject when amount <= 0", async () => {
      const mockCompliancePort: ICompliancePort = {
        saveSnapshot: jest.fn(),
        findLatestCB: jest.fn(),
      };

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn(),
        insertBankEntry: jest.fn(),
        listEntries: jest.fn(),
      };

      // Test with zero amount
      await expect(
        bankSurplus(
          { shipId: "R001", year: 2024, amount: 0 },
          {
            compliancePort: mockCompliancePort,
            bankingPort: mockBankingPort,
          }
        )
      ).rejects.toThrow("Amount to bank must be positive");

      // Test with negative amount
      await expect(
        bankSurplus(
          { shipId: "R001", year: 2024, amount: -100 },
          {
            compliancePort: mockCompliancePort,
            bankingPort: mockBankingPort,
          }
        )
      ).rejects.toThrow("Amount to bank must be positive");
    });

    it("should reject when no compliance data found", async () => {
      const mockCompliancePort: ICompliancePort = {
        saveSnapshot: jest.fn(),
        findLatestCB: jest.fn().mockResolvedValue(null),
      };

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn(),
        insertBankEntry: jest.fn(),
        listEntries: jest.fn(),
      };

      await expect(
        bankSurplus(
          { shipId: "R001", year: 2024, amount: 100000 },
          {
            compliancePort: mockCompliancePort,
            bankingPort: mockBankingPort,
          }
        )
      ).rejects.toThrow("No compliance data found");
    });

    it("should reject when CB is not positive (no surplus)", async () => {
      const mockCompliancePort: ICompliancePort = {
        saveSnapshot: jest.fn(),
        findLatestCB: jest.fn().mockResolvedValue({
          cb_gco2eq: -500000, // Negative CB (deficit)
          energy_mj: 205000000,
        }),
      };

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn(),
        insertBankEntry: jest.fn(),
        listEntries: jest.fn(),
      };

      await expect(
        bankSurplus(
          { shipId: "R001", year: 2024, amount: 100000 },
          {
            compliancePort: mockCompliancePort,
            bankingPort: mockBankingPort,
          }
        )
      ).rejects.toThrow("Cannot bank: CB must be positive");
    });

    it("should reject when amount exceeds available CB", async () => {
      const mockCompliancePort: ICompliancePort = {
        saveSnapshot: jest.fn(),
        findLatestCB: jest.fn().mockResolvedValue({
          cb_gco2eq: 500000, // Available CB
          energy_mj: 205000000,
        }),
      };

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn(),
        insertBankEntry: jest.fn(),
        listEntries: jest.fn(),
      };

      await expect(
        bankSurplus(
          { shipId: "R001", year: 2024, amount: 600000 }, // Exceeds available
          {
            compliancePort: mockCompliancePort,
            bankingPort: mockBankingPort,
          }
        )
      ).rejects.toThrow("exceeds available CB");
    });

    it("should succeed and call insertBankEntry when valid", async () => {
      const availableCB = 1000000;
      const amountToBank = 500000;

      const mockCompliancePort: ICompliancePort = {
        saveSnapshot: jest.fn(),
        findLatestCB: jest.fn().mockResolvedValue({
          cb_gco2eq: availableCB,
          energy_mj: 205000000,
        }),
      };

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn(),
        insertBankEntry: jest.fn().mockResolvedValue(undefined),
        listEntries: jest.fn(),
      };

      await bankSurplus(
        { shipId: "R001", year: 2024, amount: amountToBank },
        {
          compliancePort: mockCompliancePort,
          bankingPort: mockBankingPort,
        }
      );

      // Verify insertBankEntry was called with correct values
      expect(mockBankingPort.insertBankEntry).toHaveBeenCalledTimes(1);
      expect(mockBankingPort.insertBankEntry).toHaveBeenCalledWith({
        shipId: "R001",
        year: 2024,
        amount_gco2eq: amountToBank,
      });
    });
  });

  describe("applyBanked", () => {
    it("should reject when amount <= 0", async () => {
      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn(),
        insertBankEntry: jest.fn(),
        listEntries: jest.fn(),
      };

      // Test with zero amount
      await expect(
        applyBanked(
          { shipId: "R001", year: 2024, amount: 0 },
          { bankingPort: mockBankingPort }
        )
      ).rejects.toThrow("Amount to apply must be positive");

      // Test with negative amount
      await expect(
        applyBanked(
          { shipId: "R001", year: 2024, amount: -100 },
          { bankingPort: mockBankingPort }
        )
      ).rejects.toThrow("Amount to apply must be positive");
    });

    it("should reject when no banked CB available", async () => {
      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn().mockResolvedValue(0), // No banked CB
        insertBankEntry: jest.fn(),
        listEntries: jest.fn(),
      };

      await expect(
        applyBanked(
          { shipId: "R001", year: 2024, amount: 100000 },
          { bankingPort: mockBankingPort }
        )
      ).rejects.toThrow("No banked CB available to apply");
    });

    it("should reject when amount > available banked sum", async () => {
      const availableBanked = 500000;

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest.fn().mockResolvedValue(availableBanked),
        insertBankEntry: jest.fn(),
        listEntries: jest.fn(),
      };

      await expect(
        applyBanked(
          { shipId: "R001", year: 2024, amount: 600000 }, // Exceeds available
          { bankingPort: mockBankingPort }
        )
      ).rejects.toThrow("exceeds banked CB");
    });

    it("should succeed and insert negative entry when valid", async () => {
      const availableBanked = 1000000;
      const amountToApply = 500000;
      const newBankedSum = 500000; // After applying

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest
          .fn()
          .mockResolvedValueOnce(availableBanked) // First call: before apply
          .mockResolvedValueOnce(newBankedSum), // Second call: after apply
        insertBankEntry: jest.fn().mockResolvedValue(undefined),
        listEntries: jest.fn(),
      };

      const result = await applyBanked(
        { shipId: "R001", year: 2024, amount: amountToApply },
        { bankingPort: mockBankingPort }
      );

      // Verify insertBankEntry was called with negative amount
      expect(mockBankingPort.insertBankEntry).toHaveBeenCalledTimes(1);
      expect(mockBankingPort.insertBankEntry).toHaveBeenCalledWith({
        shipId: "R001",
        year: 2024,
        amount_gco2eq: -amountToApply, // Negative for consumption
      });

      // Verify getBankedSum was called twice (before and after)
      expect(mockBankingPort.getBankedSum).toHaveBeenCalledTimes(2);

      // Verify result is the new banked sum
      expect(result).toBe(newBankedSum);
    });

    it("should handle exact amount application", async () => {
      const availableBanked = 500000;
      const amountToApply = 500000; // Exact amount

      const mockBankingPort: IBankingPort = {
        getBankedSum: jest
          .fn()
          .mockResolvedValueOnce(availableBanked)
          .mockResolvedValueOnce(0), // All applied
        insertBankEntry: jest.fn().mockResolvedValue(undefined),
        listEntries: jest.fn(),
      };

      const result = await applyBanked(
        { shipId: "R001", year: 2024, amount: amountToApply },
        { bankingPort: mockBankingPort }
      );

      expect(result).toBe(0);
      expect(mockBankingPort.insertBankEntry).toHaveBeenCalledWith({
        shipId: "R001",
        year: 2024,
        amount_gco2eq: -amountToApply,
      });
    });
  });
});

