// Directory: src/shared/
// File: constants.ts
/**
 * Shared constants for Fuel EU Dashboard
 */

export const TARGET_INTENSITY_2025 = 89.3368; // gCO₂e/MJ (2% below baseline)
export const BASELINE_INTENSITY_2024 = 91.0; // gCO₂e/MJ
export const ENERGY_CONVERSION = 41000; // MJ/t

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";