// app/model/user.js
module.exports = app => {
  const { STRING, DATE, INTEGER } = app.Sequelize;

  // 定义模型
  const User = app.model.define('user', {
    // 用户名字段
    username: {
      type: STRING, // 对应 Mongoose 的 `String`
      allowNull: false, // 对应 Mongoose 的 `required: true`
      unique: true, // 对应 Mongoose 的 `unique: true`
    },
    // 密码字段
    password: {
      type: STRING,
      allowNull: false,
    },
    avatar: {
      type: STRING,
      allowNull: false,
    },
    // 邮箱字段
    email: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    // 创建时间
    createdAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW, // 对应 Mongoose 的 `default: Date.now`
    },
    // 更新时间
    updatedAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
  }, {
    // Sequelize 配置项
    tableName: 'users', // 指定表名
    timestamps: true, // 自动维护 `createdAt` 和 `updatedAt`
    underscored: false, // 如果需要字段使用下划线命名，请设为 true
  });
  User.associate = function() {
    app.model.User.belongsToMany(app.model.Family, {
      through: app.model.FamilyMember,
      foreignKey: 'userId',
      otherKey: 'familyId',
    });
  };
  // 定义关联
  User.associate = function() {
    app.model.User.hasMany(app.model.UserFriend, { foreignKey: 'user_id', as: 'friends' });
    app.model.User.hasMany(app.model.UserFriend, { foreignKey: 'friend_id', as: 'friendOf' });
  };

  return User;
};
