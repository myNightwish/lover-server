const Service = require('egg').Service;

class GardenService extends Service {
  /**
   * 获取花园整体数据
   */
  async getGardenData(userId) {
    const [
      emotionTree,
      empathyGarden,
      memoryPond,
      behaviorPath,
      recentConflictRecord,
      expProcessData,
    ] = await Promise.all([
      this.getEmotionTreeData(userId),
      this.getEmpathyGardenData(userId),
      this.getMemoryPondData(userId),
      this.getBehaviorPathData(userId),
      this.getConflictData(userId),
      this.getUserProgress(userId),
    ]);

    return {
      emotionTree,
      empathyGarden,
      memoryPond,
      behaviorPath,
      weather: await this.calculateWeatherState(userId),
      recentConflictRecord,
      expProcessData,
    };
  }
  getUserProgress(userId) {
    const { ctx } = this;

    const expProcessData = ctx.service.empathy.getUserProgress(userId);
    return expProcessData;
  }
  async getConflictData(userId) {
    const { ctx } = this;

    // 获取最近冲突记录
    const recentConflictRecord = await ctx.model.ConflictRecord.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 7,
    });
    return recentConflictRecord;
  }
  /**
   * 获取情感之树数据
   */
  async getEmotionTreeData(userId) {
    const { ctx } = this;

    // 获取最近情绪记录
    const recentEmotions = await ctx.model.EmotionRecord.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 7,
    });

    // 计算树的健康度
    const health = await this.calculateTreeHealth(recentEmotions);

    return {
      health,
      recentEmotions: recentEmotions.map((e) => ({
        type: e.emotion_type,
        intensity: e.intensity,
        trigger: e.trigger,
        date: e.created_at,
      })),
    };
  }

  /**
   * 获取共情花园数据
   */
  async getEmpathyGardenData(userId) {
    const { ctx } = this;

    // 获取已完成的任务
    const completedTasks = await ctx.model.UserTask.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: ctx.model.EmpathyTask,
          as: 'task',
        },
      ],
      order: [['completed_at', 'DESC']],
    });

    return {
      tasks: completedTasks.map((t) => ({
        id: t.task_id,
        title: t.task.title,
        completed: t.completed,
        description: t.task.description,
        exp_reward: t.task.exp_reward,
        completedAt: t.completed_at,
      })),
    };
  }

  /**
   * 获取记忆数据
   */
  async getMemoryPondData(userId) {
    const { ctx } = this;

    const memories = await ctx.model.MemoryPuzzle.findAll({
      where: {
        [ctx.model.Sequelize.Op.or]: [
          { user_id: userId },
          { partner_id: userId },
        ],
      },
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    return {
      memories: memories.map((memory, index) => ({
        id: memory.id,
        desc: memory.event_description,
        matchLevel: this.getMatchLevel(memory.match_score),
      })),
    };
  }

  /**
   * 获取行为之路数据
   */
  async getBehaviorPathData(userId) {
    const { ctx } = this;
    const data = await ctx.service.points.getUserPointsOverview(userId);
    return { milestones: data?.records || [] };
  }

  /**
   * 计算天气状态
   */
  async calculateWeatherState(userId) {
    const { ctx } = this;

    // 获取最近的互动数据
    const [emotions, tasks, memories, behaviors] = await Promise.all([
      ctx.model.EmotionRecord.count({
        where: {
          user_id: userId,
          created_at: {
            [ctx.model.Sequelize.Op.gte]: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ),
          },
        },
      }),
      ctx.model.UserTask.count({
        where: {
          user_id: userId,
          completed: true,
          completed_at: {
            [ctx.model.Sequelize.Op.gte]: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ),
          },
        },
      }),
      ctx.model.MemoryPuzzle.count({
        where: {
          [ctx.model.Sequelize.Op.or]: [
            { user_id: userId },
            { partner_id: userId },
          ],
          created_at: {
            [ctx.model.Sequelize.Op.gte]: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ),
          },
        },
      }),
      ctx.model.BehaviorRecord.count({
        where: {
          user_id: userId,
          created_at: {
            [ctx.model.Sequelize.Op.gte]: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ),
          },
        },
      }),
    ]);

    const totalInteractions = emotions + tasks + memories + behaviors;

    if (totalInteractions >= 15) return 'SUNNY';
    if (totalInteractions >= 7) return 'CLOUDY';
    return 'RAINY';
  }

  // 辅助方法
  async calculateTreeHealth(emotions) {
    if (!emotions.length) return 50;

    const positiveTypes = ['happy', 'neutral'];
    const positiveCount = emotions.filter((e) =>
      positiveTypes.includes(e.emotion_type)
    ).length;
    const healthPercentage = (positiveCount / emotions.length) * 100;
    return parseFloat(healthPercentage.toFixed(2)); // 保留两位小数
  }

  calculateFlowerState(task) {
    const daysSinceCompletion = Math.floor(
      (Date.now() - new Date(task.completed_at)) / (24 * 60 * 60 * 1000)
    );
    return daysSinceCompletion <= 3 ? 'bloom' : 'bud';
  }

  getMatchLevel(score) {
    if (score >= 90) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  }
}

module.exports = GardenService;
