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

    const curUserOpenId = ctx.user.openid;

    const result = await service.relationship.bindRelationship(curUserOpenId, partnerId);
    ctx.body = result;
  }
}

module.exports = RelationshipController;
