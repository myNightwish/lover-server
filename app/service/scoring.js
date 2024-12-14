const Service = require('egg').Service;

class ScoringService extends Service {
  /**
   * 计算问卷得分
   * @param userQuestionnaireId
   */
  async calculateQuestionnaireScores(userQuestionnaireId) {
    const { ctx } = this;

    // 获取问卷答案和维度信息
    const userQuestionnaire = await ctx.model.UserQuestionnaire.findOne({
      where: { id: userQuestionnaireId },
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
    });

    if (!userQuestionnaire) {
      throw new Error('问卷不存在');
    }

    // 按维度分组计算得分
    const dimensionScores = new Map();

    userQuestionnaire.answers.forEach(answer => {
      const dimension = answer.question_template.dimension;
      if (!dimension) return;

      const score = parseInt(answer.answer, 10);
      if (!dimensionScores.has(dimension.id)) {
        dimensionScores.set(dimension.id, {
          dimensionId: dimension.id,
          name: dimension.name,
          weight: dimension.weight,
          totalScore: 0,
          count: 0,
        });
      }

      const dimScore = dimensionScores.get(dimension.id);
      dimScore.totalScore += score;
      dimScore.count += 1;
    });

    // 计算加权平均分
    const scores = Array.from(dimensionScores.values()).map(dim => ({
      dimensionId: dim.dimensionId,
      name: dim.name,
      score: (dim.totalScore / dim.count).toFixed(2),
      weight: dim.weight,
    }));

    return scores;
  }
}

module.exports = ScoringService;
