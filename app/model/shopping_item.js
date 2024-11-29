// app/model/shopping_item.js
module.exports = app => {
  const { INTEGER, STRING, TEXT, BOOLEAN, DATE } = app.Sequelize;

  // 定义清单项模型
  const ShoppingItem = app.model.define('shopping_item', {
    id: {
      type: STRING(6), // 定义为短字符串，长度可以调整
      primaryKey: true, // 设置为主键
      autoIncrement: true, // 自动递增
    },
    shoppingListId: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'shopping_lists', // 关联购物清单表
        key: 'id',
      },
    },
    name: {
      type: STRING,
      allowNull: false, // 对应 Mongoose 的 `required: true`
    },
    quantity: {
      type: INTEGER,
      allowNull: false, // 对应 Mongoose 的 `required: true`
    },
    description: {
      type: TEXT, // 对应 Mongoose 的 `String`
      allowNull: true,
    },
    image: {
      type: STRING, // 对应 Mongoose 的 `String`
      allowNull: true,
    },
    addedById: {
      type: INTEGER,
      references: {
        model: 'users', // 关联用户表
        key: 'id',
      },
    },
    purchased: {
      type: BOOLEAN, // 对应 Mongoose 的 `Boolean`
      defaultValue: false, // 对应 Mongoose 的 `default: false`
    },
    purchasedById: {
      type: INTEGER,
      references: {
        model: 'users', // 关联用户表
        key: 'id',
      },
    },
    purchasedAt: {
      type: DATE,
      allowNull: true, // 对应 Mongoose 的 `Date`
    },
    createdAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
  }, {
    tableName: 'shopping_items',
    timestamps: false, // 此表不自动维护 `createdAt` 和 `updatedAt`
  });

  ShoppingItem.associate = function() {
    // 清单项关联购物清单
    app.model.ShoppingItem.belongsTo(app.model.ShoppingList, {
      foreignKey: 'shoppingListId',
      targetKey: 'id',
    });

    // 清单项关联用户（添加者）
    app.model.ShoppingItem.belongsTo(app.model.User, {
      foreignKey: 'addedById',
      targetKey: 'id',
      as: 'addedBy',
    });

    // 清单项关联用户（采购者）
    app.model.ShoppingItem.belongsTo(app.model.User, {
      foreignKey: 'purchasedById',
      targetKey: 'id',
      as: 'purchasedBy',
    });
  };

  return ShoppingItem;
};
