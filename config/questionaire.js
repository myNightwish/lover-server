const {
  DIMENSIONS,
  SELF_QUESTIONS,
  PARTENER_QUESTIONS,
} = require('./partener.js');

const RELATIONSHIP_QUESTIONS = [
  // 一、沟通与冲突解决（权重30%）
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    self: '当你们发生争吵时，通常能以理性对话而非人身攻击结束？',
    partner: '当你们发生争吵时，通常能以理性对话而非人身攻击结束？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    self: '你会主动向伴侣表达自己的真实需求（包括负面情绪）？',
    partner: '你会主动向伴侣表达自己的真实需求（包括负面情绪）？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    self: '你们会定期（如每周）进行深度交流，而不仅限于日常琐事？',
    partner: '你们会定期（如每周）进行深度交流，而不仅限于日常琐事？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    self: '伴侣在争吵中经常使用冷暴力（如拒绝沟通、长时间沉默）？',
    partner: '伴侣在争吵中经常使用冷暴力（如拒绝沟通、长时间沉默）？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    self: '你们会共同复盘过去的冲突，并制定避免重复争执的策略？',
    partner: '你们会共同复盘过去的冲突，并制定避免重复争执的策略？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    self: '请描述一次你们通过有效沟通化解危机的经历',
    partner: '请描述一次你们通过有效沟通化解危机的经历',
    match: '',
    type: 'text',
  },

  // 二、价值观与目标一致性（权重25%）
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    self: '你们对未来3-5年的生活规划（如定居城市、生育计划）高度一致？',
    partner: '你们对未来3-5年的生活规划（如定居城市、生育计划）高度一致？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    self: '在家庭开支和理财方式上，你们很少产生根本性分歧？',
    partner: '在家庭开支和理财方式上，你们很少产生根本性分歧？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    self: '伴侣对原生家庭（如父母赡养、亲戚往来）的态度令你感到压力？',
    partner: '伴侣对原生家庭（如父母赡养、亲戚往来）的态度令你感到压力？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    self: '你们能尊重彼此的事业追求，即使需要短期牺牲家庭利益？',
    partner: '你们能尊重彼此的事业追求，即使需要短期牺牲家庭利益？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    self: '当发现价值观差异时，你们愿意通过协商达成妥协？',
    partner: '当发现价值观差异时，你们愿意通过协商达成妥协？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    self: '请列举一个你们始终无法达成共识的核心矛盾',
    partner: '请列举一个你们始终无法达成共识的核心矛盾',
    match: '',
    type: 'text',
  },

  // 三、信任与情感连接（权重20%）
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    self: '你可以毫无顾忌地向伴侣展示脆弱面（如失败、恐惧）？',
    partner: '你可以毫无顾忌地向伴侣展示脆弱面（如失败、恐惧）？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    self: '你从不怀疑伴侣与其他异性的交往边界？',
    partner: '你从不怀疑伴侣与其他异性的交往边界？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    self: '你们拥有共同的兴趣爱好或精神追求？',
    partner: '你们拥有共同的兴趣爱好或精神追求？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    self: '伴侣的某些行为（如隐瞒行踪）曾让你产生强烈不安？',
    partner: '伴侣的某些行为（如隐瞒行踪）曾让你产生强烈不安？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    self: '在面临重大压力时，你们会优先向彼此寻求支持？',
    partner: '在面临重大压力时，你们会优先向彼此寻求支持？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    self: '用三个关键词描述你们的情感连接特质',
    partner: '用三个关键词描述你们的情感连接特质',
    match: '',
    type: 'text',
  },

  // 四、权力平衡与协作（权重15%）
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    self: '家务分工（如做饭、清洁）基本遵循公平原则？',
    partner: '家务分工（如做饭、清洁）基本遵循公平原则？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    self: '家庭重大决策（如购房、投资）由双方共同商议决定？',
    partner: '家庭重大决策（如购房、投资）由双方共同商议决定？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    self: '你经常感到自己为关系付出更多却得不到认可？',
    partner: '你经常感到自己为关系付出更多却得不到认可？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    self: '当一方工作繁忙时，另一方会主动承担更多家庭责任？',
    partner: '当一方工作繁忙时，另一方会主动承担更多家庭责任？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    self: '你们能有效处理与彼此原生家庭的权力边界（如婆媳关系）？',
    partner: '你们能有效处理与彼此原生家庭的权力边界（如婆媳关系）？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    self: '请举例说明你们如何合作完成一个挑战',
    partner: '请举例说明你们如何合作完成一个挑战',
    match: '',
    type: 'text',
  },

  // 五、亲密与性需求匹配（权重10%）
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    self: '你们经常通过肢体接触（如拥抱、牵手）表达情感？',
    partner: '你们经常通过肢体接触（如拥抱、牵手）表达情感？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    self: '当前的亲密生活频率和质量令双方满意？',
    partner: '当前的亲密生活频率和质量令双方满意？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    self: '伴侣拒绝亲密接触时，你会感到被伤害或怀疑关系？',
    partner: '伴侣拒绝亲密接触时，你会感到被伤害或怀疑关系？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    self: '你们能坦诚讨论对亲密行为的偏好与边界？',
    partner: '你们能坦诚讨论对亲密行为的偏好与边界？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    self: '情感疏离期（如产后、工作压力）时，你们会主动重建亲密感？',
    partner: '情感疏离期（如产后、工作压力）时，你们会主动重建亲密感？',
    match: '',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    self: '用比喻描述你们的关系（如"像战友""像港湾"）',
    partner: '用比喻描述你们的关系（如"像战友""像港湾"）',
    match: '',
    type: 'text',
  },
];
// 问卷类型定义
const QUESTIONNAIRE_TYPES = {
  // 了解自己
  SELF_AWARENESS: {
    code: 'self_awareness',
    name: '了解自己',
    description: '探索内心，发现真实的自己',
    needPartner: false,
    needSync: false,
    scoreType: 'dimension', // 按维度评分
    analysisType: 'self', // 个人分析
    status: 1,
  },

  // 了解伴侣
  PARTNER_AWARENESS: {
    code: 'partner_awareness',
    name: '了解Ta',
    description: '深入了解你的另一半',
    needPartner: true,
    needSync: false,
    scoreType: 'dimension',
    analysisType: 'partner',
    status: 1,
  },

  // 默契PK
  COUPLE_MATCH: {
    code: 'couple_match',
    name: '默契大考验',
    description: '测试你们的默契程度',
    needPartner: true,
    needSync: true,
    scoreType: 'match', // 匹配度评分
    analysisType: 'match',
    status: 1,
  },

  // 关系评估
  RELATIONSHIP_ASSESSMENT: {
    code: 'relationship_assessment',
    name: '关系体检',
    description: '全面评估你们的关系状况',
    needPartner: true,
    needSync: false,
    scoreType: 'dimension',
    analysisType: 'relationship',
    status: 1,
  },
};

// 问卷类型特性定义
// const TYPE_FEATURES = {
//   // 评分类型
//   SCORE_TYPES: {
//     dimension: '维度评分', // 按不同维度单独评分
//     match: '匹配度评分', // 计算双方答案匹配程度
//     scale: '量表评分', // 使用标准化量表评分
//   },

//   // 分析类型
//   ANALYSIS_TYPES: {
//     self: '个人分析',
//     partner: '伴侣分析',
//     match: '匹配度分析',
//     relationship: '关系分析',
//   },
// };

// 问卷模板生成器
const createQuestionnaireTemplate = (type, questions) => {
  const typeConfig = QUESTIONNAIRE_TYPES[type];
  if (!typeConfig) throw new Error(`Unknown questionnaire type: ${type}`);

  return {
    title: typeConfig.name,
    description: typeConfig.description,
    type_code: typeConfig.code,
    need_partner: typeConfig.needPartner,
    need_sync: typeConfig.needSync,
    analysis_type: typeConfig.analysisType,
    status: typeConfig.status,
    questions,
  };
};

module.exports = {
  DIMENSIONS,
  RELATIONSHIP_QUESTIONS,
  QUESTIONNAIRE_TYPES,
  SELF_QUESTIONS,
  PARTENER_QUESTIONS,
  createQuestionnaireTemplate,
};
