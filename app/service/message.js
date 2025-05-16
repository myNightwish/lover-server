const Service = require('egg').Service;

class MessageService extends Service {
  /**
   * 创建消息
   */
  async createMessage(data) {
    const { ctx } = this;
    console.log('enter--message:', data);

    try {
      // 验证用户ID和发送者ID是否存在
      if (!data.userId) {
        throw new Error('接收者ID不能为空');
      }
      
      // 验证用户是否存在
      const receiver = await ctx.model.User.findByPk(data.userId);
      if (!receiver) {
        throw new Error(`接收者用户(ID: ${data.userId})不存在`);
      }
      
      // 如果有发送者ID，验证发送者是否存在
      if (data.senderId) {
        const sender = await ctx.model.User.findByPk(data.senderId);
        if (!sender) {
          throw new Error(`发送者用户(ID: ${data.senderId})不存在`);
        }
      }
      
      // 创建消息
      const message = await ctx.model.UserMessage.create({
        user_id: data.userId,
        sender_id: data.senderId || null, // 如果没有发送者ID，设置为null
        type: data.type,
        title: data.title,
        is_read: !!data.isRead,
        content: data.content,
        related_id: data.relatedId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log('enter--message done:', message);
      return message;
    } catch (error) {
      ctx.logger.error('创建消息失败', error);
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
            model: ctx.model.User,
            as: 'sender',
            attributes: ['id', 'nickname', 'avatarUrl'],
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
