const Controller = require('egg').Controller;

class MessageController extends Controller {
  /**
   * 获取消息列表
   */
  async getMessages() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 20 } = ctx.query;

    try {
      const result = await ctx.service.message.getUserMessages(
        userId,
        parseInt(page),
        parseInt(pageSize)
      );

      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 标记消息已读
   */
  async markAsRead() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { messageId } = ctx.params;

    try {
      await ctx.service.message.markAsRead(messageId, userId);

      ctx.body = {
        success: true,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = MessageController;
