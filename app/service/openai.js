const OpenAI = require('openai');

class OpenAIService {
  constructor(ctx) {
    this.ctx = ctx;
    this.openai = new OpenAI({
      apiKey: ctx.app.config.openai.apiKey,
      baseURL: ctx.app.config.openai.baseURL,
    });
  }

  async generateResponse(question) {
    console.log(
      'enter generateResponse ---->',
      this.openai.chat.completions.create
    );
      const completion1 = await this.openai.chat.completions.create({
        model: 'Atom-7B-Chat',
        // stream: false,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: '你是一位专业资深心理专家，专注于关系咨询和亲密成长',
          },
          // { role: 'user', content: question },
          { role: 'user', content: '请介绍一下Llama社区' },
        ],
      });
      console.log('completion1 ---->', completion1);
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'Atom-7B-Chat',
        // stream: false,
        temperature: 0.3,
        messages: [
          // {
          //   role: 'system',
          //   content: '你是一位专业资深心理专家，专注于关系咨询和亲密成长',
          // },
          // { role: 'user', content: question },
          { role: 'user', content: '请介绍一下Llama社区' },
        ],
      });
      console.log('completion ---->', completion)
      return {
        answer: completion?.choices?.[0]?.message?.content || '🤔 哇偶，出现了什么问题',
        tokenCount: completion?.usage.total_tokens,
      };
    } catch (error) {
      return {
        answer: '😭  token已经用尽...',
      };
    }
  }
  /**
   * 分析问卷结果并生成专业建议
   * @param root0
   * @param root0.scores
   * @param root0.analysis
   * @param root0.userId
   * @param root0.questionnaireId
   * @param root0.analysisId
   */
  async analyze({ scores, userId, questionnaireId, analysisId }) {
    const { ctx } = this;
    // 构建GPT提示
    const prompt = this.buildAnalysisPrompt(scores);

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
      const res = await this.generateResponse(prompt);
      const analysis = res.answer || '';
      // 保存分析结果
      await this.saveAnalysisResult(userId, analysis, questionnaireId, analysisId);

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
  buildAnalysisPrompt(scores) {
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
     * 保存分析结果
     * @param userId
     * @param analysis
     * @param questionnaireId
     * @param analysisId
     */
  async saveAnalysisResult(userId, analysis, questionnaireId, analysisId) {
    const { ctx } = this;

    await ctx.model.GptAnalysis.create({
      user_id: userId,
      questionnaire_id: questionnaireId,
      content: JSON.stringify(analysis),
      created_at: new Date(),
      updated_at: new Date(),
      status: 'completed',
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
  /**
   * 创建GPT分析任务
   * @param userId
   * @param questionnaireId
   * @param scores
   */
  async createAnalysisTask(userId, questionnaireId, scores) {
    const { ctx } = this;

    try {
      // 检查是否已存在待处理的分析任务
      const existingAnalysis = await ctx.model.GptAnalysis.findOne({
        where: {
          user_id: userId,
          questionnaire_id: questionnaireId,
          status: 'pending',
        },
      });

      if (existingAnalysis) {
        return existingAnalysis.id;
      }

      // 创建新的分析任务
      const gptAnalysis = await ctx.model.GptAnalysis.create({
        user_id: userId,
        questionnaire_id: questionnaireId,
        status: 'pending',
      });

      // 异步处理GPT分析
      this.handleGptAnalysis(gptAnalysis.id, scores, questionnaireId).catch(error => {
        ctx.logger.error('[AnalysisQueue] GPT analysis failed:', error);
      });

      return gptAnalysis.id;
    } catch (error) {
      ctx.logger.error('[AnalysisQueue] Create analysis task failed:', error);
      throw new Error('创建分析任务失败');
    }
  }

  /**
     * 异步处理GPT分析
     * @param analysisId
     * @param scores
     * @param questionnaireId
     * @param retryCount
     */
  async handleGptAnalysis(analysisId, scores, questionnaireId, retryCount = 0) {
    const { ctx } = this;
    const MAX_RETRIES = 3;

    try {
      const gptAnalysis = await ctx.model.GptAnalysis.findByPk(analysisId);
      if (!gptAnalysis) {
        throw new Error('Analysis task not found');
      }

      // 调用GPT服务生成分析
      await ctx.service.openai.analyze({
        scores,
        userId: gptAnalysis.user_id,
        questionnaireId,
        analysisId,
      });

      // 更新分析结果
      // await gptAnalysis.update({
      //   content: JSON.stringify(analysis),
      //   status: 'completed',
      // });
    } catch (error) {
      ctx.logger.error(`[AnalysisQueue] GPT analysis attempt ${retryCount + 1} failed:`, error);

      if (retryCount < MAX_RETRIES) {
        // 重试
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.handleGptAnalysis(analysisId, scores, questionnaireId, retryCount + 1);
      }

      // 更新失败状态
      await ctx.model.GptAnalysis.update({
        status: 'failed',
      }, {
        where: { id: analysisId },
      });

      throw error;
    }
  }

  /**
   * 获取分析结果
   * @param userId
   * @param questionnaireId
   * @param analyzeId
   */
  async getAnalysisGptResult(userId, questionnaireId, analyzeId) {
    const { ctx } = this;

    try {
      const analysis = await ctx.model.GptAnalysis.findOne({
        where: {
          user_id: userId,
          questionnaire_id: questionnaireId,
          id: analyzeId,
        },
        order: [[ 'created_at', 'DESC' ]],
        include: [{
          model: ctx.model.User,
          as: 'user',
        }, {
          model: ctx.model.QuestionnaireTemplate,
          as: 'questionnaire',
          attributes: [ 'id', 'title' ],
        }],
      });

      return analysis;
    } catch (error) {
      ctx.logger.error('[AnalysisQueue] Get analysis result failed:', error);
      throw new Error('获取分析结果失败');
    }
  }

  async analyzeSimilarity(text1, text2) {
    // 调用OpenAI API分析文本相似度
    try {
      const prompt = `比较以下两段文本的相似度(返回0-1之间的数值):\n文本1: ${text1}\n文本2: ${text2}`;
      const response = await this.generateResponse(prompt);
      return parseFloat(response) || 0.5;
    } catch (error) {
      this.ctx.logger.error('[OpenAI] Similarity analysis failed:', error);
      return 0.5; // 默认返回中等相似度
    }
  }

  async generateEmotionSuggestion(trend) {
    try {
      const prompt = `基于以下情绪数据生成建议:\n${JSON.stringify(trend)}`;
      return await this.generateResponse(prompt);
    } catch (error) {
      this.ctx.logger.error('[OpenAI] Emotion suggestion failed:', error);
      return '继续保持积极的心态，多关注伴侣的情绪变化。';
    }
  }

  async generateConflictSuggestion(analysis) {
    try {
      const prompt = `基于以下冲突分析生成建议:\n${JSON.stringify(analysis)}`;
      return await this.generateResponse(prompt);
    } catch (error) {
      return '建议保持开放和理性的沟通态度，共同寻找解决方案。';
    }
  }
}
module.exports = OpenAIService;
