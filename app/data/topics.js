const topicsMap = {
  // 入门话题
  'starters': [
    {
      id: 'starter-q1',
      code: 'daily-life',
      title: '日常生活',
      type: 'NEVER_HAVE_EVER',
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
      type: 'DEEP_CONVERSATION',
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
      type: 'WHOS_MORE_LIKELY',
      index: 2,
      bgClass: 'bg-orange',
      icon: '❤️',
      recommended: false,
      version: '1.0'
    },
    {
      id: 'starter-q4',
      code: 'dream-home',
      title: '梦想家园',
      type: 'THIS_OR_THAT',
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
      type: 'WOULD_YOU_RATHER',
      index: 4,
      bgClass: 'bg-green',
      icon: '⚖️',
      recommended: false,
      version: '1.0'
    },
    {
      id: 'starter-q6',
      code: 'holiday-habits',
      title: '度假习惯',
      type: 'WHOS_MORE_LIKELY',
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
      id: 'close-love-q1',
      code: 'intimacy-expectations',
      title: '亲密关系中的期望',
      type: 'DEEP_CONVERSATION',
      index: 0,
      bgClass: 'bg-pink',
      icon: '💋',
      recommended: false,
      version: '1.0'
    },
    {
      id: 'close-love-q2',
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
      id: 'close-love-q3',
      code: 'intimate-behavior',
      title: '亲密行为',
      type: 'WHOS_MORE_LIKELY',
      index: 2,
      bgClass: 'bg-blue',
      icon: '🔥',
      recommended: true,
      version: '1.0'
    },
    {
      id: 'relationship-q1',
      code: 'dream-wedding',
      title: '梦想的婚礼',
      type: 'THIS_OR_THAT',
      index: 0,
      bgClass: 'bg-pink',
      icon: '💍',
      recommended: false,
      version: '1.0'
    },
    {
      id: 'relationship-q2',
      code: 'activities',
      title: '活动',
      type: 'THIS_OR_THAT',
      index: 3,
      bgClass: 'bg-pink',
      icon: '🏂',
      recommended: false,
      version: '1.0'
    },
    {
      id: 'relationship-q3',
      code: 'emoji-game',
      title: '表情游戏',
      type: 'DEEP_CONVERSATION',
      index: 4,
      bgClass: 'bg-pink',
      icon: '🎉',
      recommended: false,
      version: '1.0'
    }
  ],
  // 新增道德与价值观分类
  'moral-values': [
    {
      id: 'mv1',
      code: 'ethical-dilemmas',
      title: '伦理困境',
      type: 'DEEP_CONVERSATION',
      index: 0,
      bgClass: 'bg-purple',
      icon: '⚖️',
      recommended: true,
      version: '1.1'
    },
    {
      id: 'mv2',
      code: 'social-justice',
      title: '社会正义',
      type: 'THIS_OR_THAT',
      index: 1,
      bgClass: 'bg-blue',
      icon: '🌍',
      recommended: false,
      version: '1.1'
    },
    {
      id: 'mv3',
      code: 'family-traditions',
      title: '家庭传统',
      type: 'DEEP_CONVERSATION',
      index: 2,
      bgClass: 'bg-orange',
      icon: '👨👩👧',
      recommended: true,
      version: '1.1'
    }
  ],
  // 新增金钱与财务分类
  'money-finances': [
    {
      id: 'mf1',
      code: 'spending-habits',
      title: '消费习惯',
      type: 'THIS_OR_THAT',
      index: 0,
      bgClass: 'bg-green',
      icon: '💳',
      recommended: true,
      version: '1.1'
    },
    {
      id: 'mf2',
      code: 'investment-philosophy',
      title: '投资理念',
      type: 'DEEP_CONVERSATION',
      index: 1,
      bgClass: 'bg-gold',
      icon: '📈',
      recommended: false,
      version: '1.1'
    },
    {
      id: 'mf3',
      code: 'financial-goals',
      title: '财务规划',
      type: 'WOULD_YOU_RATHER',
      index: 2,
      bgClass: 'bg-silver',
      icon: '🎯',
      recommended: true,
      version: '1.1'
    }
  ]
};

module.exports = topicsMap;