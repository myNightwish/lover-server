const Controller = require('egg').Controller;

class MemoryPuzzleController extends Controller {
  async createPuzzle() {
    const { ctx } = this;
    // const userId = ctx.user.id;
    let { partnerId, description } = ctx.request.body;
    // partnerId = 2;
    partnerId = 1;
    const userId = 2;
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
}

module.exports = MemoryPuzzleController;
