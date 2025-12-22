/**
 * HTTP 相关工具函数
 */

/**
 * 获取请求的前端 Origin
 * 优先级: Origin > Referer > X-Forwarded-Host > Host
 * @param {import('fastify').FastifyRequest} request
 * @returns {string} normalized origin (no trailing slash)
 */
export function getFrontendOrigin(request) {
  let origin = '';

  // 1. Try Origin header
  if (request.headers.origin) {
    origin = request.headers.origin;
  }
  // 2. Try Referer header
  else if (request.headers.referer) {
    try {
      const url = new URL(request.headers.referer);
      origin = url.origin;
    } catch (e) {
      // Ignore invalid referer
    }
  }

  if (!origin) {
    // 3. Try X-Forwarded-Host (often set by reverse proxies like Nginx/Vercel)
    const forwardedHost = request.headers['x-forwarded-host'];
    if (forwardedHost) {
      // Determine protocol: X-Forwarded-Proto -> request.protocol -> 'http'
      const forwardedProto = request.headers['x-forwarded-proto'] || request.protocol || 'http';
      
      // X-Forwarded-Host might be a comma-separated list, take the first one
      const host = forwardedHost.split(',')[0].trim();
      origin = `${forwardedProto}://${host}`;
    } else {
      // 4. Fallback to request host
      const protocol = request.protocol || 'http';
      const host = request.hostname;
      origin = `${protocol}://${host}`;
    }
  }

  // Ensure no trailing slash
  return origin.replace(/\/$/, '');
}
