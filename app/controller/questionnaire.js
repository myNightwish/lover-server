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
    // 用来初始化：
    // const questionnaires = await ctx.service.questionnaire.initUserQuestionnaires(userId);

    const questionnaires = await ctx.service.questionnaire.getUserQuestionnaires(userId);

    ctx.body = {
      success: true,
      data: questionnaires,
    };
  }

  // 提交问卷
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

      ctx.body = {
        success: true,
        data: result,
        message: '问卷提交成功',
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
  async analyze() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { questionnaireId } = ctx.request.body;
    const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
      where: {
        user_id: userId,
        template_id: questionnaireId,
      },
    });

    if (!userQuestionnaire) {
      throw new Error('问卷不存在');
    }
    const result = await ctx.service.questionnaire.scoreAndAnalyze(userId, userQuestionnaire.id, questionnaireId);
    ctx.body = {
      success: true,
      data: result,
      message: '分析已开始，初步得分已生成，GPT建议将异步生成,',
    };
  }
  // 提交问卷
  async addFriends() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { shareId } = ctx.request.body;

    if (userId === shareId) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '不能添加自己为好友奥～',
      };
    }

    try {
      const res = await ctx.service.friends.addFriends(
        userId,
        shareId
      );

      ctx.body = {
        success: true,
        message: res.message,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '建立好友关系失败',
      };
    }
  }
  /**
   * 获取GPT分析结果
   */
  async getGptAnalysis() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { questionnaireId, analyzeId } = ctx.query;

    try {
      const result = await ctx.service.questionnaire.getGptAnalysis(userId, questionnaireId, analyzeId);

      ctx.body = {
        success: true,
        data: result,
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
