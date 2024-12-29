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
  /**
   * 检查当前用户是否有绑定的伴侣
   */
  async getPartner() {
    const { ctx, service } = this;
    const { openid } = ctx.query; // 从查询参数获取当前用户的 openid

    if (!openid) {
      ctx.body = {
        success: false,
        message: '缺少 openid 参数',
      };
      return;
    }

    try {
      const partnerInfo = await service.relationship.getPartnerInfo(openid);
      if (partnerInfo) {
        ctx.body = {
          success: true,
          data: partnerInfo, // 返回伴侣信息
        };
      } else {
        ctx.body = {
          success: true,
          data: null, // 未绑定伴侣
          message: '未找到绑定的伴侣',
        };
      }
    } catch (error) {
      ctx.logger.error('获取伴侣信息失败:', error);
      ctx.body = {
        success: false,
        message: '获取伴侣信息失败',
      };
    }
  }
}

module.exports = RelationshipController;
