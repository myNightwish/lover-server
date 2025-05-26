'use strict';

/**
 * 检查用户是否已绑定伴侣的中间件
 * 用于需要伴侣绑定才能访问的接口
 */
module.exports = (options = {}) => {
  return async (ctx, next) => {
    // 确保用户已经通过了 auth 中间件的验证
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '未授权，请先登录'
      };
      return;
    }

    // 检查用户是否已绑定伴侣
    if (!ctx.state.user.partner_id) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: options.message || '需要绑定伴侣才能访问此功能',
        code: 'PARTNER_REQUIRED'
      };
      return;
    }

    // 如果已绑定伴侣，继续执行后续中间件
    await next();
  };
};