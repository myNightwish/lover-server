const { DIMENSIONS } = require('./base.js');

const RELATIONSHIP_QUESTIONS = [
  // 一、沟通与冲突解决（权重30%）
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    questionText: '当你们发生争吵时，通常能以理性对话而非人身攻击结束？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    questionText: '你会主动向伴侣表达自己的真实需求（包括负面情绪）？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    questionText: '你们会定期（如每周）进行深度交流，而不仅限于日常琐事？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    questionText: '伴侣在争吵中经常使用冷暴力（如拒绝沟通、长时间沉默）？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    questionText: '你们会共同复盘过去的冲突，并制定避免重复争执的策略？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.COMMUNICATION_CONFLICT,
    questionText: '请描述一次你们通过有效沟通化解危机的经历',
    type: 'text',
  },

  // 二、价值观与目标一致性（权重25%）
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    questionText: '你们对未来3-5年的生活规划（如定居城市、生育计划）高度一致？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    questionText: '在家庭开支和理财方式上，你们很少产生根本性分歧？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    questionText: '伴侣对原生家庭（如父母赡养、亲戚往来）的态度令你感到压力？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    questionText: '你们能尊重彼此的事业追求，即使需要短期牺牲家庭利益？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    questionText: '当发现价值观差异时，你们愿意通过协商达成妥协？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TARGET_VALUE,
    questionText: '请列举一个你们始终无法达成共识的核心矛盾',
    type: 'text',
  },

  // 三、信任与情感连接（权重20%）
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    questionText: '你可以毫无顾忌地向伴侣展示脆弱面（如失败、恐惧）？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    questionText: '你从不怀疑伴侣与其他异性的交往边界？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    questionText: '你们拥有共同的兴趣爱好或精神追求？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    questionText: '伴侣的某些行为（如隐瞒行踪）曾让你产生强烈不安？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    questionText: '在面临重大压力时，你们会优先向彼此寻求支持？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.TRUST_CONNECT,
    questionText: '用三个关键词描述你们的情感连接特质',
    type: 'text',
  },

  // 四、权力平衡与协作（权重15%）
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    questionText: '家务分工（如做饭、清洁）基本遵循公平原则？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    questionText: '家庭重大决策（如购房、投资）由双方共同商议决定？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    questionText: '你经常感到自己为关系付出更多却得不到认可？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    questionText: '当一方工作繁忙时，另一方会主动承担更多家庭责任？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    questionText: '你们能有效处理与彼此原生家庭的权力边界（如婆媳关系）？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.POWER_BALANCE,
    questionText: '请举例说明你们如何合作完成一个挑战',
    type: 'text',
  },

  // 五、亲密与性需求匹配（权重10%）
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    questionText: '你们经常通过肢体接触（如拥抱、牵手）表达情感？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    questionText: '当前的亲密生活频率和质量令双方满意？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    questionText: '伴侣拒绝亲密接触时，你会感到被伤害或怀疑关系？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: true, // 反向计分题
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    questionText: '你们能坦诚讨论对亲密行为的偏好与边界？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    questionText: '情感疏离期（如产后、工作压力）时，你们会主动重建亲密感？',
    type: 'scale',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    reverse: false,
  },
  {
    dimension: DIMENSIONS.CLOSE_NEED,
    questionText: '用比喻描述你们的关系（如"像战友""像港湾"）',
    type: 'text',
  },
];
module.exports = {
  RELATIONSHIP_QUESTIONS,
};
