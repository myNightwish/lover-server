const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(' ')[1]; // 获取 Authorization Header 中的 Token
  if (!token) {
    ctx.throw(401, '未登录，缺少 Token');
  }


  // 验证并解码 Token
  const decoded = jwt.verify(token, ctx.app.config.jwt.secret);

  // 将解码后的用户信息挂载到 ctx.user 上
  ctx.user = {
    id: decoded.id,
    openid: decoded.openid,
  };

  await next(); // 继续执行后续中间件
};
