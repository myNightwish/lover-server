const Controller = require('egg').Controller;

class ConflictController extends Controller {
  async recordConflict() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const conflictData = ctx.request.body;
    const partnerId = ctx.state.user.partner_id;
    // 如果未绑定伴侣，返回错误信息
    if (!partnerId) {
      ctx.body = {
        success: false,
        message: '未找到绑定关系，无法记录行为',
      };
      return;
    }
    try {
      const result = await ctx.service.conflict.recordConflict(userId, partnerId, conflictData);
      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getConflictAnalysis() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const partnerId = ctx.state.user.partner_id;
    // 如果未绑定伴侣，返回错误信息
    if (!partnerId) {
      ctx.body = {
        success: false,
        message: '未找到绑定关系，无法记录行为',
      };
      return;
    }

    try {
      const analysis = await ctx.service.conflict.getConflictAnalysis(userId, partnerId);
      ctx.body = {
        success: true,
        data: analysis,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getConflictMemories() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const partnerId = ctx.state.user.partner_id;
    
    if (!partnerId) {
      ctx.body = {
        success: false,
        message: '未找到绑定关系，无法获取冲突记忆'
      };
      return;
    }
    
    try {
      const result = await ctx.service.conflict.getConflictMemories(userId, partnerId);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }
  
  async addConflictNote() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { conflictId, note } = ctx.request.body;
    
    if (!conflictId || !note) {
      ctx.body = {
        success: false,
        message: '参数不完整'
      };
      return;
    }
    
    try {
      const result = await ctx.service.conflict.addConflictNote(userId, conflictId, note);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = ConflictController;
