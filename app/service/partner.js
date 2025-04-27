'use strict';

const Service = require('egg').Service;

class PartnerService extends Service {
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
        user_id: targetUser.id,
        title: '新的伴侣绑定请求',
        content: `有用户请求与你建立伴侣关系`,
        type: 'partner_request',
        related_id: request.id,
        status: 0
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
        user_id: request.requester_id,
        title: '伴侣绑定成功',
        content: `你的伴侣绑定请求已被接受`,
        type: 'partner_accepted',
        related_id: request.id,
        status: 0
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
        user_id: request.requester_id,
        title: '伴侣绑定被拒绝',
        content: `你的伴侣绑定请求已被拒绝`,
        type: 'partner_rejected',
        related_id: request.id,
        status: 0
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
   * @return {Object} 绑定状态
   */
  async getBindStatus(userId) {
    const { ctx } = this;
    
    try {
      // 查询当前有效的伴侣关系
      const relationship = await ctx.model.PartnerRelationship.findOne({
        where: {
          user_id: userId,
          status: 1
        },
        include: [{
          model: ctx.model.User,
          as: 'partner',
          attributes: ['id', 'username', 'avatar']
        }]
      });
      
      if (!relationship) {
        return {
          success: true,
          data: {
            isBound: false,
            partner: null
          }
        };
      }
      
      return {
        success: true,
        data: {
          isBound: true,
          partner: relationship.partner,
          bindTime: relationship.bind_time
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
      // 查询当前有效的伴侣关系
      const relationship = await ctx.model.PartnerRelationship.findOne({
        where: {
          user_id: userId,
          status: 1
        }
      });
      
      if (!relationship) {
        await transaction.rollback();
        return {
          success: false,
          message: '没有找到有效的伴侣关系'
        };
      }
      
      const partnerId = relationship.partner_id;
      const now = new Date();
      
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
      
      // 创建通知消息
      await ctx.service.message.createMessage({
        user_id: partnerId,
        title: '伴侣关系解除',
        content: `你的伴侣已解除与你的绑定关系`,
        type: 'partner_unbind',
        status: 0
      }, transaction);
      
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
}

module.exports = PartnerService;