module.exports = app => {
  const { STRING, DATE, INTEGER } = app.Sequelize;

  const WxUser = app.model.define('wx_user', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    tableName: 'wx_users',
    timestamps: true,
  });

  WxUser.associate = () => {
    WxUser.hasMany(app.model.Relationship, {
      foreignKey: 'userOpenid',
      sourceKey: 'openid',
      as: 'UserRelationships', // 用户发起的绑定关系
    });

    WxUser.hasMany(app.model.Relationship, {
      foreignKey: 'partnerOpenid',
      sourceKey: 'openid',
      as: 'PartnerRelationships', // 用户作为伴侣的绑定关系
    });
  };
   WxUser.sync({ force: false }) // force: false 确保不会删除表
     .then(() => {})
     .catch((err) => {
       console.error('同步 WxUser 表失败:', err);
     });

  return WxUser;
};
