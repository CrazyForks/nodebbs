import db from '../db/index.js';
import { oplogs } from '../db/schema.js';
import { VALID_ACTIONS, VALID_TARGET_TYPES } from '../constants/oplog.js';

/**
 * 操作日志服务
 *
 * 统一所有系统操作日志写入入口，标准化数据结构。
 * 通过 fastify.oplog.add() 使用。
 */

/**
 * @typedef {Object} OplogOptions
 * @property {string} action - 必需：操作类型
 * @property {string} targetType - 必需：目标类型 (topic/post/user)
 * @property {number} targetId - 必需：目标 ID
 * @property {number} moderatorId - 必需：操作者 ID
 * @property {string} [reason] - 操作原因
 * @property {string} [previousStatus] - 操作前状态
 * @property {string} [newStatus] - 操作后状态
 * @property {object|string} [metadata] - 扩展数据（自动 JSON.stringify）
 * @property {string} [ip] - 操作者 IP
 * @property {string} [targetLabel] - 目标快照（话题标题/用户名等）
 */

/**
 * 标准化操作日志数据
 * @param {OplogOptions} options
 * @returns {object} 数据库插入值
 */
function normalize(options) {
  const {
    action,
    targetType,
    targetId,
    moderatorId,
    reason = null,
    previousStatus = null,
    newStatus = null,
    metadata = null,
    ip = null,
    targetLabel = null,
  } = options;

  if (!action || !targetType || !targetId || !moderatorId) {
    throw new Error('操作日志缺少必填字段：action, targetType, targetId, moderatorId');
  }

  if (!VALID_ACTIONS.has(action)) {
    throw new Error(`无效的操作类型: ${action}`);
  }

  if (!VALID_TARGET_TYPES.has(targetType)) {
    throw new Error(`无效的目标类型: ${targetType}`);
  }

  let metadataStr = null;
  if (metadata !== null && metadata !== undefined) {
    metadataStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
  }

  return {
    action,
    targetType,
    targetId,
    moderatorId,
    reason,
    previousStatus,
    newStatus,
    metadata: metadataStr,
    ip,
    targetLabel,
  };
}

/**
 * 写入单条操作日志
 * @param {OplogOptions} options
 * @returns {Promise<object>} 创建的日志记录
 */
async function add(options) {
  const values = normalize(options);

  const [record] = await db
    .insert(oplogs)
    .values(values)
    .returning();

  return record;
}

/**
 * 批量写入操作日志
 * @param {OplogOptions[]} list
 * @returns {Promise<object[]>} 创建的日志记录列表
 */
async function addBatch(list) {
  if (!list || list.length === 0) {
    return [];
  }

  const values = list.map(normalize);

  const results = await db
    .insert(oplogs)
    .values(values)
    .returning();

  return results;
}

export const oplogService = {
  add,
  addBatch,
};

export default oplogService;
