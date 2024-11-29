// app/model/invitation.js
module.exports = app => {
  const { INTEGER, STRING, ENUM, DATE } = app.Sequelize;

  const Invitation = app.model.define('invitation', {
    // 家庭 ID
    familyId: {
      type: INTEGER,
      allowNull: false, // 对应 Mongoose 的 `required: true`
      references: {
        model: 'families', // 关联家庭表
        key: 'id',
      },
    },
    // 发起邀请的用户 ID
    invitedById: {
      type: INTEGER,
      allowNull: false, // 对应 Mongoose 的 `required: true`
      references: {
        model: 'users', // 关联用户表
        key: 'id',
      },
    },
    // 被邀请用户的邮箱
    email: {
      type: STRING,
      allowNull: false,
    },
    // 邀请状态
    status: {
      type: ENUM('pending', 'accepted', 'rejected'), // 对应 Mongoose 的 `enum`
      defaultValue: 'pending', // 对应 Mongoose 的 `default: 'pending'`
    },
    // 创建时间
    createdAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW, // 对应 Mongoose 的 `default: Date.now`
    },
    // 邀请过期时间
    expiresAt: {
      type: DATE,
      allowNull: false, // 对应 Mongoose 的 `required: true`
    },
  }, {
    // Sequelize 配置项
    tableName: 'invitations', // 指定表名
    timestamps: false, // 手动维护时间字段
  });

  // 模型关联
  Invitation.associate = function() {
    // 关联家庭表
    app.model.Invitation.belongsTo(app.model.Family, {
      foreignKey: 'familyId',
      targetKey: 'id',
    });
    // 关联发起邀请的用户表
    app.model.Invitation.belongsTo(app.model.User, {
      foreignKey: 'invitedById',
      targetKey: 'id',
    });
  };

  return Invitation;
};
