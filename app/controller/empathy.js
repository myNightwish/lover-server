const Controller = require('egg').Controller;

class EmpathyController extends Controller {
  async getTasks() {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const tasks = await ctx.service.empathy.getAvailableTasks(userId);
      ctx.body = {
        success: true,
        data: tasks
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  async completeTask() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { taskId, response } = ctx.request.body;

    try {
      const result = await ctx.service.empathy.completeTask(userId, taskId, response);
      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  async getProgress() {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const progress = await ctx.service.empathy.getUserProgress(userId);
      ctx.body = {
        success: true,
        data: progress
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = EmpathyController;