const Service = require('egg').Service;

class RelationshipService extends Service {
  async bindRelationship(userId, partnerId) {
    const { Relationship } = this.ctx.model;
    console.log('relationship', Relationship);

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
    });
    return { success: true, message: '绑定成功' };
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
          model: app.model.WxUser,
          as: 'PartnerOpenId',
          attributes: [ 'openid', 'nickName', 'avatarUrl' ], // 需要返回的伴侣字段
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
          model: app.model.WxUser,
          as: 'UserOpenId',
          attributes: [ 'openid', 'nickName', 'avatarUrl' ], // 需要返回的绑定者字段
        },
      ],
    });

    return inverseRelationship ? inverseRelationship.UserOpenId : null;
  }

  /**
   * 获取当前用户的绑定关系（通过用户 ID）
   * @param {number} userId - 当前用户的 ID
   * @return {object|null} 返回伴侣信息，或者 null 表示没有绑定关系
   */
  async getPartnerByUserId(userId) {
    // 查找用户对应的 openid
    const user = await this.app.model.WxUser.findOne({
      where: { id: userId },
      attributes: [ 'openid' ],
    });

    if (!user) {
      return null; // 用户不存在
    }

    const relationship = await this.app.model.Relationship.findOne({
      where: { userOpenid: user.openid },
      include: [
        {
          model: this.app.model.WxUser,
          as: 'PartnerOpenId', // 与 Relationship 模型中定义的 alias 一致
          attributes: [ 'id', 'openid', 'nickName' ], // 获取需要的伴侣信息
        },
      ],
    });

    // 如果没有绑定关系，直接返回 null
    if (!relationship || !relationship.PartnerOpenId) {
      return null;
    }

    // 返回伴侣信息
    return {
      id: relationship.PartnerOpenId.id, // 数据库 ID
      openid: relationship.PartnerOpenId.openid, // 微信 openid
      nickName: relationship.PartnerOpenId.nickName, // 昵称
    };
  }
}

module.exports = RelationshipService;
