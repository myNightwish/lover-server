const Controller = require('egg').Controller;

class EmotionController extends Controller {
  async recordEmotion() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { question } = ctx.request.body;

    try {
      const result = await ctx.service.emotion.recordEmotion(userId, question);

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

  async getEmotionTrend() {
    const { ctx } = this;
    const userId = ctx.state.user.id;

    try {
      const trend = await ctx.service.emotion.analyzeEmotionTrend(userId);
      ctx.body = {
        success: true,
        data: trend,
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

module.exports = EmotionController;
