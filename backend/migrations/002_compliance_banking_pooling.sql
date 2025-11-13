-- Migration: Create compliance, banking, and pooling tables
-- This migration creates tables for Fuel EU Maritime compliance calculations,
-- banking operations, and pooling functionality.

-- 1. ship_compliance table
CREATE TABLE IF NOT EXISTS ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  route_id TEXT NULL,
  year INT NOT NULL,
  cb_gco2eq NUMERIC NOT NULL,
  energy_mj NUMERIC NOT NULL,
  target_gco2eq_per_mj NUMERIC NOT NULL,
  actual_gco2eq_per_mj NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index on (ship_id, year) for ship_compliance
CREATE INDEX IF NOT EXISTS idx_ship_compliance_ship_id_year ON ship_compliance(ship_id, year);

-- 2. bank_entries table
CREATE TABLE IF NOT EXISTS bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  year INT NOT NULL,
  amount_gco2eq NUMERIC NOT NULL,  -- positive for deposit, negative for consumption
  note TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index on (ship_id, year) for bank_entries
CREATE INDEX IF NOT EXISTS idx_bank_entries_ship_id_year ON bank_entries(ship_id, year);

-- 3. pools table
CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. pool_members table
CREATE TABLE IF NOT EXISTS pool_members (
  id SERIAL PRIMARY KEY,
  pool_id INT NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  ship_id TEXT NOT NULL,
  cb_before NUMERIC NOT NULL,
  cb_after NUMERIC NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
