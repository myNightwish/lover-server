const Controller = require('egg').Controller;
class QuestionnaireController extends Controller {
  // 初始化用户问卷
  async init() {
    const { ctx } = this;
    const userId = ctx.user.id; // 假设通过中间件获取已登录用户ID
    const questionnaires = await ctx.service.questionnaire.initUserQuestionnaires(userId);

    ctx.body = {
      success: true,
      data: questionnaires,
    };
  }

  // 获取用户问卷列表
  async list() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const questionnaires = await ctx.service.questionnaire.getUserQuestionnaires(userId);

    ctx.body = {
      success: true,
      data: questionnaires,
    };
  }

  // 提交问卷（支持分享）
  async submit() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { questionnaireId, answers, shareId } = ctx.request.body;

    try {
      const result = await ctx.service.questionnaire.submitWithShare(
        userId,
        answers,
        shareId,
        questionnaireId
      );
      console.log('99999--', result, questionnaireId, answers, shareId);

      ctx.body = {
        success: true,
        data: result,
        message: shareId ? '问卷提交成功并建立好友关系' : '问卷提交成功',
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
  // 获取问卷详情
  async detail() {
    const { ctx } = this;
    const userId = ctx.user.id;
    // 获取查询参数
    const { questionnaireId } = ctx.query;

    const detail = await ctx.service.questionnaire.getQuestionnaireDetail(userId, questionnaireId);

    ctx.body = {
      success: true,
      data: detail,
    };
  }

  // 获取好友列表
  async friends() {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const friends = await ctx.service.friends.getFriendList(userId);

      ctx.body = {
        success: true,
        data: friends,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = QuestionnaireController;
