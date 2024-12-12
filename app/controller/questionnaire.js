const Controller = require('egg').Controller;
const userId = 1;
class QuestionnaireController extends Controller {
  // 初始化用户问卷
  async init() {
    const { ctx } = this;
    // const userId = ctx.user.id; // 假设通过中间件获取已登录用户ID
    const questionnaires = await ctx.service.questionnaire.initUserQuestionnaires(userId);

    ctx.body = {
      success: true,
      data: questionnaires,
    };
  }

  // 获取用户问卷列表
  async list() {
    const { ctx } = this;
    // const userId = ctx.user.id;
    const questionnaires = await ctx.service.questionnaire.getUserQuestionnaires(userId);

    ctx.body = {
      success: true,
      data: questionnaires,
    };
  }

  // 提交问卷
  async submit() {
    const { ctx } = this;
    // const userId = ctx.user.id;
    const { questionnaireId, answers } = ctx.request.body;

    const analysis = await ctx.service.questionnaire.submitQuestionnaire(
      userId,
      questionnaireId,
      answers
    );

    ctx.body = {
      success: true,
      data: {
        analysis,
      },
    };
  }
  // 获取问卷详情
  async detail() {
    const { ctx } = this;
    // const userId = ctx.user.id;
    // 获取查询参数
    const { questionnaireId, ownerId, friendId } = ctx.query;

    const detail = await ctx.service.questionnaire.getQuestionnaireDetail(ownerId, questionnaireId);

    ctx.body = {
      success: true,
      data: detail,
    };
  }
}

module.exports = QuestionnaireController;
