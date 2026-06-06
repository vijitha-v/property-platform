CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS enquiries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  message         TEXT NOT NULL,
  property_id     VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'pending',
  idempotency_key VARCHAR(64) UNIQUE,
  ip_address      VARCHAR(50),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_email        ON enquiries(email);
CREATE INDEX IF NOT EXISTS idx_enquiries_status       ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created      ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_idempotency  ON enquiries(idempotency_key);

CREATE TABLE IF NOT EXISTS webhook_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source     VARCHAR(50) NOT NULL,
  payload    JSONB NOT NULL,
  signature  VARCHAR(255),
  processed  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
