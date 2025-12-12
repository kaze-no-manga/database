import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cognitoId: text('cognito_id').notNull().unique(),
    email: text('email').notNull().unique(),
    name: text('name'),
    avatar: text('avatar'),
    preferences: jsonb('preferences').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (users) => [
    index('idx_users_cognito_id').on(users.cognitoId),
    index('idx_users_email').on(users.email),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
