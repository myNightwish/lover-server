'use strict';
const { options } = require('joi');
const { DIMENSIONS, QUESTIONS } = require('../config/questionaire.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 获取问卷类型ID
    const types = await queryInterface.sequelize.query(
      'SELECT id, code FROM questionnaire_type;', // 确保 SQL 语句以分号结尾
      { type: Sequelize.QueryTypes.SELECT }
    );

    const typeMap = types.reduce((map, type) => {
      map[type.code] = type.id;
      return map;
    }, {});

    // 创建默认问卷模板
    await queryInterface.bulkInsert('questionnaire_template', [
      {
        title: '了解自己',
        description: '探索内心，发现真实的自己',
        type_id: typeMap.self_awareness,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '了解Ta',
        description: '深入了解你的另一半',
        type_id: typeMap.partner_awareness,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '默契PK题',
        description: '测试你们的默契程度',
        type_id: typeMap.couple_match,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 查询创建的模板
    const templates = await queryInterface.sequelize.query(
      'SELECT * FROM questionnaire_template;', // 确保 SQL 语句以分号结尾
      { type: Sequelize.QueryTypes.SELECT }
    );

    const selfAwarenessTemplate = templates.find(
      (t) => t.type_id === typeMap.self_awareness
    );
    const partnerAwarenessTemplate = templates.find(
      (t) => t.type_id === typeMap.partner_awareness
    );
    const coupleMatchTemplate = templates.find(
      (t) => t.type_id === typeMap.couple_match
    );

    // 先创建维度
    await queryInterface.bulkInsert('questionnaire_dimension', [
      {
        name: DIMENSIONS.confilct,
        description:
          '沟通是关系的基础，冲突解决能力直接决定矛盾是否升级（戈特曼研究所核心指标）',
        weight: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.targetValue,
        description:
          '价值观差异是离婚主因之一（参考《中国离婚纠纷大数据报告》）',
        weight: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.trustConnect,
        description:
          '信任缺失易导致猜忌，情感连接弱化预示关系疏离（依恋理论核心）',
        weight: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.neigoWorkBalance,
        description: '权力失衡易引发怨恨（社会交换理论），协作能力反映关系韧性',
        weight: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: DIMENSIONS.closeNeed,
        description: '肢体亲密度、性生活满意度、情感表达方式匹配度',
        weight: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 查询创建的维度
    const dimensions = await queryInterface.sequelize.query(
      'SELECT * FROM questionnaire_dimension;', // 确保 SQL 语句以分号结尾
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 为每个问卷类型创建问题
    for (const question of QUESTIONS) {
      const dimension = dimensions.find((d) => d.name === question.dimension);
      if (!dimension) continue;

      // 了解自己的问题
      await queryInterface.bulkInsert('question_template', [
        {
          questionnaire_id: selfAwarenessTemplate.id,
          dimension_id: dimension.id,
          question_text: question.self,
          question_type: question.type,
          options: question.options,
          order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      // 了解Ta的问题
      await queryInterface.bulkInsert('question_template', [
        {
          questionnaire_id: partnerAwarenessTemplate.id,
          dimension_id: dimension.id,
          question_text: question.partner,
          question_type: question.type,
          order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      // 默契PK的问题
      await queryInterface.bulkInsert('question_template', [
        {
          questionnaire_id: coupleMatchTemplate.id,
          dimension_id: dimension.id,
          question_text: question.match,
          question_type: question.type,
          order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 清理数据
    await queryInterface.bulkDelete('question_template', null, {});
    await queryInterface.bulkDelete('questionnaire_template', null, {});
    await queryInterface.bulkDelete('questionnaire_dimension', null, {});
  },
};
