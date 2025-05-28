const Service = require('egg').Service;

class ConflictService extends Service {
  /**
   * 记录冲突
   * @param userId 用户ID
   * @param conflictData 冲突数据
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
        growth_points: this.calculateGrowthPoints(conflictData), // 新增成长点数计算
        created_at: new Date(),
        updated_at: new Date(),
      });
      // 生成冲突分析报告
      const analysis = await this.generateConflictAnalysis(record);

      return {
        success: true,
        data: {
          record,
          analysis
        }
      };
    } catch (error) {
      ctx.logger.error('[ConflictService] Record conflict failed:', error);
      return {
        success: false,
        message: '记录冲突失败: ' + error.message
      };
    }
  }


  /**
   * 计算成长点数
   * @param conflictData 冲突数据
   */
  calculateGrowthPoints(conflictData) {
    let points = 0;
    
    // 根据填写内容的完整度计算点数
    if (conflictData.trigger && conflictData.trigger.length > 50) points += 5;
    if (conflictData.resolution && conflictData.resolution.length > 50) points += 5;
    if (conflictData.reflection && conflictData.reflection.length > 50) points += 10;
    if (conflictData.tags && conflictData.tags.length >= 2) points += 5;
    
    return points;
  }

  /**
   * 生成冲突分析报告
   * @param record
   */
  async generateConflictAnalysis(record) {
    const { ctx } = this;

    // 获取历史冲突记录
    const historicalRecords = await ctx.model.ConflictRecord.findAll({
      where: {
        [ctx.app.Sequelize.Op.or]: [
          { user_id: record.user_id, partner_id: record.partner_id },
          { user_id: record.partner_id, partner_id: record.user_id }
        ]
      },
      order: [[ 'created_at', 'DESC' ]],
      limit: 10 // 限制只分析最近的10条记录，提高性能
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

  /**
   * 获取冲突记忆列表
   * @param userId
   * @param partnerId
   */
  async getConflictMemories(userId, partnerId) {
    const { ctx } = this;

    try {
      const memories = await ctx.model.ConflictRecord.findAll({
        where: {
          [ctx.app.Sequelize.Op.or]: [
            { user_id: userId, partner_id: partnerId },
            { user_id: partnerId, partner_id: userId }
          ]
        },
        order: [['created_at', 'DESC']], // ConflictRecord 按 created_at 降序排列
        include: [{
          model: ctx.model.ConflictNote,
          as: 'notes',
          required: false,
          separate: true, // 如果是 hasMany 关系，推荐加上
          order: [['created_at', 'DESC']] // ConflictNote 也按 created_at 降序排列
        }]
      });

      return {
        success: true,
        data: memories
      };
    } catch (error) {
      ctx.logger.error('[ConflictService] Get conflict memories failed:', error);
      return {
        success: false,
        message: '获取冲突记忆失败: ' + error.message
      };
    }
  }

  /**
   * 添加冲突笔记
   * @param userId
   * @param conflictId
   * @param note
   */
  async addConflictNote(userId, conflictId, note) {
    const { ctx } = this;

    try {
      // 检查冲突记录是否存在
      const conflict = await ctx.model.ConflictRecord.findByPk(conflictId);
      if (!conflict) {
        return {
          success: false,
          message: '冲突记录不存在'
        };
      }

      // 检查用户是否有权限添加笔记
      if (conflict.user_id !== userId && conflict.partner_id !== userId) {
        return {
          success: false,
          message: '无权限添加笔记'
        };
      }

      // 创建笔记
      const conflictNote = await ctx.model.ConflictNote.create({
        conflict_id: conflictId,
        user_id: userId,
        content: note,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return {
        success: true,
        data: conflictNote
      };
    } catch (error) {
      ctx.logger.error('[ConflictService] Add conflict note failed:', error);
      return {
        success: false,
        message: '添加冲突笔记失败: ' + error.message
      };
    }
  }
}

module.exports = ConflictService;
