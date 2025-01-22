const Service = require('egg').Service;

class QuestionnaireService extends Service {
  /**
   * 初始化用户问卷
   * @param userId
   */
  async initUserQuestionnaires(userId) {
    const { ctx } = this;

    // 获取所有启用的问卷模板
    const templates = await ctx.model.QuestionnaireTemplate.findAll({
      where: { status: 1 },
      include: [{
        model: ctx.model.QuestionTemplate,
        as: 'questions',
        order: [[ 'order', 'ASC' ]],
      }],
    });

    // 如果没有模板，先创建默认模板
    if (templates.length === 0) {
      await this.createDefaultTemplates();
      return this.initUserQuestionnaires(userId); // 递归调用
    }

    // 使用事务确保数据一致性
    const result = await ctx.model.transaction(async transaction => {
      // 检查用户是否已有问卷
      const existingQuestionnaires = await ctx.model.UserQuestionnaire.findAll({
        where: { user_id: userId },
        attributes: [ 'template_id' ],
        transaction,
      });

      const existingTemplateIds = new Set(existingQuestionnaires.map(q => q.template_id));

      // 批量创建用户问卷
      const newQuestionnaires = templates
        .filter(template => !existingTemplateIds.has(template.id))
        .map(template => ({
          user_id: userId,
          template_id: template.id,
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
        }));

      if (newQuestionnaires.length > 0) {
        await ctx.model.UserQuestionnaire.bulkCreate(newQuestionnaires, { transaction });
      }

      // 返回完整的用户问卷列表
      return this.getUserQuestionnaires(userId, transaction);
    });

    return result;
  }

  /**
     * 创建默认模板
     */
  async createDefaultTemplates() {
    const { ctx } = this;

    // 使用事务确保数据一致性
    await ctx.model.transaction(async transaction => {
      const templates = [
        {
          title: '亲密关系评估问卷',
          description: '基于心理学理论的专业关系评估工具',
          status: 1,
          questions: [
          // 情感连接维度
            {
              dimension_id: 1,
              question_text: '我能够轻松地向伴侣表达我的感受',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 1,
            },
            {
              dimension_id: 1,
              question_text: '当伴侣遇到困难时，我能感受到他/她的情绪',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 2,
            },
            // 沟通质量维度
            {
              dimension_id: 2,
              question_text: '我们能够进行有效的沟通，互相理解对方的观点',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 3,
            },
            {
              dimension_id: 2,
              question_text: '在日常交流中，我们会认真倾听对方的想法',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 4,
            },
            // 冲突处理维度
            {
              dimension_id: 3,
              question_text: '当出现分歧时，我们能够平和地讨论解决方案',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 5,
            },
            {
              dimension_id: 3,
              question_text: '我们能够在争执后达成有效的和解',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 6,
            },
            // 共同成长维度
            {
              dimension_id: 4,
              question_text: '我们会互相支持对方的个人发展和目标',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 7,
            },
            {
              dimension_id: 4,
              question_text: '我们有共同的未来规划和期望',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 8,
            },
          ],
        },
        {
          title: '双方关心度评估问卷',
          description: '基于心理学理论的专业关系评估工具',
          status: 1,
          questions: [
          // 情感连接维度
            {
              dimension_id: 1,
              question_text: '他(她)最喜欢的食物',
              question_type: 'text',
              options: '',
              order: 1,
            },
            {
              dimension_id: 1,
              question_text: '他(她)最喜欢的颜色',
              question_type: 'text',
              options: '',
              order: 2,
            },
            // 沟通质量维度
            {
              dimension_id: 2,
              question_text: '他(她)最喜欢的花',
              question_type: 'text',
              options: '',
              order: 3,
            },
            {
              dimension_id: 2,
              question_text: '他(她)最喜欢的动物',
              question_type: 'text',
              options: '',
              order: 4,
            },
            // 冲突处理维度
            {
              dimension_id: 3,
              question_text: '他(她)最害怕失去的',
              question_type: 'text',
              options: '',
              order: 5,
            },
            {
              dimension_id: 3,
              question_text: '他(她)最喜欢的运动',
              question_type: 'text',
              options: '',
              order: 6,
            },
            // 共同成长维度
            {
              dimension_id: 4,
              question_text: '他(她)渴望但未曾实现的梦想',
              question_type: 'text',
              options: '',
              order: 7,
            },
            {
              dimension_id: 4,
              question_text: '我们有共同的未来规划和期望',
              question_type: 'scale',
              options: JSON.stringify([ 1, 2, 3, 4, 5 ]),
              order: 8,
            },
          ],
        },
      ];
      // 批量创建问卷模板和问题
      for (const template of templates) {
        const questions = template.questions;
        delete template.questions;
        // 检查模板是否已经存在（避免重复创建）
        const existingTemplate = await ctx.model.QuestionnaireTemplate.findOne({
          where: { title: template.title },
          transaction,
        });
        console.log('existingTemplate00', existingTemplate);
        if (existingTemplate) return;

        const createdTemplate = await ctx.model.QuestionnaireTemplate.create(template, { transaction });

        const questionRecords = questions.map(question => ({
          ...question,
          questionnaire_id: createdTemplate.id,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await ctx.model.QuestionTemplate.bulkCreate(questionRecords, { transaction });
      }
    });
  }

  /**
     * 获取用户问卷列表
     * @param userId
     * @param transaction
     */
  async getUserQuestionnaires(userId, transaction) {
    const { ctx } = this;
    const questionnaires = await ctx.model.UserQuestionnaire.findAll({
      where: { user_id: userId },
      include: [{
        model: ctx.model.QuestionnaireTemplate,
        include: [{
          model: ctx.model.QuestionTemplate,
          as: 'questions',
          order: [[ 'order', 'ASC' ]],
        }],
      }],
      order: [[ 'created_at', 'DESC' ]],
      transaction,
    });

    // 格式化返回数据
    return questionnaires.map(questionnaire => ({
      id: questionnaire.id,
      status: questionnaire.status,
      template: {
        id: questionnaire.questionnaire_template.id,
        title: questionnaire.questionnaire_template.title,
        description: questionnaire.questionnaire_template.description,
        questions: questionnaire.questionnaire_template.questions.map(question => ({
          id: question.id,
          text: question.question_text,
          type: question.question_type,
          options: question.options ? JSON.parse(question.options) : null,
          order: question.order,
        })),
      },
    }));
  }

  // 提交问卷答案
  async submitQuestionnaire(userId, questionnaireId, answers) {
    const { ctx } = this;
    const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
      where: {
        user_id: userId,
        template_id: questionnaireId,
      },
    });

    if (!userQuestionnaire) {
      throw new Error('问卷不存在');
    }

    // 保存答案
    const bulkAnswers = answers.map(answer => ({
      user_questionnaire_id: userQuestionnaire.id,
      question_id: answer.questionId,
      answer: answer.answer,
    }));

    await ctx.model.UserAnswer.bulkCreate(bulkAnswers);
    // 更新问卷状态为已完成
    await userQuestionnaire.update({ status: 1 });
    return {
      success: true,
      message: '问卷提交成功',
    };
  }

  // 获取问卷详情
  async getQuestionnaireDetail(userId, questionnaireId) {
    const { ctx } = this;
    const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
      where: {
        template_id: questionnaireId,
        user_id: userId,
      },
      include: [
        {
          model: ctx.model.QuestionnaireTemplate,
          include: [{
            model: ctx.model.QuestionTemplate,
            as: 'questions',
            order: [[ 'order', 'ASC' ]],
          }],
        },
        {
          model: ctx.model.UserAnswer,
          as: 'answers',
          include: [{
            model: ctx.model.QuestionTemplate,
          }],
        },
      ],
    });

    if (!userQuestionnaire) {
      ctx.throw(404, '问卷不存在或无权访问');
    }

    return this.formatQuestionnaireDetail(userQuestionnaire);
  }

  // 格式化问卷详情
  formatQuestionnaireDetail(userQuestionnaire) {
    const template = userQuestionnaire.questionnaire_template;
    const answers = userQuestionnaire.answers;

    return {
      id: userQuestionnaire.id,
      status: userQuestionnaire.status,
      title: template.title,
      description: template.description,
      questions: template.questions.map(question => {
        const answer = answers.find(a => a.question_id === question.id);
        return {
          id: question.id,
          text: question.question_text,
          type: question.question_type,
          options: question.options ? JSON.parse(question.options) : null,
          order: question.order,
          answer: answer ? answer.answer : null,
        };
      }),
    };
  }

  // 提交问卷并处理好友关系
  async submitWithShare(userId, answers, shareId, questionnaireId) {
    const { ctx } = this;

    // 开启事务
    const transaction = await ctx.model.transaction();

    try {
      // 1. 提交问卷答案
      const submitResult = await this.submitQuestionnaire(userId, questionnaireId, answers);


      // 提交事务
      await transaction.commit();

      return submitResult;
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  }

  // 创建双向好友关系
  async createFriendRelationship(userId, friendId, transaction) {
    const { ctx } = this;

    // 检查是否已经是好友
    const existingFriend = await ctx.model.UserFriend.findOne({
      where: {
        user_id: userId,
        friend_id: friendId,
      },
    });

    if (!existingFriend) {
      // 创建双向好友关系
      await ctx.model.UserFriend.bulkCreate([
        {
          user_id: userId,
          friend_id: friendId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: friendId,
          friend_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ], { transaction });
    }
  }

  async scoreAndAnalyze(userId, userQuestionnaireId, questionnaireId) {
    const { ctx } = this;
    // 计算得分
    const scores = await ctx.service.scoring.calculateQuestionnaireScores(userId, questionnaireId, userQuestionnaireId);
    // 生成分析报告
    const analysis = await ctx.service.analysis.analyzeQuestionnaire(userId, questionnaireId);
    // 开启调用GPT生成专业建议
    const gptAnalysisId = await ctx.service.openai.createAnalysisTask(
      userId,
      questionnaireId,
      scores
    );
    return {
      scores,
      analysis,
      gptAnalysisId,
    };
  }
  /**
   * 获取GPT分析结果
   * @param userId
   * @param questionnaireId
   * @param getGptAnalysis
   * @param analyzeId
   */
  async getGptAnalysis(userId, questionnaireId, analyzeId) {
    const { ctx } = this;

    const analysis = await ctx.service.openai.getAnalysisGptResult(userId, questionnaireId, analyzeId);
    if (!analysis) {
      return {
        status: 'not_found',
        message: '未找到分析结果',
      };
    }

    return {
      status: analysis.status,
      // content: analysis.status === 'completed' ? JSON.parse(analysis.content) : null,
      content: JSON.parse(analysis.content),
      message: this.getAnalysisStatusMessage(analysis.status),
    };
  }

  getAnalysisStatusMessage(status) {
    const messages = {
      pending: '正在生成分析结果，请稍后查询',
      completed: '分析已完成',
      failed: '分析生成失败，请重试',
    };
    return messages[status] || '未知状态';
  }
}

module.exports = QuestionnaireService;
