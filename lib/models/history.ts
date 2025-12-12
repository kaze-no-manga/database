import { boolean, index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { chapters } from './chapters';
import { mangas } from './mangas';
import { users } from './users';

export const readingHistory = pgTable(
  'reading_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mangaId: uuid('manga_id')
      .notNull()
      .references(() => mangas.id, { onDelete: 'cascade' }),
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    completed: boolean('completed').notNull().default(false),
    readAt: timestamp('read_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (readingHistory) => [
    index('idx_reading_history_user_id').on(readingHistory.userId),
    index('idx_reading_history_manga_id').on(readingHistory.mangaId),
    index('idx_reading_history_read_at').on(readingHistory.readAt.desc()),
    index('idx_reading_history_user_read_at').on(
      readingHistory.userId,
      readingHistory.readAt.desc(),
    ),
  ],
);

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type NewReadingHistory = typeof readingHistory.$inferInsert;
