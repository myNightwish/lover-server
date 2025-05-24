'use strict';

module.exports = app => {
  const { STRING, TEXT, INTEGER, DATE } = app.Sequelize;

  const AnswersForUser = app.model.define('answers_for_user', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    answer_type: {
      type: STRING(20),
      allowNull: false,
    },
    answer_value: {
      type: TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('answer_value');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('answer_value', value ? JSON.stringify(value) : null);
      }
    },
    custom_text: {
      type: TEXT,
      allowNull: true,
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
    tableName: 'answers_for_users',
    timestamps: true,
  });

  AnswersForUser.associate = () => {
    // 回答属于一个用户
    AnswersForUser.belongsTo(app.model.User, {
      foreignKey: 'user_id',
      as: 'User',
    });
    
    // 回答属于一个会话
    AnswersForUser.belongsTo(app.model.QuestionSession, {
      foreignKey: 'session_id',
      as: 'Session',
    });
    
    // 回答关联一个问题
    AnswersForUser.belongsTo(app.model.Question, {
      foreignKey: 'question_id',
      as: 'Question',
    });
  };

  AnswersForUser.sync({ force: false })
    .then(() => {})
    .catch((err) => {
      console.error('同步 AnswersForUser 表失败:', err);
    });

  return AnswersForUser;
};