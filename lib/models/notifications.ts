import { boolean, index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { chapters } from './chapters';
import { mangas } from './mangas';
import { users } from './users';

export const notificationTypeEnum = pgEnum('notification_type', [
  'new_chapter',
  'manga_completed',
  'source_changed',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mangaId: uuid('manga_id').references(() => mangas.id, { onDelete: 'cascade' }),
    chapterId: uuid('chapter_id').references(() => chapters.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    read: boolean('read').notNull().default(false),
    sentAt: timestamp('sent_at').notNull().defaultNow(),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (notifications) => [
    index('idx_notifications_user_id').on(notifications.userId),
    index('idx_notifications_read').on(notifications.userId, notifications.read),
    index('idx_notifications_sent_at').on(notifications.sentAt.desc()),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
