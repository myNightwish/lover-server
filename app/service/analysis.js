const Service = require('egg').Service;

class AnalysisService extends Service {
  /**
   * 分析问卷结果并生成可视化数据
   * @param userId
   * @param questionnaireId
   */
  async analyzeQuestionnaire(userId, questionnaireId) {
    const { ctx } = this;
    // 获取问卷答案和维度信息
    const userQuestionnaire = await this.getUserQuestionnaireWithAnswers(userId, questionnaireId);
    const dimensions = await this.getQuestionnaireDimensions(userQuestionnaire.template_id);

    // 计算各维度得分
    const dimensionScores = this.calculateDimensionScores(userQuestionnaire.answers, dimensions);

    // 生成可视化数据
    return {
      radarChart: this.generateRadarChartData(dimensionScores),
      // timeSeriesChart: await this.generateTimeSeriesData(userId, questionnaireId),
      // scatterPlot: await this.generateScatterPlotData(userId, dimensions),
    };
  }

  /**
   * 生成雷达图数据
   * @param dimensionScores
   */
  generateRadarChartData(dimensionScores) {
    return {
      categories: dimensionScores.map(d => d.name),
      series: [{
        name: '关系雷达',
        data: dimensionScores.map(d => d.score),
      }],
    };
  }


  /**
   * 生成散点图数据
   * @param userId
   * @param dimensions
   */
  async generateScatterPlotData(userId, dimensions) {
    // 获取好友数据进行对比
    const friends = await this.ctx.service.friend.getFriendList(userId);
    const friendScores = await Promise.all(
      friends.map(friend => this.getFriendScores(friend.id, dimensions))
    );

    return {
      series: dimensions.map(dim => ({
        name: dim.name,
        data: friendScores.map(score => ({
          x: score[dim.id].emotionalScore,
          y: score[dim.id].communicationScore,
        })),
      })),
    };
  }

  /**
 * 获取用户问卷及答案
 * @param userId
 * @param questionnaireId
 */
  async getUserQuestionnaireWithAnswers(userId, questionnaireId) {
    const { ctx } = this;

    const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
      where: {
        user_id: userId,
        template_id: questionnaireId,
        status: 1,
      },
      include: [{
        model: ctx.model.UserAnswer,
        as: 'answers',
        include: [{
          model: ctx.model.QuestionTemplate,
          include: [{
            model: ctx.model.QuestionnaireDimension,
            as: 'dimension',
          }],
        }],
      }],
      order: [[{ model: ctx.model.UserAnswer, as: 'answers' }, 'created_at', 'ASC' ]],
    });

    if (!userQuestionnaire) {
      throw new Error('未找到已完成的问卷');
    }

    return userQuestionnaire;
  }
  /**
 * 计算维度得分
 * @param answers
 * @param dimensions
 */
  calculateDimensionScores(answers, dimensions) {
    const dimensionScores = new Map();

    // 初始化维度得分
    dimensions.forEach(dim => {
      dimensionScores.set(dim.id, {
        id: dim.id,
        name: dim.name,
        description: dim.description,
        weight: dim.weight,
        totalScore: 0,
        count: 0,
      });
    });

    // 计算每个维度的总分和回答数
    answers.forEach(answer => {
      const dimension = answer.question_template.dimension;
      if (!dimension) return;

      const score = parseInt(answer.answer, 10);
      const dimScore = dimensionScores.get(dimension.id);

      dimScore.totalScore += score;
      dimScore.count += 1;
    });

    // 计算加权平均分
    return Array.from(dimensionScores.values())
      .map(dim => ({
        id: dim.id,
        name: dim.name,
        description: dim.description,
        weight: dim.weight,
        score: dim.count > 0 ? (dim.totalScore / dim.count).toFixed(2) : 0,
        responseCount: dim.count,
      }))
      .filter(dim => dim.responseCount > 0)
      .sort((a, b) => b.weight - a.weight);
  }
  /**
 * 获取问卷维度信息
 * @param templateId
 */
  async getQuestionnaireDimensions(templateId) {
    const { ctx } = this;

    const dimensions = await ctx.model.QuestionnaireDimension.findAll({
      include: [{
        model: ctx.model.QuestionTemplate,
        as: 'questions',
        where: { questionnaire_id: templateId },
        required: false,
      }],
      order: [[ 'weight', 'DESC' ]],
    });

    return dimensions.map(dim => ({
      id: dim.id,
      name: dim.name,
      description: dim.description,
      weight: dim.weight,
      questionCount: dim.questions.length,
    }));
  }

}

module.exports = AnalysisService;
