'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, TEXT, DATE } = Sequelize;
    
    await queryInterface.createTable('question_session_result', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: INTEGER, allowNull: false, comment: '会话ID' },
      user_id: { type: INTEGER, allowNull: false, comment: '用户ID' },
      result_data: { type: TEXT, comment: '结果数据，JSON格式' },
      status: { type: INTEGER, defaultValue: 1, comment: '状态：0-删除，1-正常' },
      created_at: DATE,
      updated_at: DATE
    });
    
    // 添加索引
    await queryInterface.addIndex('question_session_result', ['session_id']);
    await queryInterface.addIndex('question_session_result', ['user_id']);
    await queryInterface.addIndex('question_session_result', ['session_id', 'user_id'], {
      unique: true,
      name: 'idx_session_user'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('question_session_result');
  }
};