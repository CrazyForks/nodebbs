DO $$ BEGIN
 ALTER TABLE "user_items" ADD COLUMN "metadata" text;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
