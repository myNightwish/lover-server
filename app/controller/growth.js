const Controller = require('egg').Controller;

class GrowthController extends Controller {
  async getArchive() {
    const { ctx } = this;
    const userId = ctx.state.user.id;

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
}

module.exports = GrowthController;