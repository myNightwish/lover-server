const Service = require('egg').Service;

class ConflictService extends Service {
  /**
   * 记录冲突
   * @param userId
   * @param conflictData
   */
  async recordConflict(userId, partnerId, conflictData) {
    const { ctx } = this;

    try {
      const record = await ctx.model.ConflictRecord.create({
        user_id: userId,
        partner_id: partnerId,
        trigger: conflictData.trigger,
        emotion_state: conflictData.emotionState,
        resolution: conflictData.resolution,
        reflection: conflictData.reflection,
        tags: conflictData.tags,
        created_at: new Date(),
        updated_at: new Date(),
      });
      // 生成冲突分析报告
      const analysis = await this.generateConflictAnalysis(record);

      // 获取AI建议
      // const suggestion = await ctx.service.openai.generateConflictSuggestion(analysis);
      const suggestion = 'AI建议内容在这里，暂时用占位符代替';

      return {
        record,
        analysis,
        suggestion,
      };
    } catch (error) {
      ctx.logger.error('[ConflictService] Record conflict failed:', error);
      throw new Error('记录冲突失败');
    }
  }

  /**
   * 生成冲突分析报告
   * @param record
   */
  async generateConflictAnalysis(record) {
    const { ctx } = this;

    console.log('record.partner_id', record.partner_id);
    // 获取历史冲突记录
    const historicalRecords = await ctx.model.ConflictRecord.findAll({
      where: {
        user_id: record.user_id,
        partner_id: record.partner_id,
      },
      order: [[ 'created_at', 'DESC' ]],
    });

    // 分析冲突模式
    const patterns = this.analyzeConflictPatterns(historicalRecords);

    // 识别改进机会
    const improvements = this.identifyImprovementAreas(patterns);

    return {
      currentConflict: record,
      patterns,
      improvements,
    };
  }

  /**
   * 分析冲突模式
   * @param records
   */
  analyzeConflictPatterns(records) {
    const tagFrequency = {};
    const triggerPatterns = {};

    records.forEach(record => {
      // 统计标签频率
      record.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });

      // 分析触发模式
      const trigger = record.trigger.toLowerCase();
      triggerPatterns[trigger] = (triggerPatterns[trigger] || 0) + 1;
    });

    return {
      tagFrequency,
      triggerPatterns,
    };
  }

  /**
   * 识别改进机会
   * @param patterns
   */
  identifyImprovementAreas(patterns) {
    const improvements = [];

    // 基于标签频率识别主要问题领域
    const topTags = Object.entries(patterns.tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topTags.forEach(([ tag, frequency ]) => {
      improvements.push({
        area: tag,
        frequency,
        suggestion: this.getImprovementSuggestion(tag),
      });
    });

    return improvements;
  }

  /**
   * 获取改进建议
   * @param tag
   */
  getImprovementSuggestion(tag) {
    const suggestions = {
      沟通方式: '建议采用"我感受"陈述，避免指责性语言',
      价值观差异: '尝试理解对方的成长背景，寻找共同价值点',
      情绪管理: '学习情绪觉察，在情绪激动时暂停对话',
      期望不一致: '明确表达各自的期望，寻找双方都能接受的中间方案',
    };

    return suggestions[tag] || '建议寻求专业咨询师的帮助';
  }
}

module.exports = ConflictService;
