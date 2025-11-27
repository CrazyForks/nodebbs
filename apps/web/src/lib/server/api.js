// SSR请求专用
import { cookies } from 'next/headers';

export const request = async (endpoint, options = {}) => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7100';
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const cks = await cookies();
  const token = cks.get('auth_token')?.value;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const defaultCache = options.method && options.method !== 'GET' ? 'no-store' : undefined;

    const response = await fetch(url, {
      ...options,
      // 对于 GET 请求使用默认缓存策略，让 Next.js 自动去重同一渲染周期内的相同请求
      // 对于其他请求（POST/PUT/DELETE）使用 no-store
      cache: options.cache ?? defaultCache,
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching:', error);
    return null;
  }
};
