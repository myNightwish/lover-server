const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');

class TimelineService extends Service {
  /**
   * 创建时间轴记忆
   * @param userId 用户ID
   * @param partnerId 伴侣ID
   * @param memoryData 记忆数据
   */
  async createMemory(userId, partnerId, memoryData) {
    const { ctx } = this;

    try {
      // 处理照片上传
      let photos = [];
      if (memoryData.photos && memoryData.photos.length > 0) {
        photos = await Promise.all(memoryData.photos.map(async photo => {
          // 如果是临时文件路径，则上传到OSS
          if (photo.startsWith('http')) {
            return photo; // 已经是URL，直接返回
          } else {
            // 上传到OSS
            return await ctx.service.oss.uploadFile(photo);
          }
        }));
      }

      // 创建记忆记录
      const memory = await ctx.model.TimelineMemory.create({
        user_id: userId,
        partner_id: partnerId,
        title: memoryData.title,
        description: memoryData.description || '',
        date: memoryData.date,
        location: memoryData.location || '',
        category: memoryData.category || '',
        photos: photos,
        is_special: memoryData.isSpecial || false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return {
        success: true,
        data: memory
      };
    } catch (error) {
      ctx.logger.error('[TimelineService] Create memory failed:', error);
      return {
        success: false,
        message: '创建记忆失败: ' + error.message
      };
    }
  }

  /**
   * 获取时间轴记忆列表
   * @param userId 用户ID
   * @param partnerId 伴侣ID
   */
  async getMemories(userId, partnerId) {
    const { ctx } = this;

    try {
      const memories = await ctx.model.TimelineMemory.findAll({
        where: {
          [ctx.app.Sequelize.Op.or]: [
            { user_id: userId, partner_id: partnerId },
            { user_id: partnerId, partner_id: userId }
          ]
        },
        order: [['date', 'DESC']], // 按日期降序排列
        include: [{
          model: ctx.model.TimelineComment,
          as: 'comments',
          required: false,
          include: [{
            model: ctx.model.User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }]
        }]
      });

      return {
        success: true,
        data: memories
      };
    } catch (error) {
      ctx.logger.error('[TimelineService] Get memories failed:', error);
      return {
        success: false,
        message: '获取记忆列表失败: ' + error.message
      };
    }
  }

  /**
   * 获取单个记忆详情
   * @param userId 用户ID
   * @param memoryId 记忆ID
   */
  async getMemoryDetail(userId, memoryId) {
    const { ctx } = this;

    try {
      const memory = await ctx.model.TimelineMemory.findByPk(memoryId, {
        include: [{
          model: ctx.model.TimelineComment,
          as: 'comments',
          required: false,
          include: [{
            model: ctx.model.User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }]
        }, {
          model: ctx.model.User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar']
        }]
      });

      if (!memory) {
        return {
          success: false,
          message: '记忆不存在'
        };
      }

      // 检查权限
      if (memory.user_id !== userId && memory.partner_id !== userId) {
        return {
          success: false,
          message: '无权限查看该记忆'
        };
      }

      return {
        success: true,
        data: memory
      };
    } catch (error) {
      ctx.logger.error('[TimelineService] Get memory detail failed:', error);
      return {
        success: false,
        message: '获取记忆详情失败: ' + error.message
      };
    }
  }

  /**
   * 添加评论
   * @param userId 用户ID
   * @param memoryId 记忆ID
   * @param content 评论内容
   */
  async addComment(userId, memoryId, content) {
    const { ctx } = this;

    try {
      // 检查记忆是否存在
      const memory = await ctx.model.TimelineMemory.findByPk(memoryId);
      if (!memory) {
        return {
          success: false,
          message: '记忆不存在'
        };
      }

      // 检查权限
      if (memory.user_id !== userId && memory.partner_id !== userId) {
        return {
          success: false,
          message: '无权限评论该记忆'
        };
      }

      // 创建评论
      const comment = await ctx.model.TimelineComment.create({
        memory_id: memoryId,
        user_id: userId,
        content,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 获取带用户信息的评论
      const commentWithUser = await ctx.model.TimelineComment.findByPk(comment.id, {
        include: [{
          model: ctx.model.User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar']
        }]
      });

      return {
        success: true,
        data: commentWithUser
      };
    } catch (error) {
      ctx.logger.error('[TimelineService] Add comment failed:', error);
      return {
        success: false,
        message: '添加评论失败: ' + error.message
      };
    }
  }

  /**
   * 删除记忆
   * @param userId 用户ID
   * @param memoryId 记忆ID
   */
  async deleteMemory(userId, memoryId) {
    const { ctx } = this;

    try {
      // 检查记忆是否存在
      const memory = await ctx.model.TimelineMemory.findByPk(memoryId);
      if (!memory) {
        return {
          success: false,
          message: '记忆不存在'
        };
      }

      // 检查权限
      if (memory.user_id !== userId) {
        return {
          success: false,
          message: '只有创建者可以删除记忆'
        };
      }

      // 删除关联的评论
      await ctx.model.TimelineComment.destroy({
        where: { memory_id: memoryId }
      });

      // 删除记忆
      await memory.destroy();

      return {
        success: true,
        message: '删除成功'
      };
    } catch (error) {
      ctx.logger.error('[TimelineService] Delete memory failed:', error);
      return {
        success: false,
        message: '删除记忆失败: ' + error.message
      };
    }
  }
}

module.exports = TimelineService;