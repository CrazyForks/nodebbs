import db from '../db/index.js';
import { polls, pollOptions, pollVotes, topics } from '../db/schema.js';
import { and, asc, eq, sql } from 'drizzle-orm';

/**
 * 创建投票（不绑定 topic）
 *
 * @param {object} data - 投票数据
 * @param {string} data.question
 * @param {Array<string>} data.options - 至少 2、至多 20 项
 * @param {'single'|'multiple'} data.selectionType
 * @param {number|null} data.maxChoices - 仅 multiple 时有意义；null = 不限（最多等于选项数）
 * @param {boolean} data.isAnonymous
 * @param {Date|null} data.closedAt
 * @param {number} userId - 创建者
 * @returns {Promise<{id:number}>}
 */
export async function createPoll(data, userId) {
  const { question, options, selectionType, maxChoices, isAnonymous, closedAt } = data;

  if (!question || !question.trim()) {
    throw Object.assign(new Error('问题不能为空'), { statusCode: 400 });
  }
  if (!Array.isArray(options) || options.length < 2 || options.length > 20) {
    throw Object.assign(new Error('选项数量应在 2-20 之间'), { statusCode: 400 });
  }
  if (!['single', 'multiple'].includes(selectionType)) {
    throw Object.assign(new Error('selectionType 必须为 single 或 multiple'), { statusCode: 400 });
  }
  if (selectionType === 'multiple' && maxChoices != null) {
    if (maxChoices < 1 || maxChoices > options.length) {
      throw Object.assign(new Error('maxChoices 必须在 1 到选项数之间'), { statusCode: 400 });
    }
  }

  return await db.transaction(async (tx) => {
    const [poll] = await tx
      .insert(polls)
      .values({
        topicId: null,
        createdBy: userId,
        question: question.trim(),
        selectionType,
        maxChoices: selectionType === 'multiple' ? maxChoices ?? null : null,
        isAnonymous: !!isAnonymous,
        closedAt: closedAt ?? null,
      })
      .returning({ id: polls.id });

    const rows = options.map((text, idx) => ({
      pollId: poll.id,
      text: String(text).slice(0, 500),
      displayOrder: idx,
      voteCount: 0,
    }));
    await tx.insert(pollOptions).values(rows);

    return { id: poll.id };
  });
}

/**
 * 获取投票详情（含选项 + 当前用户已投选项 + 是否过期）
 *
 * @param {number} pollId
 * @param {number|null} userId - 未登录传 null
 * @returns {Promise<object|null>} 不存在或关联话题已软删返回 null
 */
export async function getPoll(pollId, userId) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);

  if (!poll) return null;

  // 校验关联 topic 未软删：spec §6.4
  if (poll.topicId) {
    const [topic] = await db
      .select({ isDeleted: topics.isDeleted })
      .from(topics)
      .where(eq(topics.id, poll.topicId))
      .limit(1);
    if (!topic || topic.isDeleted) return null;
  }

  const options = await db
    .select({
      id: pollOptions.id,
      text: pollOptions.text,
      displayOrder: pollOptions.displayOrder,
      voteCount: pollOptions.voteCount,
    })
    .from(pollOptions)
    .where(eq(pollOptions.pollId, pollId))
    .orderBy(asc(pollOptions.displayOrder));

  let myVotedOptionIds = [];
  if (userId) {
    const myVotes = await db
      .select({ optionId: pollVotes.optionId })
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
    myVotedOptionIds = myVotes.map((v) => v.optionId);
  }

  const isClosed = !!poll.closedAt && new Date(poll.closedAt).getTime() <= Date.now();

  return {
    id: poll.id,
    topicId: poll.topicId,
    question: poll.question,
    selectionType: poll.selectionType,
    maxChoices: poll.maxChoices,
    isAnonymous: poll.isAnonymous,
    closedAt: poll.closedAt,
    isClosed,
    totalVoters: poll.totalVoters,
    options,
    myVotedOptionIds,
    createdAt: poll.createdAt,
    createdBy: poll.createdBy,
  };
}
