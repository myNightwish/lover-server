'use strict';

const Controller = require('egg').Controller;

class PartnerController extends Controller {
  // 获取伴侣列表
  async getPartners() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    try {
      // 查询用户的伴侣关系
      const partners = await ctx.model.UserPartner.findAll({
        where: { user_id: userId },
        include: [
          {
            model: ctx.model.User,
            as: 'partner',
            attributes: ['id', 'nickname', 'avatar', 'gender']
          }
        ]
      });
      
      // 处理伴侣数据
      const result = partners.map(p => ({
        id: p.id,
        partnerId: p.partner_id,
        nickname: p.partner ? p.partner.nickname : '',
        avatar: p.partner ? p.partner.avatar : '',
        gender: p.partner ? p.partner.gender : '',
        status: p.status,
        createdAt: p.created_at
      }));
      
      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      ctx.logger.error('获取伴侣列表失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取伴侣列表失败'
      };
    }
  }
  
  // 添加伴侣
  async addPartner() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const { partnerId } = ctx.request.body;
    
    try {
      // 检查伴侣是否存在
      const partner = await ctx.model.User.findByPk(partnerId);
      if (!partner) {
        ctx.body = {
          success: false,
          message: '伴侣不存在'
        };
        return;
      }
      
      // 检查是否已经是伴侣
      const existPartner = await ctx.model.UserPartner.findOne({
        where: {
          user_id: userId,
          partner_id: partnerId
        }
      });
      
      if (existPartner) {
        ctx.body = {
          success: false,
          message: '已经是伴侣关系'
        };
        return;
      }
      
      // 创建伴侣关系
      await ctx.model.UserPartner.create({
        user_id: userId,
        partner_id: partnerId,
        status: 1, // 1-正常
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 创建反向伴侣关系
      await ctx.model.UserPartner.create({
        user_id: partnerId,
        partner_id: userId,
        status: 1, // 1-正常
        created_at: new Date(),
        updated_at: new Date()
      });
      
      ctx.body = {
        success: true,
        message: '添加伴侣成功'
      };
    } catch (error) {
      ctx.logger.error('添加伴侣失败', error);
      ctx.body = {
        success: false,
        message: error.message || '添加伴侣失败'
      };
    }
  }
  
  // 移除伴侣
  async removePartner() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const partnerId = ctx.params.id;
    
    try {
      // 移除伴侣关系
      await ctx.model.UserPartner.destroy({
        where: {
          user_id: userId,
          partner_id: partnerId
        }
      });
      
      // 移除反向伴侣关系
      await ctx.model.UserPartner.destroy({
        where: {
          user_id: partnerId,
          partner_id: userId
        }
      });
      
      ctx.body = {
        success: true,
        message: '移除伴侣成功'
      };
    } catch (error) {
      ctx.logger.error('移除伴侣失败', error);
      ctx.body = {
        success: false,
        message: error.message || '移除伴侣失败'
      };
    }
  }
}

module.exports = PartnerController;