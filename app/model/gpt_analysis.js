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
        model: 'wx_users',
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
  }, {
    tableName: 'gpt_analyses',
    timestamps: true,
    underscored: true,
  });

  GptAnalysis.associate = function() {
    const { WxUser, QuestionnaireTemplate } = app.model;

    GptAnalysis.belongsTo(WxUser, {
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
