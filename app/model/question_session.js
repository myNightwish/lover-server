'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionSession = app.model.define('question_session', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    creator_id: { type: INTEGER, comment: '创建者ID' },
    partner_id: { type: INTEGER, comment: '伴侣ID' },
    topic_id: { type: INTEGER, comment: '话题ID' },
    title: { type: STRING(100), comment: '会话标题' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态：0-删除，1-进行中，2-已完成' },
    created_at: DATE,
    updated_at: DATE
  });

  // 定义关联关系
  QuestionSession.associate = function() {
    app.model.QuestionSession.belongsTo(app.model.Topic, { as: 'topic', foreignKey: 'topic_id' });
  };

  return QuestionSession;
};