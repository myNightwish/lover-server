const OpenAI = require('openai');
const  {AppError} = require('../utils/errors');

class OpenAIService {
  constructor(ctx) {
    this.ctx = ctx;
    this.openai = new OpenAI({
      apiKey: ctx.app.config.openai.apiKey,
      baseURL: ctx.app.config.openai.baseURL,
    });
  }

  async generateResponse(question) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        stream: false,
        messages: [
            { role: "system", content: "请用奖励小狐狸萌宠的徽章图片的方式鼓励我做到更棒的事" },
            { role: "user", content: question }
        ]
      });

      return {
        answer: completion.choices[0].message.content,
        tokenCount: completion.usage.total_tokens,
      };
    } catch (error) {
      throw new AppError(`OpenAI API error: ${error.message}`);
    }
  }
}
module.exports = OpenAIService;