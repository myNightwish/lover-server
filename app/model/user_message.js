// 用户消息表
module.exports = (app) => {
  const { INTEGER, STRING, TEXT, DATE, BOOLEAN } = app.Sequelize;

  const UserMessage = app.model.define('user_message', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      comment: '消息接收者ID',
    },
    sender_id: {
      type: INTEGER,
      allowNull: false,
      comment: '消息发送者ID',
    },
    type: {
      type: STRING(20),
      allowNull: false,
      comment: 'exchange_request(兑换请求)/system(系统消息)',
    },
    title: {
      type: STRING(100),
      allowNull: false,
    },
    content: TEXT,
    is_read: {
      type: BOOLEAN,
      defaultValue: false,
    },
    related_id: {
      type: INTEGER,
      comment: '相关记录ID，如兑换记录ID',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  UserMessage.associate = function () {
    const { User } = app.model;

    UserMessage.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    UserMessage.belongsTo(User, {
      foreignKey: 'sender_id',
      as: 'sender',
    });
  };

  return UserMessage;
};
