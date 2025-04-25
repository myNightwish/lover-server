'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const QuestionAnswer = app.model.define('question_answer', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
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