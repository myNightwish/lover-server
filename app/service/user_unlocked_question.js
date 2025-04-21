'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const UserUnlockedQuestion = app.model.define('user_unlocked_question', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: INTEGER,
    question_id: INTEGER,
    unlock_time: DATE,
    cost: INTEGER,
    created_at: DATE,
    updated_at: DATE
  });

  return UserUnlockedQuestion;
};