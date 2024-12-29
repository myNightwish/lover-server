module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const Relationship = app.model.define('relationship', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userOpenid: {
      type: STRING,
      allowNull: false,
      references: {
        model: 'wx_users', // 引用 wx_user 表
        key: 'openid',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    partnerOpenid: {
      type: STRING,
      allowNull: false,
      references: {
        model: 'wx_users', // 引用 wx_user 表
        key: 'openid',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    tableName: 'relationships',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: [ 'userOpenid', 'partnerOpenid' ],
      },
    ],
  });

  Relationship.associate = () => {
    // 定义与 WxUser 的关联，并给别名
    Relationship.belongsTo(app.model.WxUser, {
      foreignKey: 'userOpenid',
      targetKey: 'openid',
      as: 'UserOpenId', // 唯一别名
    });

    Relationship.belongsTo(app.model.WxUser, {
      foreignKey: 'partnerOpenid',
      targetKey: 'openid',
      as: 'PartnerOpenId', // 被绑定方
    });
  };
  Relationship.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 UserRelationshipAnswer 表失败:', err);
    });

  return Relationship;
};
