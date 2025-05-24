// 问卷维度表
module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionnaireDimension = app.model.define('questionnaire_dimension', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: STRING(50),
    description: TEXT,
    weight: INTEGER, // 维度权重
    created_at: DATE,
    updated_at: DATE,
  });

  QuestionnaireDimension.associate = function() {
    // 与问题的一对多关系
    app.model.QuestionnaireDimension.hasMany(app.model.QuestionTemplate, {
      foreignKey: 'dimension_id',
      as: 'questions',
    });
  };
  QuestionnaireDimension.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch((err) => {
      console.error('同步 QuestionnaireDimension 表失败:', err);
    });

  return QuestionnaireDimension;
};
