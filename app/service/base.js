class BaseService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async processGPTRequest(conversationId, question) {
    console.log('helloo--', conversationId, question);
    try {
      // 更新会话状态为处理中
      await this.updateConversationStatus(conversationId, 'processing');
      console.log('processing');
      // 调用OpenAI API
      const { answer, tokenCount } = await this.ctx.service.openai.generateResponse(question);
      console.log('dffff', answer, tokenCount);
      // 更新会话状态为完成
      await this.updateConversationStatus(conversationId, 'completed', answer, tokenCount);

      return { success: true, answer, tokenCount };
    } catch (error) {
      // 更新会话状态为失败
      await this.updateConversationStatus(conversationId, 'failed', null, 0, error.message);
      return { success: false, error: error.message };
    }
  }

  async updateConversationStatus(conversationId, status, answer = null, tokenCount = 0, error = null) {
    const conversation = await this.ctx.model.Conversation.findByPk(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }
    conversation.status = status;
    if (answer) conversation.answer = answer;
    if (tokenCount) conversation.tokenCount = tokenCount;
    if (error) conversation.error = error;

    await conversation.save();

    // 更新Redis缓存
    await this.ctx.app.redis.set(
      `chat:${conversationId}`,
      JSON.stringify(this.ctx.helper.formatConversation(conversation)),
      'EX',
      3600
    );
  }
}
module.exports = BaseService;
