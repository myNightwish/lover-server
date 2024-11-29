// app/model/shopping_list.js
module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  // 定义购物清单模型
  const ShoppingList = app.model.define('shopping_list', {
    familyId: {
      type: INTEGER,
      allowNull: false, // 对应 Mongoose 的 `required: true`
      references: {
        model: 'families', // 关联家庭表
        key: 'id',
      },
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
    tableName: 'shopping_lists',
    timestamps: true, // 自动维护 `createdAt` 和 `updatedAt`
  });

  ShoppingList.associate = function() {
    // 购物清单关联家庭
    app.model.ShoppingList.belongsTo(app.model.Family, {
      foreignKey: 'familyId',
      targetKey: 'id',
    });

    // 购物清单与清单项关联
    app.model.ShoppingList.hasMany(app.model.ShoppingItem, {
      foreignKey: 'shoppingListId',
      sourceKey: 'id',
    });
  };

  return ShoppingList;
};
