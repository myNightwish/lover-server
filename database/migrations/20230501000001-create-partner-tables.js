'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建伴侣绑定请求表
    await queryInterface.createTable('partner_bind_request', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      requester_id: { type: Sequelize.INTEGER, allowNull: false, comment: '发起请求的用户ID' },
      target_id: { type: Sequelize.INTEGER, allowNull: false, comment: '目标用户ID' },
      status: { 
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'canceled'),
        defaultValue: 'pending',
        comment: '请求状态: pending-待处理, accepted-已接受, rejected-已拒绝, canceled-已取消'
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建伴侣关系表
    await queryInterface.createTable('partner_relationship', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, comment: '用户ID' },
      partner_id: { type: Sequelize.INTEGER, allowNull: false, comment: '伴侣ID' },
      bind_time: { type: Sequelize.DATE, allowNull: false, comment: '绑定时间' },
      unbind_time: { type: Sequelize.DATE, allowNull: true, comment: '解绑时间' },
      status: { type: Sequelize.INTEGER, defaultValue: 1, comment: '状态: 1-有效, 0-已解绑' },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 添加索引
    await queryInterface.addIndex('partner_bind_request', ['requester_id', 'target_id', 'status']);
    await queryInterface.addIndex('partner_relationship', ['user_id', 'partner_id', 'status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('partner_relationship');
    await queryInterface.dropTable('partner_bind_request');
  }
};