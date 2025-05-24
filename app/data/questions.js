const questionsMap = {
  // ========== 入门话题 ==========
  // 你是否曾经（日常生活）
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
    },
    {
      id: 'starter-q1-3',
      text: '是否在社交平台用小号给TA点赞？',
      type: 'yesno',
      version: '1.0'
    }
  ],
  // 深度对话（我们的亲密生活）
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
    },
    {
      id: 'starter-q2-4',
      code: 'starter-q2-4',
      text: '你觉得我们哪个生活细节让你觉得被深深理解？',
      type: 'text',
      version: '1.0'
    },
    {id:'starter-q2-5', text:'哪次争吵反而让你更了解我的内心？', type:'text', version:'1.0'},
    {id:'il5', text:'哪个生活细节让你觉得被深深理解？', type:'text', version:'1.0'},
    {id:'il6', text:'如果我们是电影角色，希望上演什么剧情？', type:'text', version:'1.0'},
    {id:'il7', text:'哪个瞬间让你想按下人生的暂停键？', type:'text', version:'1.0'},
    {id:'il8', text:'如果我们的爱情有颜色，现在是什么色调？', type:'text', version:'1.0'}
  ],
  // 谁更可能（情侣生活）
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
    },
    {id:'cl1', text:'谁更可能策划说走就走的旅行？', type:'who', version:'3.3'},
    {id:'cl2', text:'谁更擅长主动化解矛盾与尴尬？', type:'who', version:'3.3'},
  ],
  // 二选一（我们的梦想家园）
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
    },
    {id:'dh1', text:'家居风格更倾向？', type:'thisorthat', option1:'侘寂美学', option2:'孟菲斯设计', version:'3.3'},
    {id:'dh2', text:'智能家居必备？', type:'thisorthat', option1:'情绪感应灯光', option2:'语音交互管家', version:'3.3'},
    {id:'dh3', text:'厨房设计核心？', type:'thisorthat', option1:'开放式社交厨房', option2:'专业级料理空间', version:'3.3'},
    {id:'dh4', text:'阳台功能选择？', type:'thisorthat', option1:'空中花园', option2:'迷你健身房', version:'3.3'},
    {id:'dh5', text:'卧室氛围偏好？', type:'thisorthat', option1:'沉浸式助眠系统', option2:'多功能影音空间', version:'3.3'},
    {id:'dh6', text:'储物方案选择？', type:'thisorthat', option1:'极简隐藏式收纳', option2:'展示型记忆墙', version:'3.3'},
    {id:'dh7', text:'卫浴升级重点？', type:'thisorthat', option1:'温泉式泡澡系统', option2:'智能健康监测', version:'3.3'},
    {id:'dh8', text:'庭院设计倾向？', type:'thisorthat', option1:'可食花园', option2:'疗愈景观', version:'3.3'}
  ],
  // ========== 亲密关系 ==========
  // 深度对话（亲密关系中的期望）
  'intimacy-expectations': [
    {
      id: 'close-love-q1-1',
      code: 'intimacy-exp-1',
      text: '你对我们亲密关系的满意度如何？',
      type: 'text',
      version: '1.0'
    },
    {
      id: 'close-love-q1-2',
      code: 'intimacy-exp-2',
      text: '你希望我们如何增进亲密关系？',
      type: 'text',
      version: '1.0'
    },
    {id:'ib1', text:'谁更主动创造亲密暗号？', type:'who', version:'3.3'},
    {id:'ib2', text:'谁更注重氛围仪式感？', type:'who', version:'3.3'},
    {id:'ib3', text:'谁更愿意尝试新场景？', type:'who', version:'3.3'},
    {id:'ib5', text:'谁更可能策划主题之夜？', type:'who', version:'3.3'},
    {id:'ib6', text:'谁更关注舒适度细节？', type:'who', version:'3.3'},
  ],
  // 你会选择（浪漫表达方式）
  'romance': [
    {
      id: 'close-love-q2-1',
      code: 'romance-1',
      text: '表达爱意时，你更喜欢？',
      type: 'choice',
      options: ['言语表达', '行动表达', '礼物表达'],
      version: '1.0'
    },
    {
      id: 'close-love-q2-2',
      code: 'romance-2',
      text: '你更喜欢哪种浪漫方式？',
      type: 'choice',
      options: ['惊喜', '计划好的约会', '日常的小浪漫'],
      version: '1.0'
    },
    {id:'rm2', text:'道歉时哪种方式更有效？', type:'choice', options:['手写道歉信','复刻初遇场景','制作糗事合集','发明和解暗号'], version:'3.4'},
    {id:'rm3', text:'纪念日惊喜首选？', type:'choice', options:['时光胶囊开启','角色互换体验','关系年报发布','未来支票兑换'], version:'3.4'},
    {id:'rm4', text:'日常浪漫如何保鲜？', type:'choice', options:['早安谜语短信','口袋惊喜交换','微信状态密语','冰箱情书便签'], version:'3.4'},
    {id:'rm5', text:'压力缓解方式？', type:'choice', options:['双人冥想空间','情绪解压剧本杀','专属吐槽树洞','反向按摩挑战'], version:'3.4'},
    {id:'rm6', text:'吵架后破冰选择？', type:'choice', options:['错位时空信件','美食赎罪券','表情包大战','反向要求清单'], version:'3.4'},
    {id:'rm7', text:'情感升温秘籍？', type:'choice', options:['人生BGM交换','童年物品展','弱点交换仪式','梦想交叉授权'], version:'3.4'},
    {id:'rm8', text:'远程关怀方式？', type:'choice', options:['同步观影系统','空气拥抱装置','元宇宙约会','智能语音树洞'], version:'3.4'}
  ],
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
  'intimate-behavior': [
    {
      id: 'rec-close-love-1-1',
      code: 'intimate-behavior-1',
      text: '谁更可能主动表达亲密需求？',
      type: 'who',
      version: '1.0'
    },
    {
      id: 'rec-close-love-1-2',
      code: 'intimate-behavior-2',
      text: '谁更可能尝试新的亲密方式？',
      type: 'who',
      version: '1.0'
    }
  ],
  'emoji-game': [ // DEEP_CONVERSATION (text)
    {id:'eg1', text:'🎭 哪个时刻我们在扮演社会角色而非真实自我？', type:'text', version:'3.4'},
    {id:'eg2', text:'💎 我们的关系最像哪种宝石的生成过程？', type:'text', version:'3.4'},
    {id:'eg3', text:'📆 如果删除过去某天记忆，你选择哪一天？为什么？', type:'text', version:'3.4'},
    {id:'eg4', text:'🎵 哪段旋律能代表我们最近的相处状态？', type:'text', version:'3.4'},
    {id:'eg6', text:'🧩 哪块缺失的拼图能让我们的关系更完整？', type:'text', version:'3.4'},
    {id:'eg7', text:'🎬 如果拍摄我们的纪录片，片名会是什么？', type:'text', version:'3.4'},
    {id:'eg8', text:'🔮 五年后的我们会怎样回忆现在的这个瞬间？', type:'text', version:'3.4'}
  ],
  'activities': [ // THIS_OR_THAT (thisorthat)
    {id:'ac1', text:'周末活动更倾向？', type:'thisorthat', option1:'城市探索盲盒', option2:'宅家主题日', version:'3.4'},
    {id:'ac2', text:'学习新技能选择？', type:'thisorthat', option1:'双人冲浪课程', option2:'情侣料理竞技', version:'3.4'},
    {id:'ac3', text:'运动方式偏好？', type:'thisorthat', option1:'VR体感游戏', option2:'户外障碍挑战', version:'3.4'},
    {id:'ac4', text:'文化体验选择？', type:'thisorthat', option1:'沉浸式戏剧', option2:'古董市场寻宝', version:'3.4'},
    {id:'ac5', text:'社交活动倾向？', type:'thisorthat', option1:'情侣主题派对', option2:'独立兴趣小组', version:'3.4'},
    {id:'ac6', text:'放松方式选择？', type:'thisorthat', option1:'禅意手工坊', option2:'极限解压馆', version:'3.4'},
    {id:'ac8', text:'纪念仪式选择？', type:'thisorthat', option1:'时间胶囊封存', option2:'关系版本发布会', version:'3.4'}
  ],
  'holiday-habits': [ // WHOS_MORE_LIKELY (who)
    {id:'hh1', text:'谁更可能凌晨三点抢特价机票？', type:'who', version:'3.4'},
    {id:'hh2', text:'谁更擅长发现小众旅行目的地？', type:'who', version:'3.4'},
    {id:'hh4', text:'谁更坚持拍摄九宫格游客照？', type:'who', version:'3.4'},
    {id:'hh5', text:'谁更愿意尝试街边黑暗料理？', type:'who', version:'3.4'},
    {id:'hh6', text:'谁更可能发明行李箱收纳黑科技？', type:'who', version:'3.4'},
    {id:'hh7', text:'谁更擅长与民宿老板砍价？', type:'who', version:'3.4'},
    {id:'hh8', text:'谁更坚持记录旅行手账？', type:'who', version:'3.4'}
  ],
  'dream-wedding': [ // THIS_OR_THAT (thisorthat)
    {
      id: 'dw1',
      text: '婚礼场景更倾向？',
      type: 'thisorthat',
      option1: '水下全息婚礼舱',
      option2: '沙漠星空仪式场',
      version: '3.5'
    },
    {
      id: 'dw2',
      text: '婚礼服饰选择？',
      type: 'thisorthat',
      option1: '智能变色感应礼服',
      option2: '可种植生物面料嫁衣',
      version: '3.5'
    },
    {
      id: 'dw3',
      text: '仪式核心环节？',
      type: 'thisorthat',
      option1: '脑波誓言共鸣装置',
      option2: '传家宝熔铸对戒',
      version: '3.5'
    },
    {
      id: 'dw4',
      text: '宾客互动形式？',
      type: 'thisorthat',
      option1: '全息分身远程祝福',
      option2: '实体时间胶囊寄存',
      version: '3.5'
    },
    {
      id: 'dw5',
      text: '餐饮体验方向？',
      type: 'thisorthat',
      option1: '分子料理感官盛宴',
      option2: '童年味道复刻菜单',
      version: '3.5'
    },
    {
      id: 'dw6',
      text: '记忆留存方式？',
      type: 'thisorthat',
      option1: 'NFT爱情区块链',
      option2: '手工火漆信物库',
      version: '3.5'
    }],
     // ========== 道德与价值观 ==========
  'ethical-dilemmas': [
    {id:'ed1', text:'当个人利益与公共利益冲突时，你的决策原则是什么？', type:'text', version:'1.1'},
    {id:'ed2', text:'如何看待善意谎言与绝对诚实的关系？', type:'text', version:'1.1'},
    {id:'ed3', text:'如果发现好友的伴侣出轨，你会如何处理？', type:'text', version:'1.1'},
    {id:'ed4', text:'当法律与道德冲突时，你的选择倾向？', type:'text', version:'1.1'},
  ],

  'social-justice': [
    {id:'sj1', text:'更倾向？', type:'thisorthat', option1:'机会平等', option2:'结果平等', version:'1.1'},
    {id:'sj2', text:'优先选择？', type:'thisorthat', option1:'效率优先', option2:'公平优先', version:'1.1'},
    {id:'sj3', text:'更认同？', type:'thisorthat', option1:'个人奋斗', option2:'社会支持', version:'1.1'},
    {id:'sj4', text:'倾向于？', type:'thisorthat', option1:'市场竞争', option2:'政府调控', version:'1.1'},
    {id:'sj5', text:'更看重？', type:'thisorthat', option1:'个人自由', option2:'集体利益', version:'1.1'}
  ],

  'family-traditions': [
    {id:'ft1', text:'哪些传统是你希望延续到新家庭的？', type:'text', version:'1.1'},
    {id:'ft2', text:'如何看待节日礼金的文化意义？', type:'text', version:'1.1'},
    {id:'ft4', text:'如何平衡传统习俗与现代生活方式？', type:'text', version:'1.1'},
    {id:'ft5', text:'对"门当户对"观念的看法？', type:'text', version:'1.1'},
    {id:'ft6', text:'家族聚会频率的理想状态？', type:'text', version:'1.1'}
  ],

  // ========== 金钱与财务 ==========
  'spending-habits': [
    {id:'sh1', text:'更倾向？', type:'thisorthat', option1:'即时享受', option2:'延迟满足', version:'1.1'},
    {id:'sh2', text:'优先选择？', type:'thisorthat', option1:'品质优先', option2:'性价比优先', version:'1.1'},
    {id:'sh3', text:'消费决策更依赖？', type:'thisorthat', option1:'情感驱动', option2:'理性分析', version:'1.1'},
    {id:'sh4', text:'如何处理冲动消费？', type:'thisorthat', option1:'设立冷静期', option2:'预算硬约束', version:'1.1'},
    {id:'sh5', text:'更看重？', type:'thisorthat', option1:'体验消费', option2:'实物消费', version:'1.1'}
  ],

  'investment-philosophy': [
    {id:'ip1', text:'投资组合中风险资产的理想占比？', type:'text', version:'1.1'},
    {id:'ip2', text:'如何看待加密货币的投资价值？', type:'text', version:'1.1'},
    {id:'ip3', text:'长期投资与短期套利的平衡策略？', type:'text', version:'1.1'},
    {id:'ip4', text:'对杠杆投资的风险接受度？', type:'text', version:'1.1'},
    {id:'ip5', text:'如何定义投资成功的关键指标？', type:'text', version:'1.1'},
    {id:'ip6', text:'对ESG投资理念的认同程度？', type:'text', version:'1.1'}
  ],

  'financial-goals': [
    {id:'fg1', text:'更倾向？', type:'thisorthat', option1:'激进增长', option2:'稳健保值', version:'1.1'},
    {id:'fg2', text:'优先选择？', type:'thisorthat', option1:'房产投资', option2:'金融资产', version:'1.1'},
    {id:'fg3', text:'退休规划启动时间？', type:'thisorthat', option1:'30岁前', option2:'40岁后', version:'1.1'},
    {id:'fg4', text:'应急储备金应覆盖？', type:'thisorthat', option1:'3个月支出', option2:'6个月支出', version:'1.1'},
    {id:'fg5', text:'子女教育金筹备方式？', type:'thisorthat', option1:'专项储蓄', option2:'投资收益', version:'1.1'}
  ]
};

module.exports = questionsMap;
