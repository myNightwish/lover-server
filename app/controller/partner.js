'use strict';

const Controller = require('egg').Controller;

class PartnerController extends Controller {
  /**
   * 发送伴侣绑定请求
   */
  async sendBindRequest() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { targetId, targetPhone, type = 'id' } = ctx.request.body;
    
    // 根据类型选择目标标识符
    const targetIdentifier = type === 'phone' ? targetPhone : targetId;
    
    if (!targetIdentifier) {
      ctx.body = {
        success: false,
        message: '缺少目标用户信息'
      };
      return;
    }
    
    const result = await ctx.service.partner.sendBindRequest(userId, targetIdentifier, type);
    ctx.body = result;
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