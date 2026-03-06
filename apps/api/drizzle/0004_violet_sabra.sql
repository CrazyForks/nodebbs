CREATE TABLE "captcha_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "captcha_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"provider" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"display_name" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	"config" text,
	"enabled_scenes" text,
	CONSTRAINT "captcha_providers_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255),
	"url" varchar(500) NOT NULL,
	"category" varchar(50) NOT NULL,
	"mimetype" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"provider" varchar(50) DEFAULT 'local',
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_item_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_item_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"user_item_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"target_type" varchar(20),
	"target_id" integer,
	"quantity_used" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"expires_at" timestamp with time zone,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ad_slots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"width" integer,
	"height" integer,
	"max_ads" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ad_slots_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"slot_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"type" varchar(20) NOT NULL,
	"content" text,
	"link_url" varchar(500),
	"target_blank" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"remark" text
);
--> statement-breakpoint
CREATE TABLE "message_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"channel" varchar(20) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"config" text,
	"display_name" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "message_providers_channel_provider" UNIQUE("channel","provider")
);
--> statement-breakpoint
CREATE TABLE "storage_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "storage_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"type" varchar(20) DEFAULT 'local' NOT NULL,
	"slug" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"config" text,
	"display_name" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "storage_providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"module" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"resource_type" varchar(50),
	"is_system" boolean DEFAULT false NOT NULL,
	CONSTRAINT "permissions_slug_unique" UNIQUE("slug"),
	CONSTRAINT "permissions_module_action_unique" UNIQUE("module","action","resource_type")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "role_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"conditions" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "role_permissions_unique" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(20),
	"icon" varchar(50),
	"is_system" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_displayed" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"expires_at" timestamp with time zone,
	"assigned_by" integer,
	"assigned_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_roles_unique" UNIQUE("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "emoji_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emoji_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"size" integer,
	CONSTRAINT "emoji_groups_name_unique" UNIQUE("name"),
	CONSTRAINT "emoji_groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "emojis" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emojis_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"group_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"url" varchar(500) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "emojis_group_code_unique" UNIQUE("group_id","code")
);
--> statement-breakpoint
ALTER TABLE "reward_system_config" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "reward_system_config" CASCADE;--> statement-breakpoint
ALTER TABLE "topics" DROP CONSTRAINT "topics_last_post_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "email_providers_is_default_idx";--> statement-breakpoint
DROP INDEX "invitation_rules_is_active_idx";--> statement-breakpoint
ALTER TABLE "invitation_rules" ALTER COLUMN "role" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "invitation_rules" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_by" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "registration_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_items" ADD COLUMN "consume_type" varchar(20) DEFAULT 'non_consumable' NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_items" ADD COLUMN "currency_code" varchar(20) DEFAULT 'credits' NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_items" ADD COLUMN "max_own" integer;--> statement-breakpoint
ALTER TABLE "user_items" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_items" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_currencies" ADD COLUMN "config" text;--> statement-breakpoint
ALTER TABLE "sys_transactions" ADD COLUMN "account_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_item_logs" ADD CONSTRAINT "user_item_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_item_logs" ADD CONSTRAINT "user_item_logs_item_id_shop_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shop_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_item_logs" ADD CONSTRAINT "user_item_logs_user_item_id_user_items_id_fk" FOREIGN KEY ("user_item_id") REFERENCES "public"."user_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_slot_id_ad_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."ad_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emojis" ADD CONSTRAINT "emojis_group_id_emoji_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."emoji_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "captcha_providers_provider_idx" ON "captcha_providers" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "captcha_providers_is_enabled_idx" ON "captcha_providers" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "files_user_id_idx" ON "files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "files_category_idx" ON "files" USING btree ("category");--> statement-breakpoint
CREATE INDEX "files_created_at_idx" ON "files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_item_logs_user_id_idx" ON "user_item_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_item_logs_item_id_idx" ON "user_item_logs" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "user_item_logs_user_item_id_idx" ON "user_item_logs" USING btree ("user_item_id");--> statement-breakpoint
CREATE INDEX "user_item_logs_action_idx" ON "user_item_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "user_item_logs_status_idx" ON "user_item_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_item_logs_created_at_idx" ON "user_item_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ad_slots_code_idx" ON "ad_slots" USING btree ("code");--> statement-breakpoint
CREATE INDEX "ad_slots_is_active_idx" ON "ad_slots" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ads_slot_id_idx" ON "ads" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "ads_type_idx" ON "ads" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ads_is_active_idx" ON "ads" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ads_priority_idx" ON "ads" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "ads_start_at_idx" ON "ads" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "ads_end_at_idx" ON "ads" USING btree ("end_at");--> statement-breakpoint
CREATE INDEX "message_providers_channel_idx" ON "message_providers" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "message_providers_is_enabled_idx" ON "message_providers" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "message_providers_display_order_idx" ON "message_providers" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "storage_providers_slug_idx" ON "storage_providers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "storage_providers_is_enabled_idx" ON "storage_providers" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "permissions_slug_idx" ON "permissions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE INDEX "permissions_action_idx" ON "permissions" USING btree ("action");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "roles_slug_idx" ON "roles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "roles_is_system_idx" ON "roles" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "roles_is_default_idx" ON "roles" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "roles_priority_idx" ON "roles" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "user_roles_user_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_roles_expires_at_idx" ON "user_roles" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "emoji_groups_slug_idx" ON "emoji_groups" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "emoji_groups_order_idx" ON "emoji_groups" USING btree ("order");--> statement-breakpoint
CREATE INDEX "emoji_groups_is_active_idx" ON "emoji_groups" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "emojis_group_id_idx" ON "emojis" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "emojis_code_idx" ON "emojis" USING btree ("code");--> statement-breakpoint
CREATE INDEX "emojis_order_idx" ON "emojis" USING btree ("order");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_last_post_user_id_users_id_fk" FOREIGN KEY ("last_post_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_transactions" ADD CONSTRAINT "sys_transactions_account_id_sys_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."sys_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "shop_items_consume_type_idx" ON "shop_items" USING btree ("consume_type");--> statement-breakpoint
CREATE UNIQUE INDEX "user_items_user_item_uniq" ON "user_items" USING btree ("user_id","item_id");--> statement-breakpoint
CREATE INDEX "user_items_status_idx" ON "user_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sys_transactions_account_idx" ON "sys_transactions" USING btree ("account_id");--> statement-breakpoint
ALTER TABLE "email_providers" DROP COLUMN "is_default";--> statement-breakpoint
ALTER TABLE "invitation_rules" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "color";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");