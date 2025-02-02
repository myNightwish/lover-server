// 问卷类型表
module.exports = (app) => {
  const { STRING, INTEGER, TEXT, BOOLEAN, DATE } = app.Sequelize;

  const QuestionnaireType = app.model.define('questionnaire_type', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: STRING(100),
      allowNull: false,
    },
    description: TEXT,
    need_partner: {
      type: BOOLEAN,
      defaultValue: false,
    },
    need_sync: {
      type: BOOLEAN,
      defaultValue: false,
    },
    analysis_type: {
      type: STRING(20),
      defaultValue: 'self',
    },
    status: {
      type: INTEGER,
      defaultValue: 1,
      comment: '状态: 0-禁用, 1-启用',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  QuestionnaireType.associate = function () {
    app.model.QuestionnaireType.hasMany(app.model.QuestionnaireTemplate, {
      foreignKey: 'type_id',
      as: 'templates',
    });
  };
  QuestionnaireType.sync({ force: true }) // force: false 确保不会删除表
    .then(() => {})
    .catch((err) => {
      console.error('同步 QuestionnaireType 表失败:', err);
    });

  return QuestionnaireType;
};
