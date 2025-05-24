'use strict';

const Service = require('egg').Service;

class QuestionSessionService extends Service {
  // 创建问答会话
  async createSession(userId, topicId, title) {
    const { ctx } = this;
    // 检查话题是否存在
    const topic = await ctx.model.QuestionTopic.findByPk(topicId);
    console.log('topicId===>', topicId, topic , title)

    if (!topic) {
      return { success: false, message: '话题不存在' };
    }
    
    // 创建会话
    const session = await ctx.model.QuestionSession.create({
      creator_id: userId,
      topic_id: topicId,
      topic_code: topic.code, 
      title: title || topic.title,
      status: 1, // 1-进行中
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return { 
      success: true, 
      data: {
        id: session.id,
        title: session.title,
        topicId: session.topic_id
      }
    };
  }
  
  // 获取会话详情
  async getSessionDetail(sessionId, userId) {
    const { ctx } = this;
    
    // 查询会话
    const session = await ctx.model.QuestionSession.findOne({
      where: { id: sessionId },
      include: [
        {
          model: ctx.model.Topic,
          as: 'topic',
          attributes: ['id', 'name', 'type', 'icon']
        }
      ]
    });
    
    if (!session) {
      return { success: false, message: '会话不存在' };
    }
    
    // 检查用户是否有权限访问该会话
    if (session.creator_id !== userId && session.partner_id !== userId) {
      return { success: false, message: '无权访问该会话' };
    }
    
    // 获取话题下的问题
    const questions = await ctx.service.template.getQuestionsByTopic(session.topic_id);
    
    // 获取会话中的所有回答
    const answers = await ctx.model.UserQuestionAnswer.findAll({
      where: { session_id: sessionId },
      attributes: ['user_id', 'question_id', 'answer_value']
    });
    
    // 创建问题ID到回答的映射
    const answerMap = new Map();
    answers.forEach(answer => {
      if (!answerMap.has(answer.question_id)) {
        answerMap.set(answer.question_id, []);
      }
      answerMap.get(answer.question_id).push({
        user_id: answer.user_id,
        answer_value: answer.answer_value
      });
    });
    
    // 合并问题和回答数据
    const detailQuestions = questions.map(question => {
      const questionAnswers = answerMap.get(question.id) || [];
      
      // 获取当前用户的回答
      const userAnswer = questionAnswers.find(a => a.user_id === userId);
      
      // 获取伴侣的回答
      const partnerId = session.creator_id === userId ? session.partner_id : session.creator_id;
      const partnerAnswer = partnerId ? questionAnswers.find(a => a.user_id === partnerId) : null;
      
      return {
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options,
        option1: question.option1,
        option2: question.option2,
        userAnswer: userAnswer ? userAnswer.answer_value : null,
        partnerAnswer: partnerAnswer ? partnerAnswer.answer_value : null,
        answers: questionAnswers
      };
    });
    
    return {
      success: true,
      data: {
        id: session.id,
        title: session.title,
        status: session.status,
        creatorId: session.creator_id,
        partnerId: session.partner_id,
        topicId: session.topic_id,
        topicName: session.topic ? session.topic.name : '',
        topicType: session.topic ? session.topic.type : '',
        topicIcon: session.topic ? session.topic.icon : '',
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        detailQuestions
      }
    };
  }
  
  // 获取用户的会话列表
  async getUserSessions(userId) {
    const { ctx } = this;
    
    // 查询用户参与的所有会话
    const sessions = await ctx.model.QuestionSession.findAll({
      where: {
        [ctx.app.Sequelize.Op.or]: [
          { creator_id: userId },
          { partner_id: userId }
        ],
        status: { [ctx.app.Sequelize.Op.ne]: 0 } // 非删除状态
      },
      include: [
        {
          model: ctx.model.Topic,
          as: 'topic',
          attributes: ['id', 'name', 'type', 'icon']
        }
      ],
      order: [['updated_at', 'DESC']]
    });
    
    // 获取每个会话的回答数量
    const sessionIds = sessions.map(s => s.id);
    const answerCounts = await ctx.model.UserQuestionAnswer.findAll({
      attributes: [
        'session_id',
        'user_id',
        [ctx.app.Sequelize.fn('COUNT', ctx.app.Sequelize.col('id')), 'count']
      ],
      where: { session_id: sessionIds },
      group: ['session_id', 'user_id']
    });
    
    // 创建会话ID到回答数量的映射
    const answerCountMap = new Map();
    answerCounts.forEach(count => {
      if (!answerCountMap.has(count.session_id)) {
        answerCountMap.set(count.session_id, new Map());
      }
      answerCountMap.get(count.session_id).set(count.user_id, count.get('count'));
    });
    
    // 处理会话数据
    const result = sessions.map(session => {
      const isCreator = session.creator_id === userId;
      const partnerId = isCreator ? session.partner_id : session.creator_id;
      
      // 获取回答数量
      const sessionAnswerMap = answerCountMap.get(session.id) || new Map();
      const userAnswerCount = sessionAnswerMap.get(userId) || 0;
      const partnerAnswerCount = partnerId ? (sessionAnswerMap.get(partnerId) || 0) : 0;
      
      return {
        id: session.id,
        title: session.title,
        status: session.status,
        topicId: session.topic_id,
        topicName: session.topic ? session.topic.name : '',
        topicType: session.topic ? session.topic.type : '',
        topicIcon: session.topic ? session.topic.icon : '',
        isCreator,
        partnerId,
        userAnswerCount,
        partnerAnswerCount,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      };
    });
    
    return { success: true, data: result };
  }
  
  // 邀请伴侣加入会话
  async invitePartner(sessionId, userId, partnerId) {
    const { ctx } = this;
    
    // 查询会话
    const session = await ctx.model.QuestionSession.findByPk(sessionId);
    
    if (!session) {
      return { success: false, message: '会话不存在' };
    }
    
    // 检查是否为创建者
    if (session.creator_id !== userId) {
      return { success: false, message: '只有创建者可以邀请伴侣' };
    }
    
    // 检查是否已有伴侣
    if (session.partner_id) {
      return { success: false, message: '该会话已有伴侣' };
    }
    
    // 更新伴侣ID
    await session.update({
      partner_id: partnerId,
      updated_at: new Date()
    });
    
    return { success: true };
  }
  
  // 完成会话
  async completeSession(sessionId, userId) {
    const { ctx } = this;
    
    // 查询会话
    const session = await ctx.model.QuestionSession.findByPk(sessionId);
    
    if (!session) {
      return { success: false, message: '会话不存在' };
    }
    
    // 检查是否有权限
    if (session.creator_id !== userId && session.partner_id !== userId) {
      return { success: false, message: '无权操作该会话' };
    }
    
    // 更新会话状态为已完成
    await session.update({
      status: 2, // 2-已完成
      updated_at: new Date()
    });
    
    // 更新用户话题进度
    await ctx.model.UserTopicProgress.update(
      { completed: true },
      { 
        where: { 
          user_id: userId,
          topic_id: session.topic_id
        }
      }
    );
    
    return { success: true };
  }
}

module.exports = QuestionSessionService;