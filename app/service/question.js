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
      order: [['id', 'ASC']],
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
    order: [['id', 'ASC']]
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
    order: [['id', 'ASC']]
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
  
  // 获取分类类型
  const categoryType = category ? category.type : 
    (typeof categoryId === 'string' ? categoryId : 'default');
  
  // 获取预定义的话题数据
  const topicsData = this.getPredefinedTopics(categoryType);
  
  // 如果有用户ID，添加用户特定信息
  let topics = topicsData.topics;
  let recommendedTopics = topicsData.recommendedTopics;
  
  if (userId) {
    // 获取用户解锁的话题
    // const unlockedTopics = await ctx.model.UserUnlockedTopic.findAll({
    //   where: { user_id: userId },
    //   attributes: ['topic_id']
    // });
    
    // const unlockedTopicIds = new Set(unlockedTopics.map(u => u.topic_id));
    
    // 获取用户会话信息
    const sessions = await ctx.model.QuestionSession.findAll({
      where: {
        [Op.or]: [
          { creator_id: userId },
          { partner_id: userId }
        ],
        status: { [Op.ne]: 0 } // 非删除状态
      },
      attributes: ['id', 'creator_id', 'partner_id']
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
      // const isUnlocked = topicsData.has(topic.id) || index < 3;
      
      return {
        ...topic,
        answered,
        partnerAnswered,
        locked: false
      };
    });
    
    // 处理推荐话题
    recommendedTopics = recommendedTopics.map(topic => {
      // const isUnlocked = unlockedTopicIds.has(topic.id);
      return {
        ...topic,
        locked: false
      };
    });
  }
  
  return {
    topics,
    recommendedTopics,
    categoryId: category ? category.id : categoryId,
    categoryType
  };
}

/**
 * 获取预定义的话题数据
 * @private
 */
getPredefinedTopics(categoryType) {
  // 根据分类类型返回预定义的话题数据
  const topicsMap = {
    // 入门话题
    'starters': {
      topics: [
        {
          id: 'starter-q1',
          type: '你是否曾经',
          title: '日常生活',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-pink',
          icon: '👀'
        },
        {
          id: 'starter-q2',
          type: '深度对话',
          title: '我们的亲密生活',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-pink',
          icon: '💋'
        },
        {
          id: 'starter-q3',
          type: '谁更可能',
          title: '情侣生活',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-orange',
          icon: '❤️'
        },
        {
          id: 'starter-q4',
          type: '二选一',
          title: '我们的梦想家园',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-green',
          icon: '🏠'
        },
        {
          id: 'starter-q5',
          type: '你会选择',
          title: '爱的平衡',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-green',
          icon: '⚖️'
        }
      ],
      recommendedTopics: [
        {
          id: 'rec-starter-1',
          type: '你会选择',
          title: '约会计划',
          locked: true,
          bgClass: 'bg-purple',
          icon: '🍸'
        }
      ]
    },
    
    // 关系话题
    'relationship': {
      topics: [
        {
          id: 'relationship-q1',
          type: '深度对话',
          title: '关系中的期望与现实',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-pink',
          icon: '💑'
        },
        {
          id: 'relationship-q2',
          type: '谁更可能',
          title: '关系中的角色',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-blue',
          icon: '👫'
        },
        {
          id: 'relationship-q3',
          type: '你会选择',
          title: '解决冲突的方式',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-purple',
          icon: '🤝'
        }
      ],
      recommendedTopics: [
        {
          id: 'rec-relationship-1',
          type: '二选一',
          title: '关系中的优先级',
          locked: true,
          bgClass: 'bg-yellow',
          icon: '⚖️'
        }
      ]
    },
    
    // 性爱话题
    'sex-love': {
      topics: [
        {
          id: 'sex-love-q1',
          type: '深度对话',
          title: '亲密关系中的期望',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-pink',
          icon: '💋'
        },
        {
          id: 'sex-love-q2',
          type: '你会选择',
          title: '浪漫表达方式',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-purple',
          icon: '💘'
        }
      ],
      recommendedTopics: [
        {
          id: 'rec-sex-love-1',
          type: '谁更可能',
          title: '亲密行为',
          locked: true,
          bgClass: 'bg-blue',
          icon: '🔥'
        }
      ]
    },
    
    // 默认话题
    'default': {
      topics: [
        {
          id: 'default-q1',
          type: '深度对话',
          title: '关于我们的对话',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-pink',
          icon: '💬'
        },
        {
          id: 'default-q2',
          type: '谁更可能',
          title: '了解彼此',
          answered: false,
          partnerAnswered: false,
          locked: false,
          bgClass: 'bg-blue',
          icon: '👀'
        }
      ],
      recommendedTopics: [
        {
          id: 'rec-default-1',
          type: '你会选择',
          title: '未来规划',
          locked: true,
          bgClass: 'bg-purple',
          icon: '🔮'
        }
      ]
    }
  };
  
  // 如果找不到对应的分类，返回默认话题
  return topicsMap[categoryType] || topicsMap['default'];
}

/**
 * 获取默认话题列表
 * @param {string} categoryType - 分类类型
 * @return {Array} 默认话题列表
 */
getDefaultTopics(categoryType) {
  // 根据分类类型返回不同的默认话题
  const defaultTopicsMap = {
    'starters': [
      {
        id: 'starter-t1',
        title: '日常生活',
        type: 'text',
        icon: '👀',
        recommended: false
      },
      {
        id: 'starter-t2',
        title: '我们的亲密生活',
        type: 'text',
        icon: '💋',
        recommended: false
      },
      {
        id: 'starter-t3',
        title: '情侣生活',
        type: 'who',
        icon: '❤️',
        recommended: false
      },
      {
        id: 'starter-t4',
        title: '我们的梦想家园',
        type: 'thisorthat',
        icon: '🏠',
        recommended: false
      },
      {
        id: 'starter-t5',
        title: '爱的平衡',
        type: 'options',
        icon: '⚖️',
        recommended: false
      },
      {
        id: 'rec-starter-1',
        title: '约会计划',
        type: 'options',
        icon: '🍸',
        recommended: true
      }
    ],
    'relationship': [
      {
        id: 'relationship-t1',
        title: '关系中的期望与现实',
        type: 'text',
        icon: '💑',
        recommended: false
      },
      {
        id: 'relationship-t2',
        title: '关系中的角色',
        type: 'who',
        icon: '👫',
        recommended: false
      },
      {
        id: 'relationship-t3',
        title: '解决冲突的方式',
        type: 'options',
        icon: '🤝',
        recommended: false
      },
      {
        id: 'rec-relationship-1',
        title: '关系中的优先级',
        type: 'thisorthat',
        icon: '⚖️',
        recommended: true
      }
    ],
    'sex-love': [
      {
        id: 'sex-love-t1',
        title: '亲密关系中的期望',
        type: 'text',
        icon: '💋',
        recommended: false
      },
      {
        id: 'sex-love-t2',
        title: '浪漫表达方式',
        type: 'options',
        icon: '💘',
        recommended: false
      },
      {
        id: 'rec-sex-love-1',
        title: '亲密行为',
        type: 'who',
        icon: '🔥',
        recommended: true
      }
    ],
    'moral-values': [
      {
        id: 'moral-values-t1',
        title: '价值观探讨',
        type: 'text',
        icon: '🧠',
        recommended: false
      },
      {
        id: 'moral-values-t2',
        title: '道德困境',
        type: 'thisorthat',
        icon: '🤔',
        recommended: false
      }
    ],
    'money-finances': [
      {
        id: 'money-finances-t1',
        title: '财务规划',
        type: 'text',
        icon: '💰',
        recommended: false
      },
      {
        id: 'money-finances-t2',
        title: '消费习惯',
        type: 'who',
        icon: '💳',
        recommended: false
      }
    ],
    'get-to-know': [
      {
        id: 'get-to-know-t1',
        title: '了解彼此',
        type: 'text',
        icon: '👀',
        recommended: false
      },
      {
        id: 'get-to-know-t2',
        title: '童年回忆',
        type: 'text',
        icon: '👶',
        recommended: false
      }
    ],
    'dream-home': [
      {
        id: 'dream-home-t1',
        title: '理想家居',
        type: 'thisorthat',
        icon: '🏠',
        recommended: false
      },
      {
        id: 'dream-home-t2',
        title: '家务分工',
        type: 'who',
        icon: '🧹',
        recommended: false
      }
    ]
  };
  
  // 如果没有找到对应分类的默认话题，返回通用话题
  return defaultTopicsMap[categoryType] || [
    {
      id: 'default-t1',
      title: '关于我们的对话',
      type: 'text',
      icon: '💬',
      recommended: false
    },
    {
      id: 'default-t2',
      title: '了解彼此',
      type: 'who',
      icon: '👀',
      recommended: false
    },
    {
      id: 'rec-default-1',
      title: '未来规划',
      type: 'options',
      icon: '🔮',
      recommended: true
    }
  ];
}

/**
 * 获取话题下的问题列表（用于question.vue）
 * @param {number|string} topicId - 话题ID
 * @param {number} userId - 用户ID，可选
 * @return {Object} 问题列表和相关信息
 */
async getQuestionsByTopic(topicId, userId) {
  const { ctx, app } = this;
  const { Op } = app.Sequelize;
  return getDefaultTopics();
  
  // 查询话题
  const topic = await ctx.model.QuestionTopic.findOne({
    where: {
      [Op.or]: [
        { id: topicId },
        { type: topicId }
      ],
      status: 1
    }
  });
  
  if (!topic) {
    return { questions: [] };
  }
  
  // 查询该话题下的所有问题
  let questions = await ctx.model.Question.findAll({
    where: { 
      topic_id: topic.id,
      status: 1
    },
    attributes: ['id', 'text', 'type', 'options', 'option1', 'option2', 'status'],
    order: [['id', 'ASC']]
  });
  
  // 转换为普通对象
  questions = questions.map(q => q.get({ plain: true }));
  
  // 转换为详细问题格式
  const detailQuestions = questions.map(question => {
    // 根据问题类型处理选项
    let processedQuestion = {
      id: question.id,
      text: question.text,
      questionType: question.type,
      type: question.type // 兼容前端现有代码
    };
    
    // 根据问题类型添加特定字段
    if (question.type === 'options' && question.options) {
      try {
        processedQuestion.options = typeof question.options === 'string' 
          ? JSON.parse(question.options) 
          : question.options;
      } catch (e) {
        processedQuestion.options = [];
      }
    } else if (question.type === 'thisorthat') {
      processedQuestion.option1 = question.option1;
      processedQuestion.option2 = question.option2;
    }
    
    return processedQuestion;
  });
  
  return {
    questions: detailQuestions,
    topicId: topic.id,
    topicType: topic.type
  };
}

/**
 * 为话题添加用户特定信息
 * @private
 */
async addUserTopicInfo(topics, userId) {
  const { ctx, app } = this;
  const { Op } = app.Sequelize;
  
  // 获取用户解锁的话题
  const unlockedTopics = await ctx.model.UserUnlockedTopic.findAll({
    where: { user_id: userId },
    attributes: ['topic_id']
  });
  
  const unlockedTopicIds = new Set(unlockedTopics.map(u => u.topic_id));
  
  // 获取用户信息
  const user = await ctx.model.User.findByPk(userId);
  const userLevel = user ? user.level : 0;
  
  // 获取用户的会话信息
  const sessions = await ctx.model.QuestionSession.findAll({
    where: {
      [Op.or]: [
        { creator_id: userId },
        { partner_id: userId }
      ],
      status: { [Op.ne]: 0 } // 非删除状态
    },
    attributes: ['id', 'topic_id', 'creator_id', 'partner_id', 'updated_at']
  });
  
  // 创建话题ID到会话的映射
  const topicSessionMap = new Map();
  sessions.forEach(session => {
    topicSessionMap.set(session.topic_id, session);
  });
  
  // 为每个话题添加用户特定信息
  return Promise.all(topics.map(async (topic, index) => {
    // 判断话题是否已回答
    const session = topicSessionMap.get(topic.id);
    const answered = !!session;
    
    // 判断伴侣是否已回答
    let partnerAnswered = false;
    if (session) {
      const partnerId = session.creator_id === userId ? session.partner_id : session.creator_id;
      if (partnerId) {
        // 检查伴侣是否有回答
        const partnerAnswerCount = await ctx.model.QuestionAnswer.count({
          where: { 
            session_id: session.id,
            user_id: partnerId
          }
        });
        partnerAnswered = partnerAnswerCount > 0;
      }
    }
    
    // 判断话题是否锁定
    // 规则：前3个话题对所有用户开放，其余话题根据用户等级和解锁状态决定
    const isUnlocked = unlockedTopicIds.has(topic.id) || index < 3;
    const locked = !isUnlocked && userLevel < 2; // 假设2级以上用户可以访问所有话题
    
    // 判断是否为推荐话题
    const recommended = topic.recommended || false;
    
    return {
      id: topic.id,
      type: topic.type,
      title: topic.title,
      icon: topic.icon || this.getTopicIcon(topic.type),
      answered,
      partnerAnswered,
      locked,
      recommended,
      bgClass: this.getTopicBgClass(topic.type)
    };
  }));
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