const Controller = require('egg').Controller;

class FamilyController extends Controller {
  // 创建家庭
  async create() {
    const { ctx } = this;
    const { name } = ctx.request.body;

    // 创建家庭，并将当前用户作为管理员添加
    const family = await ctx.model.Family.create({
      name,
    });

    // 将用户加入家庭
    await family.addUser(ctx.user.id, { through: { role: 'admin' } });

    ctx.body = family;
  }

  async invite() {
    const { ctx } = this;
    const { familyId } = ctx.params;
    const { email } = ctx.request.body;
    console.log('familyId', familyId);
    const invitedById = ctx.user.id;
    if (!invitedById) {
      ctx.throw(400, 'User is not authenticated');
    }

    // 查找家庭
    const family = await ctx.model.Family.findOne({
      where: { id: familyId },
      include: [{ model: ctx.model.User }],
    });

    if (!family) {
      ctx.throw(404, 'Family not found');
    }

    // 创建邀请
    const invitation = await ctx.model.Invitation.create({
      familyId,
      invitedById: ctx.user.id,
      email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 天有效期
    });

    // 发送邮件通知
    await ctx.service.notification.sendInvitationEmail(email, invitation);

    ctx.body = invitation;
  }

  // 接受邀请
  async acceptInvitation() {
    const { ctx } = this;
    const { invitationId } = ctx.params;

    // 查找邀请
    const invitation = await ctx.model.Invitation.findOne({
      where: { id: invitationId, status: 'pending' },
    });

    if (!invitation) {
      ctx.throw(400, 'Invalid invitation');
    }

    // 将用户加入家庭
    const family = await ctx.model.Family.findOne({ where: { id: invitation.familyId } });

    if (!family) {
      ctx.throw(404, 'Family not found');
    }

    await family.addUser(ctx.user.id, { through: { role: 'member' } });

    // 更新邀请状态为已接受
    invitation.status = 'accepted';
    await invitation.save();

    ctx.body = { success: true };
  }
  // 拒绝邀请
  async rejectInvitation() {
    const { ctx } = this;
    const { invitationId } = ctx.params;

    // 查找邀请记录
    const invitation = await ctx.model.Invitation.findByPk(invitationId);

    // 检查邀请是否存在，并且是当前用户被邀请
    if (!invitation || invitation.status !== 'pending' || invitation.email !== ctx.user.email) {
      ctx.throw(400, 'Invalid or expired invitation');
    }

    // 更新邀请状态为已拒绝
    await invitation.update({ status: 'rejected' });

    ctx.body = { success: true, message: 'Invitation rejected' };
  }
  // 获取当前用户关联的家庭群组
  async getFamilies() {
    const { ctx } = this;

    // 获取当前用户信息
    const userId = ctx.user.id;

    // 查询用户关联的家庭群组
    const families = await ctx.model.Family.findAll({
      include: [{
        model: ctx.model.User,
        where: { id: userId },
        attributes: [], // 不需要返回用户信息，只需要家庭信息
      }],
      attributes: [ 'id', 'name', 'createdAt', 'updatedAt' ], // 返回需要的字段
    });

    ctx.body = families;
  }

  // 解散家庭群组
  async deleteFamily() {
    const { ctx } = this;
    const { familyId } = ctx.params;

    // 验证家庭是否存在且用户是管理员
    const family = await ctx.model.Family.findOne({
      where: { id: familyId },
      include: [{
        model: ctx.model.User,
        where: { id: ctx.user.id },
        through: { where: { role: 'admin' } }, // 仅管理员有权限解散家庭
      }],
    });

    if (!family) {
      ctx.throw(403, 'Permission denied or family not found');
    }

    // 删除家庭群组以及相关数据
    await ctx.model.FamilyMember.destroy({ where: { familyId } }); // 删除成员关系
    await ctx.model.Invitation.destroy({ where: { familyId } }); // 删除相关邀请
    await family.destroy(); // 删除家庭

    ctx.body = { success: true, message: 'Family group deleted successfully' };
  }

  async getInvitations() {
    const { ctx } = this;

    // 查询用户收到的邀请，状态为“待确认”
    const invitations = await ctx.model.Invitation.findAll({
      where: { email: ctx.user.email, status: 'pending' },
      include: [
        { model: ctx.model.Family, attributes: [ 'name' ] },
        { model: ctx.model.User, attributes: [ 'username' ] },
      ],
    });

    ctx.body = invitations;
  }
}

module.exports = FamilyController;
