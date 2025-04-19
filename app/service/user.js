'use strict';

const Service = require('egg').Service;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService extends Service {
  // 创建用户
  async create(userData) {
    const { username, password, nickname, avatar, platform, platformId } = userData;
    
    // 检查用户名是否已存在
    const existUser = await this.ctx.model.User.findOne({
      where: { username }
    });
    
    if (existUser) {
      return { success: false, message: '用户名已存在' };
    }
    
    // 密码加密
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    // 创建用户
    const user = await this.ctx.model.User.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      avatar,
      platform,
      platformId,
      status: 'active'
    });
    
    return { success: true, data: user };
  }
  
  // 用户登录
  async login(username, password) {
    // 查找用户
    const user = await this.ctx.model.User.findOne({
      where: { username, status: 'active' }
    });
    
    if (!user || !user.password) {
      return { success: false, message: '用户不存在或密码错误' };
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: '用户不存在或密码错误' };
    }
    
    // 生成 Token
    const token = jwt.sign(
      { id: user.id, username: user.username, platform: user.platform },
      this.app.config.jwt.secret,
      { expiresIn: this.app.config.jwt.expiresIn }
    );
    
    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar
        }
      }
    };
  }
  
  // 根据ID查找用户
  async findById(id) {
    return await this.ctx.model.User.findByPk(id);
  }
  
  // 获取伴侣信息
  async getPartnerInfo(userId) {
    // 这里需要根据您的业务逻辑实现
    // 例如，查询关系表获取伴侣信息
    return null;
  }
}

module.exports = UserService;