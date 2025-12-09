# Migrations - Database

## Creating Migrations

### 1. Update Schema
```typescript
// src/schema/users.ts
export const users = pgTable('users', {
  // Add new column
  avatar: text('avatar'),
})
```

### 2. Generate Migration
```bash
npm run db:generate
```

### 3. Review Migration
Check `migrations/XXXX_*.sql` for correctness.

### 4. Test Migration
```bash
npm run db:migrate  # Apply
npm run db:rollback # Test rollback
npm run db:migrate  # Re-apply
```

## Migration Patterns

### Adding Column
```sql
ALTER TABLE users ADD COLUMN avatar TEXT;
```

### Adding Index
```sql
CREATE INDEX idx_users_email ON users(email);
```

### Adding Foreign Key
```sql
ALTER TABLE chapters 
ADD CONSTRAINT fk_manga 
FOREIGN KEY (manga_id) REFERENCES manga(id);
```

## Best Practices
- One logical change per migration
- Always test rollback
- Never edit applied migrations
- Use transactions for multi-step changes
