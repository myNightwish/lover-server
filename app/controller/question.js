const Controller = require('egg').Controller;

class QuestionController extends Controller {
  // 获取所有问题分类
  async getCategories() {
    const { ctx } = this;
    
    try {
      const categories = await ctx.service.questionCategory.getAll();
      
      ctx.body = {
        success: true,
        data: categories,
      };
    } catch (error) {
      ctx.logger.error('获取问题分类失败', error);
      ctx.body = {
        success: false,
        message: '获取问题分类失败',
      };
    }
  }

  // 获取分类下的问题
  async getQuestionsByCategory() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    try {
      const questions = await ctx.service.question.getByCategory(id);
      
      ctx.body = {
        success: true,
        data: questions,
      };
    } catch (error) {
      ctx.logger.error(`获取分类 ${id} 的问题失败`, error);
      ctx.body = {
        success: false,
        message: '获取问题失败',
      };
    }
  }

  // 获取单个问题
  async getQuestion() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    try {
      const question = await ctx.service.question.getById(id);
      
      if (!question) {
        ctx.body = {
          success: false,
          message: '问题不存在',
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: question,
      };
    } catch (error) {
      ctx.logger.error(`获取问题 ${id} 失败`, error);
      ctx.body = {
        success: false,
        message: '获取问题失败',
      };
    }
  }

  // 创建问题
  async createQuestion() {
    const { ctx } = this;
    const data = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        category_id: { type: 'number', required: true },
        text: { type: 'string', required: true },
        type: { type: 'string', required: true },
      });
      
      const question = await ctx.service.question.create(data);
      
      ctx.body = {
        success: true,
        data: question,
      };
    } catch (error) {
      ctx.logger.error('创建问题失败', error);
      ctx.body = {
        success: false,
        message: error.message || '创建问题失败',
      };
    }
  }

  // 更新问题
  async updateQuestion() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = ctx.request.body;
    
    try {
      const question = await ctx.service.question.update(id, data);
      
      if (!question) {
        ctx.body = {
          success: false,
          message: '问题不存在',
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: question,
      };
    } catch (error) {
      ctx.logger.error(`更新问题 ${id} 失败`, error);
      ctx.body = {
        success: false,
        message: error.message || '更新问题失败',
      };
    }
  }

  // 删除问题
  async deleteQuestion() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    try {
      const result = await ctx.service.question.delete(id);
      
      if (!result) {
        ctx.body = {
          success: false,
          message: '问题不存在',
        };
        return;
      }
      
      ctx.body = {
        success: true,
        message: '删除问题成功',
      };
    } catch (error) {
      ctx.logger.error(`删除问题 ${id} 失败`, error);
      ctx.body = {
        success: false,
        message: '删除问题失败',
      };
    }
  }
}

module.exports = QuestionController;