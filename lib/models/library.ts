import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { chapters } from './chapters';
import { mangas } from './mangas';
import { users } from './users';

export const readingStatusEnum = pgEnum('reading_status', [
  'READING',
  'COMPLETED',
  'PLAN_TO_READ',
  'DROPPED',
  'ON_HOLD',
]);

export const userLibrary = pgTable(
  'user_library',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mangaId: uuid('manga_id')
      .notNull()
      .references(() => mangas.id, { onDelete: 'cascade' }),
    status: readingStatusEnum('status'),
    rating: integer('rating'),
    notes: text('notes'),
    currentChapterId: uuid('current_chapter_id').references(() => chapters.id),
    lastReadAt: timestamp('last_read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (userLibrary) => [
    primaryKey({ columns: [userLibrary.userId, userLibrary.mangaId] }),
    index('idx_user_library_user_id').on(userLibrary.userId),
    index('idx_user_library_manga_id').on(userLibrary.mangaId),
    index('idx_user_library_status').on(userLibrary.userId, userLibrary.status),
  ],
);

export type UserLibrary = typeof userLibrary.$inferSelect;
export type NewUserLibrary = typeof userLibrary.$inferInsert;
