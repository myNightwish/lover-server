module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const UserFriend = app.model.define('user_friend', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: INTEGER,
    friend_id: INTEGER,
    created_at: DATE,
    updated_at: DATE,
  });

  UserFriend.associate = function() {
    // 与用户表的关联关系
    app.model.UserFriend.belongsTo(app.model.WxUser, {
      foreignKey: 'user_id',
      as: 'user',
    });
    app.model.UserFriend.belongsTo(app.model.WxUser, {
      foreignKey: 'friend_id',
      as: 'friend',
    });
  };
  // 同步模型
  UserFriend.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 UserFriend 表失败:', err);
    });
  return UserFriend;
};
