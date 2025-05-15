'use strict';

const Controller = require('egg').Controller;

class PartnerController extends Controller {
  /**
   * 发送伴侣绑定请求
   */
  async sendBindRequest() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { bind_partner_code } = ctx.request.body;
    
    if (!bind_partner_code) {
      ctx.body = {
        success: false,
        message: '伴侣绑定码不能为空'
      };
      return;
    }
    
    try {
      // 根据绑定码查找目标用户
      const targetUser = await ctx.model.User.findOne({
        where: { bind_code: bind_partner_code },
        attributes: ['id', 'nickname', 'avatar', 'partner_id']
      });
      
      if (!targetUser) {
        ctx.body = {
          success: false,
          message: '未找到该绑定码对应的用户'
        };
        return;
      }
      
      // 检查目标用户是否已有伴侣
      if (targetUser.partner_id) {
        ctx.body = {
          success: false,
          message: '该用户已经绑定了伴侣'
        };
        return;
      }
      
      // 检查当前用户是否已有伴侣
      const currentUser = await ctx.model.User.findByPk(userId, {
        attributes: ['id', 'partner_id']
      });
      
      if (currentUser.partner_id) {
        ctx.body = {
          success: false,
          message: '您已经绑定了伴侣'
        };
        return;
      }
      
      // 检查是否自己绑定自己
      if (targetUser.id === userId) {
        ctx.body = {
          success: false,
          message: '不能与自己绑定'
        };
        return;
      }
      
      // 创建绑定关系（直接绑定或创建绑定请求）
      const result = await ctx.service.partner.directBindPartner(userId, targetUser.id);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('发送伴侣绑定请求失败', error);
      ctx.body = {
        success: false,
        message: '发送伴侣绑定请求失败',
        error: error.message
      };
    }
  }
  
  /**
   * 接受伴侣绑定请求
   */
  async acceptBindRequest() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { requestId } = ctx.params;
    
    const result = await ctx.service.partner.acceptBindRequest(userId, requestId);
    ctx.body = result;
  }
  
  /**
   * 拒绝伴侣绑定请求
   */
  async rejectBindRequest() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { requestId } = ctx.params;
    
    const result = await ctx.service.partner.rejectBindRequest(userId, requestId);
    ctx.body = result;
  }
  
  /**
   * 获取绑定请求列表
   */
  async getBindRequests() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    const result = await ctx.service.partner.getBindRequests(userId);
    ctx.body = result;
  }
  
  /**
   * 获取绑定状态
   */
  async getBindStatus() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    const result = await ctx.service.partner.getBindStatus(userId);
    ctx.body = result;
  }
  
  /**
   * 解除伴侣绑定
   */
  async unbindPartner() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    const result = await ctx.service.partner.unbindPartner(userId);
    ctx.body = result;
  }
}

module.exports = PartnerController;