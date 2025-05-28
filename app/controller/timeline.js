const Controller = require('egg').Controller;

class TimelineController extends Controller {
  async createMemory() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const partnerId = ctx.state.user.partner_id;
    const memoryData = ctx.request.body;

    // 如果未绑定伴侣，返回错误信息
    if (!partnerId) {
      ctx.body = {
        success: false,
        message: '未找到绑定关系，无法创建记忆'
      };
      return;
    }

    try {
      const result = await ctx.service.timeline.createMemory(userId, partnerId, memoryData);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  async getMemories() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const partnerId = ctx.state.user.partner_id;

    if (!partnerId) {
      ctx.body = {
        success: false,
        message: '未找到绑定关系，无法获取记忆'
      };
      return;
    }

    try {
      const result = await ctx.service.timeline.getMemories(userId, partnerId);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  async getMemoryDetail() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const memoryId = ctx.params.id;

    try {
      const result = await ctx.service.timeline.getMemoryDetail(userId, memoryId);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  async addComment() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { memoryId, content } = ctx.request.body;

    if (!memoryId || !content) {
      ctx.body = {
        success: false,
        message: '参数不完整'
      };
      return;
    }

    try {
      const result = await ctx.service.timeline.addComment(userId, memoryId, content);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }

  async deleteMemory() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const memoryId = ctx.params.id;

    try {
      const result = await ctx.service.timeline.deleteMemory(userId, memoryId);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = TimelineController;