CREATE TABLE "moderation_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "moderation_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"action" varchar(20) NOT NULL,
	"target_type" varchar(20) NOT NULL,
	"target_id" integer NOT NULL,
	"moderator_id" integer NOT NULL,
	"reason" text,
	"previous_status" varchar(20),
	"new_status" varchar(20),
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "qr_login_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "qr_login_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"request_id" varchar(64) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"user_id" integer,
	"token" text,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"confirmed_at" timestamp with time zone,
	"confirmed_ip" varchar(45),
	CONSTRAINT "qr_login_requests_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username_changed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username_change_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_login_requests" ADD CONSTRAINT "qr_login_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moderation_logs_action_idx" ON "moderation_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "moderation_logs_target_type_idx" ON "moderation_logs" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "moderation_logs_target_id_idx" ON "moderation_logs" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "moderation_logs_moderator_idx" ON "moderation_logs" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "moderation_logs_created_at_idx" ON "moderation_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "qr_login_requests_request_id_idx" ON "qr_login_requests" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "qr_login_requests_status_idx" ON "qr_login_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "qr_login_requests_expires_at_idx" ON "qr_login_requests" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "qr_login_requests_user_id_idx" ON "qr_login_requests" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;