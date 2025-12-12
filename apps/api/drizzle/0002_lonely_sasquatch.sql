CREATE TABLE "credit_system_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "credit_system_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"value_type" varchar(20) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	CONSTRAINT "credit_system_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "credit_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"balance" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"related_user_id" integer,
	"related_topic_id" integer,
	"related_post_id" integer,
	"related_item_id" integer,
	"description" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "post_rewards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "post_rewards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"post_id" integer NOT NULL,
	"from_user_id" integer NOT NULL,
	"to_user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"message" text
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_credits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"last_check_in_date" timestamp with time zone,
	"check_in_streak" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_credits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "shop_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shop_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"type" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"image_url" varchar(500),
	"stock" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" text,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "badges_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_url" varchar(500) NOT NULL,
	"category" varchar(50) DEFAULT 'achievement' NOT NULL,
	"unlock_condition" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" text,
	CONSTRAINT "badges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_badges_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now(),
	"source" varchar(50),
	"is_displayed" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sys_accounts" (
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
CREATE TABLE "sys_currencies" (
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
CREATE TABLE "sys_transactions" (
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
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_related_topic_id_topics_id_fk" FOREIGN KEY ("related_topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_related_post_id_posts_id_fk" FOREIGN KEY ("related_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_rewards" ADD CONSTRAINT "post_rewards_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_rewards" ADD CONSTRAINT "post_rewards_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_rewards" ADD CONSTRAINT "post_rewards_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_item_id_shop_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shop_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_accounts" ADD CONSTRAINT "sys_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_accounts" ADD CONSTRAINT "sys_accounts_currency_code_sys_currencies_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."sys_currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_transactions" ADD CONSTRAINT "sys_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_transactions" ADD CONSTRAINT "sys_transactions_currency_code_sys_currencies_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."sys_currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_transactions" ADD CONSTRAINT "sys_transactions_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_system_config_key_idx" ON "credit_system_config" USING btree ("key");--> statement-breakpoint
CREATE INDEX "credit_system_config_category_idx" ON "credit_system_config" USING btree ("category");--> statement-breakpoint
CREATE INDEX "credit_transactions_user_idx" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_transactions_created_at_idx" ON "credit_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_rewards_post_idx" ON "post_rewards" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_rewards_from_user_idx" ON "post_rewards" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "post_rewards_to_user_idx" ON "post_rewards" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "post_rewards_created_at_idx" ON "post_rewards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_credits_user_idx" ON "user_credits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_credits_balance_idx" ON "user_credits" USING btree ("balance");--> statement-breakpoint
CREATE INDEX "shop_items_type_idx" ON "shop_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "shop_items_is_active_idx" ON "shop_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "shop_items_display_order_idx" ON "shop_items" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "user_items_user_idx" ON "user_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_items_item_idx" ON "user_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "user_items_equipped_idx" ON "user_items" USING btree ("is_equipped");--> statement-breakpoint
CREATE INDEX "badges_slug_idx" ON "badges" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "badges_category_idx" ON "badges" USING btree ("category");--> statement-breakpoint
CREATE INDEX "badges_is_active_idx" ON "badges" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "badges_display_order_idx" ON "badges" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "user_badges_user_idx" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badges_badge_idx" ON "user_badges" USING btree ("badge_id");--> statement-breakpoint
CREATE INDEX "user_badges_earned_at_idx" ON "user_badges" USING btree ("earned_at");--> statement-breakpoint
CREATE INDEX "sys_accounts_user_idx" ON "sys_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sys_accounts_currency_idx" ON "sys_accounts" USING btree ("currency_code");--> statement-breakpoint
CREATE INDEX "sys_currencies_code_idx" ON "sys_currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "sys_transactions_user_idx" ON "sys_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sys_transactions_currency_idx" ON "sys_transactions" USING btree ("currency_code");--> statement-breakpoint
CREATE INDEX "sys_transactions_type_idx" ON "sys_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "sys_transactions_ref_idx" ON "sys_transactions" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "sys_transactions_created_at_idx" ON "sys_transactions" USING btree ("created_at");