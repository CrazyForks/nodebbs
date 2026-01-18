import apiClient from '../../../lib/api';

// ============= 广告系统 API =============
export const adsApi = {
  // 获取指定广告位的广告（用于前端展示）
  async getAdsBySlot(slotCode) {
    return apiClient.get(`/ads/display/${slotCode}`);
  },

  // 记录广告展示
  async recordImpression(adId) {
    return apiClient.post(`/ads/${adId}/impression`);
  },

  // 记录广告点击
  async recordClick(adId) {
    return apiClient.post(`/ads/${adId}/click`);
  },

  // 管理员 API
  admin: {
    // ============ 广告位管理 ============
    slots: {
      // 获取所有广告位
      async getAll() {
        return apiClient.get('/ads/admin/slots');
      },

      // 获取单个广告位
      async getById(id) {
        return apiClient.get(`/ads/admin/slots/${id}`);
      },

      // 创建广告位
      async create(data) {
        return apiClient.post('/ads/admin/slots', data);
      },

      // 更新广告位
      async update(id, data) {
        return apiClient.patch(`/ads/admin/slots/${id}`, data);
      },

      // 删除广告位
      async delete(id) {
        return apiClient.delete(`/ads/admin/slots/${id}`);
      },
    },

    // ============ 广告管理 ============
    // 获取广告列表
    async getAds(params = {}) {
      return apiClient.get('/ads/admin/ads', params);
    },

    // 获取单个广告
    async getAdById(id) {
      return apiClient.get(`/ads/admin/ads/${id}`);
    },

    // 创建广告
    async createAd(data) {
      return apiClient.post('/ads/admin/ads', data);
    },

    // 更新广告
    async updateAd(id, data) {
      return apiClient.patch(`/ads/admin/ads/${id}`, data);
    },

    // 删除广告
    async deleteAd(id) {
      return apiClient.delete(`/ads/admin/ads/${id}`);
    },
  },
};
