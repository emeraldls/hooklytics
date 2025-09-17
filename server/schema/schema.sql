CREATE TABLE "users" (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  google_client_id TEXT NOT NULL,
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE "websites" (
  "id" TEXT PRIMARY KEY,
  "domain" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "client_id" TEXT,
  "host" TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
