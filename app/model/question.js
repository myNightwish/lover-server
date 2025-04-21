'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE, JSON } = app.Sequelize;

  const Question = app.model.define('question', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    topic_id: { type: INTEGER, comment: '所属话题ID' },
    code: { type: STRING(50), comment: '问题编码，如q1' },
    text: { type: TEXT, comment: '问题文本' },
    type: { type: STRING(50), comment: '问题类型：text, options, who, thisorthat等' },
    options: { 
      type: TEXT, 
      comment: '选项，用于options类型',
      get() {
        const rawValue = this.getDataValue('options');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('options', value ? JSON.stringify(value) : null);
      }
    },
    option1: { type: STRING(255), comment: '选项1，用于thisorthat类型' },
    option2: { type: STRING(255), comment: '选项2，用于thisorthat类型' },
    order: { type: INTEGER, defaultValue: 0, comment: '排序' },
    version: { type: STRING(20), defaultValue: '1.0', comment: '版本号' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态：1-启用，0-禁用' },
    created_at: DATE,
    updated_at: DATE
  });

  return Question;
};