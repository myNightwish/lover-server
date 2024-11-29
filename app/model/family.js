// // app/model/family.js
// module.exports = app => {
//   const { STRING, ENUM, DATE, INTEGER } = app.Sequelize;

//   // 定义模型
//   const Family = app.model.define('family', {
//     // 家庭名称
//     name: {
//       type: STRING,
//       allowNull: false, // 对应 Mongoose 的 `required: true`
//     },
//     // 创建时间
//     createdAt: {
//       type: DATE,
//       allowNull: false,
//       defaultValue: app.Sequelize.NOW,
//     },
//     // 更新时间
//     updatedAt: {
//       type: DATE,
//       allowNull: false,
//       defaultValue: app.Sequelize.NOW,
//     },
//   }, {
//     // Sequelize 配置项
//     tableName: 'families', // 指定表名
//     timestamps: true, // 自动维护 `createdAt` 和 `updatedAt`
//   });

//   // 定义成员关系表（多对多关系）
//   const FamilyMember = app.model.define('family_member', {
//     familyId: {
//       type: INTEGER,
//       allowNull: false,
//       references: {
//         model: 'families', // 关联家庭表
//         key: 'id',
//       },
//     },
//     userId: {
//       type: INTEGER,
//       allowNull: false,
//       references: {
//         model: 'users', // 关联用户表
//         key: 'id',
//       },
//     },
//     role: {
//       type: ENUM('admin', 'member'), // 对应 Mongoose 的 `enum`
//       defaultValue: 'member', // 对应 Mongoose 的 `default: 'member'`
//     },
//     joinedAt: {
//       type: DATE,
//       defaultValue: app.Sequelize.NOW, // 对应 Mongoose 的 `default: Date.now`
//     },
//   }, {
//     tableName: 'family_members', // 指定关系表名
//     timestamps: false, // 此表不需要自动维护 `createdAt` 和 `updatedAt`
//   });

//   // 模型关联
//   Family.associate = function() {
//     // 家庭与用户通过关系表关联
//     app.model.Family.belongsToMany(app.model.User, {
//       through: FamilyMember,
//       foreignKey: 'familyId',
//       otherKey: 'userId',
//     });

//     app.model.User.belongsToMany(app.model.Family, {
//       through: FamilyMember,
//       foreignKey: 'userId',
//       otherKey: 'familyId',
//     });
//   };

//   return Family;
// };
// app/model/family.js
module.exports = app => {
  const { STRING, DATE } = app.Sequelize;

  // 定义家庭模型
  const Family = app.model.define('family', {
    // 家庭名称
    name: {
      type: STRING,
      allowNull: false,
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
