'use strict';
const {
  SELF_QUESTIONS,
  RELATIONSHIP_QUESTIONS,
  PARTENER_QUESTIONS,
  DIMENSIONS,
  createQuestionnaireTemplate,
} = require('../config/questionaire.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 获取问卷类型ID
    const types = await queryInterface.sequelize.query(
      'SELECT id, code FROM questionnaire_type;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const typeMap = types.reduce((map, type) => {
      map[type.code] = type.id;
      return map;
    }, {});
    // 先创建维度
    await queryInterface.bulkInsert('questionnaire_dimension', [
      {
        name: DIMENSIONS.COMMUNICATION_CONFLICT,
        description:
          '沟通是关系的基础，冲突解决能力直接决定矛盾是否升级（戈特曼研究所核心指标）',
        weight: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.TARGET_VALUE,
        description:
          '价值观差异是离婚主因之一（参考《中国离婚纠纷大数据报告》）',
        weight: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.TRUST_CONNECT,
        description:
          '信任缺失易导致猜忌，情感连接弱化预示关系疏离（依恋理论核心）',
        weight: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.POWER_BALANCE,
        description: '权力失衡易引发怨恨（社会交换理论），协作能力反映关系韧性',
        weight: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.CLOSE_NEED,
        description: '肢体亲密度、性生活满意度、情感表达方式匹配度',
        weight: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const dimensions = await queryInterface.sequelize.query(
      'SELECT * FROM questionnaire_dimension;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const selfQuestions = SELF_QUESTIONS.map((q) => ({
      dimension_id: dimensions.find((d) => {
        return d.name === q.dimension;
      })?.id,
      question_text: q.partner,
      question_type: q.type,
      options: q.options,
      order: 1,
    }));
    const partnerQuestions = PARTENER_QUESTIONS.map((q) => ({
      dimension_id: dimensions.find((d) => d.name === q.dimension)?.id,
      question_text: q.self,
      question_type: q.type,
      options: q.options,
      order: 1,
    }));
    const relationshipQuestions = RELATIONSHIP_QUESTIONS.map((q) => ({
      dimension_id: dimensions.find((d) => d.name === q.dimension)?.id,
      question_text: q.self,
      question_type: q.type,
      options: q.options,
      order: 1,
    }));
    // 使用模板生成器创建问卷
    const templates = [
      // 了解自己问卷
      createQuestionnaireTemplate('SELF_AWARENESS', selfQuestions),
      // 了解伴侣问卷
      createQuestionnaireTemplate('PARTNER_AWARENESS', partnerQuestions),
      // 了解共同
      createQuestionnaireTemplate( 'RELATIONSHIP_ASSESSMENT', relationshipQuestions),
      // 默契PK问卷
      // createQuestionnaireTemplate(
      //   'COUPLE_MATCH',
      //   QUESTIONS.map((q) => ({
      //     dimension_id: dimensions.find((d) => d.name === q.dimension)?.id,
      //     question_text: q.match,
      //     question_type: q.type,
      //     options: q.options,
      //     order: 1,
      //   }))
      // ),
    ];
    // 创建问卷模板
    for (const template of templates) {
      const questionnaire = await queryInterface.bulkInsert(
        'questionnaire_template',
        [
          {
            title: template.title,
            description: template.description,
            type_id: typeMap[template.type_code],
            status: template.status,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { returning: true }
      );

      // 创建问题
      const questionsForCurQuestionaire = template.questions.map((q) => ({
        ...q,
        questionnaire_id: questionnaire,
        created_at: new Date(),
        updated_at: new Date(),
      }));
      await queryInterface.bulkInsert('question_template', [
        ...questionsForCurQuestionaire,
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('question_template', null, {});
    await queryInterface.bulkDelete('questionnaire_template', null, {});
    await queryInterface.bulkDelete('questionnaire_dimension', null, {});
  },
};
