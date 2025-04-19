'use strict';

const jwt = require('jsonwebtoken');

module.exports = options => {
  return async (ctx, next) => {
    const token = ctx.headers.authorization?.split(' ')[1]; // 获取 Authorization Header 中的 Token
    
    if (!token) {
      ctx.throw(401, '未登录，缺少 Token');
    }

    try {
      // 验证并解码 Token
      const decoded = jwt.verify(token, ctx.app.config.jwt.secret);
      
      // 根据平台类型获取用户信息
      let user;
      
      if (decoded.platform === 'wechat') {
        // 微信平台用户
        const wxUser = await ctx.service.wxUser.findById(decoded.id);
        if (wxUser) {
          // 获取关联的通用用户信息
          user = await ctx.service.user.findById(wxUser.userId);
          user.wxUserInfo = wxUser;
          
          // 查询绑定关系，获取 partner_id
          const relationship = await ctx.service.relationship.getPartnerInfo(
            wxUser.openid
          );

          if (relationship) {
            user.partner_id = relationship.id;
            user.partnerInfo = relationship;
          } else {
            user.partner_id = null;
            user.partnerInfo = {};
          }
        }
      } else {
        // 其他平台用户
        user = await ctx.service.user.findById(decoded.id);
        
        // 获取伴侣信息（如果有）
        const partnerInfo = await ctx.service.user.getPartnerInfo(decoded.id);
        if (partnerInfo) {
          user.partner_id = partnerInfo.id;
          user.partnerInfo = partnerInfo;
        } else {
          user.partner_id = null;
          user.partnerInfo = {};
        }
      }
      
      if (!user) {
        ctx.throw(401, '用户不存在或已被禁用');
      }
      
      // 将用户信息挂载到 ctx.user 上
      ctx.user = user;
      
      await next(); // 继续执行后续中间件
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        ctx.throw(401, 'Token无效或已过期');
      } else {
        throw error;
      }
    }
  };
};