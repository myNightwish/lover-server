'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const SessionQuestion = app.model.define('session_question', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'question_sessions',
        key: 'id'
      }
    },
    question_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    order_index: {
      type: INTEGER,
      allowNull: false,
    },
    status: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'pending',
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
    tableName: 'session_questions',
    timestamps: true,
  });

  SessionQuestion.associate = () => {
    // 会话问题属于一个会话
    SessionQuestion.belongsTo(app.model.QuestionSession, {
      foreignKey: 'session_id',
      as: 'Session',
    });
    
    // 会话问题关联一个问题
    SessionQuestion.belongsTo(app.model.Question, {
      foreignKey: 'question_id',
      as: 'Question',
    });
  };

  SessionQuestion.sync({ force: false })
    .then(() => {})
    .catch((err) => {
      console.error('同步 SessionQuestion 表失败:', err);
    });

  return SessionQuestion;
};