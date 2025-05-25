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
        ctx.model.User.findByPk(userId),
        ctx.model.User.findByPk(targetId),
      ]);

      if (!user) {
        throw new Error('用户不存在');
      }
      if (!target) {
        throw new Error('伴侣记录未找到');
      }

      // 开启事务
      const result = await ctx.model.transaction(async (transaction) => {
        // 检查积分余额
        const userBalance = await this.getOrCreateBalance(userId, transaction);
        const targetBalance = await this.getOrCreateBalance(
          targetId,
          transaction
        );

        let userDescription = '';
        let targetDescription = '';

        // 根据行为类型处理积分
        if (data.type === 'praise') {
          // 表扬：转赠积分
          if (userBalance.balance < data.points) {
            throw new Error('积分不足');
          }

          // 构造表扬描述
          userDescription = `【${user.nickname}】表扬【${target.nickname}】: ${data.description}`;
          targetDescription = `【${user.nickname}】表扬【${target.nickname}】: ${data.description}`;

          // 扣除 user 积分
          await userBalance.decrement('balance', {
            by: data.points,
            transaction,
          });

          // 增加 target 积分
          await targetBalance.increment('balance', {
            by: data.points,
            transaction,
          });

          // 对 user 记录行为：praiseOther（扣除积分）
          await ctx.model.PointsRecord.create(
            {
              user_id: userId,
              target_id: targetId,
              type: 'praiseOther',
              points: -data.points,
              description: userDescription,
              category: data.category,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction }
          );

          // 对 target 记录行为：bePraised（增加积分）
          await ctx.model.PointsRecord.create(
            {
              user_id: targetId,
              target_id: userId,
              type: 'bePraised',
              points: data.points,
              description: targetDescription,
              category: data.category,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction }
          );
        } else if (data.type === 'criticism') {
          // 批评：扣减对方积分
          if (targetBalance.balance < Math.abs(data.points)) {
            throw new Error('对方积分不足');
          }

          // 构造批评描述
          userDescription = `${user.nickname}批评${target.nickname}: ${data.description}`;
          targetDescription = `${user.nickname}批评${target.nickname}: ${data.description}`;

          // 扣除 target 积分
          await targetBalance.decrement('balance', {
            by: Math.abs(data.points),
            transaction,
          });

          // 对 user 记录行为：criticismOther（不扣除积分，行为记录）
          await ctx.model.PointsRecord.create(
            {
              user_id: userId,
              target_id: targetId,
              type: 'criticismOther',
              points: 0, // 批评自己不扣积分，只是记录行为
              description: userDescription,
              category: data.category,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction }
          );

          // 对 target 记录行为：beCriticismed（扣除积分）
          await ctx.model.PointsRecord.create(
            {
              user_id: targetId,
              target_id: userId,
              type: 'beCriticismed',
              points: -Math.abs(data.points),
              description: targetDescription,
              category: data.category,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction }
          );
        } else if (data.type === 'signIn') {
           // 增加 target 积分
           console.log('data.points---', data.points)
          await userBalance.increment('balance', {
            by: data.points,
            transaction,
          });
          // 对 user 记录行为：signIn（签到积分）
          await ctx.model.PointsRecord.create(
            {
              user_id: userId,
              target_id: 0, // 系统赠送
              type: 'signIn',
              points: data.points, // 签到赠送积分
              description: userDescription,
              category: data.category,
              created_at: new Date(),
              updated_at: new Date(),
            },
            { transaction }
          );
        }

        // 重新加载余额
        const [newUserBalance, newTargetBalance] = await Promise.all([
          userBalance.reload({ transaction }),
          targetBalance.reload({ transaction }),
        ]);

        console.log('newUserBalance, newTargetBalance', newUserBalance, newTargetBalance)

        return {
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

  /**
   * 发起兑换请求
   */
  async exchange(userId, itemId, partnerId, userInfo) {
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
        target_id: partnerId,
        item_id: itemId,
        points_cost: item.points_cost,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 创建消息通知
      await ctx.service.message.createMessage({
        userId: partnerId,
        senderId: userId,
        type: 'exchange_request',
        title: '新的兑换请求',
        content: `【${userInfo.nickname}】想要兑换「${item.title}」，需要消耗 ${item.points_cost} 积分，是否同意？`,
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

    // 获取用户积分余额
    const balance = await ctx.model.PointsBalance.findOne({
      where: { user_id: userId },
    });

    // 获取用户积分记录，只返回与该用户相关的记录
    const records = await ctx.model.PointsRecord.findAll({
      where: {
        [ctx.model.Sequelize.Op.or]: [
          { user_id: userId }, // 记录用户自己发起的行为
        ],
        // 过滤掉不必要的记录
        type: {
          [ctx.model.Sequelize.Op.in]: [
            'praiseOther',
            'bePraised',
            'criticismOther',
            'beCriticismed',
            'exchange',
          ],
        },
      },
      order: [['created_at', 'DESC']], // 按照创建时间降序排序
    });

    return {
      balance: balance?.balance || 0, // 用户余额
      records: records.map((record) => ({
        id: record.id,
        type: record.type,
        points: record.points,
        description: record.description,
        category: record.category,
        isIncome: record.target_id === userId, // 判断是增加还是减少
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
      const user = await ctx.model.User.findByPk(userId);

      let items = await ctx.model.ExchangeItem.findAll({
        where: {
          [ctx.model.Sequelize.Op.or]: [
            { is_system: true },
            { creator_id: userId },
            user.partner_id ? { creator_id: user.partner_id } : null,
          ].filter(Boolean),
        },
        order: [['points_cost', 'ASC']],
      });
      
      // 如果没有找到兑换项目，先初始化
      if (!items || items.length === 0) {
        console.log('未找到兑换项目，正在初始化...');
        await ctx.service.initUserProgress.initializePoints(userId);
        await ctx.service.initUserProgress.initializeUserData(userId);
        // 初始化后重新查询
        items = await ctx.model.ExchangeItem.findAll({
          where: {
            [ctx.model.Sequelize.Op.or]: [
              { is_system: true },
              { creator_id: userId },
              user.partner_id ? { creator_id: user.partner_id } : null,
            ].filter(Boolean),
          },
          order: [['points_cost', 'ASC']],
        });
      }

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
    /**
   * 获取用户签到状态
   * @param {number} userId - 用户ID
   * @return {Object} 签到状态信息
   */
  async getCheckinStatus(userId) {
    const { ctx } = this;
    // 获取今天的开始时间和结束时间
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    // 查询今天的签到记录
    const existingCheckin = await ctx.model.PointsRecord.findOne({
      where: {
        user_id: userId,
        type: 'signIn',
        created_at: {
          [ctx.model.Sequelize.Op.gte]: today,
          [ctx.model.Sequelize.Op.lt]: tomorrow
        }
      }
    });
    // 获取用户积分余额
    const balance = await this.getOrCreateBalance(userId);
    
    return {
      hasCheckedIn: !!existingCheckin,
      totalPoints: balance.balance || 0
    };
  }
}

module.exports = PointsService;
