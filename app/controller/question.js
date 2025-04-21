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
          id: categoryId
        },
        attributes: ['id', 'code', 'name', 'description', 'icon', 'version']
      });
      
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
    console.log('🍎 ctx.service.UserProgress：', ctx.service);
    try {
      // 获取用户的话题进度
      const topics = await ctx.service.userProgress.getUserTopicProgress(userId, categoryId);
      
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
    const { questionId, answerValue } = ctx.request.body;
    
    try {
      const result = await ctx.service.userProgress.saveUserAnswer(
        userId, questionId, answerValue, parseInt(sessionId)
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
}

module.exports = QuestionController;