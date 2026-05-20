# 话题内嵌抽奖（v1）设计文档

- 日期：2026-05-21
- 范围：在已上线的投票 v1 / v1.1 之上，新增"抽奖"功能。基本镜像投票的指令 + 草稿 + Tab 弹框模式，独有：积分账务（预扣+发放）、自动开奖、参与门槛
- 关联：`docs/superpowers/specs/2026-05-20-topic-polls-design.md`、`docs/superpowers/specs/2026-05-21-poll-drafts-design.md`

---

## 0. 词汇表

- **抽奖（Lottery）**：一个标题 + 名额 + 奖品（积分 + 文本描述）+ 截止时间的活动
- **参与（Enter）**：登录用户在截止前提交"参与"，写一条 `lottery_participants` 行
- **开奖（Draw）**：从参与者随机选 N 个标 isWinner=true，发放积分给中奖者，退还差额给创建者
- **草稿（Draft）**：当前用户拥有、`topicId IS NULL` 的 lottery（已预扣积分，但未公开）
- **指令（directive）**：markdown `::lottery{id="xxx"}` 引用
- **冻结（freeze）**：创建/编辑草稿时把 N×P 积分通过 `fastify.ledger.deduct` 从创建者扣走
- **退还（refund）**：草稿删除、改小 N×P、或开奖后中奖人数 < 名额时，把多余冻结积分还回创建者
- **发放（grant）**：开奖时把 P 积分通过 `fastify.ledger.grant` 发给每个中奖者

## 1. 功能范围

### 1.1 In Scope（v1 必做）

- 话题内嵌抽奖，markdown 中用 `::lottery{id="..."}` 引用
- 创建：标题、描述、名额 N、每人积分 P（可 0）、奖品文本描述、可选账号天数门槛、可选回复门槛、截止时间
- 创建即冻结 N×P 积分（创建者出资）
- 草稿管理（与投票 v1.1 完全一致）：列出 / 复用 / 编辑 / 删除（owner 删自己草稿即退冻结积分）
- 截止时间自动开奖（cleanup task 调度）
- 创建者/admin 可提前手动开奖
- 一人一抽（DB UNIQUE 兜底）
- 中奖名单公开 + 奖品文本仅中奖者可见
- 编辑草稿改 N×P 多退少补
- DELETE owner 删已绑 → 400；admin 可特权 + 自动退冻结积分
- cleanup task 7 天清理过期草稿（同投票）+ 退冻结积分
- 权限点：`topic.lottery.create`、`topic.lottery.delete`、`dashboard.lotteries`

### 1.2 Out of Scope（v1 不做）

- 加权抽奖（每人权重不同）
- 多种奖品共存（一等/二等奖梯队）
- 中奖者复投 / second-chance
- 中奖名单导出
- 邮件/站内信通知中奖者（v2 加事件广播）
- 接 shop 物品奖品（v2）
- 公开"全部参与者名单"（v2，侵蚀匿名感）
- 抽奖统计（vs 投票统计）
- 跨话题抽奖引用

## 2. 决策记录

| # | 决策 | 已选 | 理由 |
|---|---|---|---|
| L1 | 形态 | 话题内嵌，`::lottery{id="..."}` | 与投票同构 |
| L2 | 奖品 | 积分 + 自定义文本 | 文本兼容 Q 群码/邀请码场景；积分接入 ledger 实物化 |
| L3 | 开奖时机 | 截止时间自动 + 创建者可提前 | 公平 + 灵活 |
| L4 | 中奖展示 | 名单公开 + 奖品文本仅中奖者可见 | 社区互动 + 公正可验证 + 敏感数据隔离 |
| L5 | 门槛集 | 未登录拒绝 + 一人一抽 + 账号天数（可选）+ 回复（可选）| 防小号 + 推活跃 |
| L6 | 积分账务 | 创建者出资 — 预扣 + 发放 | 奖品真实可见，最严格 |
| L7 | 草稿管理 | mirror 投票 v1.1 | 复用模式 |
| L8 | 草稿即冻结 | 是 | 与投票草稿一致；7 天 cleanup 退还 |
| L9 | 创建后改 | 仅未绑草稿可改 | 与投票 D8 一致 |
| L10 | 删除 | owner 删已绑 → 400；admin 可特权 | 与投票 v1.1 一致 |
| L11 | 开奖失败处理 | 整事务回滚到 status='pending'，admin 介入重试 | v1 fail-fast；v2 看真实日志再决定 |
| L12 | grant API | `fastify.ledger.grant({userId, amount, currencyCode, type, referenceType, referenceId, description, metadata})` | 项目已有，与 rewards/check-in 一致 |

## 3. 数据模型

3 张新表，无 schema 复用。

```js
// lotteries — 抽奖元数据
export const lotteries = pgTable(
  'lotteries',
  {
    ...$defaults,
    topicId: integer('topic_id').references(() => topics.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    winnersCount: integer('winners_count').notNull(),
    pointsPerWinner: integer('points_per_winner').notNull().default(0),
    prizeDescription: text('prize_description'),
    minAccountDays: integer('min_account_days').notNull().default(0),
    requireReply: boolean('require_reply').notNull().default(false),
    drawAt: timestamp('draw_at', { withTimezone: true }).notNull(),
    drawnAt: timestamp('drawn_at', { withTimezone: true }),
    status: varchar('status', { length: 20 }).notNull().default('pending'),  // 'pending' | 'drawn' | 'cancelled'
    participantsCount: integer('participants_count').notNull().default(0),
    frozenPoints: integer('frozen_points').notNull().default(0),
  },
  (table) => [
    index('lotteries_topic_idx').on(table.topicId),
    index('lotteries_user_idx').on(table.userId),
    index('lotteries_status_drawat_idx').on(table.status, table.drawAt),
  ]
);

// lottery_participants — 参与记录
export const lotteryParticipants = pgTable(
  'lottery_participants',
  {
    ...$defaults,
    lotteryId: integer('lottery_id').notNull().references(() => lotteries.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    isWinner: boolean('is_winner').notNull().default(false),
  },
  (table) => [
    uniqueIndex('lottery_participants_lottery_user_idx').on(table.lotteryId, table.userId),
    index('lottery_participants_winner_idx').on(table.lotteryId, table.isWinner),
  ]
);

// lottery_ledger_refs — 积分账务交叉引用（幂等 + 审计）
export const lotteryLedgerRefs = pgTable(
  'lottery_ledger_refs',
  {
    ...$defaults,
    lotteryId: integer('lottery_id').notNull().references(() => lotteries.id, { onDelete: 'cascade' }),
    referenceType: varchar('reference_type', { length: 20 }).notNull(),  // 'freeze' | 'grant' | 'refund'
    referenceId: varchar('reference_id', { length: 100 }).notNull(),     // ledger tx ref
    userId: integer('user_id').notNull().references(() => users.id),     // freeze/refund=创建者；grant=中奖者
    amount: integer('amount').notNull(),
  },
  (table) => [
    uniqueIndex('lottery_ledger_refs_type_ref_idx').on(table.referenceType, table.referenceId),
    index('lottery_ledger_refs_lottery_idx').on(table.lotteryId),
  ]
);

export const lotteriesRelations = relations(lotteries, ({ one, many }) => ({
  topic: one(topics, { fields: [lotteries.topicId], references: [topics.id] }),
  user: one(users, { fields: [lotteries.userId], references: [users.id] }),
  participants: many(lotteryParticipants),
  ledgerRefs: many(lotteryLedgerRefs),
}));

export const lotteryParticipantsRelations = relations(lotteryParticipants, ({ one }) => ({
  lottery: one(lotteries, { fields: [lotteryParticipants.lotteryId], references: [lotteries.id] }),
  user: one(users, { fields: [lotteryParticipants.userId], references: [users.id] }),
}));

export const lotteryLedgerRefsRelations = relations(lotteryLedgerRefs, ({ one }) => ({
  lottery: one(lotteries, { fields: [lotteryLedgerRefs.lotteryId], references: [lotteries.id] }),
  user: one(users, { fields: [lotteryLedgerRefs.userId], references: [users.id] }),
}));
```

**约束设计要点：**
- `lottery_participants` 唯一索引 (lotteryId, userId) 兜底一人一抽
- `lotteries (status, drawAt)` 复合索引服务 cleanup task 的扫描查询
- `lottery_ledger_refs (referenceType, referenceId)` 唯一索引 = 幂等：避免重复扣/发
- `frozenPoints` 是冗余字段，便于审计

## 4. Ledger 集成约定

调用 `fastify.ledger.deduct/grant` 时统一使用：

```js
{
  userId: <user>,
  amount: <positive int>,
  currencyCode: DEFAULT_CURRENCY_CODE,  // from extensions/ledger/constants.js
  type: 'lottery_freeze' | 'lottery_grant' | 'lottery_refund',
  referenceType: 'lottery',
  referenceId: `lottery_<lotteryId>_<freeze|grant|refund>_<userId>_<timestamp>`,  // 保证 ledger 端去重
  description: '抽奖冻结 / 抽奖中奖发放 / 抽奖退还',
  metadata: { lotteryId, ... },
}
```

调用后把返回的 `tx.id`（或我们自己拼的 referenceId）写一条 `lottery_ledger_refs` 行做交叉记录。

## 5. API 设计

`apps/api/src/routes/lotteries/index.js` — autoload 挂在 `/api/lotteries`

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| `POST` | `/lotteries` | 已登录 + `topic.lottery.create` | 创建抽奖。事务内：deduct N×P + insert lottery + write ledger_ref(freeze)。返回 `{id}`。balance 不足 → 400 |
| `GET` | `/lotteries/:id` | optional | 详情。返回 status / drawnAt / participantsCount / myParticipated / winners / prizeDescription（仅中奖者）。关联 topic 软删 → 404 |
| `POST` | `/lotteries/:id/enter` | 已登录 | 参与。校验：status='pending'、未截止、账号天数、回复门槛。事务：INSERT participant + 加 participantsCount。UNIQUE 违例 → 409 |
| `POST` | `/lotteries/:id/draw` | 已登录 | 提前开奖。校验：是 owner 或 `dashboard.lotteries`、status='pending'。触发 drawLottery() |
| `GET` | `/lotteries/:id/winners` | optional | 中奖名单。返回 `[{userId, username, name, avatar}]`。仅 drawn 状态有数据 |
| `GET` | `/lotteries/drafts` | 已登录 | 当前用户草稿列表，分页 |
| `GET` | `/lotteries/by-topic/:topicId` | 已登录 + 话题作者或 `dashboard.topics` | 本话题已绑列表 |
| `PUT` | `/lotteries/:id` | 已登录 | 编辑草稿（owner 且未绑）。改 N/P 触发多退少补 |
| `DELETE` | `/lotteries/:id` | 已登录 | owner 删草稿 → 退冻结。owner 删已绑 → 400。admin 删任意 → 已绑则也退积分（fail-safe）|

**响应格式**：成功 `reply.send(...)`；错误 `reply.code(...).send({ error: '...' })`。

**典型错误响应：**
- 400 余额不足创建抽奖
- 400 不满足参与门槛（详细原因）
- 400 投票已结束 / 抽奖已开奖
- 409 已参与（DB UNIQUE 违例兜底）
- 403 非 owner 编辑/删除
- 503 ledger 不可用

## 6. Service 层（`apps/api/src/services/lotteryService.js`）

```js
createLottery(data, userId)
  // 事务：
  //   const totalFreeze = winnersCount * pointsPerWinner;
  //   if (totalFreeze > 0) {
  //     const tx = await fastify.ledger.deduct({...});
  //     await tx.insert(lotteryLedgerRefs).values({ referenceType:'freeze', referenceId, userId, amount: totalFreeze });
  //   }
  //   const [row] = await tx.insert(lotteries).values({ ...data, frozenPoints: totalFreeze }).returning({ id });
  //   return { id: row.id };
  // 失败：balance 不足 → 400；ledger 抛错 → 503

getLottery(lotteryId, userId)
  // 类似 getPoll：含 winners / myParticipated；
  // 关联 topic 软删 → 返回 null；
  // prizeDescription 字段仅对中奖者（myParticipated && winner）或 creator 返回

enterLottery(lotteryId, userId)
  // 校验：status='pending'、drawAt 未到、账号天数（计算 user.createdAt vs now）
  //       requireReply 时校验 user 是否在该 topic 有 post 行（不计首贴）
  // 事务：INSERT participant + UPDATE lotteries SET participantsCount = participantsCount + 1
  // PG 23505 → 409 '您已参与'

drawLottery(lotteryId, opts = {})
  // opts: { triggerByUserId?, triggerSource? }  // 'user-early' / 'admin-early' / 'system-auto'
  // 校验：status='pending'（事务内 SELECT FOR UPDATE，避免并发开奖）
  // 事务：
  //   1. 锁 + 校验 status
  //   2. 取 participants，Fisher-Yates 在 SQL 外做随机
  //      const winners = shuffle(participants).slice(0, min(winnersCount, len));
  //   3. 标 isWinner=true（UPDATE WHERE id IN (...)）
  //   4. 对每个 winner: fastify.ledger.grant + write ledger_ref(grant)
  //   5. 计算退还 = (winnersCount - actualWinners) * pointsPerWinner
  //      if > 0: fastify.ledger.grant({userId: creator}) + write ledger_ref(refund)
  //   6. UPDATE lottery: status='drawn', drawnAt=now
  // 任意 grant 失败 → 整事务回滚

updateDraftLottery(lotteryId, data, userId)
  // 仅草稿（topicId IS NULL）+ owner
  // 事务内：SELECT FOR UPDATE + 计算新冻结 newFreeze = N'×P' - oldFrozen
  //   newFreeze > 0: deduct(newFreeze)，余额不足回滚
  //   newFreeze < 0: grant(|newFreeze|)
  //   UPDATE lottery + write ledger_ref

deleteLottery(lotteryId, { isAdmin = false } = {})
  // 404 / 400 / 退款逻辑：
  //   - 草稿 owner 删：退 frozenPoints 给 creator + cascade 删
  //   - 已绑 + !isAdmin：400 拒绝
  //   - 已绑 + isAdmin：根据 status：
  //       - pending：退 frozenPoints 给 creator（"取消活动"）
  //       - drawn：不退（已结算完毕）
  //   - cascade 自动清 participants 和 ledger_refs（注意 ledger 端账已落，ref 表只是审计）

cleanupExpiredDraftLotteries()
  // 7 天未绑定的草稿 + 退冻结积分
  // 与投票模式一致；退款逻辑同上 deleteLottery 的草稿分支

drawDueLotteries()
  // 由 cleanup task 调度（每 5 分钟）：
  // SELECT id FROM lotteries WHERE status='pending' AND drawAt <= NOW();
  // 对每个调 drawLottery(id, { triggerSource: 'system-auto' })
  // grant 失败：日志记录 + 留 pending 状态等下次重试或 admin 介入

bindLotteriesToTopic(topicId, content, userId)
  // 同 bindPollsToTopic：解析 ::lottery{id=X}、绑定 owner 自己的、剥离盗用引用
```

**事务设计要点：**
- `createLottery`/`updateDraftLottery`/`drawLottery`/`deleteLottery` 都在事务内，ledger 操作和 lottery 行更新原子
- `drawLottery` 用 `SELECT FOR UPDATE` 防多触发器并发
- `lottery_ledger_refs` 唯一索引兜底重复扣发

## 7. 前端

### 7.1 编辑器工具栏 `LotteryTool`

文件：`apps/web/src/components/common/MarkdownEditor/tools/lottery/index.jsx`

```jsx
'use client';
import { useState } from 'react';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LotteryDialog from '@/components/topic/LotteryDialog';
import { usePermission } from '@/hooks/usePermission';

export function LotteryTool({ editor, disabled, config }) {
  const { hasPermission } = usePermission();
  const [open, setOpen] = useState(false);

  if (!hasPermission('topic.lottery.create')) return null;

  const handleCreated = (lotteryId) => {
    editor.insertBlock(`::lottery{id="${lotteryId}"}\n`);
  };

  return (
    <>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => setOpen(true)} disabled={disabled} title="插入抽奖">
        <Gift className="h-4 w-4" />
      </Button>
      <LotteryDialog open={open} onOpenChange={setOpen}
                     onCreated={handleCreated} topicId={config?.topicId} />
    </>
  );
}
```

### 7.2 `LotteryDialog` 目录结构（mirror PollDialog v1.1）

- `apps/web/src/components/topic/LotteryDialog/index.jsx` — Tab 容器（同 PollDialog/index.jsx 模式）
- `apps/web/src/components/topic/LotteryDialog/LotteryFormTab.jsx` — 创建/编辑表单
- `apps/web/src/components/topic/LotteryDialog/DraftsTab.jsx` — 草稿列表
- `apps/web/src/components/topic/LotteryDialog/BoundTab.jsx` — 本话题已绑列表

#### LotteryFormTab 字段
- title（Input，必填，maxLength 200）
- description（Textarea，可选，markdown，maxLength 2000）
- winnersCount（number, 1-1000）
- pointsPerWinner（number, ≥0；0 表示不发积分仅奖品文本）
- prizeDescription（Textarea，可选 maxLength 1000）
- minAccountDays（number, ≥0，默认 0）
- requireReply（Checkbox，默认 false）
- drawAt（datetime-local input，必填）

**顶部实时显示：**"将冻结 N × P = X 积分（当前余额：Y 积分）" — fetch 当前用户 balance 一次性显示
**提交按钮**：余额不足 → disabled + 提示
**编辑模式**：与 PollFormTab 同模式（标题变"编辑草稿 #N"，按钮变"保存修改"，提交走 PUT）

### 7.3 `LotteryWidget`（markdown 渲染端）

文件：`apps/web/src/components/common/MarkdownRender/components/LotteryWidget.jsx`

UI 状态机：

| 状态 | 渲染 |
|---|---|
| Loading | 骨架 |
| 404 (deleted or topic soft-deleted) | "该抽奖已被删除" 灰条 |
| status='pending' + 未登录 | 介绍 + 名额信息 + "登录后参与"灰按钮 |
| status='pending' + 已登录 + 不满足门槛 | 按钮 disabled + "需注册满 N 天 / 需先回复话题" |
| status='pending' + 已登录 + 已参与 | "✓ 已参与，等待开奖" + 倒计时 |
| status='pending' + 已登录 + 可参与 | "参与抽奖" 按钮 + 显示门槛信息（如有）|
| status='pending' + 是 owner/admin | 上述按钮旁额外"提前开奖"按钮 |
| status='drawn' + 我中奖 | 喜庆样式 + 完整中奖名单 + 我的奖品文本 + 积分到账提示 |
| status='drawn' + 我未中 | 中奖名单 + "感谢参与" |
| status='cancelled' | 灰色 "已取消" |

### 7.4 markdown render 接线

文件：`apps/web/src/components/common/MarkdownRender/plugins/remark-lottery.js`（mirror remark-poll.js）

```js
import { visit } from 'unist-util-visit';
export default function remarkLottery() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'leafDirective' && node.name === 'lottery') {
        const attributes = node.attributes || {};
        if (!attributes.id) return;
        node.data = node.data || {};
        node.data.hName = 'lottery';
        node.data.hProperties = { 'data-lottery-id': attributes.id };
      }
    });
  };
}
```

文件：`apps/web/src/components/common/MarkdownRender/plugins/remark-restore-directives.js`：
- `ALLOWED_DIRECTIVES` 数组追加 `'lottery'`

文件：`apps/web/src/components/common/MarkdownRender/index.jsx`：
- import `remarkLottery` + `LotteryWidget`
- remark plugins 数组追加 `remarkLottery`
- components 映射追加：
  ```js
  lottery({ node, ...props }) {
    return <LotteryWidget lotteryId={props['data-lottery-id']} />;
  }
  ```

### 7.5 编辑器 ToolRegistry 接线

文件：`apps/web/src/components/common/MarkdownEditor/tools/index.js`：
- import `LotteryTool`
- ToolRegistry 追加 `lottery: LotteryTool`

文件：`apps/web/src/components/topic/TopicForm.jsx` 的 `TOPIC_TOOLBAR`：
- 在 `'poll'` 之后追加 `'lottery'`

## 8. RBAC 权限

修改 `apps/api/src/config/rbac.js`：

| Slug | 默认分配 | 说明 |
|---|---|---|
| `topic.lottery.create` | `user` 角色 | 允许创建抽奖 |
| `topic.lottery.delete` | `user` 角色（owner 删自己） | 允许删除自己的抽奖（受 service 收紧规则约束） |
| `dashboard.lotteries` | `admin` 角色（通过 `['*']`） | 后台管理：可强制开奖/删除任意 |

`SYSTEM_PERMISSIONS` 加 3 个权限点，`ROLE_PERMISSION_MAP.user` 加前两个 slug。

## 9. cleanup task

修改 `apps/api/src/plugins/cleanup.js` 注册 2 个新任务：

```js
// 6. 到期自动开奖
registerCleanupTask('draw-due-lotteries', async () => {
  return await drawDueLotteries();
});

// 7. 清理过期草稿抽奖（同投票 v1.1 模式）
registerCleanupTask('expired-draft-lotteries', async () => {
  return await cleanupExpiredDraftLotteries();
});
```

setInterval 间隔保持 2 小时；如果"到期自动开奖"延迟不能接受，后续可以加独立的 5 分钟扫描循环。**v1 接受最长 2 小时延迟**（与投票草稿清理同款延迟容忍）。

## 10. 边界与策略

| 场景 | 处理 |
|---|---|
| 创建时 ledger 不可用 | 抛 503，整事务回滚 |
| 创建时余额不足 | service 层 try/catch ledger 错误 → 400 "积分余额不足" |
| 中奖者账号已删除/封禁 → grant 抛错 | 整事务回滚（status 留 pending）；admin 介入手动 redraw 或单独 grant |
| 提前开奖与定时开奖并发 | SELECT FOR UPDATE + status='pending' WHERE 条件，第二个 UPDATE 影响 0 行 → 跳过 |
| 参与人数 < 名额 | actualWinners = 全部参与者；退还差额给创建者 |
| 参与人数 = 0 | 直接 status='drawn', drawnAt=now, 全额退还 frozenPoints |
| 一人一抽并发 | DB UNIQUE → 409 |
| 草稿被 cleanup 删 + 退积分 | 事务内 grant + delete + write refund ref |
| 草稿改 N×P | service 算 delta，多扣或退还；余额不足回滚 |
| 已绑话题硬删 | CASCADE 删 lotteries + participants + ledger_refs；**幽灵冻结**问题：ledger 表的扣账记录仍在但 lottery 行没了 → 后台 admin 视图可定期对账，v1 接受这点漂移 |
| ledger_ref 重复写入（重复 cleanup 调用） | UNIQUE(referenceType, referenceId) 兜底 → 第二次写入失败但事务已 commit；可通过 ledger 端 referenceId 唯一性互相校验 |
| draw 时 cleanup task 卡死 | 下次扫描重试。SELECT FOR UPDATE 防多 worker 并发处理同一行 |

## 11. 文件清单

### 新增
- `apps/api/src/services/lotteryService.js`（最大文件，~600 行）
- `apps/api/src/utils/extractLotteryIds.js`
- `apps/api/src/routes/lotteries/index.js`（9 routes）
- `apps/web/src/components/common/MarkdownRender/plugins/remark-lottery.js`
- `apps/web/src/components/common/MarkdownRender/components/LotteryWidget.jsx`
- `apps/web/src/components/common/MarkdownEditor/tools/lottery/index.jsx`
- `apps/web/src/components/topic/LotteryDialog/index.jsx`
- `apps/web/src/components/topic/LotteryDialog/LotteryFormTab.jsx`
- `apps/web/src/components/topic/LotteryDialog/DraftsTab.jsx`
- `apps/web/src/components/topic/LotteryDialog/BoundTab.jsx`

### 修改
- `apps/api/src/db/schema.js` — 3 新表 + relations
- `apps/api/src/config/rbac.js` — 3 新权限
- `apps/api/src/plugins/cleanup.js` — 2 新任务
- `apps/api/src/routes/topics/index.js` — POST/PATCH 调 bindLotteriesToTopic
- `apps/web/src/components/common/MarkdownRender/index.jsx` — 注册 LotteryWidget 节点
- `apps/web/src/components/common/MarkdownRender/plugins/remark-restore-directives.js` — `ALLOWED_DIRECTIVES` 加 `'lottery'`
- `apps/web/src/components/common/MarkdownEditor/tools/index.js` — ToolRegistry 加 LotteryTool
- `apps/web/src/components/topic/TopicForm.jsx` — TOPIC_TOOLBAR 加 `'lottery'`

## 12. 手动测试要点

- [ ] 创建抽奖：余额足够 → balance 扣 N×P，DB 出现 lottery + ledger_ref(freeze)
- [ ] 创建抽奖：余额不足 → 400，DB 无变化
- [ ] 用户 A 草稿 5 个抽奖 → DraftsTab 显示，用户 B 看不到
- [ ] 编辑草稿改 N 5→10 → balance 多扣 5×P；改 N 10→3 → balance 退 7×P
- [ ] 删草稿 → balance 退回 frozenPoints
- [ ] 7 天前草稿 cleanup → 自动删 + 退积分
- [ ] 创建抽奖发帖后："本话题已有"Tab 显示，DraftsTab 不显示
- [ ] 参与 enter：未登录 → 401，已登录 → 200，再 enter → 409
- [ ] 门槛：账号不满 N 天 → 400；requireReply 但未回复 → 400
- [ ] 到期前 owner 提前开奖 → 成功开奖，winners 标 isWinner，发积分
- [ ] 到期 cleanup task 自动开奖
- [ ] 参与 < 名额 → 退还差额给创建者
- [ ] 参与 = 0 → 全额退还
- [ ] 中奖者拿到 prizeDescription，未中奖者拿不到
- [ ] DELETE owner 删已绑 pending → 400
- [ ] DELETE admin 删已绑 pending → 退还 frozenPoints + 删
- [ ] DELETE admin 删已绑 drawn → 不退（已结算）
- [ ] grant 失败模拟（中奖者账号 isDeleted=true 暂时）→ draw 事务回滚，status 保持 pending
- [ ] ledger 不可用模拟 → 503

## 13. 不解决的开放问题

- 中奖者通知方式（v2 用 EventBus 广播 LOTTERY_WON 事件）
- 多种奖品（一/二/三等奖梯队）
- 加权随机
- 抽奖统计页（dashboard）

---

*遵循 AGENTS.md 约定：纯 JavaScript、ES Modules、Drizzle ORM、shadcn/ui、Tailwind v4、`@/` 别名、API import 必带 `.js` 后缀*
