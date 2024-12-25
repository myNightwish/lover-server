const Controller = require('egg').Controller;

class EmotionController extends Controller {
  async recordEmotion() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { type, intensity, trigger } = ctx.request.body;

    try {
      const result = await ctx.service.emotion.recordEmotion(userId, {
        type,
        intensity,
        trigger,
      });

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
    const userId = ctx.user.id;

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