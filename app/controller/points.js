const Controller = require('egg').Controller;
const SIGN_UP_IN_POINTS = 5;
class PointsController extends Controller {
  /**
   * 获取积分概况
   */
  async getOverview() {
    const { ctx } = this;
    const userId = ctx.state.user.id;

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
    const userId = ctx.state.user.id;
    const partnerId = ctx.state.user.partner_id;
    const behaviorData = ctx.request.body;
    if (behaviorData.type === 'signIn') {
      if (!partnerId) {
        ctx.body = {
          success: false,
          message: '请先绑定伴侣，可继续使用签到功能',
        };
        return;
      }
      const res = await ctx.service.points.getCheckinStatus(userId);
      if(!!res.hasCheckedIn) {
        ctx.body = {
          success: false,
          hasCheckedIn: true,
          message: '今日已完成签到，明日再来哦',
        };
        return;
      }
      // 如果是签到行为，直接给用户加上默认积分
      behaviorData.points = SIGN_UP_IN_POINTS;
      behaviorData.description = '签到获得积分';
      behaviorData.category = '签到';
    }

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
  //   const userId = ctx.state.user.id;
  //   const partnerId = ctx.state.user.partner_id;

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
    const userId = ctx.state.user.id;
    const partnerId = ctx.state.user.partner_id;
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
    const userId = ctx.state.user.id;
    const { itemId } = ctx.request.body;
    const partnerId = ctx.state.user.partner_id;
    if(!partnerId) {
      ctx.body = {
        success: false,
        message: '您还未绑定伴侣',
      };
      return;
    }

    try {
      const result = await ctx.service.points.exchange(
        userId,
        itemId,
        partnerId,
        ctx.state.user
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
  async getCheckinStatus() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    try {
      const res = await ctx.service.points.getCheckinStatus(userId);
      ctx.body = {
        success: true,
        data: {
          ...res,
          everydayPoints: SIGN_UP_IN_POINTS, // 每天签到获得的积分
        }
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
    const userId = ctx.state.user.id;

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
    const userId = ctx.state.user.id;
    const { exchangeId, isAccept } = ctx.request.body;
    try {
      const result = await ctx.service.points.completeExchange(
        userId,
        exchangeId,
        isAccept
      );

      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error,
      };
    }
  }
}

module.exports = PointsController;
