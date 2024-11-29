// app/model/family_member.js
module.exports = app => {
  const { ENUM, DATE, INTEGER } = app.Sequelize;

  // 定义家庭成员模型
  const FamilyMember = app.model.define('family_member', {
    familyId: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'families', // 关联家庭表
        key: 'id',
      },
    },
    userId: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'users', // 关联用户表
        key: 'id',
      },
    },
    role: {
      type: ENUM('admin', 'member'),
      defaultValue: 'member',
    },
    joinedAt: {
      type: DATE,
      defaultValue: app.Sequelize.NOW,
    },
  }, {
    tableName: 'family_members',
    timestamps: false, // 关系表不需要自动维护时间戳
  });

  return FamilyMember;
};
