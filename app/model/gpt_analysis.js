// GPT分析结果表
module.exports = app => {
  const { INTEGER, TEXT, ENUM, DATE } = app.Sequelize;

  const GptAnalysis = app.model.define('gpt_analysis', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    questionnaire_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'questionnaire_template',
        key: 'id',
      },
    },
    content: TEXT,
    status: {
      type: ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    created_at: DATE,
    updated_at: DATE,
  });

  GptAnalysis.associate = function() {
    const { User, QuestionnaireTemplate } = app.model;

    GptAnalysis.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    GptAnalysis.belongsTo(QuestionnaireTemplate, {
      foreignKey: 'questionnaire_id',
      as: 'questionnaire',
    });
  };
  GptAnalysis.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 GptAnalysis 表失败:', err);
    });

  return GptAnalysis;
};
