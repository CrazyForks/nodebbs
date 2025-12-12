CREATE TABLE IF NOT EXISTS "sys_currencies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sys_currencies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"code" varchar(20) NOT NULL,
	"name" varchar(50) NOT NULL,
	"symbol" varchar(10),
	"precision" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" text,
	CONSTRAINT "sys_currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sys_accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"currency_code" varchar(20) NOT NULL,
	"balance" bigint DEFAULT 0 NOT NULL,
	"total_earned" bigint DEFAULT 0 NOT NULL,
	"total_spent" bigint DEFAULT 0 NOT NULL,
	"is_frozen" boolean DEFAULT false NOT NULL,
	CONSTRAINT "sys_accounts_user_id_currency_code_unique" UNIQUE("user_id","currency_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sys_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"currency_code" varchar(20) NOT NULL,
	"amount" bigint NOT NULL,
	"balance_after" bigint NOT NULL,
	"type" varchar(50) NOT NULL,
	"reference_type" varchar(50),
	"reference_id" varchar(100),
	"related_user_id" integer,
	"description" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "reward_system_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reward_system_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"value_type" varchar(20) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	CONSTRAINT "reward_system_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_check_ins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_check_ins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"last_check_in_date" timestamp with time zone,
	"check_in_streak" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_check_ins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
--> statement-breakpoint
-- MANUAL DATA MIGRATION START

-- 1. Ensure Currency Exists
INSERT INTO "sys_currencies" ("code", "name", "symbol", "precision", "is_active") 
VALUES ('credits', '积分', 'pts', 0, true) 
ON CONFLICT ("code") DO NOTHING;

-- 2. Migrate User Balances (credits -> sys_accounts)
INSERT INTO "sys_accounts" ("user_id", "currency_code", "balance", "total_earned", "total_spent", "created_at", "updated_at")
SELECT "user_id", 'credits', "balance", "total_earned", "total_spent", "created_at", "updated_at"
FROM "user_credits"
ON CONFLICT ("user_id", "currency_code") DO NOTHING;

-- 3. Migrate Transactions (credit_transactions -> sys_transactions)
INSERT INTO "sys_transactions" ("user_id", "currency_code", "amount", "balance_after", "type", "description", "created_at", "updated_at", "reference_type", "reference_id")
SELECT "user_id", 'credits', "amount", "balance", "type", "description", "created_at", "updated_at", 'legacy_credit_transaction', CAST("id" AS VARCHAR)
FROM "credit_transactions";

-- 4. Migrate Config (credit_system_config -> reward_system_config)
INSERT INTO "reward_system_config" ("key", "value", "value_type", "description", "category", "created_at", "updated_at")
SELECT "key", "value", "value_type", "description", "category", "created_at", "updated_at"
FROM "credit_system_config"
ON CONFLICT ("key") DO NOTHING;

-- 5. Migrate Check-ins (user_credits -> user_check_ins)
INSERT INTO "user_check_ins" ("user_id", "check_in_streak", "last_check_in_date", "created_at", "updated_at")
SELECT "user_id", "check_in_streak", "last_check_in_date", "created_at", "updated_at"
FROM "user_credits"
ON CONFLICT ("user_id") DO NOTHING;

-- MANUAL DATA MIGRATION END
--> statement-breakpoint
DROP TABLE "credit_system_config" CASCADE;--> statement-breakpoint
DROP TABLE "credit_transactions" CASCADE;--> statement-breakpoint
DROP TABLE "user_credits" CASCADE;--> statement-breakpoint
ALTER TABLE "post_rewards" ADD COLUMN "currency" varchar(20) DEFAULT 'credits';--> statement-breakpoint
ALTER TABLE "user_check_ins" ADD CONSTRAINT "user_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reward_system_config_key_idx" ON "reward_system_config" USING btree ("key");--> statement-breakpoint
CREATE INDEX "reward_system_config_category_idx" ON "reward_system_config" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_check_ins_user_idx" ON "user_check_ins" USING btree ("user_id");