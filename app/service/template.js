'use strict';

const Service = require('egg').Service;

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
    
    // 根据分类ID返回预设的话题数据
    const topicsMap = {
      // 入门话题
      'starters': [
        {
          id: 'starter-q1',
          code: 'daily-life',
          title: '日常生活',
          type: '你是否曾经',
          index: 0,
          bgClass: 'bg-pink',
          icon: '👀',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'starter-q2',
          code: 'intimate-life',
          title: '我们的亲密生活',
          type: '深度对话',
          index: 1,
          bgClass: 'bg-pink',
          icon: '💋',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'starter-q3',
          code: 'couple-life',
          title: '情侣生活',
          type: '谁更可能',
          index: 2,
          bgClass: 'bg-orange',
          icon: '❤️',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'starter-q4',
          code: 'dream-home',
          title: '我们的梦想家园',
          type: '二选一',
          index: 3,
          bgClass: 'bg-green',
          icon: '🏠',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'starter-q5',
          code: 'love-balance',
          title: '爱的平衡',
          type: '你会选择',
          index: 4,
          bgClass: 'bg-green',
          icon: '⚖️',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'rec-starter-1',
          code: 'date-plan',
          title: '约会计划',
          type: '你会选择',
          index: 5,
          bgClass: 'bg-purple',
          icon: '🍸',
          recommended: true,
          version: '1.0'
        }
      ],
      
      // 关系话题
      'relationship': [
        {
          id: 'relationship-q1',
          code: 'expectations',
          title: '关系中的期望与现实',
          type: '深度对话',
          index: 0,
          bgClass: 'bg-pink',
          icon: '💑',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'relationship-q2',
          code: 'roles',
          title: '关系中的角色',
          type: '谁更可能',
          index: 1,
          bgClass: 'bg-blue',
          icon: '👫',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'relationship-q3',
          code: 'conflict',
          title: '解决冲突的方式',
          type: '你会选择',
          index: 2,
          bgClass: 'bg-purple',
          icon: '🤝',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'rec-relationship-1',
          code: 'priorities',
          title: '关系中的优先级',
          type: '二选一',
          index: 3,
          bgClass: 'bg-yellow',
          icon: '⚖️',
          recommended: true,
          version: '1.0'
        }
      ],
      
      // 性爱话题
      'sex-love': [
        {
          id: 'sex-love-q1',
          code: 'intimacy-expectations',
          title: '亲密关系中的期望',
          type: '深度对话',
          index: 0,
          bgClass: 'bg-pink',
          icon: '💋',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'sex-love-q2',
          code: 'romance',
          title: '浪漫表达方式',
          type: '你会选择',
          index: 1,
          bgClass: 'bg-purple',
          icon: '💘',
          recommended: false,
          version: '1.0'
        },
        {
          id: 'rec-sex-love-1',
          code: 'intimate-behavior',
          title: '亲密行为',
          type: '谁更可能',
          index: 2,
          bgClass: 'bg-blue',
          icon: '🔥',
          recommended: true,
          version: '1.0'
        }
      ]
    };
    
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
        // 同步失败时，仍返回预设数据
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
    console.log('⛄️=====》')
    
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
    console.log('999---1：', topic)
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
    } catch(_) {

    }
    }
    console.log('jjjjs==> 找到了')
    // 如果数据库中有数据，直接返回
    if (dbQuestions && dbQuestions.length > 0) {
      console.log('jjjjs==> 找到了')
      return dbQuestions.map(question => question.get({ plain: true }));
    }
    
    // 根据话题ID返回预设的问题数据
    const questionsMap = {
      // 入门话题 - 你是否曾经（日常生活）
      'daily-life': [
        {
          id: 'starter-q1-1',
          text: '你是否曾经因为工作或学习而忽略了我们的关系？',
          type: 'yesno',
          version: '1.0'
        },
        {
          id: 'starter-q1-2',
          text: '你是否曾经因为我的一个小习惯而感到烦恼？',
          type: 'yesno',
          version: '1.0'
        },
        {
          id: 'starter-q1-3',
          text: '你是否曾经在我不知情的情况下，为我做了一件暖心的事？',
          type: 'yesno',
          version: '1.0'
        }
      ],
      
      // 入门话题 - 深度对话（我们的亲密生活）
      'intimate-life': [
        {
          id: 'starter-q2-1',
          text: '你最喜欢我们之间的哪个共同点？',
          code: 'starter-q2-1',
          type: 'text',
          version: '1.0'
        },
        {
          id: 'starter-q2-2',
          code: 'starter-q2-2',
          text: '你认为我们之间最大的不同是什么？',
          type: 'text',
          version: '1.0'
        },
        {
          id: 'starter-q2-3',
          code: 'starter-q2-3',
          text: '你觉得我们的关系中最需要改进的是什么？',
          type: 'text',
          version: '1.0'
        }
      ],
      
      // 入门话题 - 谁更可能（情侣生活）
      'couple-life': [
        {
          id: 'starter-q3-1',
          text: '谁更可能在早上赖床？',
          type: 'who',
          version: '1.0'
        },
        {
          id: 'starter-q3-2',
          text: '谁更可能在争吵后先道歉？',
          type: 'who',
          version: '1.0'
        },
        {
          id: 'starter-q3-3',
          text: '谁更可能记得重要的日期和纪念日？',
          type: 'who',
          version: '1.0'
        },
        {
          id: 'starter-q3-4',
          text: '谁更可能在关系中更有耐心？',
          type: 'who',
          version: '1.0'
        }
      ],
      // 入门话题 - 二选一（我们的梦想家园）
      'dream-home': [
        {
          id: 'starter-q4-1',
          text: '你更喜欢哪一个？',
          type: 'thisorthat',
          option1: '城市生活',
          option2: '乡村生活',
          version: '1.0'
        },
        {
          id: 'starter-q4-2',
          text: '你更喜欢哪一个？',
          type: 'thisorthat',
          option1: '现代简约风格',
          option2: '温馨复古风格',
          version: '1.0'
        },
        {
          id: 'starter-q4-3',
          text: '你更喜欢哪一个？',
          type: 'thisorthat',
          option1: '大房子，远离市中心',
          option2: '小公寓，靠近市中心',
          version: '1.0'
        }
      ],
      // 入门话题 - 你会选择（约会计划）
      'date-plan': [
        {
          id: 'rec-starter-1-1',
          code: 'date-plan-1',
          text: '周末约会，你会选择？',
          type: 'choice',
          options: ['浪漫晚餐', '户外活动', '宅在家看电影'],
          version: '1.0'
        },
        {
          id: 'rec-starter-1-2',
          code: 'date-plan-2',
          text: '特别的纪念日，你会选择？',
          type: 'choice',
          options: ['精心准备惊喜', '一起计划活动', '简单但有意义的庆祝'],
          version: '1.0'
        }
      ],
      // 性爱话题 - 深度对话（亲密关系中的期望）
      'intimacy-expectations': [
        {
          id: 'sex-love-q1-1',
          code: 'intimacy-exp-1',
          text: '你对我们亲密关系的满意度如何？',
          type: 'text',
          version: '1.0'
        },
        {
          id: 'sex-love-q1-2',
          code: 'intimacy-exp-2',
          text: '你希望我们如何增进亲密关系？',
          type: 'text',
          version: '1.0'
        }
      ],
      // 性爱话题 - 你会选择（浪漫表达方式）
      'romance': [
        {
          id: 'sex-love-q2-1',
          code: 'romance-1',
          text: '表达爱意时，你更喜欢？',
          type: 'choice',
          options: ['言语表达', '行动表达', '礼物表达'],
          version: '1.0'
        },
        {
          id: 'sex-love-q2-2',
          code: 'romance-2',
          text: '你更喜欢哪种浪漫方式？',
          type: 'choice',
          options: ['惊喜', '计划好的约会', '日常的小浪漫'],
          version: '1.0'
        }
      ],
      // 关系话题 - 二选一（关系中的优先级）
      // 入门话题 - 爱的平衡（你会选择）
      'love-balance': [
        {
          id: 'rec-relationship-1-1',
          code: 'priorities-1',
          text: '你更看重哪一个？',
          type: 'thisorthat',
          option1: '个人成长',
          option2: '关系稳定',
          version: '1.0'
        },
        {
          id: 'rec-relationship-1-2',
          code: 'priorities-2',
          text: '你更看重哪一个？',
          type: 'thisorthat',
          option1: '激情',
          option2: '安全感',
          version: '1.0'
        }
      ],
      // 性爱话题 - 谁更可能（亲密行为）
      'roles': [
        {
          id: 'rec-sex-love-1-1',
          code: 'intimate-behavior-1',
          text: '谁更可能主动表达亲密需求？',
          type: 'who',
          version: '1.0'
        },
        {
          id: 'rec-sex-love-1-2',
          code: 'intimate-behavior-2',
          text: '谁更可能尝试新的亲密方式？',
          type: 'who',
          version: '1.0'
        }
      ]
    };
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
      // 1. 初始化分类
      const categories = [
        {
          code: 'starters',
          name: '入门话题',
          description: '开始了解彼此的基础话题',
          icon: '💜',
          status: 1,
          version: '1.0'
        },
        {
          code: 'relationship',
          name: '关系',
          description: '探索你们关系中的各个方面',
          icon: '💕',
          status: 1,
          version: '1.0'
        },
        {
          code: 'sex-love',
          name: '性与爱',
          description: '探讨亲密关系中的期望与感受',
          icon: '🔞',
          status: 1,
          version: '1.0'
        },
        {
          code: 'moral-values',
          name: '道德与价值观',
          description: '了解彼此的价值观和道德准则',
          icon: '🤝',
          status: 1,
          version: '1.0'
        },
        {
          code: 'money-finances',
          name: '金钱与财务',
          description: '讨论金钱观念和财务规划',
          icon: '💵',
          status: 1,
          version: '1.0'
        }
      ];
      
      // 插入分类数据
      for (const category of categories) {
        // 检查是否已存在
        const existingCategory = await ctx.model.QuestionCategory.findOne({
          where: { code: category.code }
        });
        
        if (!existingCategory) {
          await ctx.model.QuestionCategory.create(category);
        }
      }
      
      // 2. 获取所有分类
      const dbCategories = await ctx.model.QuestionCategory.findAll();
      const categoryMap = new Map();
      dbCategories.forEach(category => {
        categoryMap.set(category.code, category.id);
      });
      
      // 3. 初始化话题
      // const topicsMap = {
      //   'starters': [
      //     {
      //       code: 'daily-life',
      //       title: '日常生活',
      //       type: '你是否曾经',
      //       icon: '👀',
      //       bgClass: 'bg-pink',
      //       recommended: false,
      //       status: 1,
      //       version: '1.0'
      //     },
      //     // ... 其他话题 ...
      //   ],
      //   // ... 其他分类的话题 ...
      // };
      
      // 插入话题数据
      // for (const [categoryCode, topics] of Object.entries(topicsMap)) {
      //   const categoryId = categoryMap.get(categoryCode);
      //   if (!categoryId) continue;
        
      //   for (const topic of topics) {
      //     // 检查是否已存在
      //     const existingTopic = await ctx.model.QuestionTopic.findOne({
      //       where: { 
      //         category_id: categoryId,
      //         code: topic.code
      //       }
      //     });
          
      //     if (!existingTopic) {
      //       await ctx.model.QuestionTopic.create({
      //         ...topic,
      //         category_id: categoryId
      //       });
      //     }
      //   }
      // }
      
      // 4. 获取所有话题
      // const dbTopics = await ctx.model.QuestionTopic.findAll();
      // const topicMap = new Map();
      // dbTopics.forEach(topic => {
      //   topicMap.set(`${topic.category_id}-${topic.code}`, topic.id);
      // });
      
      // 5. 初始化问题
      // const questionsMap = {
      //   'daily-life': [
      //     {
      //       code: 'work-neglect',
      //       text: '你是否曾经因为工作或学习而忽略了我们的关系？',
      //       type: 'yesno',
      //       status: 1,
      //       version: '1.0'
      //     },
      //     // ... 其他问题 ...
      //   ],
      //   // ... 其他话题的问题 ...
      // };
      
      // 插入问题数据
      // for (const [topicCode, questions] of Object.entries(questionsMap)) {
      //   // 找到对应的话题
      //   const matchingTopic = dbTopics.find(t => t.code === topicCode);
      //   if (!matchingTopic) continue;
        
      //   for (const question of questions) {
      //     // 检查是否已存在
      //     const existingQuestion = await ctx.model.Question.findOne({
      //       where: { 
      //         topic_id: matchingTopic.id,
      //         code: question.code
      //       }
      //     });
          
      //     if (!existingQuestion) {
      //       await ctx.model.Question.create({
      //         ...question,
      //         topic_id: matchingTopic.id
      //       });
      //     }
      //   }
      // }
      
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