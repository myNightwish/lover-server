'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const UserUnlockedTopic = app.model.define('user_unlocked_topic', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: INTEGER,
    topic_id: STRING(50),
    unlock_time: DATE,
    cost: INTEGER,
    created_at: DATE,
    updated_at: DATE
  });

  return UserUnlockedTopic;
};