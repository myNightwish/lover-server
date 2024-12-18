const Controller = require('egg').Controller;

class OssController extends Controller {
  async getUploadParams() {
    const { ctx, service } = this;
    const uploadParams = service.oss.createUploadParams();
    ctx.body = {
      code: 200,
      data: {
        ...uploadParams,
      },
    };
  }
}

module.exports = OssController;
