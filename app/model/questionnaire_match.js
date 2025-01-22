// 问卷匹配结果表
module.exports = app => {
  const { INTEGER, FLOAT, JSON, DATE } = app.Sequelize;
  
  const QuestionnaireMatch = app.model.define('questionnaire_match', {
    id: { 
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    user_id: {
      type: INTEGER,
      allowNull: false
    },
    partner_id: {
      type: INTEGER,
      allowNull: false
    },
    template_id: {
      type: INTEGER,
      allowNull: false
    },
    match_score: {
      type: FLOAT,
      allowNull: false,
      comment: '匹配得分'
    },
    details: {
      type: JSON,
      comment: '匹配详情'
    },
    created_at: DATE,
    updated_at: DATE
  });

  QuestionnaireMatch.associate = function() {
    const { WxUser, QuestionnaireTemplate } = app.model;
    
    QuestionnaireMatch.belongsTo(WxUser, {
      foreignKey: 'user_id',
      as: 'user',
    });
    
    QuestionnaireMatch.belongsTo(WxUser, {
      foreignKey: 'partner_id',
      as: 'partner',
    });

    QuestionnaireMatch.belongsTo(QuestionnaireTemplate, {
      foreignKey: 'template_id',
      as: 'template'
    });
  };
    QuestionnaireMatch.sync({ force: false }) // force: false 确保不会删除表
      .then(() => {})
      .catch((err) => {
        console.error('同步 QuestionnaireMatch 表失败:', err);
      });

  return QuestionnaireMatch;
};