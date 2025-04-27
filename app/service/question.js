'use strict';

const Service = require('egg').Service;

class QuestionService extends Service {
  // 获取分类下的所有问题
  async getByCategory(categoryId) {
    return await this.ctx.model.Question.findAll({
      where: { 
        category_id: categoryId,
        status: 1 
      },
    });
  }

  // 根据ID获取问题
  async getById(id) {
    return await this.ctx.model.Question.findByPk(id);
  }

  // 批量获取问题
  async getByIds(ids) {
    return await this.ctx.model.Question.findAll({
      where: {
        id: ids,
        status: 1
      }
    });
  }

  // 创建问题
  async create(data) {
    return await this.ctx.model.Question.create(data);
  }

  // 更新问题
  async update(id, data) {
    const question = await this.ctx.model.Question.findByPk(id);
    if (!question) {
      return null;
    }
    return await question.update(data);
  }

  // 删除问题
  async delete(id) {
    const question = await this.ctx.model.Question.findByPk(id);
    if (!question) {
      return false;
    }
    await question.update({ status: 0 });
    return true;
  }

  // 随机获取指定数量的问题
  async getRandomQuestions(categoryId, count) {
    const questions = await this.ctx.model.Question.findAll({
      where: { 
        category_id: categoryId,
        status: 1 
      },
      order: this.app.Sequelize.literal('random()'),
      limit: count,
    });
    return questions;
  }
  /**
 * 获取分类下的问题列表
 * @param {number|string} categoryId - 分类ID或类型
 * @param {number} userId - 用户ID，可选
 * @return {Object} 问题列表和相关信息
 */
async getQuestionsByCategory(categoryId, userId) {
  const { ctx, app } = this;
  const { Op } = app.Sequelize;
  
  // 查询分类 - 同时支持通过ID或type查询
  const category = await ctx.model.QuestionCategory.findOne({
    where: {
      [Op.or]: [
        { id: categoryId },
        { type: categoryId }
      ],
      status: 1
    }
  });
  
  if (!category) {
    return { questions: [] };
  }
  
  // 查询该分类下的所有问题
  let questions = await ctx.model.Question.findAll({
    where: { 
      category_id: category.id,
      status: 1
    },
    attributes: ['id', 'text', 'type', 'options', 'status'],
  });
  
  // 转换为普通对象
  questions = questions.map(q => q.get({ plain: true }));
  
  // 如果有用户ID，添加用户特定信息
  if (userId) {
    questions = await this.addUserQuestionInfo(questions, category.id, userId);
  } else {
    // 没有用户ID，设置默认值
    questions = questions.map(question => ({
      ...question,
      answered: false,
      partnerAnswered: false,
      locked: false
    }));
  }
  
  // 将问题分为普通问题和推荐问题
  const regularQuestions = questions.filter(q => !q.recommended);
  const recommendedQuestions = questions.filter(q => q.recommended);
  
  return {
    questions: regularQuestions,
    recommendedQuestions,
    categoryId: category.id,
    categoryType: category.type
  };
}

/**
 * 为问题添加用户特定信息
 * @private
 */
async addUserQuestionInfo(questions, categoryId, userId) {
  const { ctx, app } = this;
  const { Op } = app.Sequelize;
  
  // 获取用户在该分类下的会话
  const session = await ctx.model.QuestionSession.findOne({
    where: {
      category_id: categoryId,
      [Op.or]: [
        { creator_id: userId },
        { partner_id: userId }
      ],
      status: { [Op.ne]: 0 } // 非删除状态
    },
    order: [['updated_at', 'DESC']]
  });
  
  // 创建问题ID到回答状态的映射
  const userAnsweredMap = new Map();
  const partnerAnsweredMap = new Map();
  
  if (session) {
    // 获取用户在该会话下的所有回答
    const userAnswers = await ctx.model.QuestionAnswer.findAll({
      where: { 
        session_id: session.id,
        user_id: userId
      },
      attributes: ['id', 'question_id']
    });
    
    userAnswers.forEach(answer => {
      userAnsweredMap.set(answer.question_id, true);
    });
    
    // 获取伴侣在该会话下的所有回答
    const partnerId = session.creator_id === userId ? session.partner_id : session.creator_id;
    if (partnerId) {
      const partnerAnswers = await ctx.model.QuestionAnswer.findAll({
        where: { 
          session_id: session.id,
          user_id: partnerId
        },
        attributes: ['id', 'question_id']
      });
      
      partnerAnswers.forEach(answer => {
        partnerAnsweredMap.set(answer.question_id, true);
      });
    }
  }
  
  // 获取用户解锁的问题
  const unlockedQuestions = await ctx.model.UserUnlockedQuestion.findAll({
    where: { user_id: userId },
    attributes: ['question_id']
  });
  
  const unlockedQuestionIds = new Set(unlockedQuestions.map(u => u.question_id));
  
  // 获取用户信息
  const user = await ctx.model.User.findByPk(userId);
  const userLevel = user ? user.level : 0;
  
  // 为每个问题添加用户特定信息
  return questions.map((question, index) => {
    // 判断问题是否已回答
    const answered = userAnsweredMap.has(question.id);
    const partnerAnswered = partnerAnsweredMap.has(question.id);
    
    // 判断问题是否锁定
    // 规则：前5个问题对所有用户开放，其余问题根据用户等级和解锁状态决定
    const isUnlocked = unlockedQuestionIds.has(question.id) || index < 5;
    const locked = !isUnlocked && userLevel < 2; // 假设2级以上用户可以访问所有问题
    
    return {
      ...question,
      answered,
      partnerAnswered,
      locked
    };
  });
}
/**
 * 获取分类下的话题问题列表（用于topic.vue）
 * @param {number|string} categoryId - 分类ID或类型
 * @param {number} userId - 用户ID，可选
 * @return {Object} 话题问题列表和相关信息
 */
async getTopicQuestionsByCategory(categoryId, userId) {
  const { ctx, app } = this;
  const { Op } = app.Sequelize;
  
  // 查询分类
  const category = await ctx.model.QuestionCategory.findOne({
    where: {
      [Op.or]: [
        { id: categoryId },
        { type: categoryId }
      ],
      status: 1
    }
  });
  
  if (!category) {
    return { questions: [] };
  }
  
  // 查询该分类下的所有问题
  let questions = await ctx.model.Question.findAll({
    where: { 
      category_id: category.id,
      status: 1
    },
    attributes: ['id', 'text', 'type', 'options', 'status'],
  });
  
  // 转换为普通对象
  questions = questions.map(q => q.get({ plain: true }));
  
  // 如果有用户ID，添加用户特定信息
  if (userId) {
    questions = await this.addUserTopicQuestionInfo(questions, category.id, userId);
  } else {
    // 没有用户ID，设置默认值
    questions = questions.map(question => ({
      ...question,
      id: question.id,
      questionType: question.type,
      title: question.text,
      answered: false,
      partnerAnswered: false,
      locked: false,
      recommended: false
    }));
  }
  
  // 将问题分为普通问题和推荐问题
  const regularQuestions = questions.filter(q => !q.recommended);
  const recommendedQuestions = questions.filter(q => q.recommended);
  
  return {
    questions: regularQuestions,
    recommendedQuestions,
    categoryId: category.id,
    categoryType: category.type
  };
}

/**
 * 为话题问题添加用户特定信息
 * @private
 */
async addUserTopicQuestionInfo(questions, categoryId, userId) {
  const { ctx, app } = this;
  const { Op } = app.Sequelize;
  
  // 获取用户在该分类下的会话
  const session = await ctx.model.QuestionSession.findOne({
    where: {
      category_id: categoryId,
      [Op.or]: [
        { creator_id: userId },
        { partner_id: userId }
      ],
      status: { [Op.ne]: 0 } // 非删除状态
    },
    order: [['updated_at', 'DESC']]
  });
  
  // 创建问题ID到回答状态的映射
  const userAnsweredMap = new Map();
  const partnerAnsweredMap = new Map();
  
  if (session) {
    // 获取用户在该会话下的所有回答
    const userAnswers = await ctx.model.QuestionAnswer.findAll({
      where: { 
        session_id: session.id,
        user_id: userId
      },
      attributes: ['id', 'question_id']
    });
    
    userAnswers.forEach(answer => {
      userAnsweredMap.set(answer.question_id, true);
    });
    
    // 获取伴侣在该会话下的所有回答
    const partnerId = session.creator_id === userId ? session.partner_id : session.creator_id;
    if (partnerId) {
      const partnerAnswers = await ctx.model.QuestionAnswer.findAll({
        where: { 
          session_id: session.id,
          user_id: partnerId
        },
        attributes: ['id', 'question_id']
      });
      
      partnerAnswers.forEach(answer => {
        partnerAnsweredMap.set(answer.question_id, true);
      });
    }
  }
  
  // 获取用户解锁的问题
  const unlockedQuestions = await ctx.model.UserUnlockedQuestion.findAll({
    where: { user_id: userId },
    attributes: ['question_id']
  });
  
  const unlockedQuestionIds = new Set(unlockedQuestions.map(u => u.question_id));
  
  // 获取用户信息
  const user = await ctx.model.User.findByPk(userId);
  const userLevel = user ? user.level : 0;
  
  // 为每个问题添加用户特定信息
  return questions.map((question, index) => {
    // 判断问题是否已回答
    const answered = userAnsweredMap.has(question.id);
    const partnerAnswered = partnerAnsweredMap.has(question.id);
    
    // 判断问题是否锁定
    // 规则：前5个问题对所有用户开放，其余问题根据用户等级和解锁状态决定
    const isUnlocked = unlockedQuestionIds.has(question.id) || index < 5;
    const locked = !isUnlocked && userLevel < 2; // 假设2级以上用户可以访问所有问题
    
    // 判断是否为推荐问题
    const recommended = question.recommended || false;
    
    return {
      id: question.id,
      questionType: question.type,
      title: question.text,
      text: question.text, // 兼容性字段
      answered,
      partnerAnswered,
      locked,
      recommended
    };
  });
}
/**
 * 获取分类下的话题列表（用于topic.vue）
 * @param {number|string} categoryId - 分类ID或类型
 * @param {number} userId - 用户ID，可选
 * @return {Object} 话题列表和相关信息
 */
async getTopicsByCategory(categoryId, userId) {
  const { ctx, app } = this;
  const { Op } = app.Sequelize;
  
  // 查询分类
  const category = await ctx.model.QuestionCategory.findOne({
    where: {
      [Op.or]: [
        { id: categoryId },
        { type: categoryId }
      ],
      status: 1
    }
  });
  
  if (!category) {
    return { topics: [], recommendedTopics: [], categoryId, categoryType: 'default' };
  }
  
  // 获取分类类型
  const categoryType = category.type || 'default';
  
  // 从数据库中获取话题数据，而不是使用预定义数据
  let topics = await ctx.model.QuestionTopic.findAll({
    where: { 
      category_id: category.id,
      recommended: false,
      status: 1
    },
    attributes: ['id', 'title', 'type', 'icon', 'recommended', 'status'],
  });
  
  // 获取推荐话题
  let recommendedTopics = await ctx.model.QuestionTopic.findAll({
    where: { 
      category_id: category.id,
      recommended: true,
      status: 1
    },
    attributes: ['id', 'title', 'type', 'icon', 'recommended', 'status'],
  });
  
  // 转换为普通对象
  topics = topics.map(t => t.get({ plain: true }));
  recommendedTopics = recommendedTopics.map(t => t.get({ plain: true }));
  
  // 如果数据库中没有话题数据，使用预定义的话题作为备份
  if (topics.length === 0) {
    return {
      topics: [],
      recommendedTopics,
      categoryId: category.id,
      categoryType
    };
  }
  
  if (recommendedTopics.length === 0) {
    return {
      topics,
      recommendedTopics: [],
      categoryId: category.id,
      categoryType
    };
  }
  
  // 如果有用户ID，添加用户特定信息
  if (userId) {
    // 获取用户解锁的话题
    const unlockedTopics = await ctx.model.UserUnlockedTopic.findAll({
      where: { user_id: userId },
      attributes: ['topic_id']
    });
    
    const unlockedTopicIds = new Set(unlockedTopics.map(u => u.topic_id));
    
    // 获取用户会话信息
    const sessions = await ctx.model.QuestionSession.findAll({
      where: {
        [Op.or]: [
          { creator_id: userId },
          { partner_id: userId }
        ],
        status: { [Op.ne]: 0 } // 非删除状态
      },
      attributes: ['id', 'topic_id', 'creator_id', 'partner_id']
    });
    
    // 创建话题ID到会话的映射
    const topicSessionMap = new Map();
    sessions.forEach(session => {
      topicSessionMap.set(session.topic_id, session);
    });
    
    // 为每个话题添加用户特定信息
    topics = topics.map((topic, index) => {
      // 判断话题是否已回答
      const session = topicSessionMap.get(topic.id);
      const answered = !!session;
      
      // 判断伴侣是否已回答
      let partnerAnswered = false;
      if (session) {
        const partnerId = session.creator_id === userId ? session.partner_id : session.creator_id;
        partnerAnswered = !!partnerId; // 简化处理，有伴侣ID就认为已回答
      }
      
      // 判断话题是否锁定
      // 规则：前3个话题对所有用户开放，其余话题根据解锁状态决定
      const isUnlocked = unlockedTopicIds.has(topic.id) || index < 3;
      
      // 确保每个话题都有背景类和图标
      const bgClass = this.getTopicBgClass(topic.type);
      const icon = topic.icon || this.getTopicIcon(topic.type);
      
      return {
        ...topic,
        answered,
        partnerAnswered,
        locked: !isUnlocked,
        bgClass,
        icon
      };
    });
    
    // 处理推荐话题
    recommendedTopics = recommendedTopics.map(topic => {
      const isUnlocked = unlockedTopicIds.has(topic.id);
      const bgClass = this.getTopicBgClass(topic.type);
      const icon = topic.icon || this.getTopicIcon(topic.type);
      
      return {
        ...topic,
        locked: !isUnlocked,
        bgClass,
        icon
      };
    });
  } else {
    // 没有用户ID，为话题添加默认值
    topics = topics.map(topic => {
      const bgClass = this.getTopicBgClass(topic.type);
      const icon = topic.icon || this.getTopicIcon(topic.type);
      
      return {
        ...topic,
        answered: false,
        partnerAnswered: false,
        locked: false,
        bgClass,
        icon
      };
    });
    
    recommendedTopics = recommendedTopics.map(topic => {
      const bgClass = this.getTopicBgClass(topic.type);
      const icon = topic.icon || this.getTopicIcon(topic.type);
      
      return {
        ...topic,
        locked: true,
        bgClass,
        icon
      };
    });
  }
  
  return {
    topics,
    recommendedTopics,
    categoryId: category.id,
    categoryType
  };
}


/**
 * 获取话题图标
 * @private
 */
getTopicIcon(type) {
  const iconMap = {
    'text': '💬',
    'choice': '🔄',
    'scale': '⚖️',
    'who': '👫',
    'would-you-rather': '🤔'
  };
  
  return iconMap[type] || '❓';
}

/**
 * 获取话题背景类
 * @private
 */
getTopicBgClass(type) {
  const bgClassMap = {
    'text': 'bg-pink',
    'choice': 'bg-purple',
    'scale': 'bg-green',
    'who': 'bg-blue',
    'would-you-rather': 'bg-yellow'
  };
  
  return bgClassMap[type] || 'bg-pink';
}
}

module.exports = QuestionService;