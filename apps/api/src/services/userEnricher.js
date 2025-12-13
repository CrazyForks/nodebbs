
/**
 * 允许不同功能向用户对象补充额外数据（如勋章、积分、设置等）的服务。
 */
class UserEnricher {
  constructor() {
    this.enrichers = [];
    this.batchEnrichers = [];
  }

  /**
   * 注册一个新的增强器。
   * @param {string} name - 增强器的唯一名称。
   * @param {function} callback - 异步函数 (user) => Promise<void>。直接修改用户对象。
   */
  register(name, callback) {
    console.log(`[UserEnricher] Registered: ${name}`);
    this.enrichers.push({ name, callback });
  }

  /**
   * 注册一个新的批量增强器。
   * @param {string} name - 增强器的唯一名称。
   * @param {function} callback - 异步函数 (users[]) => Promise<void>。直接修改数组中的用户对象。
   */
  registerBatch(name, callback) {
    console.log(`[UserEnricher] Registered Batch: ${name}`);
    this.batchEnrichers.push({ name, callback });
  }

  /**
   * 在用户对象上运行所有注册的增强器。
   * @param {object} user - 要增强的用户对象。
   * @param {object} context - 可选上下文（例如 request 对象）。
   */
  async enrich(user, context = {}) {
    if (!user) return;

    // 并行运行所有增强器以提高性能
    await Promise.all(
      this.enrichers.map(async ({ name, callback }) => {
        try {
          await callback(user, context);
        } catch (err) {
          console.error(`[UserEnricher] Error in ${name}:`, err);
          // 如果一个增强器失败，不要导致整个请求失败
        }
      })
    );
    
    return user;
  }

  /**
   * 在用户列表上运行所有注册的批量增强器。
   * @param {object[]} users - 要增强的用户对象列表。
   * @param {object} context - 可选上下文。
   */
  async enrichMany(users, context = {}) {
    if (!users || users.length === 0) return users;

    // 并行运行所有批量增强器
    await Promise.all(
      this.batchEnrichers.map(async ({ name, callback }) => {
        try {
          await callback(users, context);
        } catch (err) {
          console.error(`[UserEnricher] Error in batch ${name}:`, err);
        }
      })
    );

    return users;
  }
}

export const userEnricher = new UserEnricher();
