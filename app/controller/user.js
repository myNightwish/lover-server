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
  
  /**
   * 获取用户统计数据
   */
  async getUserStats() {
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
      
      // 获取用户创建的会话数量
      const sessionCount = await ctx.model.QuestionSession.count({
        where: { creator_id: userId }
      });
      
      // 获取用户回答的问题数量
      const answerCount = await ctx.model.QuestionAnswer.count({
        where: { user_id: userId }
      });
      
      // 获取用户收藏的问题数量
      const favoriteCount = await ctx.model.UserFavorite.count({
        where: { user_id: userId }
      });
      
      // 计算用户注册天数
      const registerDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      ctx.body = {
        success: true,
        data: {
          sessionCount,
          answerCount,
          favoriteCount,
          registerDays,
          hasPartner: !!user.partner_id
        }
      };
    } catch (error) {
      ctx.logger.error('获取用户统计数据失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取用户统计数据失败'
      };
    }
  }
  
  /**
   * 获取用户收藏的问题
   */
  async getFavoriteQuestions() {
    const { ctx } = this;
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 获取用户收藏的问题
      const favorites = await ctx.model.UserFavorite.findAll({
        where: { user_id: userId },
        include: [
          {
            model: ctx.model.Question,
            as: 'question',
            include: [
              {
                model: ctx.model.QuestionCategory,
                as: 'category',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // 格式化数据
      const questions = favorites.map(favorite => {
        const question = favorite.question;
        return {
          id: question.id,
          text: question.text,
          type: question.type,
          category: question.category ? {
            id: question.category.id,
            name: question.category.name
          } : null,
          favoriteId: favorite.id,
          createdAt: favorite.created_at
        };
      });
      
      ctx.body = {
        success: true,
        data: questions
      };
    } catch (error) {
      ctx.logger.error('获取用户收藏问题失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取用户收藏问题失败'
      };
    }
  }
  
  /**
   * 添加收藏问题
   */
  async addFavoriteQuestion() {
    const { ctx } = this;
    const { questionId } = ctx.request.body;
    
    if (!questionId) {
      ctx.body = {
        success: false,
        message: '缺少问题ID'
      };
      return;
    }
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 检查问题是否存在
      const question = await ctx.model.Question.findByPk(questionId);
      
      if (!question) {
        ctx.body = {
          success: false,
          message: '问题不存在'
        };
        return;
      }
      
      // 检查是否已经收藏
      const existingFavorite = await ctx.model.UserFavorite.findOne({
        where: {
          user_id: userId,
          question_id: questionId
        }
      });
      
      if (existingFavorite) {
        ctx.body = {
          success: false,
          message: '已经收藏过该问题'
        };
        return;
      }
      
      // 添加收藏
      await ctx.model.UserFavorite.create({
        user_id: userId,
        question_id: questionId
      });
      
      ctx.body = {
        success: true,
        message: '收藏成功'
      };
    } catch (error) {
      ctx.logger.error('添加收藏问题失败', error);
      ctx.body = {
        success: false,
        message: error.message || '添加收藏问题失败'
      };
    }
  }
  
  /**
   * 移除收藏问题
   */
  async removeFavoriteQuestion() {
    const { ctx } = this;
    const { favoriteId } = ctx.request.body;
    
    if (!favoriteId) {
      ctx.body = {
        success: false,
        message: '缺少收藏ID'
      };
      return;
    }
    
    try {
      // 从 JWT 中获取用户 ID
      const userId = ctx.state.user.id;
      
      // 查找收藏记录
      const favorite = await ctx.model.UserFavorite.findOne({
        where: {
          id: favoriteId,
          user_id: userId
        }
      });
      
      if (!favorite) {
        ctx.body = {
          success: false,
          message: '收藏记录不存在'
        };
        return;
      }
      
      // 删除收藏
      await favorite.destroy();
      
      ctx.body = {
        success: true,
        message: '取消收藏成功'
      };
    } catch (error) {
      ctx.logger.error('移除收藏问题失败', error);
      ctx.body = {
        success: false,
        message: error.message || '移除收藏问题失败'
      };
    }
  }
  
  /**
   * 微信登录
   */
  async wechatLogin() {
    const { ctx } = this;
    const { code } = ctx.request.body;
    
    if (!code) {
      ctx.body = {
        success: false,
        message: '缺少微信授权码'
      };
      return;
    }
    
    try {
      // 调用微信接口获取openid
      const wxResult = await ctx.curl('https://api.weixin.qq.com/sns/jscode2session', {
        method: 'GET',
        dataType: 'json',
        data: {
          appid: ctx.app.config.wechat.appId,
          secret: ctx.app.config.wechat.appSecret,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });
      
      if (!wxResult.data.openid) {
        ctx.body = {
          success: false,
          message: '微信授权失败'
        };
        return;
      }
      
      const openid = wxResult.data.openid;
      
      // 查找用户是否已存在
      let user = await ctx.model.User.findOne({
        where: { openid }
      });
      
      if (!user) {
        // 创建新用户
        user = await ctx.model.User.create({
          username: `wx_${openid.substring(0, 8)}`,
          nickname: `用户${Math.floor(Math.random() * 10000)}`,
          openid,
          password: '',
          salt: '',
          avatar: '/static/images/default-avatar.png',
          status: 'active',
          role: 'user'
        });
      }
      
      // 生成 token
      const tokens = ctx.service.user.generateTokens(user);
      
      // 更新用户的最后登录时间
      await user.update({ last_login: new Date() });
      
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      ctx.logger.error('微信登录失败', error);
      ctx.body = {
        success: false,
        message: error.message || '微信登录失败'
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

  /**
   * 搜索用户
   * @return {Promise<void>}
   */
  async searchUsers() {
    const { ctx } = this;
    const { keyword } = ctx.query;
    const userId = ctx.state.user.id;

    if (!keyword) {
      ctx.body = {
        success: false,
        message: '搜索关键词不能为空',
      };
      return;
    }

    try {
      // 搜索用户
      const users = await ctx.model.User.findAll({
        where: {
          id: { $ne: userId }, // 排除自己
          $or: [
            { nickname: { $like: `%${keyword}%` } },
            { username: { $like: `%${keyword}%` } },
            { bind_code: keyword },
          ],
        },
        attributes: ['id', 'nickname', 'avatar', 'bind_code'],
        limit: 10, // 限制返回数量
      });

      ctx.body = {
        success: true,
        data: users.map(user => ({
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          bindCode: user.bind_code,
        })),
      };
    } catch (error) {
      ctx.logger.error('搜索用户失败', error);
      ctx.body = {
        success: false,
        message: '搜索用户失败',
        error: error.message,
      };
    }
  }
}

module.exports = UserController;