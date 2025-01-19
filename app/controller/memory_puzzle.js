const Controller = require('egg').Controller;

class MemoryPuzzleController extends Controller {
  async createPuzzle() {
    const { ctx } = this;
    const { description } = ctx.request.body;
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
      const puzzle = await ctx.service.memoryPuzzle.createPuzzle(
        userId,
        partnerId,
        description
      );

      ctx.body = {
        success: true,
        data: puzzle,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getPuzzleResult() {
    const { ctx } = this;
    const { puzzleId } = ctx.params;

    try {
      const result = await ctx.service.memoryPuzzle.getPuzzleResult(puzzleId);
      if (result.partner_description) {
        ctx.body = {
          success: true,
          data: result,
        };
      } else {
        ctx.body = {
          success: false,
          data: result,
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = MemoryPuzzleController;
