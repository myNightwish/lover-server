'use strict';

const jwt = require('jsonwebtoken');

module.exports = options => {
  return async (ctx, next) => {
    const token = ctx.headers.authorization?.split(' ')[1]; // 获取 Authorization Header 中的 Token
    
    if (!token) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '未授权，请先登录'
      };
      return;
    }

    try {
      // 验证并解码 Token
      const decoded = jwt.verify(token, ctx.app.config.jwt.secret);
      
      // 根据平台类型获取用户信息
      let user;
      
      // 统一处理用户信息获取逻辑
      if (decoded.platform === 'wechat') {
        // 微信平台用户
        const wxUser = await ctx.service.wxUser.findById(decoded.id);
        if (!wxUser) {
          ctx.status = 401;
          ctx.body = {
            success: false,
            message: '微信用户不存在'
          };
          return;
        }
        // 获取关联的通用用户信息
        user = await ctx.service.user.findById(wxUser.userId);
        if (user) {
          // 保存微信特有信息
          user.wxUserInfo = wxUser;
          user.openid = wxUser.openid; // 确保 openid 可用
        }
      } else {
        // 其他平台用户（H5等）
        user = await ctx.service.user.findById(decoded.id);
      }
      
      if (!user) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 统一从 partner_relationship 表查询伴侣关系
      const partnerRelationship = await ctx.service.partnerRelationship.getRelationshipByUserId(user.id);
      console.log('partnerRelationship--',partnerRelationship)
      if (partnerRelationship) {
        // 确定伴侣ID（如果当前用户是user1，则伴侣是user2，反之亦然）
        const partnerId = partnerRelationship.user_id === user.id 
          ? partnerRelationship.user2_id 
          : partnerRelationship.user1_id;
          
        // 获取伴侣详细信息
        const partnerInfo = await ctx.service.user.findById(partnerId);
        
        if (partnerInfo) {
          user.partner_id = partnerId;
          user.partnerInfo = {
            id: partnerInfo.id,
            nickname: partnerInfo.nickname,
            avatar: partnerInfo.avatar
            // 不返回伴侣的敏感信息
          };
        } else {
          // 伴侣记录存在但用户不存在的异常情况
          user.partner_id = partnerId;
          user.partnerInfo = { id: partnerId };
        }
      } else {
        user.partner_id = null;
        user.partnerInfo = null;
      }
      
      // 确保用户有绑定码
      if (!user.bind_code) {
        // 如果没有绑定码，可以在这里生成并保存
        // 或者直接使用用户ID作为临时绑定码
        user.bind_code = `U${user.id.toString().padStart(7, '0')}`;
        // 更新用户绑定码（可选）
        await ctx.service.user.update(user.id, { bind_code: user.bind_code });
      }
      
      // 将用户信息存入 ctx.state.user
      ctx.state.user = {
        id: user.id,
        openid: user.openid || null, // 可能为空，非微信用户没有openid
        nickname: user.nickname,
        avatar: user.avatar,
        bind_code: user.bind_code,
        partner_id: user.partner_id,
        platform: decoded.platform, // 保存平台信息，便于后续处理
        isAdmin: user.role === 'admin'
      };
      await next(); // 继续执行后续中间件
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: 'Token无效或已过期',
          error: error.message
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          success: false,
          message: '服务器内部错误',
          error: error.message
        };
      }
    }
  };
};