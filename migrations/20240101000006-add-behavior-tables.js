'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建行为记录表
    await queryInterface.createTable('behavior_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: Sequelize.INTEGER,
      partner_id: Sequelize.INTEGER,
      type: Sequelize.ENUM('positive', 'negative'),
      points: Sequelize.INTEGER,
      category: Sequelize.STRING(50),
      description: Sequelize.TEXT,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建行为积分表
    await queryInterface.createTable('behavior_scores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: Sequelize.INTEGER,
      total_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      positive_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      negative_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('behavior_scores');
    await queryInterface.dropTable('behavior_records');
  }
};