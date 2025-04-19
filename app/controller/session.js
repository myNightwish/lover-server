'use strict';

const Controller = require('egg').Controller;

class SessionController extends Controller {
  // 创建问答会话
  async create() {
    const { ctx } = this;
    const data = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        category_id: { type: 'number', required: true },
        title: { type: 'string', required: true },
      });
      
      // 添加创建者ID
      data.creator_id = ctx.user.id;
      
      // 如果有伴侣ID，添加伴侣ID
      if (ctx.user.partner_id) {
        data.partner_id = ctx.user.partner_id;
      }
      
      const session = await ctx.service.session.create(data);
      
      ctx.body = {
        success: true,
        data: session,
      };
    } catch (error) {
      ctx.logger.error('创建会话失败', error);
      ctx.body = {
        success: false,
        message: error.message || '创建会话失败',
      };
    }
  }

  // 获取会话详情
  async getSessionDetail() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    try {
      const session = await ctx.service.session.getSessionDetail(id);
      
      if (!session) {
        ctx.body = {
          success: false,
          message: '会话不存在',
        };
        return;
      }
      
      // 检查用户是否有权限访问该会话
      if (session.creator_id !== ctx.user.id && session.partner_id !== ctx.user.id) {
        ctx.body = {
          success: false,
          message: '无权访问该会话',
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: session,
      };
    } catch (error) {
      ctx.logger.error(`获取会话 ${id} 详情失败`, error);
      ctx.body = {
        success: false,
        message: '获取会话详情失败',
      };
    }
  }

  // 获取用户的会话列表
  async getUserSessions() {
    const { ctx } = this;
    
    try {
      const sessions = await ctx.service.session.getUserSessions(ctx.user.id);
      
      ctx.body = {
        success: true,
        data: sessions,
      };
    } catch (error) {
      ctx.logger.error('获取用户会话列表失败', error);
      ctx.body = {
        success: false,
        message: '获取会话列表失败',
      };
    }
  }

  // 提交问题回答
  async submitAnswer() {
    const { ctx } = this;
    const { id: session_id } = ctx.params;
    const data = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        questionId: { type: 'number', required: true },
        answerType: { type: 'string', required: true },
        answerValue: { type: 'string', required: true },
      });
      
      // 构建回答数据
      const answerData = {
        user_id: ctx.user.id,
        session_id: parseInt(session_id),
        question_id: data.questionId,
        answer_type: data.answerType,
        answer_value: data.answerValue,
        custom_text: data.customText,
      };
      
      const result = await ctx.service.session.submitAnswer(answerData);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error(`提交回答失败`, error);
      ctx.body = {
        success: false,
        message: error.message || '提交回答失败',
      };
    }
  }

  // 获取会话结果
  async getSessionResults() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    try {
      // 获取会话详情
      const session = await ctx.service.session.getSessionDetail(id);
      
      if (!session) {
        ctx.body = {
          success: false,
          message: '会话不存在',
        };
        return;
      }
      
      // 检查用户是否有权限访问该会话
      if (session.creator_id !== ctx.user.id && session.partner_id !== ctx.user.id) {
        ctx.body = {
          success: false,
          message: '无权访问该会话',
        };
        return;
      }
      
      // 如果会话未完成，计算匹配度
      if (session.status !== 'completed') {
        await ctx.service.session.calculateSimilarity(id);
      }
      
      // 获取匹配分析
      const matchingAnalysis = await ctx.service.answer.analyzeAnswerMatching(id);
      
      ctx.body = {
        success: true,
        data: {
          session,
          matching_analysis: matchingAnalysis.data,
        },
      };
    } catch (error) {
      ctx.logger.error(`获取会话 ${id} 结果失败`, error);
      ctx.body = {
        success: false,
        message: '获取会话结果失败',
      };
    }
  }

  // 保存会话结果
  async saveSessionResults() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        similarityPercentage: { type: 'number', required: true },
      });
      
      // 获取会话
      const session = await ctx.model.QuestionSession.findByPk(id);
      
      if (!session) {
        ctx.body = {
          success: false,
          message: '会话不存在',
        };
        return;
      }
      
      // 检查用户是否有权限更新该会话
      if (session.creator_id !== ctx.user.id && session.partner_id !== ctx.user.id) {
        ctx.body = {
          success: false,
          message: '无权更新该会话',
        };
        return;
      }
      
      // 更新会话
      await session.update({
        similarity_percentage: data.similarityPercentage,
        status: 'completed',
        completedAt: new Date(),
      });
      
      ctx.body = {
        success: true,
        data: session,
      };
    } catch (error) {
      ctx.logger.error(`保存会话 ${id} 结果失败`, error);
      ctx.body = {
        success: false,
        message: error.message || '保存会话结果失败',
      };
    }
  }

  // 完成会话
  async completeSession() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    try {
      const result = await ctx.service.session.completeSession(id);
      
      ctx.body = result;
    } catch (error) {
      ctx.logger.error(`完成会话 ${id} 失败`, error);
      ctx.body = {
        success: false,
        message: '完成会话失败',
      };
    }
  }
}

module.exports = SessionController;