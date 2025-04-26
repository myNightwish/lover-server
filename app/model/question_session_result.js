'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionSessionResult = app.model.define('question_session_result', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    session_id: { type: INTEGER, allowNull: false, comment: '会话ID' },
    type: { type: STRING(50), comment: '问题类型：text, options, who, thisorthat等' },
    user_id: { type: INTEGER, allowNull: false, comment: '用户ID' },
    result_data: { type: TEXT, comment: '结果数据，JSON格式' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态：0-删除，1-正常' },
    created_at: DATE,
    updated_at: DATE
  });

  // 定义关联关系
  QuestionSessionResult.associate = function() {
    app.model.QuestionSessionResult.belongsTo(app.model.QuestionSession, { 
      as: 'session', 
      foreignKey: 'session_id',
      constraints: false // 禁用外键约束
    });
    
    app.model.QuestionSessionResult.belongsTo(app.model.User, { 
      as: 'user', 
      foreignKey: 'user_id',
      constraints: false // 禁用外键约束
    });
  };

  // 自动同步表结构（开发环境使用）
  QuestionSessionResult.sync({ alter: false })
  .then(() => {
    console.log('QuestionSessionResult 表同步成功');
  })
  .catch(err => {
    console.error('QuestionSessionResult 表同步失败:', err);
  });

  return QuestionSessionResult;
};