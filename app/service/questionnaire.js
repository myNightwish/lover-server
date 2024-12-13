const Service = require('egg').Service;

class QuestionnaireService extends Service {
  // 初始化用户问卷
  async initUserQuestionnaires(userId) {
    const { ctx } = this;

    // 获取所有启用的问卷模板
    const templates = await ctx.model.QuestionnaireTemplate.findAll({
      where: { status: 1 },
      include: [{
        model: ctx.model.QuestionTemplate,
        as: 'questions',
      }],
    });

    // 如果没有模板，先创建默认模板
    if (templates.length === 0) {
      await this.createDefaultTemplates();
      return this.initUserQuestionnaires(userId); // 递归调用
    }

    // 检查用户是否已有问卷
    const existingQuestionnaires = await ctx.model.UserQuestionnaire.findAll({
      where: { user_id: userId },
    });

    // 为用户创建尚未拥有的问卷
    for (const template of templates) {
      const exists = existingQuestionnaires.some(q => q.template_id === template.id);
      if (!exists) {
        await ctx.model.UserQuestionnaire.create({
          user_id: userId,
          template_id: template.id,
          status: 0,
        });
      }
    }

    // 返回完整的用户问卷列表
    return await this.getUserQuestionnaires(userId);
  }

  // 创建默认模板
  async createDefaultTemplates() {
    const { ctx } = this;

    // 创建问卷模板
    const templates = [
      {
        title: '对我们的了解',
        description: '了解我们共同创建的世界',
        status: 0,
        questions: [
          {
            question_text: '你们的结婚记念日',
            question_type: 'single_choice',
            options: JSON.stringify([ '1-3月', '4-6月', '7-9月', '10-12月' ]),
            order: 1,
          },
          {
            question_text: '你们最美好的一次回忆',
            question_type: 'single_choice',
            options: '',
            order: 2,
          },
        ],
      },
      {
        title: '他(她)的世界',
        description: '你是否曾尝试过走进伴侣的世界，了解有关于他(她)的一切',
        status: 0,
        questions: [
          {
            question_text: '他(她)的生日',
            question_type: 'single_choice',
            options: '',
            order: 1,
          },
          {
            question_text: '他(她)最喜欢的花',
            question_type: 'single_choice',
            options: '',
            order: 2,
          },
          {
            question_text: '他(她)最喜欢的食物',
            question_type: 'single_choice',
            options: '',
            order: 3,
          },
          {
            question_text: '他(她)的身份证号码',
            question_type: 'single_choice',
            options: '',
            order: 4,
          },
          {
            question_text: '他(她)最喜欢的颜色',
            question_type: 'single_choice',
            options: '',
            order: 5,
          },
          {
            question_text: '他(她)最讨厌吃的食物',
            question_type: 'multiple_choice',
            options: '',
            order: 6,
          },
        ],
      },
      // ... 其他模板
    ];

    for (const template of templates) {
      const questions = template.questions;
      delete template.questions;

      const createdTemplate = await ctx.model.QuestionnaireTemplate.create(template);

      for (const question of questions) {
        await ctx.model.QuestionTemplate.create({
          ...question,
          questionnaire_id: createdTemplate.id,
        });
      }
    }
  }

  // 获取用户问卷列表
  async getUserQuestionnaires(userId) {
    const { ctx } = this;
    return await ctx.model.UserQuestionnaire.findAll({
      where: { user_id: userId },
      include: [{
        model: ctx.model.QuestionnaireTemplate,
        include: [{
          model: ctx.model.QuestionTemplate,
          as: 'questions',
        }],
      }],
      limit: 1, // 只取最新的一条
    });
  }

  // 提交问卷答案
  async submitQuestionnaire(userId, questionnaireId, answers) {
    const { ctx } = this;
    console.log(userId, questionnaireId);
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
      question_id: answer.questionId + 1,
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

  // 生成分析报告
  async generateAnalysis(userQuestionnaireId) {
    const { ctx } = this;
    const userQuestionnaire = await ctx.model.UserQuestionnaire.findByPk(
      userQuestionnaireId,
      {
        include: [{
          model: ctx.model.UserAnswer,
          include: [{
            model: ctx.model.QuestionTemplate,
          }],
        }],
      }
    );

    // 收集答案数据
    const answers = userQuestionnaire.answers.map(a => ({
      question: a.question.question_text,
      answer: a.answer,
    }));

    // 调用GPT API进行分析
    const analysis = await ctx.service.gpt.analyze({
      type: 'questionnaire_analysis',
      data: answers,
    });

    return analysis;
  }

  // 获取问卷详情
  async getQuestionnaireDetail(userId, questionnaireId) {
    const { ctx } = this;

    const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
      where: {
        id: questionnaireId,
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

      // 2. 如果有分享者ID，建立好友关系
      if (shareId && shareId !== userId) {
        await this.createFriendRelationship(userId, shareId, transaction);
      }

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
}

module.exports = QuestionnaireService;
