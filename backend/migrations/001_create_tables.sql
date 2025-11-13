CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  route_id TEXT UNIQUE NOT NULL,
  vessel_type TEXT,
  fuel_type TEXT,
  year INTEGER,
  ghg_intensity NUMERIC,
  fuel_consumption_t NUMERIC,
  distance_km NUMERIC,
  total_emissions_t NUMERIC,
  is_baseline BOOLEAN DEFAULT FALSE
);