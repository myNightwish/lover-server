'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const Topic = app.model.define('topic', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: INTEGER, comment: '所属分类ID' },
    code: { type: STRING(50), unique: true, comment: '话题编码，如deep-talk' },
    name: { type: STRING(100), comment: '话题名称' },
    type: { type: STRING(50), comment: '话题类型' },
    description: TEXT,
    icon: STRING(100),
    order: { type: INTEGER, defaultValue: 0, comment: '排序' },
    version: { type: STRING(20), defaultValue: '1.0', comment: '版本号' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态：1-启用，0-禁用' },
    created_at: DATE,
    updated_at: DATE
  });

  return Topic;
};