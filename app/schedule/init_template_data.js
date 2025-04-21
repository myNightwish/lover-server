'use strict';

const Subscription = require('egg').Subscription;

class InitTemplateData extends Subscription {
  // 配置定时任务
  static get schedule() {
    return {
      // 仅在应用启动时执行一次
      type: 'worker',
      immediate: true,
      disable: false
    };
  }

  // 定时任务处理函数
  async subscribe() {
    const { ctx, app } = this;
    
    // 检查是否需要初始化
    const needInit = await app.redis.get('template:initialized');
    if (needInit === 'true') {
      return;
    }
    
    // 执行初始化
    try {
      const result = await ctx.service.template.initTemplateData();
      
      if (result) {
        // 标记为已初始化
        await app.redis.set('template:initialized', 'true');
        ctx.logger.info('模板数据初始化成功');
      } else {
        ctx.logger.error('模板数据初始化失败');
      }
    } catch (error) {
      ctx.logger.error('模板数据初始化出错', error);
    }
  }
}

module.exports = InitTemplateData;