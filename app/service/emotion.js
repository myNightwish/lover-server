const Service = require('egg').Service;
const { Op } = require('sequelize');
const moment = require('moment');

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

      // 生成AI建议
      const suggestion = await this.generateEmotionSuggestion(emotionData.type, emotionData.intensity);

      return {
        record,
        trend,
        suggestion,
      };
    } catch (error) {
      ctx.logger.error('[EmotionService] Record emotion failed:', error);
      throw new Error('记录情绪失败');
    }
  }

  /**
   * 更新情绪记录
   * @param userId
   * @param recordId
   * @param emotionData
   */
  async updateEmotionRecord(userId, recordId, emotionData) {
    const { ctx } = this;

    try {
      const record = await ctx.model.EmotionRecord.findByPk(recordId);
      
      if (!record || record.user_id !== userId) {
        throw new Error('记录不存在或无权限修改');
      }
      
      await record.update({
        emotion_type: emotionData.type,
        intensity: emotionData.intensity,
        trigger: emotionData.trigger,
        updated_at: new Date(),
      });

      // 分析情绪趋势
      const trend = await this.analyzeEmotionTrend(userId);

      // 生成AI建议
      const suggestion = await this.generateEmotionSuggestion(emotionData.type, emotionData.intensity);

      return {
        record,
        trend,
        suggestion,
      };
    } catch (error) {
      ctx.logger.error('[EmotionService] Update emotion failed:', error);
      throw new Error('更新情绪失败');
    }
  }

  /**
   * 获取今日情绪记录
   * @param userId
   */
  async getTodayRecord(userId) {
    const { ctx } = this;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return await ctx.model.EmotionRecord.findOne({
      where: {
        user_id: userId,
        created_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });
  }

  /**
   * 分析情绪趋势
   * @param userId
   * @param period 时间段：day, week, month
   */
  async analyzeEmotionTrend(userId, period = 'week') {
    const { ctx } = this;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = moment().subtract(1, 'days').toDate();
        break;
      case 'month':
        startDate = moment().subtract(30, 'days').toDate();
        break;
      case 'week':
      default:
        startDate = moment().subtract(7, 'days').toDate();
        break;
    }

    const records = await ctx.model.EmotionRecord.findAll({
      where: {
        user_id: userId,
        created_at: {
          [Op.between]: [startDate, now],
        },
      },
      order: [['created_at', 'ASC']],
    });

    return this.calculateTrendMetrics(records, period);
  }

  /**
   * 获取情绪同步数据（与伴侣情绪对比）
   * @param userId
   */
  async getEmotionSyncData(userId, partnerId) {
    const { ctx } = this;
    
    // 获取伴侣关系
    // const partnerRelation = await ctx.model.PartnerRelationship.findOne({
    //   where: {
    //     [Op.or]: [
    //       { user_id: userId },
    //       { partner_id: userId },
    //     ],
    //   },
    // });
    
    // if (!partnerId) {
    //   return {
    //     hasPartner: false,
    //     message: '暂无伴侣关系',
    //     data: null,
    //   };
    // }
    
    // 获取过去7天的数据
    const startDate = moment().subtract(7, 'days').toDate();
    const now = new Date();
    
    // 获取用户情绪记录
    const userRecords = await ctx.model.EmotionRecord.findAll({
      where: {
        user_id: userId,
        created_at: {
          [Op.between]: [startDate, now],
        },
      },
      order: [['created_at', 'ASC']],
    });
    
    // 获取伴侣情绪记录
    const partnerRecords = partnerId ? await ctx.model.EmotionRecord.findAll({
      where: {
        user_id: partnerId,
        created_at: {
          [Op.between]: [startDate, now],
        },
      },
      order: [['created_at', 'ASC']],
    }) : [];
    
    // 生成日期映射数据
    const dateMap = {};
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      dates.unshift(date);
      dateMap[date] = {
        user: null,
        partner: null,
      };
    }
    
    // 填充用户数据
    userRecords.forEach(record => {
      const date = moment(record.created_at).format('YYYY-MM-DD');
      if (dateMap[date]) {
        dateMap[date].user = {
          type: record.emotion_type,
          intensity: record.intensity,
        };
      }
    });
    
    // 填充伴侣数据
    partnerRecords.forEach(record => {
      const date = moment(record.created_at).format('YYYY-MM-DD');
      if (dateMap[date]) {
        dateMap[date].partner = {
          type: record.emotion_type,
          intensity: record.intensity,
        };
      }
    });
    
    // 计算情绪同步率
    let syncCount = 0;
    let totalCount = 0;
    
    for (const date of dates) {
      const dayData = dateMap[date];
      if (dayData.user && dayData.partner) {
        totalCount++;
        // 情绪类型相同或强度差异小于2视为同步
        if (dayData.user.type === dayData.partner.type || 
            Math.abs(dayData.user.intensity - dayData.partner.intensity) < 2) {
          syncCount++;
        }
      }
    }
    
    const syncRate = totalCount > 0 ? (syncCount / totalCount) * 100 : 0;
    
    // 生成建议
    let suggestion = '';
    if (syncRate >= 70) {
      suggestion = '本周你们的情绪波动较为一致，建议周末安排一次户外活动，共同感受自然的美好。';
    } else if (syncRate >= 40) {
      suggestion = '本周你们的情绪有些不同步，建议找个安静的时间，聊聊彼此的感受和想法。';
    } else {
      suggestion = '本周你们的情绪差异较大，建议多关注伴侣的情绪变化，适时给予理解和支持。';
    }
    
    return {
      hasPartner: true,
      dates,
      data: dateMap,
      syncRate: Math.round(syncRate),
      suggestion,
    };
  }

  /**
   * 计算趋势指标
   * @param records
   * @param period
   */
  calculateTrendMetrics(records, period) {
    const emotionCounts = {};
    const intensityTrend = [];
    const dateFormat = period === 'day' ? 'HH:mm' : 'MM-DD';

    records.forEach(record => {
      // 统计情绪类型分布
      emotionCounts[record.emotion_type] = (emotionCounts[record.emotion_type] || 0) + 1;
      // 记录情绪强度变化
      intensityTrend.push({
        date: moment(record.created_at).format(dateFormat),
        intensity: record.intensity,
        trigger: record.trigger,
        emotion_type: record.emotion_type,
      });
    });

    // 计算主导情绪
    let dominantEmotion = null;
    let maxCount = 0;
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    return {
      distribution: emotionCounts,
      trend: intensityTrend,
      dominantEmotion,
      recordCount: records.length,
    };
  }

  /**
   * 生成情绪建议
   * @param emotionType
   * @param intensity
   */
  async generateEmotionSuggestion(emotionType, intensity) {
    // 根据情绪类型和强度生成建议
    const suggestions = {
      happy: [
        '很高兴看到你今天心情愉快！记得把这份快乐分享给身边的人。',
        '阳光般的心情，值得被珍藏。不妨记录下今天让你开心的瞬间。',
        '快乐是一种能量，它会让你的世界更加明亮。继续保持这份美好！'
      ],
      sad: [
        '每个人都低落的时候，给自己一些空间和时间去感受。',
        '悲伤是情感的一部分，它提醒我们什么是重要的。温柔地对待自己。',
        '如果愿意，可以尝试与信任的人分享你的感受，倾诉有时能带来意想不到的安慰。'
      ],
      angry: [
        '感到生气是正常的，试着深呼吸，让自己平静下来再做决定。',
        '愤怒背后常常隐藏着受伤或失望，花点时间了解自己真正的感受。',
        '当愤怒来袭，可以尝试转移注意力，比如散步或听音乐，等平静后再处理问题。'
      ],
      anxious: [
        '焦虑时，试着关注当下，感受呼吸，一步一步来。',
        '适当的焦虑是正常的，它提醒我们关注重要的事情。但记得照顾好自己。',
        '当焦虑感强烈时，可以尝试"5-4-3-2-1"练习：关注5件看得见的事物，4件能触摸的事物，3件能听到的声音，2种气味和1种味道。'
      ],
      neutral: [
        '平静的心境是一种珍贵的状态，享受这份宁静。',
        '平静时是反思和规划的好时机，不妨思考一下近期的目标和计划。',
        '平和的心态让我们能更清晰地看待事物，这是一种难得的平衡。'
      ]
    };
    
    // 根据强度选择不同的建议
    const index = Math.min(Math.floor(intensity / 2), 2);
    return suggestions[emotionType][index];
  }
}

module.exports = EmotionService;
