import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const mangaStatusEnum = pgEnum('manga_status', [
  'ONGOING',
  'COMPLETED',
  'HIATUS',
  'CANCELLED',
]);

export const mangas = pgTable(
  'mangas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    altTitles: text('alt_titles').array().notNull().default([]),
    description: text('description'),
    cover: text('cover'),
    status: mangaStatusEnum('status').notNull(),
    genres: text('genres').array().notNull().default([]),
    authors: text('authors').array().notNull().default([]),
    year: integer('year'),
    totalChapters: integer('total_chapters'),
    isNsfw: boolean('is_nsfw').notNull().default(false),
    sourceName: text('source_name').notNull(),
    sourceId: text('source_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (mangas) => [
    index('idx_manga_slug').on(mangas.slug),
    index('idx_manga_title').on(mangas.title),
    index('idx_manga_status').on(mangas.status),
    index('idx_manga_genres').using('gin', mangas.genres),
    index('idx_manga_source').on(mangas.sourceName, mangas.sourceId),
  ],
);

export type Manga = typeof mangas.$inferSelect;
export type NewManga = typeof mangas.$inferInsert;
