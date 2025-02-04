const Controller = require('egg').Controller;

class PointsController extends Controller {
  /**
   * 获取积分概况
   */
  async getOverview() {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const overview = await ctx.service.points.getUserPointsOverview(userId);
      ctx.body = {
        success: true,
        data: overview,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 记录行为
   */
  async recordBehavior() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const partnerId = ctx.user.partner_id;
    const behaviorData = ctx.request.body;

    try {
      const result = await ctx.service.points.recordBehavior(
        userId,
        partnerId,
        behaviorData
      );

      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 获取兑换项目列表
   */
  // async getExchangeItems() {
  //   const { ctx } = this;
  //   const userId = ctx.user.id;
  //   const partnerId = ctx.user.partner_id;

  //   try {
  //     const items = await ctx.model.ExchangeItem.findAll({
  //       where: {
  //         [ctx.model.Sequelize.Op.or]: [
  //           { is_system: true },
  //           { creator_id: userId },
  //         ],
  //       },
  //       order: [['points_cost', 'ASC']],
  //     });

  //     ctx.body = {
  //       success: true,
  //       data: items,
  //     };
  //   } catch (error) {
  //     ctx.status = 500;
  //     ctx.body = {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  /**
   * 创建自定义兑换项目
   */
  async createExchangeItem() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const partnerId = ctx.user.partner_id;
    const itemData = ctx.request.body;
    try {
      const result = await ctx.service.points.createExchangeItem(
        userId,
        itemData,
        partnerId
      );
      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 兑换奖励
   */
  async exchange() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const partnerInfo = ctx.user.partnerInfo;
    const { itemId } = ctx.request.body;

    try {
      const result = await ctx.service.points.exchange(
        userId,
        itemId,
        partnerInfo,
        ctx.user
      );

      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 获取积分历史记录
   */
  async getHistory() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { page = 1, pageSize = 20 } = ctx.query;
    const data = ctx.service.points.getHistory(userId, page, pageSize);

    try {
      ctx.body = {
        success: true,
        data
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 获取兑换项目列表
   */
  async getExchangeItems() {
    const { ctx } = this;
    const userId = ctx.user.id;

    try {
      const items = await ctx.service.points.getAvailableExchangeItems(userId);

      ctx.body = {
        success: true,
        data: items,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 完成兑换
   */
  async completeExchange() {
    const { ctx } = this;
    const userId = ctx.user.id;
    const { id: exchangeId } = ctx.params;

    try {
      const result = await ctx.service.points.completeExchange(
        exchangeId,
        userId
      );

      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = PointsController;
