const Service = require('egg').Service;

class RelationshipService extends Service {
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
