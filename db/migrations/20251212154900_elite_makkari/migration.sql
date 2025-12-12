CREATE TYPE "reading_status" AS ENUM('READING', 'COMPLETED', 'PLAN_TO_READ', 'DROPPED', 'ON_HOLD');--> statement-breakpoint
CREATE TYPE "manga_status" AS ENUM('ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('new_chapter', 'manga_completed', 'source_changed');--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"manga_id" uuid NOT NULL,
	"number" numeric NOT NULL,
	"title" text,
	"images" jsonb DEFAULT '[]' NOT NULL,
	"released_ate" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"manga_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_library" (
	"user_id" uuid,
	"manga_id" uuid,
	"status" "reading_status",
	"rating" integer,
	"notes" text,
	"current_chapter_id" uuid,
	"last_read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_library_pkey" PRIMARY KEY("user_id","manga_id")
);
--> statement-breakpoint
CREATE TABLE "mangas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"alt_titles" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text,
	"cover" text,
	"status" "manga_status" NOT NULL,
	"genres" text[] DEFAULT '{}'::text[] NOT NULL,
	"authors" text[] DEFAULT '{}'::text[] NOT NULL,
	"year" integer,
	"total_chapters" integer,
	"is_nsfw" boolean DEFAULT false NOT NULL,
	"source_name" text NOT NULL,
	"source_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"manga_id" uuid,
	"chapter_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cognito_id" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"name" text,
	"avatar" text,
	"preferences" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_chapters_manga_id" ON "chapters" ("manga_id");--> statement-breakpoint
CREATE INDEX "idx_chapters_number" ON "chapters" ("manga_id","number");--> statement-breakpoint
CREATE INDEX "idx_chapters_release_date" ON "chapters" ("released_ate");--> statement-breakpoint
CREATE INDEX "idx_reading_history_user_id" ON "reading_history" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reading_history_manga_id" ON "reading_history" ("manga_id");--> statement-breakpoint
CREATE INDEX "idx_reading_history_read_at" ON "reading_history" ("read_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_history_user_read_at" ON "reading_history" ("user_id","read_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_library_user_id" ON "user_library" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_library_manga_id" ON "user_library" ("manga_id");--> statement-breakpoint
CREATE INDEX "idx_user_library_status" ON "user_library" ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_manga_slug" ON "mangas" ("slug");--> statement-breakpoint
CREATE INDEX "idx_manga_title" ON "mangas" ("title");--> statement-breakpoint
CREATE INDEX "idx_manga_status" ON "mangas" ("status");--> statement-breakpoint
CREATE INDEX "idx_manga_genres" ON "mangas" USING gin ("genres");--> statement-breakpoint
CREATE INDEX "idx_manga_source" ON "mangas" ("source_name","source_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" ("user_id","read");--> statement-breakpoint
CREATE INDEX "idx_notifications_sent_at" ON "notifications" ("sent_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_users_cognito_id" ON "users" ("cognito_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" ("email");--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_manga_id_mangas_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "mangas"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_manga_id_mangas_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "mangas"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_chapter_id_chapters_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_manga_id_mangas_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "mangas"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_current_chapter_id_chapters_id_fkey" FOREIGN KEY ("current_chapter_id") REFERENCES "chapters"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_manga_id_mangas_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "mangas"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_chapter_id_chapters_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE;