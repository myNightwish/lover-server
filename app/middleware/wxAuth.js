const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(' ')[1]; // 获取 Authorization Header 中的 Token
  if (!token) {
    ctx.throw(401, '未登录，缺少 Token');
  }

  // 验证并解码 Token
  const decoded = jwt.verify(token, ctx.app.config.jwt.secret);
  const user = await ctx.service.wxUser.findById(decoded.id);
  // 将解码后的用户信息挂载到 ctx.user 上
  ctx.user = user ? user : {
    id: decoded.id,
    openid: decoded.openid,
  };
  // 查询绑定关系，获取 partner_id
  const relationship = await ctx.service.relationship.getPartnerInfo(
    decoded.openid
  );

  if (relationship) {
    ctx.user.partner_id = relationship.id;
    ctx.user.partnerInfo = relationship;
  } else {
    ctx.user.partner_id = null;
    ctx.user.partnerInfo = {};
  }

  await next(); // 继续执行后续中间件
};
