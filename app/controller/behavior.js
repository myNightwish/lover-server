const Controller = require('egg').Controller;

class BehaviorController extends Controller {
  async recordBehavior() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const behaviorData = ctx.request.body;
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
      const result = await ctx.service.behavior.recordBehavior(
        userId,
        partnerId,
        behaviorData
      );

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

  async getBehaviorAnalysis() {
    const { ctx } = this;
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
      const analysis = await ctx.service.behavior.getBehaviorAnalysis(partnerId);
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

  async getBehaviorCategories() {
    const { ctx } = this;

    try {
      const categories = ctx.service.behavior.getBehaviorCategories();
      ctx.body = {
        success: true,
        data: categories,
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

module.exports = BehaviorController;
