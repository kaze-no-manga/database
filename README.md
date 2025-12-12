# @kaze-no-manga/database

[![npm version](https://img.shields.io/npm/v/@kaze-no-manga/database.svg?style=flat)](https://www.npmjs.com/package/@kaze-no-manga/database)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Database schema, migrations, and utilities for Kaze no Manga platform using Drizzle ORM and PostgreSQL

## Overview

This package provides the complete database schema and connection utilities for the Kaze no Manga platform using Drizzle ORM with AWS Aurora Serverless and Data API.

## Features

- 📊 **Drizzle ORM**: Type-safe database schema
- 🔄 **Migrations**: Version-controlled schema changes  
- ☁️ **AWS Data API**: Serverless database connection
- 🎯 **GraphQL Ready**: Schema aligned with GraphQL types
- 🚀 **CDK Integration**: Deployed via AWS CDK

## Installation

```bash
npm install @kaze-no-manga/database
```

## Usage

### Import Models and Types

```typescript
import { 
  users, 
  mangas, 
  chapters,
  type User,
  type Manga,
  type Chapter 
} from '@kaze-no-manga/database'

// Or import specific models
import { users, type User } from '@kaze-no-manga/database/models'
```

### Database Connection

```typescript
import { db } from '@kaze-no-manga/database'

// The db instance is pre-configured for AWS Data API
// Set these environment variables:
// - DATABASE: Aurora database name
// - SECRET_ARN: Secrets Manager ARN
// - RESOURCE_ARN: Aurora cluster ARN
```

### GraphQL Schema

```typescript
// Import the GraphQL schema for AppSync
import schema from '@kaze-no-manga/database/graphql'
```

## Schema Overview

### Core Entities

- **users** - User accounts with Cognito integration
- **mangas** - Manga metadata and information  
- **chapters** - Individual manga chapters
- **userLibrary** - User reading lists and progress
- **readingHistory** - Chapter reading tracking
- **notifications** - User notification system

### Enums

- **MangaStatus**: `ONGOING`, `COMPLETED`, `HIATUS`, `CANCELLED`
- **ReadingStatus**: `READING`, `COMPLETED`, `PLAN_TO_READ`, `DROPPED`, `ON_HOLD`
- **NotificationType**: `new_chapter`, `manga_completed`, `source_changed`

## Development

### Generate Migrations

```bash
# Local development (no AWS connection required)
npm run db:generate:local

# Production (requires AWS credentials)
npm run db:generate
```

### Other Commands

```bash
npm run build          # Compile TypeScript
npm run db:migrate     # Apply migrations (requires AWS)
npm run db:push        # Push schema changes (requires AWS)  
npm run db:studio      # Open Drizzle Studio (requires AWS)
```

## Environment Variables

```bash
# Required for AWS Data API
DATABASE=your-aurora-database-name
SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name
RESOURCE_ARN=arn:aws:rds:region:account:cluster:cluster-name

# Optional for local development
DRIZZLE_LOCAL=true  # Disables AWS Data API for migration generation
```

## Architecture

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   AppSync   │    │   This Package  │    │   Aurora    │
│  (GraphQL)  │────│   (Schema)      │────│ Serverless  │
└─────────────┘    └─────────────────┘    └─────────────┘
```

This package provides the schema layer between AppSync GraphQL API and Aurora Serverless database, ensuring type safety and consistency across the entire stack.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Part of the [Kaze no Manga](https://github.com/kaze-no-manga) project**
