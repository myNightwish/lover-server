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
  
  /**
   * 创建伴侣关系
   * @param {number} user1Id - 用户1 ID
   * @param {number} user2Id - 用户2 ID
   * @return {Object} 创建的伴侣关系
   */
  async createRelationship(user1Id, user2Id) {
    const { ctx } = this;
    
    // 检查是否已存在关系
    const existingRelationship = await this.getRelationshipByUserId(user1Id);
    if (existingRelationship) {
      throw new Error('用户已有伴侣关系');
    }
    
    const relationship = await ctx.model.PartnerRelationship.create({
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return relationship;
  }
}

module.exports = PartnerRelationshipService;