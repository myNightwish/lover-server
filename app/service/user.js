'use strict';

const Service = require('egg').Service;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class UserService extends Service {
  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @return {Object} 注册结果
   */
  async register(userData) {
    const { ctx } = this;
    
    try {
      // 检查用户名是否已存在
      const existUser = await ctx.model.User.findOne({
        where: { username: userData.username }
      });
      
      if (existUser) {
        return { success: false, message: '用户名已存在' };
      }
      
      // 生成盐和密码哈希
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(userData.password, salt, 1000, 64, 'sha512').toString('hex');

      // 创建用户
      const user = await ctx.model.User.create({
        username: userData.username,
        password: hash,
        salt,
        nickname: userData.nickname || userData.username,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar || 'https://mynightwish.oss-cn-beijing.aliyuncs.com/user-avatars/defaultAavatar.png',
        status: 'active',
        role: 'user',
        create_at: new Date(),
        bind_code: crypto.randomBytes(3).toString('hex').toUpperCase()
        });
      
      // 生成 token
      const tokens = this.generateTokens(user);
      
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      ctx.logger.error('用户注册失败', error);
      return { success: false, message: '注册失败: ' + error.message };
    }
  }
  
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @return {Object} 登录结果
   */
  async login(username, password) {
    const { ctx, app } = this;
    
    try {
      // 查找用户
      const user = await ctx.model.User.findOne({
        where: { username }
      });
      
      if (!user) {
        return { success: false, message: '用户名或密码错误' };
      }
      console.log(user);
      
      // 验证密码
      const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
      if (hash !== user.password) {
        return { success: false, message: '用户名或密码错误' };
      }
      
      // 生成 token
      const tokens = this.generateTokens(user);
      
      // 更新用户的最后登录时间
      await user.update({ last_login: new Date() });
      
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      ctx.logger.error('用户登录失败', error);
      return { success: false, message: '登录失败: ' + error.message };
    }
  }
  
  /**
   * 刷新 Token
   * @param {string} refreshToken - 刷新令牌
   * @return {Object} 新的令牌对
   */
  async refreshToken(refreshToken) {
    const { ctx, app } = this;
    
    try {
      // 验证刷新令牌
      const decoded = jwt.verify(refreshToken, app.config.jwt.refreshSecret);
      
      // 查找用户
      const user = await ctx.model.User.findByPk(decoded.id);
      
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 生成新的令牌对
      const tokens = this.generateTokens(user);
      
      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      ctx.logger.error('刷新令牌失败', error);
      return { success: false, message: '刷新令牌失败: ' + error.message };
    }
  }
  
  /**
   * 生成访问令牌和刷新令牌
   * @param {Object} user - 用户对象
   * @return {Object} 令牌对
   */
  generateTokens(user) {
    const { app } = this;
    
    // 用户信息载荷
    const payload = {
      id: user.id,
      username: user.username,
    };
    
    // 生成访问令牌 (短期有效)
    const accessToken = jwt.sign(payload, app.config.jwt.secret, {
      expiresIn: app.config.jwt.expiresIn || '7h' // 默认7小时
    });
    
    // 生成刷新令牌 (长期有效)
    const refreshToken = jwt.sign(payload, app.config.jwt.refreshSecret, {
      expiresIn: app.config.jwt.refreshExpiresIn || '7d' // 默认7天
    });
    
    return { accessToken, refreshToken };
  }
  
  /**
   * 验证令牌
   * @param {string} token - 访问令牌
   * @return {Object|null} 解码后的用户信息或null
   */
  verifyToken(token) {
    const { app } = this;
    
    try {
      return jwt.verify(token, app.config.jwt.secret);
    } catch (error) {
      return null;
    }
  }
  async findById(userId) {
    const { ctx } = this;
    const user = await ctx.model.User.findOne({ where: { id: userId } });
    return user;
  }
  /**
   * 获取当前用户信息
   * @param {number} userId - 用户ID
   * @return {Object} 用户信息
   */
  async getCurrentUser(userId) {
    const { ctx } = this;
    
    try {
      const user = await ctx.model.User.findByPk(userId);
      
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          partner_id: user.partner_id,
          created_at: user.created_at
        }
      };
    } catch (error) {
      ctx.logger.error('获取用户信息失败', error);
      return { success: false, message: '获取用户信息失败: ' + error.message };
    }
  }
  
  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} userData - 更新的用户数据
   * @return {Object} 更新结果
   */
  async updateUser(userId, userData) {
    const { ctx } = this;
    
    try {
      const user = await ctx.model.User.findByPk(userId);
      
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 更新用户信息
      const updateData = {};
      
      if (userData.nickname) updateData.nickname = userData.nickname;
      if (userData.email) updateData.email = userData.email;
      if (userData.phone) updateData.phone = userData.phone;
      if (userData.avatar) updateData.avatar = userData.avatar;
      
      // 如果要更新密码，需要验证旧密码
      if (userData.newPassword && userData.oldPassword) {
        const hash = crypto.pbkdf2Sync(userData.oldPassword, user.salt, 1000, 64, 'sha512').toString('hex');
        if (hash !== user.password) {
          return { success: false, message: '旧密码错误' };
        }
        
        // 更新密码
        const salt = crypto.randomBytes(16).toString('hex');
        const newHash = crypto.pbkdf2Sync(userData.newPassword, salt, 1000, 64, 'sha512').toString('hex');
        
        updateData.password = newHash;
        updateData.salt = salt;
      }
      
      await user.update(updateData);
      
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          partner_id: user.partner_id
        }
      };
    } catch (error) {
      ctx.logger.error('更新用户信息失败', error);
      return { success: false, message: '更新用户信息失败: ' + error.message };
    }
  }
  
  /**
   * 绑定伴侣
   * @param {number} userId - 用户ID
   * @param {string} partnerCode - 伴侣绑定码
   * @return {Object} 绑定结果
   */
  async bindPartner(userId, partnerCode) {
    const { ctx } = this;
    
    try {
      const user = await ctx.model.User.findByPk(userId);
      
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 如果已经绑定伴侣，不能再次绑定
      if (user.partner_id) {
        return { success: false, message: '您已经绑定了伴侣' };
      }
      
      // 查找伴侣
      const partner = await ctx.model.User.findOne({
        where: { bind_code: partnerCode }
      });
      
      if (!partner) {
        return { success: false, message: '伴侣绑定码无效' };
      }
      
      // 不能绑定自己
      if (partner.id === user.id) {
        return { success: false, message: '不能绑定自己为伴侣' };
      }
      
      // 如果伴侣已经绑定了其他人，不能绑定
      if (partner.partner_id && partner.partner_id !== user.id) {
        return { success: false, message: '该伴侣已经绑定了其他用户' };
      }
      
      // 绑定伴侣
      await user.update({ partner_id: partner.id });
      await partner.update({ partner_id: user.id });
      
      return {
        success: true,
        data: {
          id: user.id,
          partner_id: partner.id,
          partner_nickname: partner.nickname,
          partner_avatar: partner.avatar
        }
      };
    } catch (error) {
      ctx.logger.error('绑定伴侣失败', error);
      return { success: false, message: '绑定伴侣失败: ' + error.message };
    }
  }
  
  /**
   * 解绑伴侣
   * @param {number} userId - 用户ID
   * @return {Object} 解绑结果
   */
  async unbindPartner(userId) {
    const { ctx } = this;
    
    try {
      const user = await ctx.model.User.findByPk(userId);
      
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 如果没有绑定伴侣，不需要解绑
      if (!user.partner_id) {
        return { success: false, message: '您还没有绑定伴侣' };
      }
      
      // 获取伴侣
      const partner = await ctx.model.User.findByPk(user.partner_id);
      
      // 解绑伴侣
      await user.update({ partner_id: null });
      
      // 如果伴侣存在，也解绑伴侣
      if (partner) {
        await partner.update({ partner_id: null });
      }
      
      return { success: true, message: '解绑伴侣成功' };
    } catch (error) {
      ctx.logger.error('解绑伴侣失败', error);
      return { success: false, message: '解绑伴侣失败: ' + error.message };
    }
  }
  
  /**
   * 生成伴侣绑定码
   * @param {number} userId - 用户ID
   * @return {Object} 绑定码
   */
  async generateBindCode(userId) {
    const { ctx } = this;
    
    try {
      const user = await ctx.model.User.findByPk(userId);
      
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 生成绑定码
      const bindCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      
      // 更新用户绑定码
      await user.update({ bind_code: bindCode });
      
      return {
        success: true,
        data: { bind_code: bindCode }
      };
    } catch (error) {
      ctx.logger.error('生成绑定码失败', error);
      return { success: false, message: '生成绑定码失败: ' + error.message };
    }
  }
}

module.exports = UserService;