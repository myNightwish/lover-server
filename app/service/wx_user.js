const Service = require('egg').Service;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class WxUserService extends Service {
  async loginAndAutoSignUp(code) {
    const { ctx, app } = this;
    const { openid } = await ctx.helper.getWeChatUserInfo(code);
    let user = await ctx.model.User.findOne({
      where: { openid },
      raw: true,
    });
    console.log('🍊--->', user)
    // 查找是否已有用户
    if (!user) {
      // 如果是新用户，进行注册
      user = await ctx.model.User.create({
        openid,
        username: '默认名字',
        nickname: '默认昵称',
        avatarUrl: 'https://mynightwish.oss-cn-beijing.aliyuncs.com/user-avatars/defaultAavatar.png',
        status: 'active',
        role: 'user',
        create_at: new Date(),
        password: '',
        salt: '',
        avatar: '/static/images/default-avatar.png',
        status: 'active',
        role: 'user',
        bind_code: crypto.randomBytes(3).toString('hex').toUpperCase()
      });
    
      console.log('dsjfk----')
      await ctx.service.initUserProgress.initializeUserData(user.id);
    }
    // 查询绑定关系，获取 partner_id
    const relationship = await ctx.service.relationship.getPartnerInfo(openid);

    // 生成JWT Token
    const accessToken = jwt.sign(
      { id: user.id, openid: user.openid },
      app.config.jwt.secret,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, openid: user.openid },
      app.config.jwt.secret,
      { expiresIn: '7d' }
    );
    // 返回数据

    return {
      accessToken,
      refreshToken,
      user: user,
      partnerInfo: relationship ? relationship.toJSON() : null
    };
  }

  async findById(userId) {
    const user = await this.app.model.User.findOne({ where: { id: userId } });
    return user;
  }
  async updateUser(userId, updateData) {
    // 查找用户
    const user = await this.findById(userId);

    if (!user) {
      return null; // 如果用户不存在，返回 null
    }
    // 限制只允许更新 avatarUrl 和 nickname
    const { avatarUrl, nickname } = updateData;

    // 构造只包含允许更新字段的数据
    const fieldsToUpdate = {
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(nickname ? { nickname } : {}),
      updatedAt: new Date(), // 自动更新 updatedAt 字段
    };
    // 更新用户信息
    const result = await user.update(fieldsToUpdate);
    return result; // 返回更新后的用户信息
  }
}

module.exports = WxUserService;
