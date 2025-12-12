import apiClient from '../../../lib/api';

// ============= 奖励系统 API =============
export const rewardsApi = {
  // 获取积分系统状态
  async getStatus() {
    return apiClient.get('/rewards/status');
  },

  // 获取当前用户积分余额
  async getBalance() {
    // Delegate to Ledger (user context)
    return apiClient.get('/ledger/balance', { currency: 'credits' });
  },

  // 每日签到 (New Endpoint)
  async checkIn() {
    return apiClient.post('/check-in');
  },

  // 获取签到状态
  async getCheckInStatus() {
      return apiClient.get('/check-in');
  },

  // 获取交易记录
  async getTransactions(params = {}) {
    return apiClient.get('/ledger/transactions', { ...params, currency: 'credits' });
  },

  // 打赏帖子 (Feature specific, remains)
  async reward(postId, amount, message) {
    return apiClient.post('/rewards/reward', { postId, amount, message });
  },

  // 获取帖子的打赏列表
  async getPostRewards(postId, params = {}) {
    return apiClient.get(`/rewards/posts/${postId}`, params);
  },

  // 批量获取多个帖子的打赏统计
  async getBatchPostRewards(postIds) {
    if (!postIds || postIds.length === 0) {
      return {};
    }
    return apiClient.post('/rewards/posts/batch', { postIds });
  },

  // 获取积分排行榜 (Feature specific, remains)
  async getRanking(params = {}) {
    return apiClient.get('/rewards/rank', params);
  },

  // 管理员 API
  admin: {
    // 获取积分系统统计 (Delegated to Ledger)
    async getStats() {
      return apiClient.get('/ledger/stats', { currency: 'credits' });
    },

    // 获取所有交易记录
    async getTransactions(params = {}) {
      return apiClient.get('/ledger/transactions', { ...params, currency: 'credits' });
    },

    // 手动发放积分 (Feature specific wrapper around ledger admin grant? Or calling rewards/admin/grant which wraps it?)
    // Kept rewards/admin/grant in backend.
    async grant(userId, amount, description) {
      return apiClient.post('/rewards/admin/grant', { userId, amount, description });
    },

    // 手动扣除积分
    async deduct(userId, amount, description) {
      return apiClient.post('/rewards/admin/deduct', { userId, amount, description });
    },

    // 获取积分配置
    async getConfig() {
      return apiClient.get('/rewards/admin/config');
    },

    // 更新积分配置
    async updateConfig(key, value) {
      return apiClient.request(`/rewards/admin/config/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
    },
  },
};




