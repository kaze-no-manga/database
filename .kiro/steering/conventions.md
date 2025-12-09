# Conventions - Database

## Naming
- Tables: snake_case, plural (e.g., `users`, `manga`)
- Columns: snake_case (e.g., `created_at`, `manga_id`)
- Indexes: `idx_{table}_{column}` (e.g., `idx_users_email`)
- Foreign keys: `{table}_id` (e.g., `user_id`, `manga_id`)

## Types
- IDs: uuid
- Timestamps: timestamp with time zone
- Booleans: boolean (not integer)
- JSON: jsonb (not json)

## Indexes
- Primary keys: automatic
- Foreign keys: always indexed
- Frequently queried columns: indexed
- Composite indexes for multi-column queries
