'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const Category = app.model.define('category', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: STRING(50), unique: true, comment: '分类编码，如relationship' },
    name: { type: STRING(100), comment: '分类名称' },
    description: TEXT,
    icon: STRING(100),
    order: { type: INTEGER, defaultValue: 0, comment: '排序' },
    version: { type: STRING(20), defaultValue: '1.0', comment: '版本号' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态：1-启用，0-禁用' },
    created_at: DATE,
    updated_at: DATE
  });

  return Category;
};