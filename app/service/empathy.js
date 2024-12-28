const Service = require('egg').Service;

class EmpathyService extends Service {
  async getAvailableTasks(userId) {
    const { ctx } = this;

    const tasks = await ctx.model.EmpathyTask.findAll({
      where: {
        status: 'active',
      },
      include: [{
        model: ctx.model.UserTask,
        as: 'user_tasks',
        where: {
          user_id: userId,
          completed: false,
        },
        required: false,
      }],
    });

    return tasks.filter(task => !task.user_tasks?.length);
  }

  async completeTask(userId, taskId, response) {
    const { ctx } = this;

    // 开启事务
    const result = await ctx.model.transaction(async transaction => {
      // 获取或创建用户进度
      let progress = await ctx.model.UserProgress.findOne({
        where: { user_id: userId },
        transaction,
      });

      if (!progress) {
        progress = await ctx.model.UserProgress.create({
          user_id: userId,
          experience: 0,
        }, { transaction });
      }

      // 记录任务完成
      const userTask = await ctx.model.UserTask.create({
        user_id: userId,
        task_id: taskId,
        response,
        completed: true,
        completed_at: new Date(),
      }, { transaction });

      // 计算获得的经验值
      const task = await ctx.model.EmpathyTask.findByPk(taskId);
      const expGained = task.exp_reward;

      // 更新用户经验值
      await progress.increment('experience', {
        by: expGained,
        transaction,
      });

      return {
        taskId,
        expGained,
        completedAt: userTask.completed_at,
      };
    });

    return result;
  }

  async getUserProgress(userId) {
    const { ctx } = this;

    // 获取或创建用户进度
    let progress = await ctx.model.UserProgress.findOne({
      where: { user_id: userId },
    });

    if (!progress) {
      progress = await ctx.model.UserProgress.create({
        user_id: userId,
        experience: 0,
      });
    }

    const completedTasks = await ctx.model.UserTask.findAll({
      where: {
        user_id: userId,
        completed: true,
      },
      include: [{
        model: ctx.model.EmpathyTask,
        as: 'task',
      }],
      order: [[ 'completed_at', 'DESC' ]],
      limit: 5,
    });

    return {
      level: this.calculateLevel(progress.experience),
      experience: progress.experience,
      completedTasks: completedTasks.length,
      recentTasks: completedTasks,
    };
  }

  calculateLevel(experience) {
    // 简单的等级计算公式
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }
  async getCurrentTask(userId) {
    const { ctx } = this;

    // 获取用户当前未完成的任务
    const currentTask = await ctx.model.UserTask.findOne({
      where: {
        user_id: userId,
        completed: false,
      },
      include: [{
        model: ctx.model.EmpathyTask,
        as: 'task',
      }],
      order: [[ 'created_at', 'DESC' ]],
    });

    // 如果没有进行中的任务，分配一个新任务
    if (!currentTask) {
      const newTask = await this.assignNewTask(userId);
      return newTask;
    }

    return currentTask;
  }
}

module.exports = EmpathyService;
