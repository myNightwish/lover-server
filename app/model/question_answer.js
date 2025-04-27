'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionAnswer = app.model.define('question_answer', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: STRING(50), comment: '问题类型：text, options, who, thisorthat等' },
    question_text: { type: STRING(50), comment: '问题描述文本' },
    session_id: INTEGER,
    user_id: INTEGER,
    question_id: STRING(50),
    answer_value: TEXT,
    created_at: DATE,
    updated_at: DATE
  });


  QuestionAnswer.sync({ force: false })
  .then(() => {})
  .catch((err) => {
    console.error('同步 QuestionAnswer 表失败:', err);
  });

  return QuestionAnswer;
};