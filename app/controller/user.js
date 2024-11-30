const Controller = require('egg').Controller;

class UserController extends Controller {
  async getUserInfo() {
    const { ctx } = this;
    // 假设通过 token 或 session 获取当前用户 ID
    const userId = ctx.user.id;

    if (!userId) {
      ctx.throw(401, 'Unauthorized');
    }

    // 查询用户信息及其家庭群组
    const user = await ctx.model.User.findOne({
      where: { id: userId },
      attributes: [ 'username', 'email' ], // 仅查询用户名和邮箱
      include: [{
        model: ctx.model.Family,
        through: { attributes: [ 'role' ] },
        attributes: [ 'id', 'name', 'status' ], // 查询家庭的 ID 和名称
      }],
    });

    if (!user) {
      ctx.throw(404, 'User not found');
    }

    // 返回用户信息
    ctx.body = {
      username: user.username,
      email: user.email,
      families: user.families, // 已加入的家庭群组列表
    };
  }
}

module.exports = UserController;
