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
    avatarUrl: {
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
      unique: true,    // 确保唯一性
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
    hooks: {
      beforeCreate: async (user) => {
        // 如果没有绑定码，自动生成一个唯一的8位数字码
        if (!user.bind_code) {
          user.bind_code = await generateUniqueBindCode(app);
        }
      },
      beforeBulkCreate: async (users) => {
        // 批量创建时也处理绑定码
        for (const user of users) {
          if (!user.bind_code) {
            user.bind_code = await generateUniqueBindCode(app);
          }
        }
      }
    }
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
    // 伴侣关系
    User.belongsTo(User, {
      foreignKey: 'partner_id',
      as: 'Partner',
    });

    User.hasMany(app.model.Relationship, {
      foreignKey: 'userOpenid',
      sourceKey: 'openid',
      as: 'UserRelationships', // 用户发起的绑定关系
    });

    User.hasMany(app.model.Relationship, {
      foreignKey: 'partnerOpenid',
      sourceKey: 'openid',
      as: 'PartnerRelationships', // 用户作为伴侣的绑定关系
    });
  };

  // 生成唯一的绑定码
  async function generateUniqueBindCode(app) {
    let isUnique = false;
    let bindCode = '';
    
    while (!isUnique) {
      // 生成8位随机数字
      bindCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      // 检查是否已存在
      const existingUser = await app.model.User.findOne({
        where: { bind_code: bindCode }
      });
      
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    return bindCode;
  }

  User.sync({ force: false, alter: true }) // 使用 alter: true 允许模型更新表结构
    .then(() => {
      console.log('User 表同步成功');
    })
    .catch((err) => {
      console.error('同步 User 表失败:', err);
    });

  return User;
};