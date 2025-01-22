'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 获取问卷类型ID
    const types = await queryInterface.sequelize.query(
      'SELECT id, code FROM questionnaire_type',
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
        title: '了解伴侣',
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
      'SELECT * FROM questionnaire_template',
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
        name: '性格特征',
        description: '个性、行为方式等特征',
        weight: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '生活习惯',
        description: '日常生活中的习惯和偏好',
        weight: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '价值观',
        description: '人生观、价值取向等',
        weight: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '兴趣爱好',
        description: '个人兴趣和娱乐偏好',
        weight: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 查询创建的维度
    const dimensions = await queryInterface.sequelize.query(
      'SELECT * FROM questionnaire_dimension',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 问题模板数据
    const questions = [
      {
        dimension: '性格特征',
        self: '你认为自己是一个什么样性格的人？',
        partner: '你认为伴侣是一个什么样性格的人？',
        match: '用一个词形容对方的性格特点',
        type: 'text',
      },
      {
        dimension: '生活习惯',
        self: '你最喜欢的食物是什么？',
        partner: '伴侣最喜欢的食物是什么？',
        match: '说出对方最喜欢的一道菜',
        type: 'text',
      },
      {
        dimension: '价值观',
        self: '你对未来生活的规划是什么？',
        partner: '你了解伴侣对未来的规划吗？',
        match: '说出对方最想实现的一个目标',
        type: 'text',
      },
      {
        dimension: '兴趣爱好',
        self: '你平时最喜欢的休闲活动是什么？',
        partner: '伴侣平时最喜欢的休闲活动是什么？',
        match: '说出对方最喜欢的一项运动',
        type: 'text',
      },
    ];

    // 为每个问卷类型创建问题
    for (const question of questions) {
      const dimension = dimensions.find((d) => d.name === question.dimension);
      if (!dimension) continue;

      // 了解自己的问题
      await queryInterface.bulkInsert('question_template', [
        {
          questionnaire_id: selfAwarenessTemplate.id,
          dimension_id: dimension.id,
          question_text: question.self,
          question_type: question.type,
          order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      // 了解伴侣的问题
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
