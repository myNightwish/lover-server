const Controller = require('egg').Controller;

class ConflictController extends Controller {
  async recordConflict() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const conflictData = ctx.request.body;
    const partnerId = ctx.user.partner_id;
    // 如果未绑定伴侣，返回错误信息
    if (!partnerId) {
      ctx.body = {
        success: false,
        message: '未找到绑定关系，无法记录行为',
      };
      return;
    }
    try {
      const result = await ctx.service.conflict.recordConflict(userId, conflictData);
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
    const userId = ctx.user.id;
    const partnerId = ctx.user.partner_id;
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
}

module.exports = ConflictController;
