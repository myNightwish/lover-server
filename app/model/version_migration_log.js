'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const VersionMigrationLog = app.model.define('version_migration_log', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: INTEGER, comment: '用户ID' },
    topic_id: { type: INTEGER, comment: '话题ID' },
    old_version: { type: STRING(20), comment: '旧版本' },
    new_version: { type: STRING(20), comment: '新版本' },
    migration_time: DATE,
    created_at: DATE,
    updated_at: DATE
  });

  return VersionMigrationLog;
};