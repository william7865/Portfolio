CREATE TABLE IF NOT EXISTS events (
  id            BIGSERIAL PRIMARY KEY,
  ts            TIMESTAMPTZ NOT NULL DEFAULT now(),
  visitor_hash  TEXT        NOT NULL,
  path          TEXT        NOT NULL,
  lang          TEXT,
  referrer_host TEXT,
  country       TEXT,
  device        TEXT        NOT NULL
);

CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts);
CREATE INDEX IF NOT EXISTS events_ts_visitor_idx ON events (ts, visitor_hash);

-- Fixed-window rate-limit counters, shared across serverless instances.
-- One row per key ('login:ip:1.2.3.4', 'contact:global', ...); see lib/security/ratelimit.ts.
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT        PRIMARY KEY,
  count        INT         NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supports the periodic sweep of closed windows: keys are per-IP, so without it
-- the table keeps a row for every address that ever hit a limited route.
CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx ON rate_limits (window_start);
