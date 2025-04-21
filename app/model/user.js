'use strict';

module.exports = app => {
  const { STRING, DATE, INTEGER, ENUM, TEXT } = app.Sequelize;

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
    salt: {
      type: STRING,
      allowNull: true, // 密码加密的盐值
    },
    nickname: {
      type: STRING,
      allowNull: true,
    },
    email: {
      type: STRING,
      allowNull: true,
    },
    phone: {
      type: STRING,
      allowNull: true,
    },
    avatar: {
      type: STRING,
      allowNull: true,
    },
    platform: {
      type: ENUM('web', 'app', 'wechat', 'apple', 'google', 'other'),
      allowNull: false,
      defaultValue: 'web',
    },
    platformId: {
      type: STRING,
      allowNull: true, // 平台唯一标识，如微信的openid
    },
    openid: {
      type: STRING,
      allowNull: true, // 微信openid
    },
    unionid: {
      type: STRING,
      allowNull: true, // 微信unionid
    },
    status: {
      type: ENUM('active', 'inactive', 'banned'),
      allowNull: false,
      defaultValue: 'active',
    },
    role: {
      type: ENUM('user', 'admin', 'super_admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    partner_id: {
      type: INTEGER,
      allowNull: true, // 伴侣ID
    },
    bind_code: {
      type: STRING(10),
      allowNull: true, // 伴侣绑定码
    },
    createdAt: {
      type: DATE,
      allowNull: true,
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
    
    // 伴侣关系
    User.belongsTo(User, {
      foreignKey: 'partner_id',
      as: 'Partner',
    });
  };

  User.sync({ force: false, alter: true }) // 使用 alter: true 允许模型更新表结构
    .then(() => {
      console.log('User 表同步成功');
    })
    .catch((err) => {
      console.error('同步 User 表失败:', err);
    });

  return User;
};