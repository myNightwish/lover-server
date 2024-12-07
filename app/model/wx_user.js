// app/model/wx_user.js
module.exports = app => {
  const { STRING, DATE } = app.Sequelize;

  const WxUser = app.model.define('wx_user', {
    openid: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    nickname: {
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
    }
  }, {
    tableName: 'wx_users',  // 确保这是你的表名
    timestamps: true,
  });

   // 同步模型
   WxUser.sync({ force: false }) // force: false 确保不会删除表
   .then(() => {
     console.log('wx_users 表已同步');
   })
   .catch(err => {
     console.error('同步 wx_users 表失败:', err);
   });

  return WxUser;
};
