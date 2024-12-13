const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');

class WxUserController extends Controller {
  // 登录/注册接口
  async loginAndAutoSignUp() {
    const { ctx } = this;
    const { code, userInfo } = ctx.request.body;
    try {
      // 调用 service 层方法处理
      const result = await ctx.service.wxUser.loginAndAutoSignUp(code, userInfo);

      // 返回结果给前端
      ctx.body = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = { message: error.message };
    }
  }
  // 刷新Token接口
  async refreshToken() {
    const { ctx, app } = this;
    const { refreshToken } = ctx.request.body;

    // 验证refreshToken
    if (!refreshToken) {
      ctx.throw(400, 'Refresh token is required');
    }

    // 根据refreshToken获取用户信息
    const decoded = await jwt.verify(refreshToken, app.config.jwt.secret, { ignoreExpiration: true });

    if (!decoded) {
      ctx.throw(401, 'Invalid refresh token');
    }

    // 根据解码得到的用户信息重新生成新的accessToken和refreshToken
    const user = await ctx.service.wxUser.findByOpenId(decoded.userId); // 获取用户信息
    if (!user) {
      ctx.throw(404, 'User not found');
    }

    // 生成新的token
    const newAccessToken = app.jwt.sign({ id: user.id, openid: user.openid }, app.config.jwt.secret, { expiresIn: '1h' });
    const newRefreshToken = app.jwt.sign({ id: user.id, openid: user.openid }, app.config.jwt.secret, { expiresIn: '7d' });

    // 返回新的tokens
    ctx.body = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

module.exports = WxUserController;
