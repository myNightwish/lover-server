const Service = require('egg').Service;
const jwt = require('jsonwebtoken');

class WxUserService extends Service {
  async loginAndAutoSignUp(code, userInfo) {
    const { ctx, app } = this;
    // 假设你通过微信的 code 获取到 openid 或 unionid
    const { openid } = await ctx.helper.getWeChatUserInfo(code);

    if (!userInfo) {
      throw new Error('获取用户信息失败');
    }
    const user = await ctx.model.WxUser.findOne({ where: { openid } }); // 使用 wxUser 模型查找

    // 查找是否已有用户
    if (!user) {
      const { nickName, avatarUrl } = userInfo;
      // 如果是新用户，进行注册
      await ctx.model.WxUser.create({
        openid,
        nickName,
        avatarUrl,
      });
    }

    // 生成JWT Token
    const accessToken = jwt.sign({ id: user.id, openid: user.openid }, app.config.jwt.secret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id, openid: user.openid }, app.config.jwt.secret, { expiresIn: '7d' });
    // 返回数据

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async findById(userId) {
    const user = await this.app.model.WxUser.findOne({ where: { id: userId } });
    return user;
  }
  async updateUser(userId, updateData) {
    // 查找用户
    const user = await this.findById(userId);

    if (!user) {
      return null; // 如果用户不存在，返回 null
    }
    // 限制只允许更新 avatarUrl 和 nickName
    const { avatarUrl, nickName } = updateData;

    // 构造只包含允许更新字段的数据
    const fieldsToUpdate = {
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(nickName ? { nickName } : {}),
      updatedAt: new Date(), // 自动更新 updatedAt 字段
    };
    // 更新用户信息
    const result = await user.update(fieldsToUpdate);
    return result; // 返回更新后的用户信息
  }

}

module.exports = WxUserService;
