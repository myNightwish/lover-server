'use strict';
const { QUESTIONNAIRE_TYPES } = require('../config/questionaire.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建问卷类型表
    await queryInterface.createTable('questionnaire_type', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '问卷类型代码',
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
      analysis_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'self',
        comment: '分析类型: self/partner/match/relationship',
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: '状态: 0-禁用, 1-启用',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 添加默认问卷类型
    await queryInterface.bulkInsert(
      'questionnaire_type',
      Object.values(QUESTIONNAIRE_TYPES).map((type) => ({
        code: type.code,
        name: type.name,
        description: type.description,
        need_partner: type.needPartner,
        need_sync: type.needSync,
        analysis_type: type.analysisType,
        status: type.status,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questionnaire_type');
  },
};
