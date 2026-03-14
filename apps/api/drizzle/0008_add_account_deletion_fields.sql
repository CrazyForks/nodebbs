ALTER TABLE "users" ADD COLUMN "deletion_requested_at" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN "deletion_reason" text;
