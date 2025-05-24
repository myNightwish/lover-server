// 用户答案表
module.exports = app => {
  const { INTEGER, TEXT, DATE } = app.Sequelize;

  const UserAnswer = app.model.define('user_answer', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: INTEGER,
    user_questionnaire_id: INTEGER,
    question_id: INTEGER,
    answer: TEXT,
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

  UserAnswer.associate = function () {
    app.model.UserAnswer.belongsTo(app.model.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    // 与用户问卷的多对一关系
    app.model.UserAnswer.belongsTo(app.model.UserQuestionnaire, {
      foreignKey: 'user_questionnaire_id',
    });

    // 与问题模板的多对一关系
    app.model.UserAnswer.belongsTo(app.model.QuestionTemplate, {
      foreignKey: 'question_id',
    });
  };
  UserAnswer.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 UserAnswer 表失败:', err);
    });

  return UserAnswer;
};
