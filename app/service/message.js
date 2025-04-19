const Service = require('egg').Service;

class MessageService extends Service {
  /**
   * 创建消息
   */
  async createMessage(data) {
    const { ctx } = this;

    try {
      const message = await ctx.model.UserMessage.create({
        user_id: data.userId,
        sender_id: data.senderId,
        type: data.type,
        title: data.title,
        content: data.content,
        related_id: data.relatedId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户消息列表
   */
  async getUserMessages(userId, page = 1, pageSize = 20) {
    const { ctx } = this;

    try {
      const messages = await ctx.model.UserMessage.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        include: [
          {
            model: ctx.model.WxUser,
            as: 'sender',
            attributes: ['id', 'nickName', 'avatarUrl'],
          },
        ],
      });

      return {
        messages: messages.rows,
        total: messages.count,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(messageId, userId) {
    const { ctx } = this;

    try {
      const message = await ctx.model.UserMessage.findOne({
        where: { id: messageId, user_id: userId },
      });

      if (!message) {
        throw new Error('消息不存在');
      }

      await message.update({ is_read: true });
      return message;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MessageService;
