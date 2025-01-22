'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建问卷类型表
    await queryInterface.createTable('questionnaire_type', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '问卷类型代码: self_awareness/partner_awareness/couple_match',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '问卷类型名称',
      },
      description: Sequelize.TEXT,
      need_partner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否需要伴侣',
      },
      need_sync: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否需要同步在线',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 添加类型字段到问卷模板表
    await queryInterface.addColumn('questionnaire_template', 'type_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'questionnaire_type',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 添加默认问卷类型
    await queryInterface.bulkInsert('questionnaire_type', [
      {
        code: 'self_awareness',
        name: '了解自己',
        description: '深入了解自己的性格、习惯和偏好',
        need_partner: false,
        need_sync: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'partner_awareness',
        name: '了解伴侣',
        description: '探索伴侣的性格、习惯和偏好',
        need_partner: true,
        need_sync: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'couple_match',
        name: '默契PK题',
        description: '考验你们的默契程度',
        need_partner: true,
        need_sync: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('questionnaire_template', 'type_id');
    await queryInterface.dropTable('questionnaire_type');
  },
};
