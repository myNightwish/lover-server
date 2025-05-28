const Controller = require('egg').Controller;

class EmotionController extends Controller {
  async recordEmotion() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { question } = ctx.request.body;

    try {
      // 检查是否已经记录过今日情绪
      const todayRecord = await ctx.service.emotion.getTodayRecord(userId);
      
      let result;
      if (todayRecord) {
        // 更新今日情绪记录
        result = await ctx.service.emotion.updateEmotionRecord(userId, todayRecord.id, question);
      } else {
        // 创建新的情绪记录
        result = await ctx.service.emotion.recordEmotion(userId, question);
      }

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
    const { period = 'week' } = ctx.query; // 支持查询不同时间段：day, week, month

    try {
      const trend = await ctx.service.emotion.analyzeEmotionTrend(userId, period);
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

  // 新增：获取情绪同步数据（与伴侣情绪对比）
  async getEmotionSync() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    try {
      // 获取用户与伴侣的情绪同步数据
      const syncData = await ctx.service.emotion.getEmotionSyncData(userId);
      
      ctx.body = {
        success: true,
        data: syncData,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  // 新增：获取今日情绪记录状态
  async getTodayStatus() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    try {
      const todayRecord = await ctx.service.emotion.getTodayRecord(userId);
      
      ctx.body = {
        success: true,
        data: {
          hasRecorded: !!todayRecord,
          record: todayRecord || null,
        },
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
