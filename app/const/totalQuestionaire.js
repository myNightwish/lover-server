const { DIMENSIONS } = require('./base.js');
const { SELF_QUESTIONS } = require('./selftQuestions.js');
const { PARTENER_QUESTIONS } = require('./partenerQuestions.js');
const { RELATIONSHIP_QUESTIONS } = require('./relationQuestions.js');

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
  SELF_QUESTIONS,
  PARTENER_QUESTIONS,
  createQuestionnaireTemplate,
};
