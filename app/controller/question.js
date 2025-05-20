'use strict';

const Controller = require('egg').Controller;

class QuestionController extends Controller {
  // 获取所有分类
  async getCategories() {
    const { ctx } = this;
    const userId = ctx.state.user ? ctx.state.user.id : null;
    
    try {
      // 获取所有分类模板
      const categories = await ctx.service.template.getCategories();
      
      ctx.body = {
        success: true,
        data: categories
      };
    } catch (error) {
      ctx.logger.error('获取分类列表失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取分类列表失败'
      };
    }
  }
  
  // 获取分类详情
  async getCategoryDetail() {
    const { ctx } = this;
    const categoryId = ctx.params.id;
    
    try {
      // 查询分类
      const category = await ctx.model.Category.findOne({
        where: {
          code: categoryId
        },
        attributes: ['id', 'code', 'name', 'description', 'icon', 'version']
      });
    console.log('category---', category)

      
      if (!category) {
        ctx.body = {
          success: false,
          message: '分类不存在'
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: category
      };
    } catch (error) {
      ctx.logger.error('获取分类详情失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取分类详情失败'
      };
    }
  }
  
  // 获取分类下的话题列表
  async getTopicsByCategory() {
    const { ctx } = this;
    const categoryId = ctx.params.id;
    const userId = ctx.state.user ? ctx.state.user.id : null;
    try {
      // 获取用户的话题进度
      const topics = await ctx.service.userProgress.getUserTopicProgress(userId, categoryId);
      console.log('🍎 topics：', topics);
      
      // 分离普通话题和推荐话题
      const regularTopics = topics.filter(t => !t.recommended);
      const recommendedTopics = topics.filter(t => t.recommended);
      
      ctx.body = {
        success: true,
        data: {
          topics: regularTopics,
          recommendedTopics,
          categoryId
        }
      };
    } catch (error) {
      ctx.logger.error('获取分类话题列表失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取分类话题列表失败'
      };
    }
  }
  
  // 获取话题下的问题列表
  async getQuestionsByTopic() {
    const { ctx } = this;
    const topicId = ctx.params.id;
    const userId = ctx.state.user ? ctx.state.user.id : null;
    
    try {
      // 获取用户的问题回答
      const questions = await ctx.service.userProgress.getUserQuestionAnswers(userId, topicId);
      
      ctx.body = {
        success: true,
        data: {
          detailQuestions: questions,
          topicId
        }
      };
    } catch (error) {
      ctx.logger.error('获取话题问题列表失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取话题问题列表失败'
      };
    }
  }
  
  // 解锁话题
  async unlockTopic() {
    const { ctx } = this;
    const topicId = ctx.params.id;
    const userId = ctx.state.user.id;
    
    try {
      const result = await ctx.service.userProgress.unlockTopic(userId, topicId);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('解锁话题失败', error);
      ctx.body = {
        success: false,
        message: error.message || '解锁话题失败'
      };
    }
  }
  
  // 提交问题回答
  async submitAnswer() {
    const { ctx } = this;
    const sessionId = ctx.params.sessionId;
    const userId = ctx.state.user.id;
    const { question_id, answer_value } = ctx.request.body;
    
    try {
      const result = await ctx.service.userProgress.saveUserAnswer(
        userId, question_id, answer_value, parseInt(sessionId)
      );
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('提交问题回答失败', error);
      ctx.body = {
        success: false,
        message: error.message || '提交问题回答失败'
      };
    }
  }
  
  // 初始化模板数据（仅管理员可用）
  async initTemplateData() {
    const { ctx } = this;
    
    // 检查是否为管理员
    if (!ctx.state.user || !ctx.state.user.isAdmin) {
      ctx.body = {
        success: false,
        message: '无权限执行此操作'
      };
      return;
    }
    
    try {
      const result = await ctx.service.template.initTemplateData();
      
      ctx.body = {
        success: result,
        message: result ? '初始化模板数据成功' : '初始化模板数据失败'
      };
    } catch (error) {
      ctx.logger.error('初始化模板数据失败', error);
      ctx.body = {
        success: false,
        message: error.message || '初始化模板数据失败'
      };
    }
  }
  
  /**
   * 获取会话的所有回答
   * @return {Promise<void>}
   */
  async getSessionAnswers() {
    const { ctx } = this;
    const { sessionId } = ctx.params;
    const userId = ctx.state.user.id;

    try {
      // 验证会话是否存在且用户有权限访问
      const [session] = await ctx.model.query(
        'SELECT id, creator_id, partner_id, topic_id, status FROM question_session WHERE id = ? AND status != 0 AND (creator_id = ? OR partner_id = ?)',
        {
          type: ctx.model.QueryTypes.SELECT,
          replacements: [sessionId, userId, userId]
        }
      );
      console.log('🍺', userId)
      if (!session) {
        ctx.body = {
          success: false,
          message: '会话不存在或无权访问'
        };
        return;
      }

      // 获取会话中的所有回答
      const answers = await ctx.service.userProgress.getSessionAnswers(sessionId, userId);

      ctx.body = {
        success: true,
        data: answers
      };
    } catch (error) {
      ctx.logger.error('获取会话回答失败', error);
      ctx.body = {
        success: false,
        message: '获取会话回答失败'
      };
    }
  }

  /**
   * 保存会话结果
   * @return {Promise<void>}
   */
  async saveSessionResults() {
    const { ctx } = this;
    const { sessionId } = ctx.params;
    const { answers, qaType } = ctx.request.body;
    const userId = ctx.state.user.id;
    const { Op } = ctx.app.Sequelize; // 获取 
    console.log('3322222', userId, answers, sessionId)
    try {
      // 验证会话是否存在且用户有权限访问
      // const session = await ctx.model.QuestionSession.findOne({
      //   where: {
      //     id: sessionId,
      //     // status: { [Op.ne]: 0 }, // 非删除状态
      //     [Op.or]: [ // 使用正确的操作符语法
      //       { creator_id: userId },
      //     ]
      //   }
      // });

      // 检查会话是否存在 - 使用原始 SQL 查询避免关联加载问题
      const [session] = await ctx.model.query(
        'SELECT id, creator_id, partner_id, topic_id, status FROM question_session WHERE id = ? AND status != 0',
        {
          type: ctx.model.QueryTypes.SELECT,
          replacements: [sessionId]
        }
      );
    
      if (!session) {
        ctx.body = {
          success: false,
          message: '会话不存在或无权访问'
        };
        return;
      }

      // 保存会话结果
      const saveResult = await ctx.service.userProgress.saveSessionResults(sessionId, userId, answers, qaType);

      ctx.body = {
        success: saveResult.success,
        message: saveResult.message,
        data: saveResult.data
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: '保存会话结果失败'
      };
    }
  }
}

module.exports = QuestionController;