'use strict';

module.exports = app => {
  const { STRING, TEXT, INTEGER, DATE } = app.Sequelize;

  const QuestionCategory = app.model.define('question_category', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING(50),
      allowNull: false,
    },
    description: {
      type: TEXT,
      allowNull: true,
    },
    icon: {
      type: STRING(255),
      allowNull: true,
    },
    type: {
      type: STRING(30),
      allowNull: false,
    },
    status: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
    updatedAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
  }, {
    tableName: 'question_categories',
    timestamps: true,
  });

  QuestionCategory.associate = () => {
    // 一个分类有多个问题
    QuestionCategory.hasMany(app.model.Question, {
      foreignKey: 'category_id',
      as: 'Questions',
    });
    
    // 一个分类有多个会话
    QuestionCategory.hasMany(app.model.QuestionSession, {
      foreignKey: 'category_id',
      as: 'Sessions',
    });
  };

  QuestionCategory.sync({ force: false })
    .then(() => {})
    .catch((err) => {
      console.error('同步 QuestionCategory 表失败:', err);
    });

  return QuestionCategory;
};