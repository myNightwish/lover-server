const Service = require('egg').Service;

class PointsService extends Service {
  /**
   * 记录行为并处理积分
   */
  async recordBehavior(userId, targetId, data) {
    const { ctx } = this;

    try {
      // 验证用户存在
      const [user, target] = await Promise.all([
        ctx.model.WxUser.findByPk(userId),
        ctx.model.WxUser.findByPk(targetId),
      ]);

      if (!user || !target) {
        throw new Error('用户不存在');
      }

      // 开启事务
      const result = await ctx.model.transaction(async (transaction) => {
        // 检查积分余额
        const userBalance = await this.getOrCreateBalance(userId, transaction);
        const targetBalance = await this.getOrCreateBalance(
          targetId,
          transaction
        );

        // 根据行为类型处理积分
        if (data.type === 'praise') {
          // 表扬：转赠积分
          if (userBalance.balance < data.points) {
            throw new Error('积分不足');
          }
          await userBalance.decrement('balance', {
            by: data.points,
            transaction,
          });
          await targetBalance.increment('balance', {
            by: data.points,
            transaction,
          });
        } else if (data.type === 'criticism') {
          // 批评：扣减对方积分
          if (targetBalance.balance < Math.abs(data.points)) {
            throw new Error('对方积分不足');
          }
          await targetBalance.decrement('balance', {
            by: Math.abs(data.points),
            transaction,
          });
        }

        // 记录积分变动
        const record = await ctx.model.PointsRecord.create(
          {
            user_id: userId,
            target_id: targetId,
            type: data.type,
            points: data.points,
            description: data.description,
            category: data.category,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction }
        );

        // 重新加载余额
        const [newUserBalance, newTargetBalance] = await Promise.all([
          userBalance.reload({ transaction }),
          targetBalance.reload({ transaction }),
        ]);

        return {
          record,
          userBalance: newUserBalance,
          targetBalance: newTargetBalance,
        };
      });

      return result;
    } catch (error) {
      ctx.logger.error('[PointsService] Record behavior failed:', error);
      throw error;
    }
  }

  // /**
  //  * 兑换奖励
  //  */
  // async exchange(userId, itemId) {
  //   const { ctx } = this;

  //   try {
  //     const result = await ctx.model.transaction(async (transaction) => {
  //       // 获取兑换项目
  //       const item = await ctx.model.ExchangeItem.findByPk(itemId);
  //       if (!item) {
  //         throw new Error('兑换项目不存在');
  //       }

  //       // 检查积分余额
  //       const balance = await this.getOrCreateBalance(userId, transaction);
  //       if (balance.balance < item.points_cost) {
  //         throw new Error('积分不足');
  //       }

  //       // 扣减积分
  //       await balance.decrement('balance', {
  //         by: item.points_cost,
  //         transaction,
  //       });

  //       // 记录兑换
  //       const record = await ctx.model.PointsRecord.create(
  //         {
  //           user_id: userId,
  //           target_id: userId,
  //           type: 'exchange',
  //           points: -item.points_cost,
  //           description: `兑换: ${item.title}`,
  //         },
  //         { transaction }
  //       );

  //       return {
  //         record,
  //         balance: await balance.reload(),
  //       };
  //     });

  //     return result;
  //   } catch (error) {
  //     ctx.logger.error('[PointsService] Exchange failed:', error);
  //     throw error;
  //   }
  // }

  /**
   * 发起兑换请求
   */
  async exchange(userId, itemId, partnerInfo, userInfo) {
    const { ctx } = this;

    try {
      // 验证兑换项目
      const item = await ctx.model.ExchangeItem.findByPk(itemId);
      if (!item) {
        throw new Error('兑换项目不存在');
      }

      // 验证积分余额
      const balance = await this.getOrCreateBalance(userId);
      if (balance.balance < item.points_cost) {
        throw new Error('积分不足');
      }

      // 创建兑换记录
      const exchangeRecord = await ctx.model.ExchangeRecord.create({
        user_id: userId,
        target_id: partnerInfo.id,
        item_id: itemId,
        points_cost: item.points_cost,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 创建消息通知
      await ctx.service.message.createMessage({
        userId: partnerInfo.id,
        senderId: userId,
        type: 'exchange_request',
        title: '新的兑换请求',
        content: `【${userInfo.nickName}】想要兑换「${item.title}」，需要消耗 ${item.points_cost} 积分，是否同意？`,
        relatedId: exchangeRecord.id,

      });

      return exchangeRecord;
    } catch (error) {
      ctx.logger.error('[PointsService] Exchange request failed:', error);
      throw error;
    }
  }

  /**
   * 获取或创建积分余额
   */
  async getOrCreateBalance(userId, transaction) {
    const { ctx } = this;

    let balance = await ctx.model.PointsBalance.findOne({
      where: { user_id: userId },
      transaction,
    });

    if (!balance) {
      balance = await ctx.model.PointsBalance.create(
        {
          user_id: userId,
          balance: 50, // 初始积分
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction }
      );
    }

    return balance;
  }

  /**
   * 获取用户积分概况
   */
  async getUserPointsOverview(userId) {
    const { ctx } = this;

    const [balance, records] = await Promise.all([
      ctx.model.PointsBalance.findOne({
        where: { user_id: userId },
      }),
      ctx.model.PointsRecord.findAll({
        where: {
          [ctx.model.Sequelize.Op.or]: [
            { user_id: userId },
            { target_id: userId },
          ],
        },
        order: [['created_at', 'DESC']],
        limit: 10,
      }),
    ]);

    return {
      balance: balance?.balance || 0,
      records: records.map((record) => ({
        id: record.id,
        type: record.type,
        points: record.points,
        description: record.description,
        category: record.category,
        isIncome: record.target_id === userId,
        createdAt: record.created_at,
      })),
    };
  }

  /**
   * 创建自定义兑换项目
   */
  async createExchangeItem(userId, itemData, partnerId) {
    const { ctx } = this;

    try {
      // 开启事务
      const result = await ctx.model.transaction(async (transaction) => {
        // 创建兑换项目
        const item = await ctx.model.ExchangeItem.create(
          {
            ...itemData,
            creator_id: userId,
            is_system: false,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction }
        );

        // 为伴侣创建相同的兑换项目
        await ctx.model.ExchangeItem.create(
          {
            ...itemData,
            creator_id: partnerId,
            is_system: false,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction }
        );

        return item;
      });

      return result;
    } catch (error) {
      ctx.logger.error('[PointsService] Create exchange item failed:', error);
      throw error;
    }
  }
  /**
   * 获取可用的兑换项目
   */
  async getAvailableExchangeItems(userId) {
    const { ctx } = this;

    try {
      const user = await ctx.model.WxUser.findByPk(userId);

      const items = await ctx.model.ExchangeItem.findAll({
        where: {
          [ctx.model.Sequelize.Op.or]: [
            { is_system: true },
            { creator_id: userId },
            user.partner_id ? { creator_id: user.partner_id } : null,
          ].filter(Boolean),
        },
        order: [['points_cost', 'ASC']],
      });

      return items;
    } catch (error) {
      ctx.logger.error('[PointsService] Get exchange items failed:', error);
      throw error;
    }
  }

  /**
   * 完成兑换
   */
  async completeExchange(exchangeId, targetId) {
    const { ctx } = this;

    try {
      const exchange = await ctx.model.ExchangeRecord.findOne({
        where: { id: exchangeId, status: 'pending' },
        include: [
          {
            model: ctx.model.ExchangeItem,
            as: 'item',
          },
        ],
      });

      if (!exchange) {
        throw new Error('兑换记录不存在或已处理');
      }

      if (exchange.target_id !== targetId) {
        throw new Error('无权操作此兑换记录');
      }

      // 开启事务
      const result = await ctx.model.transaction(async (transaction) => {
        // 扣除积分
        const userBalance = await this.getOrCreateBalance(exchange.user_id);
        if (userBalance.balance < exchange.points_cost) {
          throw new Error('积分不足');
        }
        await userBalance.decrement('balance', {
          by: exchange.points_cost,
          transaction,
        });

        // 更新兑换记录状态
        await exchange.update(
          {
            status: 'completed',
          },
          { transaction }
        );

        // 记录积分变动
        await ctx.model.PointsRecord.create(
          {
            user_id: exchange.user_id,
            target_id: exchange.target_id,
            type: 'exchange',
            points: -exchange.points_cost,
            description: `兑换「${exchange.item.title}」`,
            category: 'exchange',
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction }
        );

        return exchange;
      });

      return result;
    } catch (error) {
      ctx.logger.error('[PointsService] Complete exchange failed:', error);
      throw error;
    }
  }
}

module.exports = PointsService;
