// app/model/family.js
module.exports = app => {
  const { STRING, DATE, ENUM } = app.Sequelize;

  // 定义家庭模型
  const Family = app.model.define('family', {
    // 家庭名称
    name: {
      type: STRING,
      allowNull: false,
    },
    // 家庭状态
    status: {
      type: ENUM('pending', 'active', 'inactive'),
      defaultValue: 'pending', // 初始状态为待完成
    },
    // 创建时间
    createdAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
    // 更新时间
    updatedAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
  }, {
    tableName: 'families',
    timestamps: true,
  });

  Family.associate = function() {
    // 家庭与用户通过关系表关联
    app.model.Family.belongsToMany(app.model.User, {
      through: app.model.FamilyMember, // 通过 FamilyMember 关系表
      foreignKey: 'familyId',
      otherKey: 'userId',
    });

    app.model.User.belongsToMany(app.model.Family, {
      through: app.model.FamilyMember,
      foreignKey: 'userId',
      otherKey: 'familyId',
    });
  };

  return Family;
};
