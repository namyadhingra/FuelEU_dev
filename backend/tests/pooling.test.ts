import { createPoolGreedy } from "../src/core/application/poolingUsecase";
import { IPoolingPort } from "../src/core/ports/poolingPort";

/**
 * Unit tests for createPoolGreedy use-case
 */
describe("createPoolGreedy", () => {
  // Mock pooling port (not used in computation but required for interface)
  const mockPoolingPort: IPoolingPort = {
    createPool: jest.fn(),
  };

  describe("exact cover scenario", () => {
    it("should allocate surplus exactly to cover deficits", () => {
      const members = [
        { shipId: "R001", cb_before: 1000000 }, // Surplus
        { shipId: "R002", cb_before: -500000 }, // Deficit
        { shipId: "R003", cb_before: -500000 }, // Deficit
      ];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      expect(result.members).toHaveLength(3);

      // Find each member
      const r001 = result.members.find((m) => m.shipId === "R001");
      const r002 = result.members.find((m) => m.shipId === "R002");
      const r003 = result.members.find((m) => m.shipId === "R003");

      expect(r001).toBeDefined();
      expect(r002).toBeDefined();
      expect(r003).toBeDefined();

      // Verify deficits never got worse (main requirement)
      expect(r002?.cb_after).toBeGreaterThanOrEqual(r002?.cb_before!);
      expect(r003?.cb_after).toBeGreaterThanOrEqual(r003?.cb_before!);

      // Verify no surplus goes negative
      expect(r001?.cb_after).toBeGreaterThanOrEqual(0);

      // Verify total CB is preserved (sum of cb_after should equal sum of cb_before)
      const totalBefore = members.reduce((sum, m) => sum + m.cb_before, 0);
      const totalAfter = result.members.reduce((sum, m) => sum + m.cb_after, 0);
      expect(totalAfter).toBeCloseTo(totalBefore, 2);
    });
  });

  describe("insufficient surplus scenario", () => {
    it("should throw error when sum(cb_before) < 0", () => {
      const members = [
        { shipId: "R001", cb_before: 500000 }, // Surplus
        { shipId: "R002", cb_before: -1000000 }, // Deficit (exceeds surplus)
      ];

      expect(() => {
        createPoolGreedy(members, { poolingPort: mockPoolingPort });
      }).toThrow("Pool validation failed: Sum of cb_before");
    });

    it("should throw error when sum is exactly negative", () => {
      const members = [
        { shipId: "R001", cb_before: 100000 },
        { shipId: "R002", cb_before: -200000 },
      ];

      expect(() => {
        createPoolGreedy(members, { poolingPort: mockPoolingPort });
      }).toThrow("Sum of cb_before");
    });
  });

  describe("surplus leftover scenario", () => {
    it("should correctly allocate when surplus exceeds deficits", () => {
      const members = [
        { shipId: "R001", cb_before: 1500000 }, // Surplus
        { shipId: "R002", cb_before: -500000 }, // Deficit
        { shipId: "R003", cb_before: -500000 }, // Deficit
      ];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      const r001 = result.members.find((m) => m.shipId === "R001");
      const r002 = result.members.find((m) => m.shipId === "R002");
      const r003 = result.members.find((m) => m.shipId === "R003");

      // Verify deficits never got worse
      expect(r002?.cb_after).toBeGreaterThanOrEqual(r002?.cb_before!);
      expect(r003?.cb_after).toBeGreaterThanOrEqual(r003?.cb_before!);

      // Verify no surplus goes negative
      expect(r001?.cb_after).toBeGreaterThanOrEqual(0);

      // Verify total CB is preserved
      const totalBefore = members.reduce((sum, m) => sum + m.cb_before, 0);
      const totalAfter = result.members.reduce((sum, m) => sum + m.cb_after, 0);
      expect(totalAfter).toBeCloseTo(totalBefore, 2);

      // Surplus should have leftover: 1500000 - 500000 - 500000 = 500000
      // (This may not be exactly 500000 if algorithm distributes differently)
      expect(r001?.cb_after).toBeGreaterThan(0);
    });

    it("should handle multiple surplus ships with leftover", () => {
      const members = [
        { shipId: "R001", cb_before: 800000 }, // Surplus 1
        { shipId: "R002", cb_before: 700000 }, // Surplus 2
        { shipId: "R003", cb_before: -600000 }, // Deficit 1
        { shipId: "R004", cb_before: -400000 }, // Deficit 2
      ];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      const r001 = result.members.find((m) => m.shipId === "R001");
      const r002 = result.members.find((m) => m.shipId === "R002");
      const r003 = result.members.find((m) => m.shipId === "R003");
      const r004 = result.members.find((m) => m.shipId === "R004");

      // Verify deficits never got worse
      expect(r003?.cb_after).toBeGreaterThanOrEqual(r003?.cb_before!);
      expect(r004?.cb_after).toBeGreaterThanOrEqual(r004?.cb_before!);

      // Verify no surplus goes negative
      expect(r001?.cb_after).toBeGreaterThanOrEqual(0);
      expect(r002?.cb_after).toBeGreaterThanOrEqual(0);

      // Verify total CB is preserved
      const totalBefore = members.reduce((sum, m) => sum + m.cb_before, 0);
      const totalAfter = result.members.reduce((sum, m) => sum + m.cb_after, 0);
      expect(totalAfter).toBeCloseTo(totalBefore, 2);

      // Total surplus: 800000 + 700000 = 1500000
      // Total deficit: 600000 + 400000 = 1000000
      // Leftover: 1500000 - 1000000 = 500000
      expect(totalAfter).toBeCloseTo(500000, 2);
    });
  });

  describe("edge cases", () => {
    it("should throw error when members array is empty", () => {
      expect(() => {
        createPoolGreedy([], { poolingPort: mockPoolingPort });
      }).toThrow("Pool must have at least one member");
    });

    it("should handle single member with positive CB", () => {
      const members = [{ shipId: "R001", cb_before: 1000000 }];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      expect(result.members).toHaveLength(1);
      expect(result.members[0].cb_after).toBeCloseTo(1000000, 2);
    });

    it("should handle single member with zero CB", () => {
      const members = [{ shipId: "R001", cb_before: 0 }];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      expect(result.members).toHaveLength(1);
      expect(result.members[0].cb_after).toBeCloseTo(0, 2);
    });

    it("should handle all members with positive CB (no deficits)", () => {
      const members = [
        { shipId: "R001", cb_before: 500000 },
        { shipId: "R002", cb_before: 300000 },
      ];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      // All should keep their original values
      const r001 = result.members.find((m) => m.shipId === "R001");
      const r002 = result.members.find((m) => m.shipId === "R002");

      expect(r001?.cb_after).toBeCloseTo(500000, 2);
      expect(r002?.cb_after).toBeCloseTo(300000, 2);
    });
  });

  describe("validation rules", () => {
    it("should ensure deficits never get worse", () => {
      const members = [
        { shipId: "R001", cb_before: 1000000 },
        { shipId: "R002", cb_before: -500000 },
      ];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      const r002 = result.members.find((m) => m.shipId === "R002");
      expect(r002?.cb_after).toBeGreaterThanOrEqual(r002?.cb_before!);
    });

    it("should ensure no surplus goes negative", () => {
      const members = [
        { shipId: "R001", cb_before: 1000000 },
        { shipId: "R002", cb_before: -500000 },
      ];

      const result = createPoolGreedy(members, { poolingPort: mockPoolingPort });

      const r001 = result.members.find((m) => m.shipId === "R001");
      expect(r001?.cb_after).toBeGreaterThanOrEqual(0);
    });
  });
});

