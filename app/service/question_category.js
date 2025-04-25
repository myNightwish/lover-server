'use strict';

const Service = require('egg').Service;

class QuestionCategoryService extends Service {
  /**
   * 获取所有问题分类，并附加用户进度信息
   * @param {number} userId - 用户ID，可选
   * @return {Array} 分类列表
   */
  async getAll(userId) {
    // 首先从缓存获取基础分类数据
    let categories = await this.getCachedCategories();
    
    console.log('userId:',userId);
    // 如果有用户ID，则添加用户特定的进度信息
    if (userId) {
      categories = await this.addUserProgress(categories, userId);
    }
    
    return categories;
  }
  /**
   * 从缓存获取基础分类数据，如果缓存不存在则从数据库加载并缓存
   * @return {Array} 分类列表
   */
  async getCachedCategories() {
    const { app } = this;
    const cacheKey = 'question_category';
    
    // 尝试从缓存获取
    let categories = await app.redis.get(cacheKey);
    
    if (categories) {
      // 如果缓存存在，解析JSON
      return JSON.parse(categories);
    }
    
    // 缓存不存在，检查数据库
    categories = await this.ctx.model.QuestionCategory.findAll({
      where: { status: 1 },
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'description', 'icon', 'type', 'status'],
    });
    
    // 如果数据库也没有数据，则初始化默认分类
    if (!categories || categories.length === 0) {
      categories = await this.initDefaultCategories();
    } else {
      // 转换为普通对象
      categories = categories.map(category => category.get({ plain: true }));
    }
    
    // 缓存分类数据（设置1小时过期）
    await app.redis.set(cacheKey, JSON.stringify(categories), 'EX', 3600);
    
    return categories;
  }
  /**
   * 初始化默认分类数据
   * @return {Array} 默认分类列表
   */
  async initDefaultCategories() {
    const defaultCategories = [
      {
        name: '入门话题',
        description: '适合初次了解对方的轻松话题',
        icon: '💜',
        type: 'starters',
        status: 1
      },
      {
        name: '关系探索',
        description: '探索彼此关系的深度话题',
        icon: '💕',
        type: 'relationship',
        status: 1
      },
      {
        name: '性与爱',
        description: '关于亲密关系的深入话题',
        icon: '🔞',
        type: 'sex-love',
        status: 1
      },
      {
        name: '道德价值观',
        description: '探讨彼此的价值观和道德观念',
        icon: '🤝',
        cover_image: '/static/images/categories/moral-values.jpg',
        type: 'moral-values',
        status: 1
      },
      {
        name: '金钱与财务',
        description: '关于金钱观念和财务规划的话题',
        icon: '💵',
        cover_image: '/static/images/categories/money-finances.jpg',
        type: 'money-finances',
        status: 1
      },
      {
        name: '深入了解对方',
        description: '更深入了解彼此的话题',
        icon: '👫',
        cover_image: '/static/images/categories/get-to-know.jpg',
        type: 'get-to-know',
        status: 1
      },
      {
        name: '梦想家园',
        description: '关于未来生活和家庭的话题',
        icon: '🏠',
        cover_image: '/static/images/categories/dream-home.jpg',
        type: 'dream-home',
        status: 1
      }
    ];
    
    // 批量创建分类
    const createdCategories = await this.ctx.model.QuestionCategory.bulkCreate(defaultCategories);
    
    // 为每个分类创建默认话题和问题
    await this.createDefaultTopics();
    console.log('9999')
    
    return createdCategories.map(category => category.get({ plain: true }));
  }
  /**
   * 创建默认问题
   */
  async createDefaultTopics() {
    // 获取所有分类
    const categories = await this.ctx.model.QuestionCategory.findAll();
    const categoryMap = {};
    
    categories.forEach(category => {
      categoryMap[category.type] = category.id;
    });
    
    // 为每个分类创建默认问题
    const defaultTopics = [];
    
    // 入门话题的问题
    if (categoryMap.starters) {
      defaultTopics.push(
        { category_id: categoryMap.starters, text: '你最喜欢的电影是什么？为什么？', type: 'text', status: 1 },
        { category_id: categoryMap.starters, text: '你童年最美好的回忆是什么？', type: 'text', status: 1 },
        { category_id: categoryMap.starters, text: '如果可以选择一项超能力，你会选择什么？', type: 'text', status: 1 },
        { category_id: categoryMap.starters, text: '你最欣赏自己的哪一点？', type: 'text', status: 1 },
        { category_id: categoryMap.starters, text: '你最喜欢的旅行目的地是哪里？', type: 'text', status: 1 }
      );
    }
    
    // 关系探索的问题
    if (categoryMap.relationship) {
      defaultTopics.push(
        { category_id: categoryMap.relationship, text: '你认为一段健康的关系应该具备哪些特质？', type: 'text', status: 1 },
        { category_id: categoryMap.relationship, text: '你如何看待关系中的沟通？', type: 'text', status: 1 },
        { category_id: categoryMap.relationship, text: '你认为关系中最重要的是什么？', type: 'text', status: 1 }
      );
    }
    
    // 其他分类的问题...
    
    // 批量创建问题
     // 批量创建话题
     let createdTopics = [];
     try {
       // 检查QuestionTopic表是否存在
       try {
         await ctx.model.QuestionTopic.findOne();
         console.log('QuestionTopic表存在，继续创建话题');
       } catch (error) {
         console.error('QuestionTopic表不存在，请先创建该表:', error);
         return;
       }
       
       createdTopics = await ctx.model.QuestionTopic.bulkCreate(defaultTopics);
       console.log(`成功创建${createdTopics.length}个话题`);
     } catch (error) {
       console.error('创建话题失败:', error);
       return;
     }
       // 为每个话题创建默认问题
      const topicMap = {};
      createdTopics.forEach(topic => {
        topicMap[topic.code] = topic.id;
      });
      
      const defaultQuestions = [];
        // 日常生活话题的问题
    if (topicMap['daily-life']) {
      defaultQuestions.push(
        { 
          topic_id: topicMap['daily-life'], 
          text: '你是否曾经因为工作或学习而忽略了我们的关系？', 
          type: 'yesno',
          code: 'work-neglect',
          status: 1 
        },
        { 
          topic_id: topicMap['daily-life'], 
          text: '你是否曾经为了对方改变自己的生活习惯？', 
          type: 'yesno',
          code: 'change-habits',
          status: 1 
        }
      );
    }

     
    // 亲密生活话题的问题
    if (topicMap['intimate-life']) {
      defaultQuestions.push(
        { 
          topic_id: topicMap['intimate-life'], 
          text: '你认为我们的亲密关系中最重要的是什么？', 
          type: 'text',
          code: 'intimacy-important',
          status: 1 
        }
      );
    }

     // 批量创建问题
     try {
      await ctx.model.Question.bulkCreate(defaultQuestions);
      console.log(`成功创建${defaultQuestions.length}个问题`);
    } catch (error) {
      console.error('创建问题失败:', error);
    }
  }

  /**
   * 为分类添加用户进度信息
   * @param {Array} categories - 分类列表
   * @param {number} userId - 用户ID
   * @return {Array} 添加了用户进度的分类列表
   */
  async addUserProgress(categories, userId) {
    const { Op } = this.app.Sequelize;
    console.log('QuestionSession:',this.ctx.model.QuestionSession);
    // 获取用户的所有会话
    const sessions = await this.ctx.model.QuestionSession.findAll({
      where: {
        [Op.or]: [
          { creator_id: userId },
          { partner_id: userId }
        ]
      },
      attributes: ['id', 'category_id', 'status']
    });
    console.log('🍊sessions--->:',sessions, sessions.length);
    
    if(sessions.length === 0){
      return categories.map(category => {
        return {
          ...category,
          progress: 0,
          sessionId: null,
          answeredCount: 0,
          totalQuestions: 0,
          isNew: true,
          isYourTurn: false
        };
      })
    }
    // 按分类ID分组会话
    const sessionsByCategory = {};
    (sessions || []).forEach(session => {
      const categoryId = session.category_id;
      if (!sessionsByCategory[categoryId]) {
        sessionsByCategory[categoryId] = [];
      }
      sessionsByCategory[categoryId].push(session);
    });
    
    // 获取用户的所有回答
    const answers = await this.ctx.model.AnswersForUser.findAll({
      where: { user_id: userId },
      attributes: ['id', 'session_id', 'question_id']
    });
    console.log('🍊answers--->:',answers, answers.length);
    if(answers.length === 0){
      return categories.map(category => {
        return {
          ...category,
          progress: 0,
          sessionId: null,
          answeredCount: 0,
          totalQuestions: 0,
          isNew: true,
          isYourTurn: false
        };
      })
    }
    
    // 按会话ID分组回答
    const answersBySession = {};
    (answers || []).forEach(answer => {
      const sessionId = answer.session_id;
      if (!answersBySession[sessionId]) {
        answersBySession[sessionId] = [];
      }
      answersBySession[sessionId].push(answer);
    });
    
    // 计算每个分类的问题总数
    const questionCountByCategory = {};
    const questionCounts = await this.ctx.model.Question.findAll({
      attributes: ['category_id', [this.app.Sequelize.fn('COUNT', this.app.Sequelize.col('id')), 'count']],
      where: { status: 1 },
      group: ['category_id']
    });
    
    questionCounts.forEach(item => {
      questionCountByCategory[item.category_id] = parseInt(item.get('count'));
    });
    
    // 为每个分类添加用户进度
    return categories.map(category => {
      const categorySessions = sessionsByCategory[category.id] || [];
      const latestSession = categorySessions.length > 0 ? 
        categorySessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0] : null;
      
      const totalQuestions = questionCountByCategory[category.id] || 0;
      let answeredCount = 0;
      let progress = 0;
      
      if (latestSession) {
        const sessionAnswers = answersBySession[latestSession.id] || [];
        answeredCount = sessionAnswers.length;
        progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
      }
      
      // 添加用户特定信息
      return {
        ...category,
        progress,
        sessionId: latestSession ? latestSession.id : null,
        answeredCount,
        totalQuestions,
        isNew: this.isNewCategory(category),
        isYourTurn: this.isYourTurn(category, userId, latestSession)
      };
    });
  }
  
  /**
   * 判断分类是否为新内容
   * @param {Object} category - 分类对象
   * @return {boolean} 是否为新内容
   */
  isNewCategory(category) {
    // 判断逻辑：如果分类是最近7天添加的，则标记为新
    const createdAt = new Date(category.created_at);
    const now = new Date();
    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }
  
  /**
   * 判断是否轮到用户回答
   * @param {Object} category - 分类对象
   * @param {number} userId - 用户ID
   * @param {Object} latestSession - 最新会话
   * @return {boolean} 是否轮到用户回答
   */
  isYourTurn(category, userId, latestSession) {
    if (!latestSession) return false;
    
    // 获取伴侣ID
    const partnerId = latestSession.creator_id === userId ? 
      latestSession.partner_id : latestSession.creator_id;
    
    // 如果没有伴侣，则总是轮到用户
    if (!partnerId) return true;
    
    // 获取最后一个回答的用户
    // 这里需要额外查询，实际实现可能需要优化
    return this.ctx.model.QuestionAnswer.findOne({
      where: { session_id: latestSession.id },
      order: [['created_at', 'DESC']]
    }).then(lastAnswer => {
      // 如果没有回答，或者最后回答的是伴侣，则轮到用户
      return !lastAnswer || lastAnswer.user_id !== userId;
    });
  }

  /**
   * 获取分类详情
   * @param {number|string} categoryId - 分类ID或类型
   * @param {number} userId - 用户ID，可选
   * @return {Object} 分类详情
   */
  async getDetail(categoryId, userId) {
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    
    // 查询分类详情 - 同时支持通过ID或type查询
    let category = await ctx.model.QuestionCategory.findOne({
      where: {
        [Op.or]: [
          { id: categoryId },
          { type: categoryId }
        ],
        status: 1
      },
      attributes: ['id', 'name', 'description', 'icon',  'type',]
    });
    
    if (!category) {
      return null;
    }
    
    // 转换为普通对象
    category = category.get({ plain: true });
    
    // 如果有用户ID，添加用户特定信息
    if (userId) {
      // 获取用户在该分类下的会话
      const session = await ctx.model.QuestionSession.findOne({
        where: {
          category_id: category.id,
          [Op.or]: [
            { creator_id: userId },
            { partner_id: userId }
          ],
          status: { [Op.ne]: 0 } // 非删除状态
        },
        order: [['updated_at', 'DESC']]
      });
      
      if (session) {
        // 计算进度信息
        const progressInfo = await this.calculateProgress(category.id, session.id, userId);
        Object.assign(category, progressInfo);
      } else {
        // 没有会话，设置默认值
        category.sessionId = null;
        category.progress = 0;
        category.answeredCount = 0;
        category.totalQuestions = await ctx.model.Question.count({
          where: { 
            category_id: category.id,
            status: 1
          }
        });
        category.isYourTurn = false;
      }
      
      // 判断是否为新内容
      category.isNew = this.isNewCategory(category);
    }
    
    return category;
  }

  /**
   * 计算用户在分类下的进度
   * @private
   */
  async calculateProgress(categoryId, sessionId, userId) {
    const { ctx } = this;
    
    // 获取该分类下的问题总数
    const totalQuestions = await ctx.model.Question.count({
      where: { 
        category_id: categoryId,
        status: 1
      }
    });
    
    // 获取用户已回答的问题数
    const answeredQuestions = await ctx.model.QuestionAnswer.count({
      where: { 
        session_id: sessionId,
        user_id: userId
      }
    });
    
    // 计算进度
    const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    
    // 判断是否轮到用户回答
    const lastAnswer = await ctx.model.QuestionAnswer.findOne({
      where: { session_id: sessionId },
      order: [['created_at', 'DESC']]
    });
    
    return {
      sessionId,
      progress,
      answeredCount: answeredQuestions,
      totalQuestions,
      isYourTurn: !lastAnswer || lastAnswer.user_id !== userId
    };
  }
}

module.exports = QuestionCategoryService;