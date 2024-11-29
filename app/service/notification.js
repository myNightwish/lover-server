const Service = require('egg').Service;

class NotificationService extends Service {
  // 发送邀请邮件
  async sendInvitationEmail(email) {
    // 在这里实现邮件发送逻辑
    // 目前我们只是记录日志
    this.ctx.logger.info(`Invitation sent to ${email}`);
  }

  // 通知购物清单更新
  async notifyListUpdate(familyId, update) {
    const { app, ctx } = this;

    // 通过 Socket.IO 发送实时通知
    app.io.of('/').to(`family:${familyId}`).emit('listUpdated', update);

    // 获取家庭成员及其通知偏好
    const family = await ctx.model.Family.findOne({
      where: { id: familyId },
      include: [{
        model: ctx.model.User,
        as: 'members',
        attributes: [ 'email', 'notificationPreferences' ],
      }],
    });

    if (!family) {
      ctx.throw(404, 'Family not found');
    }

    // 向家庭成员发送邮件通知
    for (const member of family.members) {
      if (member.notificationPreferences?.email) {
        // 实现邮件发送逻辑
        this.ctx.logger.info(`Email notification sent to ${member.email}`);
      }
    }
  }
}

module.exports = NotificationService;
