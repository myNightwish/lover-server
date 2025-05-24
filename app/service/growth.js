const Service = require('egg').Service;

class GrowthService extends Service {
  async getUserMilestones(userId) {
    const { ctx } = this;

    // 获取用户的所有成长记录
    const [ emotions, conflicts, puzzles, tasks ] = await Promise.all([
      ctx.model.EmotionRecord.findAll({
        where: { user_id: userId },
        order: [[ 'created_at', 'DESC' ]],
        limit: 5,
      }),
      ctx.model.ConflictRecord.findAll({
        where: { user_id: userId },
        order: [[ 'created_at', 'DESC' ]],
        limit: 5,
      }),
      ctx.model.MemoryPuzzle.findAll({
        where: { user_id: userId },
        order: [[ 'created_at', 'DESC' ]],
        limit: 5,
      }),
      ctx.model.UserTask.findAll({
        where: {
          user_id: userId,
          completed: true,
        },
        order: [[ 'completed_at', 'DESC' ]],
        limit: 5,
        include: [{
          model: ctx.model.EmpathyTask,
          as: 'task',
        }],
      }),
    ]);

    // 合并所有记录并按时间排序
    const allEvents = [
      ...this.formatEmotionMilestones(emotions),
      ...this.formatConflictMilestones(conflicts),
      ...this.formatPuzzleMilestones(puzzles),
      ...this.formatTaskMilestones(tasks),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return allEvents.slice(0, 10); // 返回最近的10个里程碑
  }

  formatEmotionMilestones(emotions) {
    return emotions.map(emotion => ({
      id: `emotion_${emotion.id}`,
      type: 'emotion',
      title: '记录了一次情绪',
      description: `情绪类型: ${emotion.emotion_type}, 强度: ${emotion.intensity}`,
      date: emotion.created_at,
    }));
  }

  formatConflictMilestones(conflicts) {
    return conflicts.map(conflict => ({
      id: `conflict_${conflict.id}`,
      type: 'conflict',
      title: '化解了一次冲突',
      description: conflict.reflection,
      date: conflict.created_at,
    }));
  }

  formatPuzzleMilestones(puzzles) {
    return puzzles.map(puzzle => ({
      id: `puzzle_${puzzle.id}`,
      type: 'memory',
      title: '创建了一个记忆拼图',
      description: puzzle.event_description,
      date: puzzle.created_at,
    }));
  }

  formatTaskMilestones(tasks) {
    return tasks.map(task => ({
      id: `task_${task.id}`,
      type: 'empathy',
      title: '完成了一个共情任务',
      description: task.task.title,
      date: task.completed_at,
    }));
  }

  async getGrowthArchive(userId) {
    const { ctx } = this;

    try {
      // 获取用户的各项统计数据
      const [ emotionCount, conflictCount, puzzleCount, taskCount ] = await Promise.all([
        ctx.model.EmotionRecord.count({ where: { user_id: userId } }),
        ctx.model.ConflictRecord.count({ where: { user_id: userId } }),
        ctx.model.MemoryPuzzle.count({ where: { user_id: userId } }),
        ctx.model.UserTask.count({ where: { user_id: userId, completed: true } }),
      ]);

      // 计算成长指数
      const growthIndex = this.calculateGrowthIndex({
        emotionCount,
        conflictCount,
        puzzleCount,
        taskCount,
      });

      // 获取最近的成长事件
      const recentEvents = await this.getUserMilestones(userId);

      // 生成AI建议
      // const suggestion = await ctx.service.openai.generateGrowthSuggestion({
      //   growthIndex,
      //   recentEvents
      // });
      const suggestion = {
        mainPoint: '继续保持积极情绪，尝试新的共情任务',
        details: [ '尝试新的共情任务，如倾听他人的故事或分享自己的经历', '保持积极情绪，可以通过冥想、运动等方式' ],
      };

      return {
        stats: [
          { label: '情绪共鸣', value: this.calculateEmotionAwareness(emotionCount) },
          { label: '冲突解决', value: this.calculateConflictResolution(conflictCount) },
          { label: '共同回忆', value: this.calculateMemorySharing(puzzleCount) },
          { label: '共情指数', value: this.calculateEmpathyLevel(taskCount) },
        ],
        growthIndex,
        recentEvents,
        suggestion,
      };
    } catch (error) {
      ctx.logger.error('[GrowthService] Get growth archive failed:', error);
      throw new Error('获取成长档案失败');
    }
  }

  calculateGrowthIndex(stats) {
    const weights = {
      emotionCount: 0.25,
      conflictCount: 0.25,
      puzzleCount: 0.25,
      taskCount: 0.25,
    };

    return Object.entries(stats).reduce((total, [ key, value ]) => {
      return total + (value * weights[key]);
    }, 0);
  }

  calculateEmotionAwareness(count) {
    return Math.min(100, count * 5);
  }

  calculateConflictResolution(count) {
    return Math.min(100, count * 10);
  }

  calculateMemorySharing(count) {
    return Math.min(100, count * 15);
  }

  calculateEmpathyLevel(count) {
    return Math.min(100, count * 8);
  }
}

module.exports = GrowthService;
