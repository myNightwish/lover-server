// app/middleware/auth.js
module.exports = () => {
  return async function auth(ctx, next) {
    // 获取 Authorization 头部的 token
    const authorizationHeader = ctx.headers.authorization;

    if (!authorizationHeader) {
      ctx.throw(401, { message: 'Token expired', isTokenExpired: true });
    }
    const token = authorizationHeader.split(' ')[1]; // 获取 Bearer 后的 token

    if (!token) {
      ctx.throw(401, { message: 'Token expired', isTokenExpired: true });
    }

    try {
    // 验证 token 并解析用户信息
      const user = await ctx.service.auth.verifyToken(token); // 使用 auth 服务解析 token
      if (!user) {
        ctx.throw(401, { message: 'Token expired', isTokenExpired: true });
      }

      // 将用户信息绑定到 ctx 对象上
      ctx.user = user;

      // 继续执行后续逻辑
      await next();
    } catch (error) {
      ctx.throw(401, { message: 'Token expired', isTokenExpired: true });
    }
  };
};
