const Controller = require('egg').Controller;

class GrowthController extends Controller {
  async getArchive() {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const archive = await ctx.service.growth.getGrowthArchive(userId);
      ctx.body = {
        success: true,
        data: archive
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  async getMilestones() {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const milestones = await ctx.service.growth.getUserMilestones(userId);
      ctx.body = {
        success: true,
        data: milestones
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = GrowthController;