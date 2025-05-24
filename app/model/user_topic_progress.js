'use strict';

module.exports = app => {
  const { STRING, INTEGER, BOOLEAN, DATE } = app.Sequelize;

  const UserTopicProgress = app.model.define('user_topic_progress', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: INTEGER, comment: '用户ID' },
    topic_id: { type: INTEGER, comment: '话题ID' },
    topic_version: { type: STRING(20), comment: '话题版本' },
    unlocked: { type: BOOLEAN, defaultValue: false, comment: '是否解锁' },
    completed: { type: BOOLEAN, defaultValue: false, comment: '是否完成' },
    unlock_time: DATE,
    created_at: DATE,
    updated_at: DATE
  });

  return UserTopicProgress;
};