const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(' ')[1]; // 获取 Authorization Header 中的 Token
  if (!token) {
    ctx.throw(401, '未登录，缺少 Token');
  }

  try {
    // 验证并解码 Token
    const decoded = jwt.verify(token, ctx.app.config.jwt.secret);

    // 将解码后的用户信息挂载到 ctx.user 上
    ctx.user = {
      id: decoded.id,
      openid: decoded.openid, // 你在签名时将 openid 存储为 userId
    };

    await next(); // 继续执行后续中间件
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      ctx.throw(401, '登录已过期，请重新登录');
    } else if (err.name === 'JsonWebTokenError') {
      ctx.throw(401, '无效的 Token');
    } else {
      ctx.throw(500, '服务器错误');
    }
  }
};
