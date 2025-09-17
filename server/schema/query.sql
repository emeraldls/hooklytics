----- User Queries

-- name: GetUserByID :one
SELECT * FROM "users"
WHERE id = $1
LIMIT 1;

-- name: CreateUser :exec
INSERT INTO "users" (
  id,
  full_name,
  email,
  password,
  google_client_id,
  created_at,
  updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7
);

-- name: GetUserBySignIn :one
SELECT * FROM "users"
WHERE email = $1 AND password = $2
LIMIT 1;


---- Websites Queries

-- name: GetWebsiteByID :one
SELECT * FROM websites
WHERE id = $1
LIMIT 1;

-- name: ListWebsitesByUser :many
SELECT * FROM websites
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: CreateWebsite :exec
INSERT INTO websites (
  id,
  user_id,
  domain,
  name,
  created_at,
  updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6
);
