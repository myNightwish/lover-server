// 用户问卷表
module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const UserQuestionnaire = app.model.define('user_questionnaire', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: INTEGER,
    template_id: INTEGER,
    status: INTEGER, // 0: 未完成, 1: 已完成
    created_at: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
    updated_at: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
  });

  UserQuestionnaire.associate = function() {
    // 与问卷模板的多对一关系
    app.model.UserQuestionnaire.belongsTo(app.model.QuestionnaireTemplate, {
      foreignKey: 'template_id',
    });

    // 与用户答案的一对多关系
    app.model.UserQuestionnaire.hasMany(app.model.UserAnswer, {
      foreignKey: 'user_questionnaire_id',
      as: 'answers',
    });
  };
  UserQuestionnaire.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 UserQuestionnaire 表失败:', err);
    });
  return UserQuestionnaire;
};
