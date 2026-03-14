-- 审核日志字段调整: action 字段扩容 + 新增 ip 和 target_label 字段
ALTER TABLE "moderation_logs" ALTER COLUMN "action" SET DATA TYPE varchar(50);
ALTER TABLE "moderation_logs" ADD COLUMN "ip" varchar(45);
ALTER TABLE "moderation_logs" ADD COLUMN "target_label" varchar(255);
