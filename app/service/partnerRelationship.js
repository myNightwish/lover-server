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
    
    // 查询用户作为user1或user2的伴侣关系
    const relationship = await ctx.model.PartnerRelationship.findOne({
      where: {
        $or: [
          { user1_id: userId },
          { user2_id: userId }
        ],
        status: 'active' // 假设有状态字段表示关系是否有效
      }
    });
    
    return relationship;
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