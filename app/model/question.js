'use strict';

module.exports = app => {
  const { STRING, TEXT, INTEGER, DATE } = app.Sequelize;

  const Question = app.model.define('question', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'question_categories',
        key: 'id'
      }
    },
    text: {
      type: TEXT,
      allowNull: false,
    },
    type: {
      type: STRING(20),
      allowNull: false,
    },
    options: {
      type: TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('options');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('options', value ? JSON.stringify(value) : null);
      }
    },
    option1: {
      type: STRING(255),
      allowNull: true,
    },
    option2: {
      type: STRING(255),
      allowNull: true,
    },
    difficulty: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'normal',
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
    tableName: 'questions',
    timestamps: true,
  });

  Question.associate = () => {
    // 问题属于一个分类
    Question.belongsTo(app.model.QuestionCategory, {
      foreignKey: 'category_id',
      as: 'Category',
    });
    
    // 问题可以出现在多个会话中
    Question.hasMany(app.model.SessionQuestion, {
      foreignKey: 'question_id',
      as: 'SessionQuestions',
    });
    
    // 问题可以有多个用户回答
    Question.hasMany(app.model.AnswersForUser, {
      foreignKey: 'question_id',
      as: 'Answers',
    });
  };

  Question.sync({ force: false })
    .then(() => {})
    .catch((err) => {
      console.error('同步 Question 表失败:', err);
    });

  return Question;
};