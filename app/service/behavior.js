const Service = require('egg').Service;

class BehaviorService extends Service {
  /**
   * 记录行为
   * @param userId
   * @param partnerId
   * @param behaviorData
   */
  async recordBehavior(userId, partnerId, behaviorData) {
    const { ctx } = this;

    try {
      // 开启事务
      const result = await ctx.model.transaction(async (transaction) => {
        // 创建行为记录
        const record = await ctx.model.BehaviorRecord.create(
          {
            user_id: userId,
            partner_id: partnerId,
            type: behaviorData.type,
            points: behaviorData.points,
            category: behaviorData.category,
            description: behaviorData.description,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction }
        );

        // 更新积分
        await this.updateBehaviorScore(
          partnerId,
          behaviorData.type,
          behaviorData.points,
          transaction
        );

        return record;
      });

      // 生成行为分析
      const analysis = await this.getBehaviorAnalysis(partnerId);

      return {
        record: result,
        analysis,
      };
    } catch (error) {
      ctx.logger.error('[BehaviorService] Record behavior failed:', error);
      throw new Error('记录行为失败');
    }
  }

  /**
   * 更新行为积分
   * @param userId
   * @param type
   * @param points
   * @param transaction
   */
  async updateBehaviorScore(userId, type, points, transaction) {
    const { ctx } = this;

    let score = await ctx.model.BehaviorScore.findOne({
      where: { user_id: userId },
      transaction,
    });

    if (!score) {
      score = await ctx.model.BehaviorScore.create(
        {
          user_id: userId,
          total_score: 0,
          positive_count: 0,
          negative_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction }
      );
    }

    const updates = {
      total_score: score.total_score + points,
      [type === 'positive' ? 'positive_count' : 'negative_count']:
        score[type === 'positive' ? 'positive_count' : 'negative_count'] + 1,
      updated_at: new Date()
    };

    await score.update(updates, { transaction });
  }

  /**
   * 分析行为模式
   * @param userId
   */
  async getBehaviorAnalysis(userId) {
    const { ctx } = this;

    const records = await ctx.model.BehaviorRecord.findAll({
      where: { partner_id: userId },
      order: [[ 'created_at', 'DESC' ]],
      limit: 30, // 最近30条记录
    });

    const score = await ctx.model.BehaviorScore.findOne({
      where: { user_id: userId },
    });

    return {
      totalScore: score?.total_score || 0,
      positiveRate: score ?
        (score.positive_count / (score.positive_count + score.negative_count) * 100).toFixed(1) : 0,
      categoryAnalysis: this.analyzeBehaviorCategories(records),
      recentTrend: this.analyzeRecentTrend(records),
    };
  }

  /**
   * 分析行为类别
   * @param records
   */
  analyzeBehaviorCategories(records) {
    const categories = {};

    records.forEach(record => {
      if (!categories[record.category]) {
        categories[record.category] = {
          positive: 0,
          negative: 0,
          totalPoints: 0,
        };
      }

      categories[record.category][record.type]++;
      categories[record.category].totalPoints += record.points;
    });

    return Object.entries(categories).map(([ category, stats ]) => ({
      category,
      positiveCount: stats.positive,
      negativeCount: stats.negative,
      totalPoints: stats.totalPoints,
    }));
  }
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要加1
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // 返回格式 YYYY-MM-DD
  }
  /**
   * 分析最近趋势
   * @param records
   */
  analyzeRecentTrend(records) {
    const dailyTrendList = records.map(record => {
      const date = this.formatDate(record.created_at);
      return {
        date: record.created_at,
        type: record.type,
        description: record.description,
        points: record.points,
        category: record.category,
      };
    });
    return dailyTrendList.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * 获取行为类别列表
   */
  getBehaviorCategories() {
    return [
      { id: 'care', name: '关心照顾', description: '生活中的体贴关怀' },
      { id: 'responsibility', name: '责任担当', description: '承担家庭责任' },
      { id: 'communication', name: '沟通交流', description: '有效的情感表达' },
      { id: 'growth', name: '共同成长', description: '促进彼此进步' },
      { id: 'respect', name: '尊重理解', description: '尊重对方的想法和决定' },
    ];
  }
}

module.exports = BehaviorService;
