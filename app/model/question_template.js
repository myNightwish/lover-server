// 问题模板表
module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionTemplate = app.model.define('question_template', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    questionnaire_id: INTEGER,
    dimension_id: INTEGER,
    question_text: TEXT,
    question_type: STRING(20), // 'single_choice', 'multiple_choice', 'text', 'scale'
    options: {
      type: TEXT,
      get() {
        const rawValue = this.getDataValue('options');
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch (error) {
          console.error('JSON 解析失败：', error);
          return []; // 解析失败时返回默认值
        }
      },
      set(value) {
        this.setDataValue('options', JSON.stringify(value));
      },
    }, // JSON string for choices

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

    // 与维度的多对一关系
    app.model.QuestionTemplate.belongsTo(app.model.QuestionnaireDimension, {
      foreignKey: 'dimension_id',
      as: 'dimension',
    });

    // 与用户答案的一对多关系
    app.model.QuestionTemplate.hasMany(app.model.UserAnswer, {
      foreignKey: 'question_id',
       as: 'userAnswers', // 确保别名与查询中一致
    });
  };
  QuestionTemplate.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 QuestionTemplate 表失败:', err);
    });

  return QuestionTemplate;
};
