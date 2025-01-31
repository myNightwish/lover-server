const Service = require('egg').Service;

class QuestionnaireService extends Service {
  /**
   * 获取用户的问卷列表
   */
  async getUserQuestionnaires(user) {
    const userId = user.id;
    const { ctx } = this;

    try {
      // 获取所有问卷模板
      const templates = await ctx.model.QuestionnaireTemplate.findAll({
        include: [
          {
            model: ctx.model.QuestionnaireType,
            as: 'type',
          },
        ],
        order: [['created_at', 'ASC']],
      });

      // 获取用户已完成的问卷
      const completedQuestionnaires = await ctx.model.UserQuestionnaire.findAll(
        {
          where: {
            user_id: userId,
            status: 1,
          },
        }
      );
      // 获取用户的所有答案
      const userAnswers = await ctx.model.UserAnswer.findAll({
        where: {
          user_questionnaire_id: {
            [ctx.app.Sequelize.Op.in]: completedQuestionnaires.map((q) => q.id),
          },
        },
      });
      console.log('userAnswers--->', userAnswers);
      // 处理每个问卷的状态
      return templates.map((template) => {
        const completed = completedQuestionnaires.find(
          (q) => q.template_id === template.id
        );
        const locked =
          template.type && template.type.need_partner && !user.partner_id;

        // 获取属于当前问卷模板的用户答案
        const answers = completed
          ? userAnswers
              .filter((answer) => answer.user_questionnaire_id === completed.id)
              .map((answer) => ({
                questionId: answer.question_id,
                answer: answer.answer,
              }))
          : [];

        return {
          id: template.id,
          title: template.title,
          description: template.description,
          type: template.type,
          status: completed ? 'completed' : locked ? 'locked' : 'available',
          completedAt: completed?.created_at,
          answers, // 添加答案到返回数据
        };
      });
    } catch (error) {
      ctx.logger.error(
        '[QuestionnaireService] Get user questionnaires failed:',
        error
      );
      throw error;
    }
  }

  /**
   * 获取问卷详情
   */
  async getQuestionnaireDetail(templateId) {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const template = await ctx.model.QuestionnaireTemplate.findOne({
        where: { id: templateId },
        include: [
          {
            model: ctx.model.QuestionnaireType,
            as: 'type',
          },
          {
            model: ctx.model.QuestionTemplate,
            as: 'questions',
            include: [
              {
                model: ctx.model.QuestionnaireDimension,
                as: 'dimension',
              },
            ],
          },
        ],
      });

      if (!template) {
        throw new Error('问卷不存在');
      }

      // 检查权限
      if (template.type?.need_partner && !ctx.user.partner_id) {
        throw new Error('需要先绑定伴侣才能查看此问卷');
      }

      // 获取用户问卷
      const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
        where: {
          user_id: userId,
          template_id: templateId,
        },
      });
      console.log('userQuestionnaire--', userQuestionnaire);

      if (!userQuestionnaire) {
        // 如果用户未完成此问卷，返回问卷模板数据
        console.log('template--', template);
        return template;
      }

      // 获取用户答案
      const userAnswers = await ctx.model.UserAnswer.findAll({
        where: {
          user_id: userId,
          user_questionnaire_id: userQuestionnaire.id,
        },
        attributes: ['question_id', 'answer'], // 只查询必要字段
      });

      // 将模板的 questions 转换为 JSON 数据
      const questionsWithAnswers = template.questions.map((question, idx) => {
        // 查找当前问题对应的用户答案
        const matchedAnswer = userAnswers.find(
          (answer) => answer.question_id === idx
        );

        // 转换为普通 JSON 对象并添加 answer
        return {
          ...question.get(), // 转为普通对象
          answer: matchedAnswer ? matchedAnswer.answer : null, // 添加答案字段
        };
      });
      console.log('questionsWithAnswers--->', questionsWithAnswers);

      // 更新模板对象中的 questions
      return{
        ...template.get(), // 转为普通对象
        questions: questionsWithAnswers, // 使用新结构替换原始 questions
      };

    } catch (error) {
      ctx.logger.error(
        '[QuestionnaireService] Get questionnaire detail failed:',
        error
      );
      throw error;
    }
  }

  /**
   * 提交问卷答案
   */
  async submitQuestionnaire(userId, templateId, answers) {
    const { ctx } = this;

    try {
      // 验证问卷
      const template = await ctx.model.QuestionnaireTemplate.findOne({
        where: { id: templateId },
        include: [
          {
            model: ctx.model.QuestionnaireType,
            as: 'type',
          },
        ],
      });

      if (!template) {
        throw new Error('问卷不存在');
      }

      // 检查权限
      if (template.type?.need_partner && !ctx.user.partner_id) {
        throw new Error('需要先绑定伴侣才能提交此问卷');
      }

      // 创建用户问卷记录
      const [userQuestionnaire, created] =
        await ctx.model.UserQuestionnaire.findOrCreate({
          where: {
            user_id: userId,
            template_id: templateId,
          },
          defaults: {
            status: 1, // 默认创建时的值
          },
        });
      // 如果已存在记录且需要更新 status
      if (!created) {
        await userQuestionnaire.update({ status: 1 });
      }

      // 保存答案
      const bulkAnswers = answers.map((answer) => ({
        user_id: userId,
        user_questionnaire_id: userQuestionnaire.id,
        question_id: answer.questionId,
        answer: answer.answer,
      }));
      console.log('bulkAnswers---->:', bulkAnswers);

      await ctx.model.UserAnswer.bulkCreate(bulkAnswers);
      // 更新问卷状态为已完成
      await userQuestionnaire.update({ status: 1 });

      // 如果是需要同步的问卷，检查伴侣是否也完成了
      if (template.type?.need_sync) {
        await this.checkCoupleMatch(userId, templateId);
      }
      // 如果是了解类问卷，检查是否可以生成分析
      // else if (
      //   ['self_awareness', 'partner_awareness'].includes(template.type.code)
      // ) {
      //   await this.checkAwarenessAnalysis(userId, template.type.code);
      // }

      return userQuestionnaire;
    } catch (error) {
      ctx.logger.error(
        '[QuestionnaireService] Submit questionnaire failed:',
        error
      );
      throw error;
    }
  }

  /**
   * 检查默契PK结果
   */
  async checkCoupleMatch(userId, templateId) {
    const { ctx } = this;

    const user = await ctx.model.WxUser.findByPk(userId);
    if (!user.partner_id) return;

    // 获取双方的答案
    const [userAnswers, partnerAnswers] = await Promise.all([
      this.getLatestAnswers(userId, templateId),
      this.getLatestAnswers(user.partner_id, templateId),
    ]);

    if (!partnerAnswers) return;

    // 计算匹配度
    const matchResult = this.calculateMatchScore(userAnswers, partnerAnswers);

    // 创建匹配结果
    await ctx.model.QuestionnaireMatch.create({
      user_id: userId,
      partner_id: user.partner_id,
      template_id: templateId,
      match_score: matchResult.score,
      details: matchResult.details,
    });
  }

  /**
   * 检查了解类问卷分析
   */
  async checkAwarenessAnalysis(userId, typeCode) {
    const { ctx } = this;
    const user = ctx.user;

    if (!user.partner_id) return;

    // 获取自我认知和伴侣认知的问卷ID
    const templates = await ctx.model.QuestionnaireTemplate.findAll({
      where: {
        '$type.code$': ['self_awareness', 'partner_awareness'],
      },
      include: [
        {
          model: ctx.model.QuestionnaireType,
          as: 'type',
        },
      ],
    });

    const selfTemplate = templates.find(
      (t) => t.type.code === 'self_awareness'
    );
    const partnerTemplate = templates.find(
      (t) => t.type.code === 'partner_awareness'
    );

    // 检查双方是否都完成了问卷
    const [selfAnswers, partnerAnswers] = await Promise.all([
      this.getLatestAnswers(userId, selfTemplate.id),
      this.getLatestAnswers(user.partner_id, partnerTemplate.id),
    ]);

    if (!selfAnswers || !partnerAnswers) return;

    // 生成分析报告
    const analysis = await this.generateAwarenessAnalysis(
      selfAnswers,
      partnerAnswers
    );

    // 创建分析结果
    await ctx.model.QuestionnaireAnalysis.create({
      user_id: userId,
      partner_id: user.partner_id,
      content: analysis,
    });
  }

  /**
   * 获取最新答案
   */
  async getLatestAnswers(userId, templateId) {
    const { ctx } = this;

    const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
      where: {
        user_id: userId,
        template_id: templateId,
        status: 1,
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: ctx.model.UserAnswer,
          as: 'answers',
          include: [
            {
              model: ctx.model.QuestionTemplate,
              include: [
                {
                  model: ctx.model.QuestionnaireDimension,
                  as: 'dimension',
                },
              ],
            },
          ],
        },
      ],
    });

    return userQuestionnaire?.answers || null;
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(userAnswers, partnerAnswers) {
    let totalScore = 0;
    const details = [];

    userAnswers.forEach((userAnswer) => {
      const partnerAnswer = partnerAnswers.find(
        (a) =>
          a.question_template.dimension_id ===
          userAnswer.question_template.dimension_id
      );

      if (partnerAnswer) {
        const similarity = this.calculateAnswerSimilarity(
          userAnswer.answer,
          partnerAnswer.answer
        );

        totalScore +=
          similarity * userAnswer.question_template.dimension.weight;

        details.push({
          dimension: userAnswer.question_template.dimension.name,
          userAnswer: userAnswer.answer,
          partnerAnswer: partnerAnswer.answer,
          similarity,
          weight: userAnswer.question_template.dimension.weight,
        });
      }
    });

    return {
      score: Math.round(totalScore / 100), // 转换为百分制
      details,
    };
  }

  /**
   * 计算答案相似度
   */
  calculateAnswerSimilarity(answer1, answer2) {
    // 简单实现：完全相同100%，否则0%
    // TODO: 使用更复杂的文本相似度算法
    return answer1.toLowerCase() === answer2.toLowerCase() ? 1 : 0;
  }

  /**
   * 生成认知分析报告
   */
  async generateAwarenessAnalysis(selfAnswers, partnerAnswers) {
    // 按维度分组分析
    const dimensionAnalysis = {};

    selfAnswers.forEach((selfAnswer) => {
      const partnerAnswer = partnerAnswers.find(
        (a) =>
          a.question_template.dimension_id ===
          selfAnswer.question_template.dimension_id
      );

      if (partnerAnswer) {
        const dimension = selfAnswer.question_template.dimension.name;
        if (!dimensionAnalysis[dimension]) {
          dimensionAnalysis[dimension] = {
            matches: 0,
            mismatches: 0,
            details: [],
          };
        }

        const similarity = this.calculateAnswerSimilarity(
          selfAnswer.answer,
          partnerAnswer.answer
        );

        dimensionAnalysis[dimension].details.push({
          question: selfAnswer.question_template.question_text,
          selfAnswer: selfAnswer.answer,
          partnerAnswer: partnerAnswer.answer,
          matched: similarity > 0.7,
        });

        if (similarity > 0.7) {
          dimensionAnalysis[dimension].matches++;
        } else {
          dimensionAnalysis[dimension].mismatches++;
        }
      }
    });

    return {
      dimensions: dimensionAnalysis,
      summary: this.generateAnalysisSummary(dimensionAnalysis),
    };
  }

  /**
   * 生成分析总结
   */
  generateAnalysisSummary(dimensionAnalysis) {
    let totalMatches = 0;
    let totalQuestions = 0;
    const dimensionInsights = [];

    Object.entries(dimensionAnalysis).forEach(([dimension, analysis]) => {
      totalMatches += analysis.matches;
      totalQuestions += analysis.matches + analysis.mismatches;

      const matchRate =
        analysis.matches / (analysis.matches + analysis.mismatches);
      dimensionInsights.push({
        dimension,
        matchRate,
        needImprovement: matchRate < 0.6,
      });
    });

    const overallMatchRate = totalMatches / totalQuestions;

    return {
      overallMatchRate,
      dimensionInsights,
      suggestion: this.generateSuggestion(overallMatchRate, dimensionInsights),
    };
  }

  /**
   * 生成建议
   */
  generateSuggestion(overallMatchRate, dimensionInsights) {
    const suggestions = [];

    if (overallMatchRate < 0.6) {
      suggestions.push('建议增加日常交流的频率，多分享各自的想法和感受');
    }

    dimensionInsights
      .filter((insight) => insight.needImprovement)
      .forEach((insight) => {
        suggestions.push(
          `在${insight.dimension}方面的理解存在差异，建议多关注对方在这方面的表现和需求`
        );
      });

    return suggestions;
  }
}

module.exports = QuestionnaireService;
