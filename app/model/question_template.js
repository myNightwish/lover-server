// 问题模板表
module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionTemplate = app.model.define('question_template', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    questionnaire_id: INTEGER,
    question_text: TEXT,
    question_type: STRING(20), // 'single_choice', 'multiple_choice', 'text'
    options: TEXT, // JSON string for choices
    order: INTEGER,
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

  QuestionTemplate.associate = function() {
    // 与问卷模板的多对一关系
    app.model.QuestionTemplate.belongsTo(app.model.QuestionnaireTemplate, {
      foreignKey: 'questionnaire_id',
    });

    // 与用户答案的一对多关系
    app.model.QuestionTemplate.hasMany(app.model.UserAnswer, {
      foreignKey: 'question_id',
    });
  };
  QuestionTemplate.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {
      console.log('QuestionTemplate 表已同步');
    })
    .catch(err => {
      console.error('同步 QuestionTemplate 表失败:', err);
    });


  return QuestionTemplate;
};
