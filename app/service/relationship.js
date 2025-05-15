const Service = require('egg').Service;

class RelationshipService extends Service {
  async bindRelationship(userId, partnerId) {
    const { Relationship } = this.ctx.model;

    // 检查是否已有绑定关系
    const existing = await Relationship.findOne({
      where: { userOpenid: userId, partnerOpenid: partnerId },
    });

    if (existing) {
      return { success: false, message: '已绑定，无需重复操作' };
    }

    // 创建绑定关系
    await Relationship.create({
      userOpenid: userId,
      partnerOpenid: partnerId,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return { success: true, message: '绑定成功' };
  }
  /**
   * 解除伴侣关系
   */
  async unbindRelationship(userId, partnerId) {
    const { ctx } = this;
    const { Relationship } = ctx.model;

    // 开启事务
    const result = await ctx.model.transaction(async (transaction) => {
      // 删除双向绑定关系
      await Promise.all([
        Relationship.destroy({
          where: { userOpenid: userId },
          transaction,
        }),
        Relationship.destroy({
          where: { userOpenid: partnerId },
          transaction,
        }),
      ]);

      // 清理相关数据
      // await this.cleanupRelatedData(userId, partnerId, transaction);

      return {
        success: true,
        message: '解除绑定成功',
      };
    });

    return result;
  }
  /**
   * 清理相关联数据
   */
  async cleanupRelatedData(userId, partnerId, transaction) {
    const { ctx } = this;

    // 清理共同问卷数据
    await ctx.model.QuestionnaireMatch.destroy({
      where: {
        [ctx.model.Sequelize.Op.or]: [
          { user_id: userId, partner_id: partnerId },
          { user_id: partnerId, partner_id: userId },
        ],
      },
      transaction,
    });

    // 清理记忆拼图数据
    await ctx.model.MemoryPuzzle.destroy({
      where: {
        [ctx.model.Sequelize.Op.or]: [
          { user_id: userId, partner_id: partnerId },
          { user_id: partnerId, partner_id: userId },
        ],
      },
      transaction,
    });

    // 清理兑换记录
    await ctx.model.ExchangeRecord.update(
      { status: 'cancelled' },
      {
        where: {
          [ctx.model.Sequelize.Op.or]: [
            { user_id: userId, target_id: partnerId },
            { user_id: partnerId, target_id: userId },
          ],
          status: 'pending',
        },
        transaction,
      }
    );

    // 添加系统消息通知
    await ctx.model.UserMessage.bulkCreate(
      [
        {
          user_id: userId,
          sender_id: 0, // 系统消息
          type: 'system',
          title: '伴侣关系解除通知',
          content: '你已成功解除伴侣关系，相关数据已清理',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: partnerId,
          sender_id: 0,
          type: 'system',
          title: '伴侣关系解除通知',
          content: '你的伴侣已解除关系绑定，相关数据已清理',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { transaction }
    );
  }
  /**
   * 检查用户是否有绑定的伴侣
   * @param {string} openid 用户的 openid
   * @return {object|null} 如果绑定了伴侣，返回伴侣的信息；否则返回 null
   */
  async getPartnerInfo(openid) {
    const { app } = this;

    // 查找绑定关系，优先查找作为发起方的关系
    const relationship = await app.model.Relationship.findOne({
      where: { userOpenid: openid },
      include: [
        {
          model: app.model.User,
          as: 'PartnerOpenId',
          attributes: ['openid', 'nickname', 'avatarUrl', 'id'], // 需要返回的伴侣字段
        },
      ],
    });

    if (relationship) {
      return relationship.PartnerOpenId;
    }

    // 如果未找到，查找作为伴侣方的关系
    const inverseRelationship = await app.model.Relationship.findOne({
      where: { partnerOpenid: openid },
      include: [
        {
          model: app.model.User,
          as: 'UserOpenId',
          attributes: ['openid', 'nickname', 'avatarUrl', 'id'], // 需要返回的绑定者字段
        },
      ],
    });

    return inverseRelationship ? inverseRelationship.UserOpenId : null;
  }
}

module.exports = RelationshipService;
