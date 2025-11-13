ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  year INT NOT NULL,
  cb_gco2eq NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  year INT NOT NULL,
  amount_gco2eq NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

pools (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

pool_members (
  id SERIAL PRIMARY KEY,
  pool_id INT REFERENCES pools(id),
  ship_id TEXT NOT NULL,
  cb_before NUMERIC NOT NULL,
  cb_after NUMERIC NOT NULL
)
