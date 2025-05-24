'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, BOOLEAN } = app.Sequelize;
  
  const QuestionTopic = app.model.define('question_topic', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: INTEGER, allowNull: false, comment: '分类ID' },
    title: { type: STRING(100), allowNull: false, comment: '话题标题' },
    type: { type: STRING(50), allowNull: false, comment: '话题类型' },
    code: { type: STRING(50), allowNull: false, comment: '话题代码' },
    icon: { type: STRING(50), comment: '话题图标' },
    bgClass: { type: STRING(50), comment: '背景样式类' },
    recommended: { type: BOOLEAN, defaultValue: false, comment: '是否推荐' },
    sort_order: { type: INTEGER, defaultValue: 0, comment: '排序顺序' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态：0-禁用，1-启用' },
    version: { type: STRING(20), comment: '版本号' }
  });
  
  // 定义关联关系
  QuestionTopic.associate = function() {
    app.model.QuestionTopic.belongsTo(app.model.QuestionCategory, { 
      foreignKey: 'category_id', 
      as: 'category' 
    });
    
    app.model.QuestionTopic.hasMany(app.model.Question, { 
      foreignKey: 'topic_id', 
      as: 'questions' 
    });
  };
  
  return QuestionTopic;
};