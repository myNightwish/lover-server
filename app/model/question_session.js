'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const QuestionSession = app.model.define('question_session', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    creator_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    partner_id: {
      type: INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    category_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'question_categories',
        key: 'id'
      }
    },
    title: {
      type: STRING(100),
      allowNull: false,
    },
    status: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'active',
    },
    similarity_percentage: {
      type: INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
    completedAt: {
      type: DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
  }, {
    tableName: 'question_sessions',
    timestamps: true,
  });

  QuestionSession.associate = () => {
    // 会话由一个用户创建
    QuestionSession.belongsTo(app.model.User, {
      foreignKey: 'creator_id',
      as: 'Creator',
    });
    
    // 会话可能有一个伴侣
    QuestionSession.belongsTo(app.model.User, {
      foreignKey: 'partner_id',
      as: 'Partner',
    });
    
    // 会话属于一个问题分类
    QuestionSession.belongsTo(app.model.QuestionCategory, {
      foreignKey: 'category_id',
      as: 'Category',
    });
    
    // 会话包含多个问题
    QuestionSession.hasMany(app.model.SessionQuestion, {
      foreignKey: 'session_id',
      as: 'SessionQuestions',
    });
    
    // 会话有多个用户回答
    QuestionSession.hasMany(app.model.AnswersForUser, {
      foreignKey: 'session_id',
      as: 'Answers',
    });
  };

  QuestionSession.sync({ force: false })
    .then(() => {})
    .catch((err) => {
      console.error('同步 QuestionSession 表失败:', err);
    });

  return QuestionSession;
};