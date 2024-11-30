const Controller = require('egg').Controller;

class ShoppingListController extends Controller {
  // 创建或更新购物清单
  async create() {
    const { ctx } = this;
    const { item } = ctx.request.body;
    const familyId = item.familyId;

    // 查找或创建购物清单
    let list = await ctx.model.ShoppingList.findOne({
      where: { familyId },
      include: [{ model: ctx.model.ShoppingItem }],
    });
    if (!list) {
      list = await ctx.model.ShoppingList.create({ familyId });
    }

    // 将新物品添加到购物清单中
    const newItem = await ctx.model.ShoppingItem.create({
      name: item.name,
      quantity: item.quantity,
      description: item.description,
      image: item.image,
      addedBy: ctx.user.id,
      shoppingListId: list.id,
      familyId,
    });

    // 更新购物清单的更新时间
    list.updatedAt = new Date();
    await list.save();

    // 通知家庭成员购物清单更新
    this.app.io.of('/').to(`family:${familyId}`).emit('listUpdated', {
      type: 'itemAdded',
      item: newItem,
    });

    ctx.body = list;
  }

  // 标记多个物品为已购买
  async markItemsAsPurchased() {
    const { ctx } = this;
    const { familyId, itemIds } = ctx.request.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      ctx.throw(400, 'Invalid itemIds');
    }

    // 查找购物清单及相关物品
    const list = await ctx.model.ShoppingList.findOne({
      where: { familyId },
      include: [{
        model: ctx.model.ShoppingItem,
        where: { id: { [ctx.app.Sequelize.Op.in]: itemIds } }, // 使用 Op.in 查询多个 itemId
      }],
    });

    if (!list) {
      ctx.throw(404, 'Shopping list not found');
    }

    // 更新物品的购买状态：这里的大坑：模型定义中的 hasMany 关联默认会将 ShoppingItem 数组命名为 shopping_items，而不是 ShoppingItems。
    // 因此，你应该使用 list.shopping_items 来访问关联的清单项，而不是 list.ShoppingItems
    const items = list.shopping_items;
    if (!items || items.length === 0) {
      ctx.throw(404, 'Items not found');
    }

    const now = new Date();
    await Promise.all(
      items.map(item => {
        item.purchased = true;
        item.purchasedBy = ctx.user.id;
        item.purchasedAt = now;
        return item.save();
      })
    );

    // 更新购物清单的更新时间
    list.updatedAt = now;
    await list.save();

    // 通知家庭成员购物清单更新
    this.app.io.of('/').to(`family:${familyId}`).emit('listUpdated', {
      type: 'itemsPurchased',
      itemIds,
    });

    ctx.body = { success: true, itemIds };
  }

  // 获取所有购物清单
  async getAllShoppingLists() {
    const { ctx } = this;
    const userId = ctx.user.id; // 获取当前用户 ID

    // 查找用户所在的所有家庭，并返回每个家庭的购物清单
    const families = await ctx.model.Family.findAll({
      include: {
        model: ctx.model.User,
        where: { id: userId },
      },
    });

    // 获取所有家庭的购物清单
    const shoppingLists = [];
    for (const family of families) {
      const list = await ctx.model.ShoppingList.findOne({
        where: { familyId: family.id },
        include: [{ model: ctx.model.ShoppingItem }],
      });
      shoppingLists.push({
        familyId: family.id,
        familyName: family.name,
        items: list?.shopping_items || [], // 购物清单项
      });
    }

    ctx.body = shoppingLists;
  }
}

module.exports = ShoppingListController;
