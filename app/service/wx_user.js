const Service = require('egg').Service;
const jwt = require('jsonwebtoken');

class WxUserService extends Service {
  async loginAndAutoSignUp(code, userInfo) {
    const { ctx, app } = this;
    // 假设你通过微信的 code 获取到 openid 或 unionid
    const { openid } = await ctx.helper.getWeChatUserInfo(code);
    console.log('userInfo--', userInfo);

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
    console.log('user.id--', user.id);

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
}

module.exports = WxUserService;
