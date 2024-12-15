// 问卷分析结果表
module.exports = app => {
  const { INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionnaireAnalysis = app.model.define('questionnaire_analysis', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: INTEGER,
    questionnaire_id: INTEGER,
    scores: TEXT, // JSON string of dimension scores
    analysis_result: TEXT, // JSON string of analysis results
    gpt_analysis: TEXT, // JSON string of GPT analysis
    gpt_status: INTEGER, // 0: pending, 1: completed, 2: failed
    created_at: DATE,
    updated_at: DATE,
  });

  QuestionnaireAnalysis.associate = function() {
    app.model.QuestionnaireAnalysis.belongsTo(app.model.WxUser, {
      foreignKey: 'user_id',
    });

    app.model.QuestionnaireAnalysis.belongsTo(app.model.QuestionnaireTemplate, {
      foreignKey: 'questionnaire_id',
    });
  };
  QuestionnaireAnalysis.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 QuestionnaireAnalysis 表失败:', err);
    });

  return QuestionnaireAnalysis;
};
