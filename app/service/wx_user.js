const Service = require('egg').Service;
const jwt = require('jsonwebtoken');

class WxUserService extends Service {
  async loginAndAutoSignUp(code) {
    const { ctx, app } = this;
    // 假设你通过微信的 code 获取到 openid 或 unionid
    const userInfo = await ctx.helper.getWeChatUserInfo(code);

    if (!userInfo) {
      throw new Error('获取用户信息失败');
    }

    const { openid, nickname, avatarUrl } = userInfo;

    // 查找是否已有用户
    let user = await ctx.model.WxUser.findOne({ where: { openid } }); // 使用 wxUser 模型查找

    if (!user) {
      // 如果是新用户，进行注册
      user = await ctx.model.WxUser.create({
        openid,
        nickname,
        avatarUrl
      });
    }

    // 生成JWT Token
    const accessToken = jwt.sign({ userId: user.id }, app.config.jwt.secret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, app.config.jwt.secret, { expiresIn: '7d' } );
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
