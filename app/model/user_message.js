// 用户消息表
module.exports = app => {
  const { INTEGER, STRING, TEXT, BOOLEAN, DATE, ENUM } = app.Sequelize;

  const UserMessage = app.model.define('user_message', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'users',  // 确保这里是正确的表名
        key: 'id'
      }
    },
    sender_id: {
      type: INTEGER,
      allowNull: true,  // 允许为空，系统消息可能没有发送者
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: STRING,
      allowNull: false,
      defaultValue: 'system'
    },
    title: {
      type: STRING,
      allowNull: false
    },
    content: {
      type: TEXT,
      allowNull: false
    },
    is_read: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    related_id: {
      type: INTEGER,
      allowNull: true
    },
    created_at: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW
    },
    updated_at: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW
    }
  }, {
    tableName: 'user_message',
    timestamps: true,
    underscored: true,
  });

  UserMessage.associate = function() {
    // 关联用户（接收者）
    UserMessage.belongsTo(app.model.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    // 关联发送者
    // UserMessage.belongsTo(app.model.User, {
    //   foreignKey: 'sender_id',
    //   as: 'sender'
    // });
  };
  UserMessage.sync({ force: true, alter: true }) // 使用 alter: true 允许模型更新表结构
  .then(() => {
    console.log('UserMessage 表同步成功');
  })
  .catch((err) => {
    console.error('同步 UserMessage 表失败:', err);
  });

  return UserMessage;
};
