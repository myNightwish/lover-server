const Service = require('egg').Service;

class EmotionService extends Service {
  /**
   * 记录每日情绪
   * @param userId
   * @param emotionData
   */
  async recordEmotion(userId, emotionData) {
    const { ctx } = this;

    try {
      const record = await ctx.model.EmotionRecord.create({
        user_id: userId,
        emotion_type: emotionData.type,
        intensity: emotionData.intensity,
        trigger: emotionData.trigger,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 分析情绪趋势
      const trend = await this.analyzeEmotionTrend(userId);

      // 生成AI建议：todo
      // const suggestion = await ctx.service.openai.generateEmotionSuggestion(trend);

      return {
        record,
        trend,
        // suggestion,
      };
    } catch (error) {
      ctx.logger.error('[EmotionService] Record emotion failed:', error);
      throw new Error('记录情绪失败');
    }
  }

  /**
   * 分析情绪趋势
   * @param userId
   */
  async analyzeEmotionTrend(userId) {
    const { ctx } = this;

    const records = await ctx.model.EmotionRecord.findAll({
      where: { user_id: userId },
      order: [[ 'created_at', 'DESC' ]],
      limit: 30, // 最近30天
    });

    return this.calculateTrendMetrics(records);
  }

  /**
   * 计算趋势指标
   * @param records
   */
  calculateTrendMetrics(records) {
    const emotionCounts = {};
    const intensityTrend = [];

    records.forEach(record => {
      // 统计情绪类型分布
      emotionCounts[record.emotion_type] = (emotionCounts[record.emotion_type] || 0) + 1;
      // 记录情绪强度变化
      intensityTrend.push({
        date: record.created_at,
        intensity: record.intensity,
        trigger: record.trigger,
        emotion_type: record.emotion_type,
      });
    });

    return {
      // distribution: emotionCounts,
      trend: intensityTrend,
    };
  }
}

module.exports = EmotionService;
