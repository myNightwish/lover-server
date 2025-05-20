'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  /**
   * 用户注册
   */
  async register() {
    const { ctx } = this;
    const userData = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        username: { type: 'string', required: true },
        password: { type: 'string', required: true },
        nickname: { type: 'string', required: false },
        email: { type: 'string', required: false },
        phone: { type: 'string', required: false },
      });
      
      // 调用 service 进行注册
      const result = await ctx.service.user.register(userData);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('注册失败', error);
      ctx.body = {
        success: false,
        message: error.message || '注册失败'
      };
    }
  }
  
  /**
   * 用户登录
   */
  async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        username: { type: 'string', required: true },
        password: { type: 'string', required: true }
      });
      
      // 调用 service 进行登录
      const result = await ctx.service.user.login(username, password);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('登录失败', error);
      ctx.body = {
        success: false,
        message: error.message || '登录失败'
      };
    }
  }
  
  /**
   * 刷新访问令牌
   */
  async refreshToken() {
    const { ctx } = this;
    const { refreshToken } = ctx.request.body;
    
    if (!refreshToken) {
      ctx.body = {
        success: false,
        message: '缺少刷新令牌'
      };
      return;
    }
    
    try {
      // 调用 service 刷新令牌
      const result = await ctx.service.user.refreshToken(refreshToken);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('刷新令牌失败', error);
      ctx.body = {
        success: false,
        message: error.message || '刷新令牌失败'
      };
    }
  }
  
  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    const { ctx } = this;
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      // 调用 service 获取用户信息
      const result = await ctx.service.user.getCurrentUser(userId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('获取用户信息失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取用户信息失败'
      };
    }
  }
  
  /**
   * 更新用户信息
   */
  async updateUser() {
    const { ctx } = this;
    const userData = ctx.request.body;
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 调用 service 更新用户信息
      const result = await ctx.service.user.updateUser(userId, userData);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('更新用户信息失败', error);
      ctx.body = {
        success: false,
        message: error.message || '更新用户信息失败'
      };
    }
  }
  
  /**
   * 绑定伴侣
   */
  async bindPartner() {
    const { ctx } = this;
    const { partnerCode } = ctx.request.body;
    
    if (!partnerCode) {
      ctx.body = {
        success: false,
        message: '缺少伴侣绑定码'
      };
      return;
    }
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 调用 service 绑定伴侣
      const result = await ctx.service.user.bindPartner(userId, partnerCode);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('绑定伴侣失败', error);
      ctx.body = {
        success: false,
        message: error.message || '绑定伴侣失败'
      };
    }
  }
  
  /**
   * 解绑伴侣
   */
  async unbindPartner() {
    const { ctx } = this;
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 调用 service 解绑伴侣
      const result = await ctx.service.user.unbindPartner(userId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('解绑伴侣失败', error);
      ctx.body = {
        success: false,
        message: error.message || '解绑伴侣失败'
      };
    }
  }
  
  /**
   * 生成伴侣绑定码
   */
  async generateBindCode() {
    const { ctx } = this;
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 调用 service 生成绑定码
      const result = await ctx.service.user.generateBindCode(userId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('生成绑定码失败', error);
      ctx.body = {
        success: false,
        message: error.message || '生成绑定码失败'
      };
    }
  }
  
  /**
   * 获取伴侣信息
   */
  async getPartnerInfo() {
    const { ctx } = this;
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 获取用户信息
      const user = await ctx.model.User.findByPk(userId);
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 如果没有绑定伴侣
      if (!user.partner_id) {
        ctx.body = {
          success: false,
          message: '您还没有绑定伴侣'
        };
        return;
      }
      
      // 获取伴侣信息
      const partner = await ctx.model.User.findByPk(user.partner_id);
      
      if (!partner) {
        ctx.body = {
          success: false,
          message: '伴侣不存在'
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: {
          id: partner.id,
          username: partner.username,
          nickname: partner.nickname,
          avatar: partner.avatar,
          created_at: partner.created_at
        }
      };
    } catch (error) {
      ctx.logger.error('获取伴侣信息失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取伴侣信息失败'
      };
    }
  }
  
  /**
   * 获取用户会话列表
   */
  async getUserSessions() {
    const { ctx } = this;
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 获取用户参与的会话
      const sessions = await ctx.model.QuestionSession.findAll({
        where: {
          $or: [
            { creator_id: userId },
            { partner_id: userId }
          ]
        },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: ctx.model.User,
            as: 'creator',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: ctx.model.User,
            as: 'partner',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ]
      });
      
      ctx.body = {
        success: true,
        data: sessions
      };
    } catch (error) {
      ctx.logger.error('获取用户会话列表失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取用户会话列表失败'
      };
    }
  }
  
   // 新增注销功能
   async logout() {
    const { ctx } = this;

    try {
      const userId = ctx.state.user.id;
      const user = await ctx.model.User.findByPk(userId);
      
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }
      
      // 清除用户信息
      await ctx.model.User.destroy({
        where: { id: userId }
      });
      
      // 如果有关联的其他数据表，也可以在这里清除
      // 例如：清除用户的会话、消息、进度等数据
      
      return {
        success: true,
        message: '用户已成功注销，所有数据已清除'
      };
    } catch (error) {
      ctx.logger.error('用户注销失败', error);
      return {
        success: false,
        message: error.message || '注销失败'
      };
    }
  }

  /**
   * 根据绑定码查找用户
   * @return {Promise<void>}
   */
  async findUserByBindCode() {
    const { ctx } = this;
    const { bindCode } = ctx.query;

    if (!bindCode) {
      ctx.body = {
        success: false,
        message: '绑定码不能为空',
      };
      return;
    }

    try {
      // 查找用户
      const user = await ctx.model.User.findOne({
        where: { bind_code: bindCode },
        attributes: ['id', 'nickname', 'avatar', 'bind_code'],
      });

      if (!user) {
        ctx.body = {
          success: false,
          message: '未找到该用户',
        };
        return;
      }

      // 返回用户基本信息
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          bindCode: user.bind_code,
        },
      };
    } catch (error) {
      ctx.logger.error('查找用户失败', error);
      ctx.body = {
        success: false,
        message: '查找用户失败',
        error: error.message,
      };
    }
  }

  /**
   * 获取当前用户信息
   * @return {Promise<void>}
   */
  async getUserInfo() {
    const { ctx } = this;
    const userId = ctx.state.user.id;

    try {
      // 查询用户信息
      const user = await ctx.model.User.findByPk(userId, {
        attributes: ['id', 'username', 'nickname', 'avatar', 'bind_code', 'partner_id'],
      });

      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在',
        };
        return;
      }

      // 获取伴侣信息
      let partnerInfo = null;
      if (user.partner_id) {
        const partner = await ctx.model.User.findByPk(user.partner_id, {
          attributes: ['id', 'nickname', 'avatar'],
        });
        
        if (partner) {
          partnerInfo = {
            id: partner.id,
            nickname: partner.nickname,
            avatar: partner.avatar,
          };
        }
      }

      // 返回用户信息
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          bindCode: user.bind_code,
          partnerInfo,
        },
      };
    } catch (error) {
      ctx.logger.error('获取用户信息失败', error);
      ctx.body = {
        success: false,
        message: '获取用户信息失败',
        error: error.message,
      };
    }
  }


}

module.exports = UserController;