'use strict';

const Service = require('egg').Service;
const questionsMap = require('../data/questions');
const topicsMap = require('../data/topics');
const categoriesMap = require('../data/categories');

class TemplateService extends Service {
  /**
   * 获取所有分类模板
   * @return {Array} 分类列表
   */
  async getCategories() {
    const { ctx } = this;
    
    // 先从数据库获取分类
    const dbCategories = await ctx.model.QuestionCategory.findAll({
      where: { status: 1 },
    });
    
    // 如果数据库中有数据，直接返回
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map(category => category.get({ plain: true }));
    } return[]
  }
  
  /**
   * 获取分类下的话题模板
   * @param {string|number} categoryId - 分类ID
   * @return {Array} 话题列表
   */
  async getTopicsByCategoryId(categoryId) {
    console.log('enter----', categoryId)
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    
    // 先查询分类
    const category = await ctx.model.QuestionCategory.findOne({
      where: {
        [Op.or]: [
          { id: categoryId },
        ],
        status: 1
      }
    });
    
    const categoryCode = category ? category.code : categoryId;
    const categoryDbId = category ? category.id : null;
    console.log('category--->', categoryCode, categoryDbId,ctx.model.QuestionTopic)
    
    // 从数据库获取话题
    if (categoryDbId) {
      const dbTopics = await ctx.model.QuestionTopic.findAll({
        where: { 
          category_id: categoryDbId,
          status: 1
        },
      });
      
      // 如果数据库中有数据，直接返回
      if (dbTopics && dbTopics.length > 0) {
        return dbTopics.map(topic => {
          const plainTopic = topic.get({ plain: true });
          // 确保有bgClass和icon
          return {
            ...plainTopic,
            bgClass: plainTopic.bgClass || this.getTopicBgClass(plainTopic.type),
            icon: plainTopic.icon || '💬'
          };
        });
      }
    }
    
    // 获取预设话题数据
    let predefinedTopics = topicsMap[categoryCode] || [
      {
        id: 'default-q1',
        code: 'about-us',
        title: '关于我们的对话',
        type: '深度对话',
        index: 0,
        bgClass: 'bg-pink',
        icon: '💬',
        recommended: false,
        version: '1.0'
      },
      // ... 其他默认话题 ...
    ];
    
    // 如果有分类ID，将预设数据同步到数据库
    if (categoryDbId) {
      try {
        // 批量创建话题记录
        const topicsToCreate = [];
        
        for (const topic of predefinedTopics) {
          // 检查话题是否已存在
          const existingTopic = await ctx.model.QuestionTopic.findOne({
            where: { 
              category_id: categoryDbId,
              code: topic.code
            }
          });
          
          if (!existingTopic) {
            // 准备创建新话题
            topicsToCreate.push({
              code: topic.code,
              title: topic.title,
              type: topic.type,
              icon: topic.icon,
              bgClass: topic.bgClass,
              recommended: topic.recommended || false,
              status: 1,
              category_id: categoryDbId,
              version: topic.version || '1.0'
            });
          }
        }
        
        // 批量创建话题
        if (topicsToCreate.length > 0) {
          await ctx.model.QuestionTopic.bulkCreate(topicsToCreate);
          
          // 重新从数据库获取话题
          const newDbTopics = await ctx.model.QuestionTopic.findAll({
            where: { 
              category_id: categoryDbId,
              status: 1
            },
          });
          
          if (newDbTopics && newDbTopics.length > 0) {
            return newDbTopics.map(topic => {
              const plainTopic = topic.get({ plain: true });
              return {
                ...plainTopic,
                bgClass: plainTopic.bgClass || this.getTopicBgClass(plainTopic.type),
                icon: plainTopic.icon || '💬'
              };
            });
          }
        }
      } catch (error) {
        ctx.logger.error('同步话题数据到数据库失败:', error);
      }
    }
    // 返回预设数据
    return predefinedTopics;
  }
  
  /**
   * 获取话题下的问题模板
   * @param {string|number} topicId - 话题ID
   * @return {Array} 问题列表
   */
  async getQuestionsByTopicId(topicId) {
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    // 先查询话题
    const topic = await ctx.model.QuestionTopic.findOne({
      where: {
        [Op.or]: [
          { id: topicId },
          { code: topicId }
        ],
        status: 1
      }
    });
    const topicDbId = topic ? topic.id : null;
    const topicCode = topic ? topic.code : topicId;
    
    // 从数据库获取问题
    let dbQuestions;
    if (topicDbId) {
      try {
      dbQuestions = await ctx.model.Question.findAll({
        where: { 
          topic_id: topicDbId,
          status: 1
        },
      });
    } catch(_) {}
    }
    console.log('jjjjs==> 找到了')
    // 如果数据库中有数据，直接返回
    if (dbQuestions && dbQuestions.length > 0) {
      console.log('jjjjs==> 找到了')
      return dbQuestions.map(question => question.get({ plain: true }));
    }
    // 根据话题ID返回预设的问题数据
    console.log('topicCode---',topicCode, topicDbId, questionsMap[topicCode])
    // 如果找不到对应的话题，返回默认问题
   let predefinedQuestions = questionsMap[topicCode];
   // 如果有话题ID，将预设数据同步到数据库
   if (topicDbId) {
    try {
      // 批量创建问题记录
      const questionsToCreate = [];
      
      for (const question of predefinedQuestions) {
        console.log('111---', question)

        // 检查问题是否已存在
        // const existingQuestion = await ctx.model.Question.findOne({
        //   where: { 
        //     topic_id: topicDbId,
        //     code: question.code || `question-${question.id}`
        //   },
        //   include: [], // 明确指定不加载任何关联
        //   raw: true    // 使用原始查询
        // });
        // 修改查询方式，使用原始 SQL
        const existingQuestion = await ctx.model.query(
          'SELECT id FROM question WHERE topic_id = ? AND code = ? LIMIT 1',
          {
            type: ctx.model.QueryTypes.SELECT,
            replacements: [topicDbId, question.code || `question-${question.id}`]
          }
        );
        
        if (!existingQuestion || !existingQuestion.length) {
          // 准备创建新问题
          questionsToCreate.push({
            code: question.code,
            text: question.text,
            type: question.type,
            option1: question.option1,
            option2: question.option2,
            options: question.options ? JSON.stringify(question.options) : null,
            status: 1,
            topic_id: topicDbId,
            version: question.version || '1.0'
          });
        }
      }
      
      // 批量创建问题
      if (questionsToCreate.length > 0) {
        await ctx.model.Question.bulkCreate(questionsToCreate);
        
        // 重新从数据库获取问题
        // const newDbQuestions = await ctx.model.Question.findAll({
        //   where: { 
        //     topic_id: topicDbId,
        //     status: 1,
        //   },
        //   include: [], // 明确指定不加载任何关联
        //   raw: true    // 使用原始查询
        // });
        const newDbQuestions = await ctx.model.query(
          'SELECT * FROM question WHERE topic_id = ? AND status = 1',
          {
            type: ctx.model.QueryTypes.SELECT,
            replacements: [topicDbId]
          }
        );
        
        if (newDbQuestions && newDbQuestions.length > 0) {
          return newDbQuestions.map(question => {
            const plainQuestion = question.get({ plain: true });
            // 处理options字段，如果是JSON字符串则解析为对象
            if (plainQuestion.options && typeof plainQuestion.options === 'string') {
              try {
                plainQuestion.options = JSON.parse(plainQuestion.options);
              } catch (e) {
                // 解析失败时保持原样
              }
            }
            return plainQuestion;
          });
        }
      }
    } catch (error) {
      ctx.logger.error('同步问题数据到数据库失败:', error);
      // 同步失败时，仍返回预设数据
    }
  }
  
  // 返回预设数据
  return predefinedQuestions;
  }
  
  /**
   * 获取话题详情
   * @param {string|number} topicId - 话题ID
   * @return {Object} 话题详情
   */
  async getTopicById(topicId) {
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    
    // 先从数据库查询话题
    const topic = await ctx.model.QuestionTopic.findOne({
      where: {
        [Op.or]: [
          { id: topicId },
          { code: topicId }
        ],
        status: 1
      },
      include: [
        {
          model: ctx.model.QuestionCategory,
          as: 'category'
        }
      ]
    });
    
    // 如果数据库中有数据，直接返回
    if (topic) {
      const plainTopic = topic.get({ plain: true });
      return {
        ...plainTopic,
        categoryId: plainTopic.category_id,
        bgClass: plainTopic.bgClass || this.getTopicBgClass(plainTopic.type),
        icon: plainTopic.icon || '💬'
      };
    }
    
    // 获取所有分类
    const categories = await this.getCategories();
    
    // 遍历所有分类，查找话题
    for (const category of categories) {
      const topics = await this.getTopicsByCategoryId(category.id);
      const topic = topics.find(t => t.id === topicId || t.code === topicId);
      
      if (topic) {
        return {
          ...topic,
          categoryId: category.type
        };
      }
    }
    
    return null;
  }
  /**
   * 初始化模板数据
   * @return {boolean} 是否成功
   */
  async initTemplateData() {
    const { ctx } = this;
    
    try {
      // 插入分类数据
      for (const category of categoriesMap) {
        // 检查是否已存在
        const existingCategory = await ctx.model.QuestionCategory.findOne({
          where: { code: category.code }
        });
        
        if (!existingCategory) {
          await ctx.model.QuestionCategory.create(category);
        }
      }
      return true;
    } catch (error) {
      ctx.logger.error('初始化模板数据失败:', error);
      return false;
    }
  }
  
  /**
   * 获取话题背景类
   * @param {string} type - 话题类型
   * @return {string} 背景类名
   */
  getTopicBgClass(type) {
    const bgClassMap = {
      '你是否曾经': 'bg-pink',
      '深度对话': 'bg-blue',
      '谁更可能': 'bg-orange',
      '二选一': 'bg-green',
      '你会选择': 'bg-purple'
    };
    
    return bgClassMap[type] || 'bg-pink';
  }
  
  /**
   * 获取话题图标
   * @param {string} type - 话题类型
   * @return {string} 图标
   */
  getTopicIcon(type) {
    const iconMap = {
      '你是否曾经': '👀',
      '深度对话': '💬',
      '谁更可能': '👫',
      '二选一': '⚖️',
      '你会选择': '🔍'
    };
    
    return iconMap[type] || '💬';
  }
}

module.exports = TemplateService;