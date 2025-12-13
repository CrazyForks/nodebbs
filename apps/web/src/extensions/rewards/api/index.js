import apiClient from '../../../lib/api';

// ============= 奖励系统 API =============
export const rewardsApi = {
  // 每日签到 (New Endpoint)
  async checkIn() {
    return apiClient.post('/check-in');
  },

  // 获取签到状态
  async getCheckInStatus() {
    return apiClient.get('/check-in');
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
};
