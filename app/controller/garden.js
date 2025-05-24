const Controller = require('egg').Controller;

class GardenController extends Controller {
  async getGardenData() {
    const { ctx } = this;
    const userId = ctx.state.user.id;

    try {
      const gardenData = await ctx.service.garden.getGardenData(userId);
      
      ctx.body = {
        success: true,
        data: gardenData
      };
    } catch (error) {
      ctx.logger.error('[GardenController] Get garden data failed:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = GardenController;
