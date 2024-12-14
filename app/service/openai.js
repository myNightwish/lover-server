const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

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
        model: 'gpt-4-turbo',
        stream: false,
        messages: [
          { role: 'system', content: '请用奖励小狐狸萌宠的徽章图片的方式鼓励我做到更棒的事' },
          { role: 'user', content: question },
        ],
      });

      return {
        answer: completion.choices[0].message.content,
        tokenCount: completion.usage.total_tokens,
      };
    } catch (error) {
      throw new AppError(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * 分析问卷结果并生成专业建议
   * @param root0
   * @param root0.scores
   * @param root0.analysis
   * @param root0.userId
   */
  async analyze({ scores, analysis, userId }) {
    const { ctx } = this;
    // 构建GPT提示
    const prompt = this.buildAnalysisPrompt(scores, analysis);

    try {
      // 调用GPT API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        stream: false,
        messages: [
          { role: 'system', content: '你是一位专业资深心理专家，专注于关系咨询和亲密成长' },
          { role: 'user', content: prompt },
        ],
      });

      // 解析GPT响应
      // const analysis = this.parseGptResponse(completion.choices[0].message.content);
      const analysis = completion.choices[0].message.content;
      // 保存分析结果
      await this.saveAnalysisResult(userId, analysis);

      return analysis;
    } catch (error) {
      ctx.logger.error('GPT API调用失败:', error);
      return this.getFallbackAnalysis(scores);
    }
  }

  /**
     * 构建GPT分析提示
     * @param scores
     * @param analysis
     */
  buildAnalysisPrompt(scores, analysis) {
    const scoreText = scores.map(s =>
      `${s.name}: ${s.score}分 (权重: ${s.weight}%)`
    ).join('\n');

    return `请基于以下维度得分进行专业的关系分析和建议：
  
  得分情况：
  ${scoreText}
  请提供：
  1. 总体关系状况分析
  2. 各维度详细解读
  3. 具体改进建议
  4. 发展潜力评估
差异分析：分析双方问卷中明显的差异部分，作为后续沟通的重点。
预测模型：通过分析以往数据，预测关系的发展趋势。
关系调节工具：基于问卷结果生成定制化建议，如推荐更有效的沟通技巧或冲突解决策略。
`;
  }

  /**
     * 解析GPT响应
     * @param content
     */
  parseGptResponse(content) {
    // 简单的响应解析示例
    const sections = content.split('\n\n');

    return {
      summary: sections[0],
      interpretations: this.extractInterpretations(sections[1]),
      suggestions: this.extractSuggestions(sections[2]),
      potential: sections[3],
    };
  }

  /**
     * 保存分析结果
     * @param userId
     * @param analysis
     */
  async saveAnalysisResult(userId, analysis) {
    const { ctx } = this;

    await ctx.model.AnalysisResult.create({
      user_id: userId,
      content: JSON.stringify(analysis),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
     * 获取备用分析结果
     * @param scores
     */
  getFallbackAnalysis(scores) {
    return {
      summary: '基于当前得分进行的基础分析',
      interpretations: scores.reduce((acc, s) => {
        acc[s.name] = `${s.name}维度得分为${s.score}分`;
        return acc;
      }, {}),
      suggestions: [ '保持开放和诚实的沟通', '共同制定改进计划', '定期进行感情交流' ],
      potential: '关系具有良好的发展潜力，通过共同努力可以达到更好的状态。',
    };
  }
}
module.exports = OpenAIService;
