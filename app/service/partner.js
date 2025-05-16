'use strict';

const Service = require('egg').Service;

class PartnerService extends Service {
  /**
   * 创建绑定关系
   * @param {number} userId - 当前用户ID
   * @param {number} targetId - 目标用户ID
   * @return {Object} 结果
   */
  async createBindRelationship(userId, targetId) {
    const { ctx } = this;
    
    // 开启事务
    const transaction = await ctx.model.transaction();
    
    try {
      // 检查是否已存在绑定请求
      const existingRequest = await ctx.model.BindRequest.findOne({
        where: {
          $or: [
            { user_id: userId, target_id: targetId },
            { user_id: targetId, target_id: userId }
          ],
          status: 'pending'
        },
        transaction
      });
      
      if (existingRequest) {
        await transaction.commit();
        return {
          success: false,
          message: '已存在绑定请求，请勿重复发送'
        };
      }
      
      // 创建绑定请求
      const bindRequest = await ctx.model.BindRequest.create({
        user_id: userId,
        target_id: targetId,
        status: 'pending',
        created_at: new Date()
      }, { transaction });
      
      // 获取用户信息
      const user = await ctx.model.User.findByPk(userId, {
        attributes: ['id', 'nickname', 'avatar'],
        transaction
      });
      
      await transaction.commit();
      
      // 可以在这里添加消息通知逻辑
      
      return {
        success: true,
        message: '绑定请求已发送，等待对方确认',
        data: {
          requestId: bindRequest.id,
          targetId,
          status: 'pending'
        }
      };
    } catch (error) {
      await transaction.rollback();
      this.ctx.logger.error('创建绑定关系失败', error);
      return {
        success: false,
        message: '创建绑定关系失败',
        error: error.message
      };
    }
  }
  
  /**
   * 接受绑定请求
   * @param {number} userId - 当前用户ID
   * @param {number} requestId - 请求ID
   * @return {Object} 结果
   */
  async acceptBindRequest(userId, requestId) {
    const { ctx } = this;
    
    // 开启事务
    const transaction = await ctx.model.transaction();
    
    try {
      // 查找绑定请求
      const bindRequest = await ctx.model.BindRequest.findOne({
        where: {
          id: requestId,
          target_id: userId,
          status: 'pending'
        },
        transaction
      });
      
      if (!bindRequest) {
        await transaction.commit();
        return {
          success: false,
          message: '绑定请求不存在或已处理'
        };
      }
      
      // 更新绑定请求状态
      await bindRequest.update({
        status: 'accepted',
        updated_at: new Date()
      }, { transaction });
      
      // 更新用户伴侣关系
      await ctx.model.User.update({
        partner_id: bindRequest.user_id
      }, {
        where: { id: userId },
        transaction
      });
      
      await ctx.model.User.update({
        partner_id: userId
      }, {
        where: { id: bindRequest.user_id },
        transaction
      });
      
      await transaction.commit();
      
      return {
        success: true,
        message: '已成功绑定伴侣关系',
        data: {
          partnerId: bindRequest.user_id
        }
      };
    } catch (error) {
      await transaction.rollback();
      this.ctx.logger.error('接受绑定请求失败', error);
      return {
        success: false,
        message: '接受绑定请求失败',
        error: error.message
      };
    }
  }
  
  /**
   * 发送伴侣绑定请求
   * @param {number} requesterId - 请求者ID
   * @param {number|string} targetIdentifier - 目标用户标识（ID或手机号）
   * @param {string} [type='id'] - 标识类型，'id'或'phone'
   * @return {Object} 请求结果
   */
  async sendBindRequest(requesterId, targetIdentifier, type = 'id') {
    const { ctx } = this;
    
    try {
      // 查找目标用户
      let targetUser;
      if (type === 'phone') {
        targetUser = await ctx.model.User.findOne({
          where: { phone: targetIdentifier },
          attributes: ['id', 'username', 'avatar']
        });
      } else {
        targetUser = await ctx.model.User.findByPk(targetIdentifier, {
          attributes: ['id', 'username', 'avatar']
        });
      }
      
      if (!targetUser) {
        return {
          success: false,
          message: '目标用户不存在'
        };
      }
      
      // 检查是否为自己
      if (targetUser.id === requesterId) {
        return {
          success: false,
          message: '不能向自己发送绑定请求'
        };
      }
      
      // 检查是否已经是伴侣关系
      const existingRelationship = await ctx.model.PartnerRelationship.findOne({
        where: {
          user_id: requesterId,
          partner_id: targetUser.id,
          status: 1
        }
      });
      
      if (existingRelationship) {
        return {
          success: false,
          message: '你们已经是伴侣关系'
        };
      }
      
      // 检查是否已有待处理的请求
      const pendingRequest = await ctx.model.PartnerBindRequest.findOne({
        where: {
          requester_id: requesterId,
          target_id: targetUser.id,
          status: 'pending'
        }
      });
      
      if (pendingRequest) {
        return {
          success: false,
          message: '已有待处理的绑定请求'
        };
      }
      
      // 创建绑定请求
      const request = await ctx.model.PartnerBindRequest.create({
        requester_id: requesterId,
        target_id: targetUser.id,
        status: 'pending',
        created_at: new Date()
      });
      
      // 创建通知消息
      await ctx.service.message.createMessage({
        userId: targetUser.id,
        senderId: targetUser.id,
        title: '新的伴侣绑定请求',
        content: `有用户请求与你建立伴侣关系`,
        type: 'partner_request',
      });
      
      return {
        success: true,
        message: '绑定请求已发送',
        data: {
          requestId: request.id,
          targetUser: {
            id: targetUser.id,
            username: targetUser.username,
            avatar: targetUser.avatar
          }
        }
      };
    } catch (error) {
      ctx.logger.error('发送伴侣绑定请求失败', error);
      return {
        success: false,
        message: error.message || '发送绑定请求失败'
      };
    }
  }
  
  /**
   * 接受伴侣绑定请求
   * @param {number} userId - 当前用户ID
   * @param {number} requestId - 请求ID
   * @return {Object} 处理结果
   */
  async acceptBindRequest(userId, requestId) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    
    try {
      // 查找绑定请求
      const request = await ctx.model.PartnerBindRequest.findOne({
        where: {
          id: requestId,
          target_id: userId,
          status: 'pending'
        }
      });
      
      if (!request) {
        await transaction.rollback();
        return {
          success: false,
          message: '绑定请求不存在或已处理'
        };
      }
      
      // 更新请求状态
      await request.update({ status: 'accepted' }, { transaction });
      
      // 创建双向伴侣关系
      const now = new Date();
      await ctx.model.PartnerRelationship.bulkCreate([
        {
          user_id: request.requester_id,
          partner_id: userId,
          bind_time: now,
          status: 1,
          created_at: now
        },
        {
          user_id: userId,
          partner_id: request.requester_id,
          bind_time: now,
          status: 1,
          created_at: now
        }
      ], { transaction });
      
      // 创建通知消息
      await ctx.service.message.createMessage({
        userId: request.requester_id,
        senderId: request.requester_id,
        title: '伴侣绑定成功',
        content: `你的伴侣绑定请求已被接受`,
        type: 'partner_accepted',
      }, transaction);
      
      await transaction.commit();
      
      return {
        success: true,
        message: '已接受绑定请求',
        data: {
          requestId: request.id,
          partnerId: request.requester_id
        }
      };
    } catch (error) {
      await transaction.rollback();
      ctx.logger.error('接受伴侣绑定请求失败', error);
      return {
        success: false,
        message: error.message || '接受绑定请求失败'
      };
    }
  }
  
  /**
   * 拒绝伴侣绑定请求
   * @param {number} userId - 当前用户ID
   * @param {number} requestId - 请求ID
   * @return {Object} 处理结果
   */
  async rejectBindRequest(userId, requestId) {
    const { ctx } = this;
    
    try {
      // 查找绑定请求
      const request = await ctx.model.PartnerBindRequest.findOne({
        where: {
          id: requestId,
          target_id: userId,
          status: 'pending'
        }
      });
      
      if (!request) {
        return {
          success: false,
          message: '绑定请求不存在或已处理'
        };
      }
      
      // 更新请求状态
      await request.update({ status: 'rejected' });
      
      // 创建通知消息
      await ctx.service.message.createMessage({
        userId: request.requester_id,
        senderId: request.requester_id,
        title: '伴侣绑定被拒绝',
        content: `你的伴侣绑定请求已被拒绝`,
        type: 'partner_rejected',
      });
      
      return {
        success: true,
        message: '已拒绝绑定请求',
        data: {
          requestId: request.id
        }
      };
    } catch (error) {
      ctx.logger.error('拒绝伴侣绑定请求失败', error);
      return {
        success: false,
        message: error.message || '拒绝绑定请求失败'
      };
    }
  }
  
  /**
   * 获取绑定请求列表
   * @param {number} userId - 用户ID
   * @return {Object} 请求列表
   */
  async getBindRequests(userId) {
    const { ctx } = this;
    
    try {
      // 查询收到的绑定请求
      const requests = await ctx.model.PartnerBindRequest.findAll({
        where: {
          target_id: userId,
          status: 'pending'
        },
        include: [{
          model: ctx.model.User,
          as: 'requester',
          attributes: ['id', 'username', 'avatar']
        }],
        order: [['created_at', 'DESC']]
      });
      
      return {
        success: true,
        data: requests.map(req => ({
          id: req.id,
          requesterId: req.requester_id,
          requester: req.requester,
          status: req.status,
          createdAt: req.created_at
        }))
      };
    } catch (error) {
      ctx.logger.error('获取绑定请求列表失败', error);
      return {
        success: false,
        message: error.message || '获取绑定请求列表失败'
      };
    }
  }
  
  /**
   * 获取绑定状态
   * @param {number} userId - 用户ID
   * @return {Object} 绑定状态信息
   */
  async getBindStatus(userId) {
    const { ctx } = this;
    
    try {
      // 从 user 表直接查询用户及其伴侣信息
      const user = await ctx.model.User.findByPk(userId, {
        attributes: ['id', 'nickname', 'partner_id']
      });
      
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }
      
      // 如果没有伴侣
      if (!user.partner_id) {
        return {
          success: true,
          data: {
            isBound: false,
            partnerInfo: null
          }
        };
      }
      
      // 查询伴侣信息
      const partner = await ctx.model.User.findByPk(user.partner_id, {
        attributes: ['id', 'nickname', 'bind_code']
      });
      
      if (!partner) {
        // 伴侣ID存在但伴侣不存在，这是一种异常情况
        // 可以考虑清除这个无效的伴侣ID
        await user.update({ partner_id: null });
        
        return {
          success: true,
          data: {
            isBound: false,
            partnerInfo: null
          }
        };
      }
      
      return {
        success: true,
        data: {
          isBound: true,
          partnerInfo: {
            id: partner.id,
            nickname: partner.nickname,
            avatar: partner.avatar,
            bindCode: partner.bind_code
          }
        }
      };
    } catch (error) {
      ctx.logger.error('获取绑定状态失败', error);
      return {
        success: false,
        message: error.message || '获取绑定状态失败'
      };
    }
  }
  
  /**
   * 解除伴侣绑定
   * @param {number} userId - 用户ID
   * @return {Object} 处理结果
   */
  async unbindPartner(userId) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    
    try {
      // 查询当前用户信息，获取伴侣ID
      const user = await ctx.model.User.findByPk(userId, {
        attributes: ['id', 'nickname', 'partner_id'],
        transaction
      });
      
      if (!user || !user.partner_id) {
        await transaction.rollback();
        return {
          success: false,
          message: '没有找到有效的伴侣关系'
        };
      }
      
      const partnerId = user.partner_id;
      const now = new Date();
      
      // 更新 user 表，清除双方的 partner_id
      await ctx.model.User.update({
        partner_id: null
      }, {
        where: { id: userId },
        transaction
      });
      
      await ctx.model.User.update({
        partner_id: null
      }, {
        where: { id: partnerId },
        transaction
      });
      
      // 如果存在 PartnerRelationship 表，也更新该表
      if (ctx.model.PartnerRelationship) {
        // 更新双方的伴侣关系状态
        await ctx.model.PartnerRelationship.update({
          status: 0,
          unbind_time: now
        }, {
          where: {
            user_id: userId,
            partner_id: partnerId,
            status: 1
          },
          transaction
        });
        
        await ctx.model.PartnerRelationship.update({
          status: 0,
          unbind_time: now
        }, {
          where: {
            user_id: partnerId,
            partner_id: userId,
            status: 1
          },
          transaction
        });
      }
      
      // 修复：确保提供所有必需的消息字段
      // todo：@add：这里将来如果做拒绝，需要消息的
      if (partnerId) {
        await ctx.service.message.createMessage({
          userId: partnerId,      // 接收消息的用户ID
          senderId: userId,       // 发送消息的用户ID
          title: '伴侣关系解除',
          content: `你的伴侣已解除与你的绑定关系`,
          type: 'partner_unbind',
          isRead: false,              // 未读状态
        }, { transaction });
      }
      
      await transaction.commit();
      
      return {
        success: true,
        message: '已解除伴侣绑定',
        data: {
          unbindTime: now
        }
      };
    } catch (error) {
      await transaction.rollback();
      ctx.logger.error('解除伴侣绑定失败', error);
      return {
        success: false,
        message: error.message || '解除伴侣绑定失败'
      };
    }
  }
  
  /**
   * 直接绑定伴侣关系
   * @param {number} userId - 当前用户ID
   * @param {number} partnerId - 伴侣用户ID
   * @return {Object} 结果
   */
  async directBindPartner(userId, partnerId) {
    const { ctx } = this;
    
    // 开启事务
    const transaction = await ctx.model.transaction();
    
    try {
      // 更新双方的伴侣关系
      await ctx.model.User.update({
        partner_id: partnerId
      }, {
        where: { id: userId },
        transaction
      });
      
      await ctx.model.User.update({
        partner_id: userId
      }, {
        where: { id: partnerId },
        transaction
      });
      
      // 如果需要保留 partner_relationship 表，同时更新该表
      await ctx.model.PartnerRelationship.create({
        user_id: userId,
        partner_id: partnerId,
        status: 'active',
        bind_time: new Date(),
        created_at: new Date()
      }, { transaction });
      
      // 获取伴侣信息
      const partnerInfo = await ctx.model.User.findByPk(partnerId, {
        attributes: ['id', 'nickname', 'avatar'],
        transaction
      });
      
      await transaction.commit();
      
      // 可以在这里添加消息通知逻辑
      
      return {
        success: true,
        message: '已成功绑定伴侣关系',
        data: {
          partnerId,
          partnerInfo: {
            id: partnerInfo.id,
            nickname: partnerInfo.nickname,
            avatar: partnerInfo.avatar
          }
        }
      };
    } catch (error) {
      await transaction.rollback();
      this.ctx.logger.error('绑定伴侣关系失败', error);
      return {
        success: false,
        message: '绑定伴侣关系失败',
        error: error.message
      };
    }
  }
}

module.exports = PartnerService;