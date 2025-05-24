'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE, JSON } = app.Sequelize;

  const UserQuestionAnswer = app.model.define('user_question_answer', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: INTEGER, comment: '用户ID' },
    question_id: { type: INTEGER, comment: '问题ID' },
    question_version: { type: STRING(20), comment: '问题版本' },
    session_id: { type: INTEGER, comment: '会话ID' },
    answer_value: { type: JSON, comment: '回答内容' },
    created_at: DATE,
    updated_at: DATE
  });

  return UserQuestionAnswer;
};