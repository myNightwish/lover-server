const Controller = require('egg').Controller;

class RelationshipController extends Controller {
  async bind() {
    const { ctx, service } = this;
    // 这个必须得是前端传的
    // 这里是前端传过来的参数，partnerId 是伴侣的 openid
    const { partnerId } = ctx.request.body;
    if (!partnerId) {
      ctx.body = { success: false, message: '缺少 partnerId 参数' };
      return;
    }

    const curUserOpenId = ctx.state.user.openid;

    const result = await service.relationship.bindRelationship(
      curUserOpenId,
      partnerId
    );
    ctx.body = result;
  }
  async unbind() {
    const { ctx } = this;
    const userId = ctx.state.user.openid;
    const partnerId = ctx.state.user.partner_id;
    if (!partnerId) {
      ctx.body = {
        success: false,
        message: '你没有绑定伴侣'
      };
      return;
    }
    try {
      const result = await ctx.service.relationship.unbindRelationship(
        userId,
        partnerId
      );
      ctx.body = result;
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message || '解除绑定失败',
      };
    }
  }
}

module.exports = RelationshipController;
