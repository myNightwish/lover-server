'use strict';

const Controller = require('egg').Controller;

class AdminController extends Controller {
  // 初始化模板数据
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
  
  // 更新模板数据
  async updateTemplateData() {
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
      const { type, id, data } = ctx.request.body;
      
      let result;
      switch (type) {
        case 'category':
          result = await ctx.service.template.updateCategory(id, data);
          break;
        case 'topic':
          result = await ctx.service.template.updateTopic(id, data);
          break;
        case 'question':
          result = await ctx.service.template.updateQuestion(id, data);
          break;
        default:
          ctx.body = {
            success: false,
            message: '无效的更新类型'
          };
          return;
      }
      
      // 清除缓存
      await ctx.service.template.clearTemplateCache();
      
      ctx.body = {
        success: result,
        message: result ? '更新模板数据成功' : '更新模板数据失败'
      };
    } catch (error) {
      ctx.logger.error('更新模板数据失败', error);
      ctx.body = {
        success: false,
        message: error.message || '更新模板数据失败'
      };
    }
  }
  
  // 获取用户统计数据
  async getUserStats() {
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
      // 获取用户总数
      const userCount = await ctx.model.User.count();
      
      // 获取今日新增用户数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUserCount = await ctx.model.User.count({
        where: {
          created_at: {
            [ctx.app.Sequelize.Op.gte]: today
          }
        }
      });
      
      // 获取会话总数
      const sessionCount = await ctx.model.QuestionSession.count();
      
      // 获取今日新增会话数
      const todaySessionCount = await ctx.model.QuestionSession.count({
        where: {
          created_at: {
            [ctx.app.Sequelize.Op.gte]: today
          }
        }
      });
      
      // 获取回答总数
      const answerCount = await ctx.model.UserQuestionAnswer.count();
      
      // 获取今日新增回答数
      const todayAnswerCount = await ctx.model.UserQuestionAnswer.count({
        where: {
          created_at: {
            [ctx.app.Sequelize.Op.gte]: today
          }
        }
      });
      
      ctx.body = {
        success: true,
        data: {
          userCount,
          todayUserCount,
          sessionCount,
          todaySessionCount,
          answerCount,
          todayAnswerCount
        }
      };
    } catch (error) {
      ctx.logger.error('获取用户统计数据失败', error);
      ctx.body = {
        success: false,
        message: error.message || '获取用户统计数据失败'
      };
    }
  }
}

module.exports = AdminController;