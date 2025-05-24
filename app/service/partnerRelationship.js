'use strict';

const Service = require('egg').Service;

class PartnerRelationshipService extends Service {
  /**
   * 根据用户ID获取伴侣关系
   * @param {number} userId - 用户ID
   * @return {Object} 伴侣关系记录
   */
  async getRelationshipByUserId(userId) {
    const { ctx } = this;
    
    // 直接查询用户的伴侣关系
    const user = await ctx.model.User.findByPk(userId, {
      attributes: ['id', 'partner_id']
    });
    
    if (user && user.partner_id) {
      // 如果用户有伴侣ID，构造一个简单的关系对象返回
      return {
        user_id: userId,
        partner_id: user.partner_id
      };
    }
    
    return null;
  }
  
  /**
   * 根据绑定码查找用户
   * @param {string} bindCode - 绑定码
   * @return {Object} 用户信息
   */
  async findUserByBindCode(bindCode) {
    const { ctx } = this;
    
    const user = await ctx.model.User.findOne({
      where: {
        bind_code: bindCode
      }
    });
    
    return user;
  }
}

module.exports = PartnerRelationshipService;