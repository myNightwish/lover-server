'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建问卷匹配结果表
    await queryInterface.createTable('questionnaire_match', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      partner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      match_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: '匹配得分',
      },
      details: {
        type: Sequelize.JSON,
        comment: '匹配详情',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建问卷分析结果表
    await queryInterface.createTable('questionnaire_analysis', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      partner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      content: {
        type: Sequelize.JSON,
        comment: '分析内容',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 添加索引
    await queryInterface.addIndex('questionnaire_match', [
      'user_id',
    ]);
    await queryInterface.addIndex('questionnaire_analysis', [
      'user_id',
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questionnaire_analysis');
    await queryInterface.dropTable('questionnaire_match');
  },
};
