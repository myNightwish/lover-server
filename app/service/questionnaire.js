const Service = require('egg').Service;

class QuestionnaireService extends Service {
  // 初始化用户问卷
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
        title: '学习习惯调查',
        description: '了解学生的学习习惯和方法',
        status: 1,
        questions: [
          {
            question_text: '你每天的学习时间是多少？',
            question_type: 'single_choice',
            options: JSON.stringify([ '1-2小时', '2-4小时', '4-6小时', '6小时以上' ]),
            order: 1,
          },
          {
            question_text: '你最常用的学习方法是什么？',
            question_type: 'multiple_choice',
            options: JSON.stringify([ '看书笔记', '视频学习', '练习题', '小组讨论' ]),
            order: 2,
          },
        ],
      },
      {
        title: '对他的了解',
        description: '了解别人',
        status: 1,
        questions: [
          {
            question_text: '他(她)最喜欢的运动',
            question_type: 'single_choice',
            options: JSON.stringify([ '篮球', '足球', '羽毛球', '乒乓球', '游泳', '其他' ]),
            order: 1,
          },
          {
            question_text: '他(她)最喜欢读哪种类型的书？',
            question_type: 'multiple_choice',
            options: JSON.stringify([ '哲学', '历史', '文学', '科技', '其他' ]),
            order: 2,
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
}

module.exports = QuestionnaireService;
