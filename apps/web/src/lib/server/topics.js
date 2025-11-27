import { request } from '@/lib/server/api';

/**
 * 服务端获取话题列表数据
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.sort - 排序方式
 * @param {string} params.categoryId - 分类ID
 * @param {string} params.tag - 标签
 * @param {string} params.status - 状态
 * @returns {Promise<Object>} 话题列表数据
 */
export async function getTopicsData(params = {}) {
  const {
    page = 1,
    limit = 20,
    sort = 'latest',
    categoryId,
    tag,
    status,
  } = params;

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (categoryId) {
      queryParams.set('categoryId', categoryId);
    }

    if (tag) {
      queryParams.set('tag', tag);
    }

    if (status) {
      queryParams.set('status', status);
    }

    const data = await request(`/api/topics?${queryParams}`);
    
    return data || { items: [], total: 0, limit: 20 };
  } catch (error) {
    console.error('Error fetching topics:', error);
    return { items: [], total: 0, limit: 20 };
  }
}

/**
 * 服务端获取所有分类
 * @param {Object} params - 查询参数
 * @param {boolean} params.isFeatured - 是否只获取精选分类
 * @param {string} params.search - 搜索关键词
 * @returns {Promise<Array>} 分类列表
 */
export async function getCategoriesData(params = {}) {
  try {
    const { isFeatured, search } = params;
    const queryParams = new URLSearchParams();

    if (isFeatured !== undefined) {
      queryParams.set('isFeatured', isFeatured.toString());
    }

    if (search) {
      queryParams.set('search', search);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/api/categories?${queryString}` : '/api/categories';

    const data = await request(url);
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * 服务端根据slug获取分类
 * @param {string} slug - 分类slug
 * @returns {Promise<Object|null>} 分类数据
 */
export async function getCategoryBySlug(slug) {
  try {
    const data = await request(`/api/categories/${slug}`);
    return data || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

/**
 * 服务端获取统计数据
 * @returns {Promise<Object>} 统计数据
 */
export async function getStatsData() {
  try {
    const data = await request('/api/stats');
    return data || {
      totalTopics: 0,
      totalPosts: 0,
      totalUsers: 0,
      online: { total: 0 },
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalTopics: 0,
      totalPosts: 0,
      totalUsers: 0,
      online: { total: 0 },
    };
  }
}

/**
 * 服务端获取单个话题数据
 * @param {number|string} id - 话题ID
 * @returns {Promise<Object|null>} 话题数据
 */
export async function getTopicData(id) {
  try {
    const data = await request(`/api/topics/${id}`);
    return data;
  } catch (error) {
    console.error('Error fetching topic:', error);
    return null;
  }
}

/**
 * 服务端获取话题回复数据
 * @param {number|string} topicId - 话题ID
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<Object>} 回复列表数据
 */
export async function getPostsData(topicId, page = 1, limit = 20) {
  try {
    const params = new URLSearchParams({
      topicId: topicId.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const data = await request(`/api/posts?${params}`);
    return data || { items: [], total: 0 };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { items: [], total: 0 };
  }
}
