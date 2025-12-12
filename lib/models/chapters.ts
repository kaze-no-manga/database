import { decimal, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { mangas } from './mangas';

export const chapters = pgTable(
  'chapters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mangaId: uuid('manga_id')
      .notNull()
      .references(() => mangas.id, { onDelete: 'cascade' }),
    number: decimal('number').notNull(),
    title: text('title'),
    images: jsonb('images').notNull().default([]),
    releasedAt: timestamp('released_ate'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (chapters) => [
    index('idx_chapters_manga_id').on(chapters.mangaId),
    index('idx_chapters_number').on(chapters.mangaId, chapters.number),
    index('idx_chapters_release_date').on(chapters.releasedAt),
  ],
);

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
