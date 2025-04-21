const Controller = require('egg').Controller;
const Joi = require('joi');

class ChatController extends Controller {
  async start() {
    const { ctx } = this;
    const { question } = ctx.request.body;
    try {
      // 验证请求参数
      const { error } = Joi.object({
        question: Joi.string().required().min(1)
          .max(1000),
      }).validate({ question });
      // 如果验证失败，抛出一个错误
      if (error) {
        throw new Error('Invalid question parameter');
      }
      const userId = ctx.state.user.id;
      // 创建会话记录
      const conversation = await ctx.model.Conversation.create({
        userId,
        question,
        status: 'pending',
      });
      // 发送到消息队列
      await ctx.service.queue.publishMessage({
        conversationId: conversation.id,
        question,
      });

      // 缓存会话状态到Redis
      await ctx.app.redis.set(
        `chat:${conversation.id}`,
        JSON.stringify({ status: 'pending' }),
        'EX',
        3600
      );
      const callback = async data => {
        // 假设这里有个service方法来处理消息数据，比如保存到数据库
        await this.service.base.processGPTRequest(data.conversationId, data.question);
      };
      // 启动消费者进程开始监听队列消息并处理
      await ctx.service.queue.startConsumer(callback);

      ctx.body = ctx.helper.success({
        conversationId: conversation.id,
        status: 'pending',
      });
    } catch (error) {
      ctx.body = ctx.helper.error(error.message);
    }
  }

  async query() {
    const { ctx } = this;
    const { id } = ctx.params;
    try {
      // 先从Redis查询
      const cached = await ctx.app.redis.get(`chat:${id}`);

      if (cached) {
        const data = JSON.parse(cached);
        ctx.body = ctx.helper.success(data);
        return;
      }

      // Redis没有则查询数据库
      const conversation = await ctx.model.Conversation.findByPk(id);
      if (!conversation) {
        throw new ctx.helper.NotFoundError('Conversation not found');
      }

      // 更新Redis缓存
      await ctx.app.redis.set(
        `chat:${conversation.id}`,
        JSON.stringify(ctx.helper.formatConversation(conversation)),
        'EX',
        3600
      );

      ctx.body = ctx.helper.success(ctx.helper.formatConversation(conversation));
    } catch (error) {
      ctx.body = ctx.helper.error(error.message);
    }
  }

  async history() {
    const { ctx } = this;
    const { page = 1, pageSize = 10 } = ctx.query;
    const userId = ctx.state.user.id;
    try {
      const result = await ctx.model.Conversation.findByUserId(
        userId,
        parseInt(page),
        parseInt(pageSize)
      );

      ctx.body = ctx.helper.success({
        total: result.count,
        items: result.rows.map(ctx.helper.formatConversation),
      });
    } catch (error) {
      ctx.body = ctx.helper.error(error.message);
    }
  }
}
module.exports = ChatController;
