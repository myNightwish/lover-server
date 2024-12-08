const Subscription = require('egg').Subscription;

class CleanupSubscription extends Subscription {
  static get schedule() {
    return {
      cron: '0 0 * * *', // 每天凌晨执行
      type: 'worker',
    };
  }

  async subscribe() {
    const { ctx } = this;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // 清理30天前的失败记录
      await ctx.model.Conversation.destroy({
        where: {
          status: 'failed',
          createdAt: {
            [ctx.app.Sequelize.Op.lt]: thirtyDaysAgo,
          },
        },
      });

      ctx.logger.info('Cleanup job completed successfully');
    } catch (error) {
      ctx.logger.error('Cleanup job failed:', error);
    }
  }
}

module.exports = CleanupSubscription;