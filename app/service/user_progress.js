'use strict';

const Service = require('egg').Service;

class UserProgressService extends Service {
  /**
   * 获取用户的话题进度
   * @param {number} userId - 用户ID
   * @param {string|number} categoryId - 分类ID
   * @return {Array} 话题列表（包含用户进度信息）
   */
  async getUserTopicProgress(userId, categoryId) {
    const { ctx } = this;
    
    try {
      // 获取分类下的所有话题模板
      const topicTemplates = await ctx.service.template.getTopicsByCategoryId(categoryId);
      
      // 如果没有用户ID，直接返回模板数据
      if (!userId) {
        return topicTemplates.map(topic => ({
          ...topic,
          answered: false,
          partnerAnswered: false,
          locked: topic.index > 2 // 前三个话题默认解锁
        }));
      }
      
      // 获取用户解锁的话题
      const unlockedTopics = await ctx.model.UserUnlockedTopic.findAll({
        where: { user_id: userId },
        attributes: ['topic_id']
      });
      
      const unlockedTopicIds = new Set(unlockedTopics.map(u => u.topic_id));
      
      // 获取用户会话信息
      const sessions = await ctx.model.QuestionSession.findAll({
        where: {
          creator_id: userId,
          topic_id: topicTemplates.map(t => t.id),
          status: { $ne: 0 } // 非删除状态
        },
        attributes: ['id', 'topic_id', 'creator_id', 'partner_id', 'updated_at']
      });
      
      // 创建话题ID到会话的映射
      const topicSessionMap = new Map();
      sessions.forEach(session => {
        topicSessionMap.set(session.topic_id, session);
      });
      
      // 为每个话题添加用户特定信息
      return topicTemplates.map((topic, index) => {
        // 判断话题是否已回答
        const session = topicSessionMap.get(topic.id);
        const answered = !!session;
        
        // 判断伴侣是否已回答
        let partnerAnswered = false;
        if (session && session.partner_id) {
          partnerAnswered = true; // 简化处理，有伴侣ID就认为已回答
        }
        
        // 判断话题是否锁定
        // 规则：前3个话题对所有用户开放，其余话题根据解锁状态决定
        const isUnlocked = unlockedTopicIds.has(topic.id) || index < 3;
        
        return {
          ...topic,
          answered,
          partnerAnswered,
          locked: !isUnlocked
        };
      });
    } catch (error) {
      this.ctx.logger.error('获取用户话题进度失败', error);
      return [];
    }
  }
  
  /**
   * 获取用户的问题回答
   * @param {number} userId - 用户ID
   * @param {string|number} topicId - 话题ID
   * @return {Array} 问题列表（包含用户回答信息）
   */
  async getUserQuestionAnswers(userId, topicId) {
    const { ctx } = this;
    
    try {
      // 获取话题下的所有问题模板
      const questionTemplates = await ctx.service.template.getQuestionsByTopicId(topicId);
      
      // 如果没有用户ID，直接返回模板数据
      if (!userId) {
        return questionTemplates;
      }
      
      // 获取用户的会话
      const session = await ctx.model.QuestionSession.findOne({
        where: {
          creator_id: userId,
          topic_id: topicId,
          status: { $ne: 0 } // 非删除状态
        },
        attributes: ['id']
      });
      
      // 如果没有会话，直接返回模板数据
      if (!session) {
        return questionTemplates;
      }
      
      // 获取用户的回答
      const answers = await ctx.model.QuestionAnswer.findAll({
        where: {
          session_id: session.id,
          user_id: userId
        },
        attributes: ['question_id', 'answer_value']
      });
      
      // 创建问题ID到回答的映射
      const questionAnswerMap = new Map();
      answers.forEach(answer => {
        questionAnswerMap.set(answer.question_id, answer.answer_value);
      });
      
      // 为每个问题添加用户回答信息
      return questionTemplates.map(question => {
        const userAnswer = questionAnswerMap.get(question.id);
        
        return {
          ...question,
          userAnswer: userAnswer || null,
          answered: !!userAnswer
        };
      });
    } catch (error) {
      this.ctx.logger.error('获取用户问题回答失败', error);
      return [];
    }
  }
  
  /**
   * 解锁话题
   * @param {number} userId - 用户ID
   * @param {string|number} topicId - 话题ID
   * @return {Object} 解锁结果
   */
  async unlockTopic(userId, topicId) {
    const { ctx } = this;
    
    try {
      // 检查话题是否存在
      const topic = await ctx.service.template.getTopicById(topicId);
      
      if (!topic) {
        return {
          success: false,
          message: '话题不存在'
        };
      }
      
      // 检查用户是否已解锁该话题
      const existingUnlock = await ctx.model.UserUnlockedTopic.findOne({
        where: {
          user_id: userId,
          topic_id: topicId
        }
      });
      
      if (existingUnlock) {
        return {
          success: true,
          message: '话题已解锁',
          data: { alreadyUnlocked: true }
        };
      }
      
      // 创建解锁记录
      await ctx.model.UserUnlockedTopic.create({
        user_id: userId,
        topic_id: topicId,
        unlock_time: new Date(),
        cost: 0 // 暂时不收费
      });
      
      return {
        success: true,
        message: '解锁话题成功',
        data: { alreadyUnlocked: false }
      };
    } catch (error) {
      this.ctx.logger.error('解锁话题失败', error);
      return {
        success: false,
        message: error.message || '解锁话题失败'
      };
    }
  }
  
  /**
   * 保存用户回答
   * @param {number} userId - 用户ID
   * @param {string|number} questionId - 问题ID
   * @param {string|object} answerValue - 回答内容
   * @param {number} sessionId - 会话ID
   * @return {Object} 保存结果
   */
  async saveUserAnswer(userId, questionId, answerValue, sessionId) {
    const { ctx } = this;
    
    try {
      // 检查会话是否存在
      const session = await ctx.model.QuestionSession.findByPk(sessionId);
      
      if (!session) {
        return {
          success: false,
          message: '会话不存在'
        };
      }
      
      // 检查问题是否存在
      const question = await ctx.service.template.getQuestionById(questionId);
      
      if (!question) {
        return {
          success: false,
          message: '问题不存在'
        };
      }
      
      // 检查是否已回答
      const existingAnswer = await ctx.model.QuestionAnswer.findOne({
        where: {
          session_id: sessionId,
          user_id: userId,
          question_id: questionId
        }
      });
      
      // 如果已回答，更新回答
      if (existingAnswer) {
        await existingAnswer.update({
          answer_value: typeof answerValue === 'object' ? JSON.stringify(answerValue) : answerValue,
          updated_at: new Date()
        });
      } else {
        // 否则创建新回答
        await ctx.model.QuestionAnswer.create({
          session_id: sessionId,
          user_id: userId,
          question_id: questionId,
          answer_value: typeof answerValue === 'object' ? JSON.stringify(answerValue) : answerValue,
          created_at: new Date()
        });
      }
      
      return {
        success: true,
        message: '保存回答成功'
      };
    } catch (error) {
      this.ctx.logger.error('保存用户回答失败', error);
      return {
        success: false,
        message: error.message || '保存用户回答失败'
      };
    }
  }
}

module.exports = UserProgressService;