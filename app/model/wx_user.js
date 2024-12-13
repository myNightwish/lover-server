// app/model/wx_user.js
module.exports = app => {
  const { STRING, DATE, INTEGER } = app.Sequelize;

  const WxUser = app.model.define('wx_user', {
    id: {
      type: INTEGER, // 数据类型为整型
      primaryKey: true, // 设置为主键
      autoIncrement: true, // 设置自动递增
    },
    openid: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    nickName: {
      type: STRING,
      allowNull: false,
    },
    avatarUrl: {
      type: STRING,
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
    tableName: 'wx_users', // 确保这是你的表名
    timestamps: true,
  });

  // 同步模型
  WxUser.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 wx_users 表失败:', err);
    });

  return WxUser;
};
