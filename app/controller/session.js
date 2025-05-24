'use strict';

const Controller = require('egg').Controller;

class SessionController extends Controller {
  // 创建问答会话
  async createSession() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { topicId, title } = ctx.request.body;
    
    try {
      const result = await ctx.service.questionSession.createSession(userId, topicId, title);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('创建问答会话失败', error);
      ctx.body = {
        success: false,
        message: error.message || '创建问答会话失败'
      };
    }
  }
  
  // 获取会话详情
  async getSessionDetail() {
    const { ctx } = this;
    const sessionId = ctx.params.id;
    const userId = ctx.state.user.id;
    
    try {
      const result = await ctx.service.question_session.getSessionDetail(sessionId, userId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('获取会话详情失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取会话详情失败'
      };
    }
  }
  
  // 获取用户的会话列表
  async getUserSessions() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    try {
      const result = await ctx.service.question_session.getUserSessions(userId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('获取用户会话列表失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取用户会话列表失败'
      };
    }
  }
  
  // 邀请伴侣加入会话
  async invitePartner() {
    const { ctx } = this;
    const sessionId = ctx.params.id;
    const userId = ctx.state.user.id;
    const { partnerId } = ctx.request.body;
    
    try {
      const result = await ctx.service.question_session.invitePartner(sessionId, userId, partnerId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('邀请伴侣加入会话失败', error);
      ctx.body = {
        success: false,
        message: error.message || '邀请伴侣加入会话失败'
      };
    }
  }
  
  // 完成会话
  async completeSession() {
    const { ctx } = this;
    const sessionId = ctx.params.id;
    const userId = ctx.state.user.id;
    
    try {
      const result = await ctx.service.question_session.completeSession(sessionId, userId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('完成会话失败', error);
      ctx.body = {
        success: false,
        message: error.message || '完成会话失败'
      };
    }
  }
}

module.exports = SessionController;