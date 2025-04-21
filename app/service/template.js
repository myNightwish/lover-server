'use strict';

const Service = require('egg').Service;

class TemplateService extends Service {
  /**
   * 获取所有分类模板
   * @return {Array} 分类列表
   */
  async getCategories() {
    // 预设的分类数据
    return [
      {
        id: 'starters',
        code: 'starters',
        name: '入门话题',
        description: '开始了解彼此的基础话题',
        icon: '💜',
        version: '1.0'
      },
      {
        id: 'relationship',
        code: 'relationship',
        name: '关系',
        description: '探索你们关系中的各个方面',
        icon: '💕',
        version: '1.0'
      },
      {
        id: 'sex-love',
        code: 'sex-love',
        name: '性与爱',
        description: '探讨亲密关系中的期望与感受',
        icon: '🔞',
        version: '1.0'
      },
      {
        id: 'moral-values',
        code: 'moral-values',
        name: '道德与价值观',
        description: '了解彼此的价值观和道德准则',
        icon: '🤝',
        version: '1.0'
      },
      {
        id: 'money-finances',
        code: 'money-finances',
        name: '金钱与财务',
        description: '讨论金钱观念和财务规划',
        icon: '💵',
        version: '1.0'
      }
    ];
  }
  
  /**
   * 获取分类下的话题模板
   * @param {string|number} categoryId - 分类ID
   * @return {Array} 话题列表
   */
  async getTopicsByCategoryId(categoryId) {
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
    
    // 如果找不到对应的分类，返回默认话题
    return topicsMap[categoryId] || [
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
      {
        id: 'default-q2',
        code: 'know-each-other',
        title: '了解彼此',
        type: '谁更可能',
        index: 1,
        bgClass: 'bg-blue',
        icon: '👀',
        recommended: false,
        version: '1.0'
      },
      {
        id: 'rec-default-1',
        code: 'future-plans',
        title: '未来规划',
        type: '你会选择',
        index: 2,
        bgClass: 'bg-purple',
        icon: '🔮',
        recommended: true,
        version: '1.0'
      }
    ];
  }
  
  /**
   * 获取话题下的问题模板
   * @param {string|number} topicId - 话题ID
   * @return {Array} 问题列表
   */
  async getQuestionsByTopicId(topicId) {
    // 根据话题ID返回预设的问题数据
    const questionsMap = {
      // 入门话题 - 你是否曾经（日常生活）
      'starter-q1': [
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
      'starter-q2': [
        {
          id: 'starter-q2-1',
          text: '你最喜欢我们之间的哪个共同点？',
          type: 'text',
          version: '1.0'
        },
        {
          id: 'starter-q2-2',
          text: '你认为我们之间最大的不同是什么？',
          type: 'text',
          version: '1.0'
        },
        {
          id: 'starter-q2-3',
          text: '你觉得我们的关系中最需要改进的是什么？',
          type: 'text',
          version: '1.0'
        }
      ],
      
      // 入门话题 - 谁更可能（情侣生活）
      'starter-q3': [
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
      'starter-q4': [
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
      
      // 其他话题的问题...
    };
    
    // 如果找不到对应的话题，返回默认问题
    return questionsMap[topicId] || [
      {
        id: 'default-q1-1',
        text: '你认为一段健康的关系最重要的是什么？',
        type: 'text',
        version: '1.0'
      },
      {
        id: 'default-q1-2',
        text: '你希望我们的关系在未来如何发展？',
        type: 'text',
        version: '1.0'
      },
      {
        id: 'default-q1-3',
        text: '你最欣赏我的哪一点？',
        type: 'text',
        version: '1.0'
      }
    ];
  }
  
  /**
   * 获取话题详情
   * @param {string|number} topicId - 话题ID
   * @return {Object} 话题详情
   */
  async getTopicById(topicId) {
    // 获取所有分类
    const categories = await this.getCategories();
    
    // 遍历所有分类，查找话题
    for (const category of categories) {
      const topics = await this.getTopicsByCategoryId(category.id);
      const topic = topics.find(t => t.id === topicId);
      
      if (topic) {
        return {
          ...topic,
          categoryId: category.id
        };
      }
    }
    
    return null;
  }
  
  /**
   * 获取问题详情
   * @param {string|number} questionId - 问题ID
   * @return {Object} 问题详情
   */
  async getQuestionById(questionId) {
    // 获取所有分类
    const categories = await this.getCategories();
    
    // 遍历所有分类和话题，查找问题
    for (const category of categories) {
      const topics = await this.getTopicsByCategoryId(category.id);
      
      for (const topic of topics) {
        const questions = await this.getQuestionsByTopicId(topic.id);
        const question = questions.find(q => q.id === questionId);
        
        if (question) {
          return {
            ...question,
            topicId: topic.id,
            categoryId: category.id
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * 初始化模板数据
   * @return {boolean} 是否成功
   */
  async initTemplateData() {
    // 这个方法可以用来将预设数据导入数据库
    // 如果需要的话，可以在这里实现
    return true;
  }
}

module.exports = TemplateService;