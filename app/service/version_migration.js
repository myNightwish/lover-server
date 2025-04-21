'use strict';

const Service = require('egg').Service;

class VersionMigrationService extends Service {
  // 检查并执行版本迁移
  async checkAndMigrate(userId) {
    const { ctx } = this;
    
    // 获取用户的话题进度
    const userProgress = await ctx.model.UserTopicProgress.findAll({
      where: { user_id: userId },
      attributes: ['id', 'topic_id', 'topic_version']
    });
    
    // 获取最新的话题版本
    const topics = await ctx.model.Topic.findAll({
      where: { 
        id: userProgress.map(p => p.topic_id)
      },
      attributes: ['id', 'version']
    });
    
    // 创建话题ID到最新版本的映射
    const topicVersionMap = new Map();
    topics.forEach(topic => {
      topicVersionMap.set(topic.id, topic.version);
    });
    
    // 检查需要迁移的进度
    const needMigration = userProgress.filter(progress => {
      const latestVersion = topicVersionMap.get(progress.topic_id);
      return latestVersion && progress.topic_version !== latestVersion;
    });
    
    // 执行迁移
    if (needMigration.length > 0) {
      await this.migrateUserProgress(userId, needMigration, topicVersionMap);
    }
    
    return needMigration.length;
  }
  
  // 迁移用户进度
  async migrateUserProgress(userId, progressList, topicVersionMap) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    
    try {
      // 更新话题版本
      for (const progress of progressList) {
        const latestVersion = topicVersionMap.get(progress.topic_id);
        
        await progress.update({
          topic_version: latestVersion
        }, { transaction });
        
        // 记录迁移日志
        await ctx.model.VersionMigrationLog.create({
          user_id: userId,
          topic_id: progress.topic_id,
          old_version: progress.topic_version,
          new_version: latestVersion,
          migration_time: new Date()
        }, { transaction });
      }
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      this.ctx.logger.error('迁移用户进度失败', error);
      return false;
    }
  }
}

module.exports = VersionMigrationService;