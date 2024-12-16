// 问卷得分表
module.exports = app => {
  const { INTEGER, JSON, DATE } = app.Sequelize;

  const QuestionnaireScore = app.model.define('questionnaire_score', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: INTEGER,
    questionnaire_id: INTEGER,
    scores: JSON, // 存储维度得分
    created_at: DATE,
    updated_at: DATE,
  });

  QuestionnaireScore.associate = function() {
    app.model.QuestionnaireScore.belongsTo(app.model.WxUser, {
      foreignKey: 'user_id',
    });
    app.model.QuestionnaireScore.belongsTo(app.model.QuestionnaireTemplate, {
      foreignKey: 'questionnaire_id',
      as: 'questionnaire_template', // 使用一致的别名
    });
  };
  QuestionnaireScore.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 QuestionnaireScore 表失败:', err);
    });

  return QuestionnaireScore;
};
