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
