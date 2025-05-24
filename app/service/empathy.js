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
        progress = await ctx.model.UserProgress.create(
          {
            user_id: userId,
            experience: 0,
            created_at: new Date(),
          },
          { transaction }
        );
      }
      // 查找现有的用户任务记录
      let userExistTask = await ctx.model.UserTask.findOne({
        where: {
          user_id: userId,
          task_id: taskId,
          completed: false,
        },
        transaction,
      });

      if (!userExistTask) {
        return {
          taskId,
          desc: '任务已完成或不存在',
        };
      }
      // 更新任务状态
      await userExistTask.update(
        {
          response,
          completed: true,
          completed_at: new Date(),
          updated_at: new Date(),
        },
        { transaction }
      );

      // 计算获得的经验值
      const task = await ctx.model.EmpathyTask.findByPk(taskId);
      const expGained = task.exp_reward;

      // 同时更新经验值和更新时间
      await progress.update(
        {
          experience: progress.experience + expGained,
          updated_at: new Date(),
        },
        { transaction }
      );

      return {
        taskId,
        expGained,
        completedAt: userExistTask.completed_at,
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
  async assignNewTask(userId) {
    const { ctx } = this;

    try {
      // 获取用户已完成的任务ID列表
      const completedTaskIds = await ctx.model.UserTask.findAll({
        where: {
          user_id: userId,
          completed: true,
        },
        attributes: [ 'task_id' ],
      }).then(tasks => tasks.map(t => t.task_id));

      // 先检查是否还有可用任务
      const availableTasks = await ctx.model.EmpathyTask.findAll({
        where: {
          status: 'active',
          id: {
            [ctx.model.Sequelize.Op.notIn]: completedTaskIds.length ? completedTaskIds : [ 0 ],
          },
        },
      });

      if (!availableTasks.length) {
        // 如果没有可用任务，重置所有任务为未完成
        await ctx.model.UserTask.destroy({
          where: {
            user_id: userId,
          },
        });

        // 重新获取所有活跃任务
        const allTasks = await ctx.model.EmpathyTask.findAll({
          where: {
            status: 'active',
          },
        });


        // 随机选择一个任务
        const randomIndex = Math.floor(Math.random() * allTasks.length);
        const selectedTask = allTasks[randomIndex];

        // 创建新的用户任务记录
        const userTask = await ctx.model.UserTask.create({
          user_id: userId,
          task_id: selectedTask.id,
          completed: false,
          created_at: new Date(),
          updated_at: new Date(),
        });

        return {
          ...userTask.toJSON(),
          task: selectedTask,
        };
      }

      // 随机选择一个未完成的任务
      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      const selectedTask = availableTasks[randomIndex];

      // 创建用户任务记录
      const userTask = await ctx.model.UserTask.create({
        user_id: userId,
        task_id: selectedTask.id,
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return {
        ...userTask.toJSON(),
        task: selectedTask,
      };
    } catch (error) {
      ctx.logger.error('[EmpathyService] assignNewTask failed:', error);
      throw new Error('分配新任务失败');
    }
  }
    /**
   * 获取任务历史
   */
    async getTaskHistory(userId) {
      const { ctx } = this;
      
      try {
        const history = await ctx.model.UserTask.findAll({
          where: {
            user_id: userId,
            completed: true
          },
          include: [{
            model: ctx.model.EmpathyTask,
            as: 'task'
          }],
          order: [['completed_at', 'DESC']],
          limit: 10
        });
  
        return history.map(record => ({
          id: record.id,
          taskId: record.task_id,
          title: record.task.title,
          expGained: record.task.exp_reward,
          completedAt: record.completed_at,
          response: record.response
        }));
      } catch (error) {
        ctx.logger.error('[EmpathyService] Get task history failed:', error);
        throw new Error('获取任务历史失败');
      }
    }
}

module.exports = EmpathyService;
