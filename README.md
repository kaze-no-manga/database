# database

[![npm version](https://img.shields.io/npm/v/@kaze-no-manga/database.svg?style=flat)](https://www.npmjs.com/package/@kaze-no-manga/database)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Coverage Badge](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat)

> Database schema, migrations, and utilities for Kaze no Manga

## Overview

This repository contains the complete database schema, migration files, seed data, and utility functions for the Kaze no Manga platform using Drizzle ORM and PostgreSQL.

## Features

- 📊 **Drizzle ORM**: Type-safe database schema
- 🔄 **Migrations**: Version-controlled schema changes
- 🌱 **Seed Data**: Initial data for development
- 🛠️ **Utilities**: Helper functions for common operations
- 🚀 **CDK Integration**: Deployed via AWS CDK Custom Resource

## Tech Stack

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (AWS RDS)
- **Migration**: Drizzle Kit
- **Deployment**: AWS CDK Custom Resource (Lambda)

## Schema Overview

### Core Entities

```
users
├── id (uuid, PK)
├── email (text, unique)
├── name (text, nullable)
├── avatar (text, nullable)
├── preferences (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)

manga
├── id (uuid, PK)
├── slug (text, unique)
├── title (text)
├── alt_titles (text[])
├── description (text, nullable)
├── cover (text, nullable)
├── status (enum: ONGOING, COMPLETED, HIATUS, CANCELLED)
├── genres (text[])
├── authors (text[])
├── year (integer, nullable)
├── total_chapters (integer, nullable)
├── is_nsfw (boolean)
├── source_name (text)
├── source_id (text)
├── created_at (timestamp)
└── updated_at (timestamp)

chapters
├── id (uuid, PK)
├── manga_id (uuid, FK -> manga)
├── number (decimal)
├── title (text, nullable)
├── release_date (timestamp, nullable)
├── images (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)

user_library
├── user_id (uuid, FK -> users)
├── manga_id (uuid, FK -> manga)
├── status (enum: READING, COMPLETED, PLAN_TO_READ, DROPPED, ON_HOLD, nullable)
├── rating (integer, nullable, 1-10)
├── notes (text, nullable)
├── current_chapter_id (uuid, FK -> chapters, nullable)
├── last_read_at (timestamp, nullable)
├── created_at (timestamp)
├── updated_at (timestamp)
└── PRIMARY KEY (user_id, manga_id)

reading_history
├── id (uuid, PK)
├── user_id (uuid, FK -> users)
├── manga_id (uuid, FK -> manga)
├── chapter_id (uuid, FK -> chapters)
├── chapter_number (decimal)
├── completed (boolean)
├── read_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)
```
└── updated_at (timestamp)

user_library
├── id (uuid, PK)
├── user_id (uuid, FK -> users)
├── manga_id (uuid, FK -> manga)
├── status (enum: reading, completed, plan_to_read, dropped, on_hold)
├── rating (integer, nullable, 1-10)
├── notes (text, nullable)
├── current_chapter_id (uuid, FK -> chapters, nullable)
├── current_chapter_number (decimal, nullable)
├── last_read_at (timestamp, nullable)
├── added_at (timestamp)
└── updated_at (timestamp)

reading_history
├── id (uuid, PK)
├── user_id (uuid, FK -> users)
├── manga_id (uuid, FK -> manga)
├── chapter_id (uuid, FK -> chapters)
├── chapter_number (decimal)
├── completed (boolean)
└── read_at (timestamp)

notifications
├── id (uuid, PK)
├── user_id (uuid, FK -> users)
├── manga_id (uuid, FK -> manga, nullable)
├── chapter_id (uuid, FK -> chapters, nullable)
├── type (enum: new_chapter, manga_completed, source_changed)
├── title (text)
├── message (text)
├── read (boolean)
├── sent_at (timestamp)
└── read_at (timestamp, nullable)
```

### Indexes

```sql
-- Users
CREATE INDEX idx_users_cognito_id ON users(cognito_id);
CREATE INDEX idx_users_email ON users(email);

-- Manga
CREATE INDEX idx_manga_title ON manga(title);
CREATE INDEX idx_manga_status ON manga(status);
CREATE INDEX idx_manga_genres ON manga USING GIN(genres);

-- Chapters
CREATE INDEX idx_chapters_manga_id ON chapters(manga_id);
CREATE INDEX idx_chapters_number ON chapters(manga_id, number);

-- User Library
CREATE INDEX idx_user_library_user_id ON user_library(user_id);
CREATE INDEX idx_user_library_manga_id ON user_library(manga_id);
CREATE UNIQUE INDEX idx_user_library_unique ON user_library(user_id, manga_id);

-- Reading History
CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX idx_reading_history_manga_id ON reading_history(manga_id);
CREATE INDEX idx_reading_history_read_at ON reading_history(read_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
```

## Installation

```bash
npm install
```

## Usage

### Define Schema (Drizzle)

```typescript
// src/schema/users.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  cognitoId: text('cognito_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  preferences: jsonb('preferences').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### Create Migration

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback
```

### Seed Database

```bash
# Run seed script
npm run db:seed
```

### Query Database

```typescript
import { db } from './db'
import { users, manga } from './schema'
import { eq } from 'drizzle-orm'

// Select
const allUsers = await db.select().from(users)
const user = await db.select().from(users).where(eq(users.id, userId))

// Insert
const newUser = await db.insert(users).values({
  cognitoId: 'cognito-123',
  email: 'user@example.com',
  preferences: {}
}).returning()

// Update
await db.update(users)
  .set({ name: 'John Doe' })
  .where(eq(users.id, userId))

// Delete
await db.delete(users).where(eq(users.id, userId))
```

## Migrations

### Generate Migration

```bash
npm run db:generate
```

This creates a new migration file in `migrations/` based on schema changes.

### Apply Migrations

**Local Development:**
```bash
npm run db:migrate
```

**Production (via CDK):**
Migrations are applied automatically during deployment via AWS CDK Custom Resource.

### Migration Files

```
migrations/
├── 0000_initial_schema.sql
├── 0001_add_notifications.sql
├── 0002_add_reading_history.sql
└── meta/
    └── _journal.json
```

## Seed Data

Seed data for development and testing:

```typescript
// src/seed/index.ts
import { db } from '../db'
import { sources, manga, chapters } from '../schema'

export async function seed() {
  // Insert sources
  await db.insert(sources).values([
    { name: 'MangaPark', baseUrl: 'https://mangapark.net', status: 'active', priority: 1 },
    { name: 'OmegaScans', baseUrl: 'https://omegascans.org', status: 'active', priority: 2 },
  ])
  
  // Insert sample manga
  await db.insert(manga).values([
    {
      title: 'One Piece',
      altTitles: ['ワンピース'],
      status: 'ongoing',
      genres: ['Action', 'Adventure', 'Fantasy'],
      authors: ['Eiichiro Oda'],
      year: 1997,
    }
  ])
}
```

Run seed:
```bash
npm run db:seed
```

## Utilities

### Connection

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)
```

### Helpers

```typescript
// src/utils/helpers.ts

// Get user library with manga details
export async function getUserLibraryWithManga(userId: string) {
  return db
    .select()
    .from(userLibrary)
    .innerJoin(manga, eq(userLibrary.mangaId, manga.id))
    .where(eq(userLibrary.userId, userId))
}

// Get reading history for user
export async function getReadingHistory(userId: string, limit = 50) {
  return db
    .select()
    .from(readingHistory)
    .where(eq(readingHistory.userId, userId))
    .orderBy(desc(readingHistory.readAt))
    .limit(limit)
}

// Get unread notifications
export async function getUnreadNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ))
    .orderBy(desc(notifications.sentAt))
}
```

## CDK Integration

Migrations are applied during deployment via AWS CDK Custom Resource:

```typescript
// In infrastructure repo
import { CustomResource } from 'aws-cdk-lib'
import { Provider } from 'aws-cdk-lib/custom-resources'

const migrationLambda = new lambda.Function(this, 'MigrationLambda', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('path/to/database/dist'),
  environment: {
    DATABASE_URL: rds.secret.secretValueFromJson('connectionString').toString(),
  },
})

const migrationProvider = new Provider(this, 'MigrationProvider', {
  onEventHandler: migrationLambda,
})

new CustomResource(this, 'DatabaseMigration', {
  serviceToken: migrationProvider.serviceToken,
})
```

## Development

```bash
# Install dependencies
npm install

# Generate migration
npm run db:generate

# Apply migrations (local)
npm run db:migrate

# Rollback migration
npm run db:rollback

# Seed database
npm run db:seed

# Open Drizzle Studio (GUI)
npm run db:studio

# Build
npm run build

# Test
npm test
```

## Environment Variables

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/kaze_no_manga"
```

## Package Structure

```
database/
├── src/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── manga.ts
│   │   ├── chapters.ts
│   │   ├── library.ts
│   │   ├── notifications.ts
│   │   └── index.ts
│   ├── migrations/
│   │   └── (generated files)
│   ├── seed/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── db/
│   │   └── index.ts
│   └── index.ts
├── drizzle.config.ts
├── package.json
└── README.md
```

## Best Practices

1. **Always use migrations** - Never modify schema directly in production
2. **Test migrations** - Test rollback before deploying
3. **Use transactions** - For multi-step operations
4. **Index strategically** - Add indexes for frequently queried columns
5. **Avoid N+1 queries** - Use joins or batch queries
6. **Use prepared statements** - Drizzle handles this automatically

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Part of the [Kaze no Manga](https://github.com/kaze-no-manga) project**
