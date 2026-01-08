import apiClient from '../../../lib/api';

export const badgesApi = {
  // 获取所有可用勋章
  async getAll(params = {}) {
    return apiClient.get('/badges', params);
  },

  // 获取用户的勋章
  async getUserBadges(userId) {
    return apiClient.get(`/badges/users/${userId}`);
  },

  // 更新用户勋章展示设置
  async updateDisplay(userBadgeId, data) {
    return apiClient.request(`/badges/user/${userBadgeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 管理员 API
  admin: {
    getAll(params = {}) {
      return apiClient.get('/badges/admin', params);
    },
    create(data) {
      return apiClient.post('/badges/admin', data);
    },
    update(id, data) {
      return apiClient.request(`/badges/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return apiClient.delete(`/badges/admin/${id}`);
    },
    grant(data) {
      return apiClient.post('/badges/admin/grant', data);
    },
    revoke(data) {
      return apiClient.post('/badges/admin/revoke', data);
    },
  },
};
