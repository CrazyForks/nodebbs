/**
 * 消息服务统一错误类
 * 提供标准化的错误码和详细信息
 */
export class MessageError extends Error {
  /**
   * @param {string} code - 错误码（MessageErrorCode 中定义）
   * @param {string} message - 错误消息
   * @param {object} details - 额外的错误详情
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'MessageError';
    this.code = code;
    this.details = details;
  }

  /**
   * 转换为 JSON 格式（便于日志和 API 响应）
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * 消息服务错误码常量
 */
export const MessageErrorCode = {
  // 类型和渠道错误
  INVALID_TYPE: 'INVALID_TYPE', // 无效的消息类型
  UNSUPPORTED_CHANNEL: 'UNSUPPORTED_CHANNEL', // 不支持的消息渠道
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER', // 不支持的提供商

  // 提供商配置错误
  PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED', // 提供商未配置
  PROVIDER_DISABLED: 'PROVIDER_DISABLED', // 提供商已禁用
  INVALID_CONFIG: 'INVALID_CONFIG', // 配置无效

  // 参数缺失错误
  MISSING_RECIPIENT: 'MISSING_RECIPIENT', // 缺少收件人
  MISSING_SUBJECT: 'MISSING_SUBJECT', // 缺少邮件主题
  MISSING_CONTENT: 'MISSING_CONTENT', // 缺少邮件内容
  MISSING_TEMPLATE: 'MISSING_TEMPLATE', // 缺少模板
  MISSING_PARAMS: 'MISSING_PARAMS', // 缺少模板参数

  // 模板错误
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND', // 模板不存在

  // 发送错误
  SEND_FAILED: 'SEND_FAILED', // 发送失败
};
