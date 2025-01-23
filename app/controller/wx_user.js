const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');

class WxUserController extends Controller {
  // 登录/注册接口
  async loginAndAutoSignUp() {
    const { ctx } = this;
    const { code } = ctx.request.body;
    try {
      const result = await ctx.service.wxUser.loginAndAutoSignUp(code);

      // 返回结果给前端
      ctx.body = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          ...result.user,
          partnerInfo: result.partnerInfo,
        },
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
    const decoded = jwt.verify(refreshToken, app.config.jwt.secret, { ignoreExpiration: true });

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
  async updateWxUser() {
    const { ctx, service } = this;
    const userId = ctx.user.id;

    const { ...updateData } = ctx.request.body;
    // 更新数据库中的用户信息
    const updatedUser = await service.wxUser.updateUser(userId, updateData);

    if (updatedUser) {
      ctx.body = {
        success: true,
        data: updatedUser,
      };
    } else {
      ctx.body = {
        success: false,
        message: '更新失败，用户不存在或数据无效',
      };
    }
  }
  async getUserInfo() {
    const { ctx, service } = this;
    const userId = ctx.user.id;
    const openid = ctx.user.openid;

    // 获取用户信息，同时携带绑定的伴侣信息
    const userInfo = await this.app.model.WxUser.findOne({
      where: { id: userId },
      attributes: [ 'openid', 'nickName', 'avatarUrl' ], // 只查询需要的字段
      include: [
        {
          model: this.app.model.Relationship,
          as: 'UserRelationships', // 用户发起的绑定关系
          attributes: [ 'partnerOpenid' ], // 只获取 partnerOpenid
          include: [
            {
              model: this.app.model.WxUser,
              as: 'PartnerOpenId', // 被绑定的伴侣
              attributes: [ 'openid', 'nickName', 'avatarUrl' ], // 伴侣字段
            },
          ],
        },
      ],
    });
    const partnerInfo = await service.relationship.getPartnerInfo(openid);
    ctx.body = {
      success: true,
      data: {
        openid: userInfo?.openid || null,
        nickName: userInfo?.nickName || null,
        avatarUrl: userInfo?.avatarUrl || null,
        partnerInfo: partnerInfo || '', // 如果有绑定关系，返回伴侣信息
      },
    };
  }
}

module.exports = WxUserController;
