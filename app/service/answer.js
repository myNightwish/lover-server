'use strict';

const Service = require('egg').Service;

class AnswerService extends Service {
  // 获取用户在会话中的所有回答
  async getUserSessionAnswers(userId, sessionId) {
    return await this.ctx.model.AnswersForUser.findAll({
      where: {
        user_id: userId,
        session_id: sessionId,
      },
      include: [
        {
          model: this.ctx.model.Question,
          as: 'Question',
        },
      ],
      order: [['question_id', 'ASC']],
    });
  }

  // 获取问题的所有回答
  async getQuestionAnswers(questionId, sessionId) {
    return await this.ctx.model.AnswersForUser.findAll({
      where: {
        question_id: questionId,
        session_id: sessionId,
      },
      include: [
        {
          model: this.ctx.model.User,
          as: 'User',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
      ],
    });
  }

  // 保存用户回答
  async saveAnswer(data) {
    const { user_id, session_id, question_id, answer_type, answer_value, custom_text } = data;
    
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
      return await existingAnswer.update({
        answer_type,
        answer_value,
        custom_text,
      });
    } else {
      // 创建新回答
      return await this.ctx.model.AnswersForUser.create({
        user_id,
        session_id,
        question_id,
        answer_type,
        answer_value,
        custom_text,
      });
    }
  }

  // 删除用户回答
  async deleteAnswer(userId, questionId, sessionId) {
    const answer = await this.ctx.model.AnswersForUser.findOne({
      where: {
        user_id: userId,
        question_id: questionId,
        session_id: sessionId,
      },
    });
    
    if (!answer) {
      return false;
    }
    
    await answer.destroy();
    return true;
  }

  // 转换回答为AI分析格式
  async transformAnswersForAI(sessionId) {
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
      ],
    });
    
    if (!session) {
      return null;
    }
    
    // 获取会话中的所有回答
    const answers = await this.ctx.model.AnswersForUser.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: this.ctx.model.Question,
          as: 'Question',
        },
        {
          model: this.ctx.model.User,
          as: 'User',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
      ],
    });
    
    // 按用户分组回答
    const creatorAnswers = answers.filter(a => a.user_id === session.creator_id);
    const partnerAnswers = answers.filter(a => a.user_id === session.partner_id);
    
    // 构建AI分析所需的数据结构
    const aiData = {
      session: {
        id: session.id,
        title: session.title,
        category_id: session.category_id,
        similarity_percentage: session.similarity_percentage,
      },
      creator: {
        id: session.Creator.id,
        nickname: session.Creator.nickname,
        answers: creatorAnswers.map(a => ({
          question_id: a.question_id,
          question_text: a.Question.text,
          question_type: a.Question.type,
          answer_type: a.answer_type,
          answer_value: a.answer_value,
          custom_text: a.custom_text,
        })),
      },
      partner: session.Partner ? {
        id: session.Partner.id,
        nickname: session.Partner.nickname,
        answers: partnerAnswers.map(a => ({
          question_id: a.question_id,
          question_text: a.Question.text,
          question_type: a.Question.type,
          answer_type: a.answer_type,
          answer_value: a.answer_value,
          custom_text: a.custom_text,
        })),
      } : null,
    };
    
    return aiData;
  }

  // 分析回答匹配度
  async analyzeAnswerMatching(sessionId) {
    const session = await this.ctx.model.QuestionSession.findByPk(sessionId);
    if (!session || !session.partner_id) {
      return { success: false, message: '会话不存在或没有伴侣' };
    }
    
    // 获取会话中的所有回答
    const answers = await this.ctx.model.AnswersForUser.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: this.ctx.model.Question,
          as: 'Question',
        },
        {
          model: this.ctx.model.User,
          as: 'User',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
      ],
    });
    
    // 按问题分组回答
    const questionGroups = {};
    answers.forEach(answer => {
      const questionId = answer.question_id;
      if (!questionGroups[questionId]) {
        questionGroups[questionId] = {
          question: answer.Question,
          answers: [],
        };
      }
      questionGroups[questionId].answers.push(answer);
    });
    
    // 分析每个问题的匹配情况
    const matchingResults = [];
    
    Object.values(questionGroups).forEach(group => {
      if (group.answers.length >= 2) {
        const question = group.question;
        const userAnswers = group.answers;
        
        // 简单匹配分析
        let isMatch = false;
        let matchReason = '';
        
        if (userAnswers.length === 2) {
          const answer1 = userAnswers[0];
          const answer2 = userAnswers[1];
          
          if (question.type === 'options') {
            isMatch = answer1.answer_value.optionId === answer2.answer_value.optionId;
            matchReason = isMatch ? '你们选择了相同的选项' : '你们选择了不同的选项';
          } else if (question.type === 'yesno') {
            isMatch = answer1.answer_value.value === answer2.answer_value.value;
            matchReason = isMatch ? '你们的回答一致' : '你们的回答不一致';
          } else if (question.type === 'wholikely') {
            // 对于"谁更可能"类型，如果一方选择"我"，另一方选择"伴侣"，也算匹配
            const value1 = answer1.answer_value.value;
            const value2 = answer2.answer_value.value;
            
            isMatch = (value1 === value2) || 
                     (value1 === 'me' && value2 === 'partner') ||
                     (value1 === 'partner' && value2 === 'me');
                     
            if (isMatch) {
              if (value1 === value2) {
                matchReason = '你们的看法一致';
              } else {
                matchReason = '你们互相认可对方的特点';
              }
            } else {
              matchReason = '你们对这个问题有不同的看法';
            }
          } else if (question.type === 'thisorthat') {
            isMatch = answer1.answer_value.value === answer2.answer_value.value;
            matchReason = isMatch ? '你们的偏好相同' : '你们的偏好不同';
          }
        }
        
        matchingResults.push({
          question_id: question.id,
          question_text: question.text,
          question_type: question.type,
          is_match: isMatch,
          match_reason: matchReason,
          answers: userAnswers.map(a => ({
            user_id: a.user_id,
            user_nickname: a.User.nickname,
            answer_value: a.answer_value,
            custom_text: a.custom_text,
          })),
        });
      }
    });
    
    return {
      success: true,
      data: {
        session_id: sessionId,
        matching_results: matchingResults,
      },
    };
  }
}

module.exports = AnswerService;