'use strict';

module.exports = app => {
  const { STRING, DATE, INTEGER, ENUM } = app.Sequelize;

  const User = app.model.define('user', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: STRING,
      allowNull: true, // 第三方登录可能没有密码
    },
    nickname: {
      type: STRING,
      allowNull: true,
    },
    avatar: {
      type: STRING,
      allowNull: true,
    },
    platform: {
      type: ENUM('web', 'app', 'wechat', 'other'),
      allowNull: false,
      defaultValue: 'web',
    },
    platformId: {
      type: STRING,
      allowNull: true, // 平台唯一标识，如微信的openid
    },
    status: {
      type: ENUM('active', 'inactive', 'banned'),
      allowNull: false,
      defaultValue: 'active',
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
    tableName: 'users',
    timestamps: true,
  });

  User.associate = () => {
    // 关联问答会话
    User.hasMany(app.model.QuestionSession, {
      foreignKey: 'creator_id',
      as: 'CreatedSessions',
    });
    
    User.hasMany(app.model.QuestionSession, {
      foreignKey: 'partner_id',
      as: 'PartnerSessions',
    });
    
    // 关联用户回答
    User.hasMany(app.model.AnswersForUser, {
      foreignKey: 'user_id',
      as: 'Answers',
    });
    
    // 与微信用户的关联
    User.hasOne(app.model.WxUser, {
      foreignKey: 'userId',
      as: 'WxUserInfo',
    });
  };

  User.sync({ force: false })
    .then(() => {})
    .catch((err) => {
      console.error('同步 User 表失败:', err);
    });

  return User;
};