'use strict';

const Service = require('egg').Service;

class SessionService extends Service {
  // 创建新会话
  async create(data) {
    const { creator_id, partner_id, category_id, title, questions } = data;
    
    // 开启事务
    const transaction = await this.ctx.model.transaction();
    
    try {
      // 创建会话
      const session = await this.ctx.model.QuestionSession.create({
        creator_id,
        partner_id,
        category_id,
        title,
        status: 'active',
      }, { transaction });
      
      // 如果提供了问题列表，添加到会话中
      if (questions && questions.length > 0) {
        const sessionQuestions = questions.map((questionId, index) => ({
          session_id: session.id,
          question_id: questionId,
          order_index: index,
          status: 'pending',
        }));
        
        await this.ctx.model.SessionQuestion.bulkCreate(sessionQuestions, { transaction });
      } else {
        // 如果没有提供问题列表，随机选择问题
        const randomQuestions = await this.ctx.service.question.getRandomQuestions(category_id, 5);
        
        const sessionQuestions = randomQuestions.map((question, index) => ({
          session_id: session.id,
          question_id: question.id,
          order_index: index,
          status: 'pending',
        }));
        
        await this.ctx.model.SessionQuestion.bulkCreate(sessionQuestions, { transaction });
      }
      
      await transaction.commit();
      return session;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 获取会话详情
  async getSessionDetail(sessionId) {
    const session = await this.ctx.model.QuestionSession.findByPk(sessionId, {
      include: [
        {
          model: this.ctx.model.User,
          as: 'Creator',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
        {
          model: this.ctx.model.User,
          as: 'Partner',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
        {
          model: this.ctx.model.QuestionCategory,
          as: 'Category',
        },
      ],
    });
    
    if (!session) {
      return null;
    }
    
    // 获取会话中的问题
    const sessionQuestions = await this.ctx.model.SessionQuestion.findAll({
      where: { session_id: sessionId },
      order: [['order_index', 'ASC']],
      include: [
        {
          model: this.ctx.model.Question,
          as: 'Question',
        },
      ],
    });
    
    // 获取用户回答
    const answers = await this.ctx.model.AnswersForUser.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: this.ctx.model.User,
          as: 'User',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
      ],
    });
    
    // 整理问题和回答
    const questions = sessionQuestions.map(sq => {
      const question = sq.Question.toJSON();
      question.order_index = sq.order_index;
      question.status = sq.status;
      
      // 添加用户回答
      const userAnswers = answers.filter(a => a.question_id === question.id);
      question.answers = userAnswers.map(a => ({
        user_id: a.user_id,
        user: a.User,
        answer_type: a.answer_type,
        answer_value: a.answer_value,
        custom_text: a.custom_text,
        created_at: a.createdAt,
      }));
      
      return question;
    });
    
    const result = session.toJSON();
    result.questions = questions;
    
    return result;
  }

  // 获取用户的会话列表
  async getUserSessions(userId) {
    return await this.ctx.model.QuestionSession.findAll({
      where: {
        [this.app.Sequelize.Op.or]: [
          { creator_id: userId },
          { partner_id: userId },
        ],
      },
      include: [
        {
          model: this.ctx.model.User,
          as: 'Creator',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
        {
          model: this.ctx.model.User,
          as: 'Partner',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
        {
          model: this.ctx.model.QuestionCategory,
          as: 'Category',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // 提交问题回答
  async submitAnswer(data) {
    const { user_id, session_id, question_id, answer_type, answer_value, custom_text } = data;
    
    // 检查会话是否存在
    const session = await this.ctx.model.QuestionSession.findByPk(session_id);
    if (!session) {
      return { success: false, message: '会话不存在' };
    }
    
    // 检查问题是否存在于会话中
    const sessionQuestion = await this.ctx.model.SessionQuestion.findOne({
      where: {
        session_id,
        question_id,
      },
    });
    
    if (!sessionQuestion) {
      return { success: false, message: '问题不存在于该会话中' };
    }
    
    // 检查是否已回答过该问题
    const existingAnswer = await this.ctx.model.AnswersForUser.findOne({
      where: {
        user_id,
        session_id,
        question_id,
      },
    });
    
    if (existingAnswer) {
      // 更新已有回答
      await existingAnswer.update({
        answer_type,
        answer_value,
        custom_text,
      });
      
      // 更新会话问题状态
      await sessionQuestion.update({ status: 'answered' });
      
      return { success: true, data: existingAnswer };
    } else {
      // 创建新回答
      const answer = await this.ctx.model.AnswersForUser.create({
        user_id,
        session_id,
        question_id,
        answer_type,
        answer_value,
        custom_text,
      });
      
      // 更新会话问题状态
      await sessionQuestion.update({ status: 'answered' });
      
      return { success: true, data: answer };
    }
  }

  // 计算会话匹配度
  async calculateSimilarity(sessionId) {
    const session = await this.ctx.model.QuestionSession.findByPk(sessionId);
    if (!session || !session.partner_id) {
      return { success: false, message: '会话不存在或没有伴侣' };
    }
    
    // 获取会话中的所有问题
    const sessionQuestions = await this.ctx.model.SessionQuestion.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: this.ctx.model.Question,
          as: 'Question',
        },
      ],
    });
    
    // 获取所有回答
    const answers = await this.ctx.model.AnswersForUser.findAll({
      where: { session_id: sessionId },
    });
    
    // 按用户分组回答
    const creatorAnswers = answers.filter(a => a.user_id === session.creator_id);
    const partnerAnswers = answers.filter(a => a.user_id === session.partner_id);
    
    // 计算匹配度
    let matchCount = 0;
    let totalAnswered = 0;
    
    sessionQuestions.forEach(sq => {
      const questionId = sq.question_id;
      const creatorAnswer = creatorAnswers.find(a => a.question_id === questionId);
      const partnerAnswer = partnerAnswers.find(a => a.question_id === questionId);
      
      // 只计算双方都回答了的问题
      if (creatorAnswer && partnerAnswer) {
        totalAnswered++;
        
        // 根据问题类型比较回答
        const question = sq.Question;
        let isMatch = false;
        
        if (question.type === 'options') {
          isMatch = creatorAnswer.answer_value.optionId === partnerAnswer.answer_value.optionId;
        } else if (question.type === 'yesno') {
          isMatch = creatorAnswer.answer_value.value === partnerAnswer.answer_value.value;
        } else if (question.type === 'wholikely') {
          // 对于"谁更可能"类型，如果一方选择"我"，另一方选择"伴侣"，也算匹配
          const creatorValue = creatorAnswer.answer_value.value;
          const partnerValue = partnerAnswer.answer_value.value;
          
          isMatch = (creatorValue === partnerValue) || 
                   (creatorValue === 'me' && partnerValue === 'partner') ||
                   (creatorValue === 'partner' && partnerValue === 'me');
        } else if (question.type === 'thisorthat') {
          isMatch = creatorAnswer.answer_value.value === partnerAnswer.answer_value.value;
        }
        
        if (isMatch) {
          matchCount++;
        }
      }
    });
    
    // 计算匹配百分比
    const similarityPercentage = totalAnswered > 0 ? Math.round((matchCount / totalAnswered) * 100) : 0;
    
    // 更新会话匹配度
    await session.update({ 
      similarity_percentage: similarityPercentage,
      completedAt: new Date(),
      status: 'completed'
    });
    
    return { 
      success: true, 
      data: { 
        similarityPercentage,
        matchCount,
        totalAnswered
      } 
    };
  }

  // 完成会话
  async completeSession(sessionId) {
    const session = await this.ctx.model.QuestionSession.findByPk(sessionId);
    if (!session) {
      return { success: false, message: '会话不存在' };
    }
    
    // 计算匹配度
    const similarity = await this.calculateSimilarity(sessionId);
    
    // 更新会话状态
    await session.update({
      status: 'completed',
      completedAt: new Date(),
    });
    
    return { 
      success: true, 
      data: { 
        session,
        similarity: similarity.data
      } 
    };
  }
}

module.exports = SessionService;