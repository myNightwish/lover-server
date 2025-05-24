'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建分类表
    await queryInterface.createTable('category', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: Sequelize.STRING(50), unique: true, comment: '分类编码，如relationship' },
      name: { type: Sequelize.STRING(100), comment: '分类名称' },
      description: Sequelize.TEXT,
      icon: Sequelize.STRING(100),
      order: { type: Sequelize.INTEGER, defaultValue: 0, comment: '排序' },
      version: { type: Sequelize.STRING(20), defaultValue: '1.0', comment: '版本号' },
      status: { type: Sequelize.INTEGER, defaultValue: 1, comment: '状态：1-启用，0-禁用' },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });

    // 创建话题表
    await queryInterface.createTable('topic', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      category_id: { type: Sequelize.INTEGER, comment: '所属分类ID' },
      code: { type: Sequelize.STRING(50), unique: true, comment: '话题编码，如deep-talk' },
      name: { type: Sequelize.STRING(100), comment: '话题名称' },
      type: { type: Sequelize.STRING(50), comment: '话题类型' },
      description: Sequelize.TEXT,
      icon: Sequelize.STRING(100),
      order: { type: Sequelize.INTEGER, defaultValue: 0, comment: '排序' },
      version: { type: Sequelize.STRING(20), defaultValue: '1.0', comment: '版本号' },
      status: { type: Sequelize.INTEGER, defaultValue: 1, comment: '状态：1-启用，0-禁用' },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });

    // 创建问题表
    await queryInterface.createTable('question', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      topic_id: { type: Sequelize.INTEGER, comment: '所属话题ID' },
      code: { type: Sequelize.STRING(50), comment: '问题编码，如q1' },
      text: { type: Sequelize.TEXT, comment: '问题文本' },
      type: { type: Sequelize.STRING(50), comment: '问题类型：text, options, who, thisorthat等' },
      // 修改 JSON 类型为 TEXT
      options: { type: Sequelize.TEXT, comment: '选项，用于options类型' },
      option1: { type: Sequelize.STRING(255), comment: '选项1，用于thisorthat类型' },
      option2: { type: Sequelize.STRING(255), comment: '选项2，用于thisorthat类型' },
      order: { type: Sequelize.INTEGER, defaultValue: 0, comment: '排序' },
      version: { type: Sequelize.STRING(20), defaultValue: '1.0', comment: '版本号' },
      status: { type: Sequelize.INTEGER, defaultValue: 1, comment: '状态：1-启用，0-禁用' },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });

    // 创建用户话题进度表
    await queryInterface.createTable('user_topic_progress', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, comment: '用户ID' },
      topic_id: { type: Sequelize.INTEGER, comment: '话题ID' },
      topic_version: { type: Sequelize.STRING(20), comment: '话题版本' },
      unlocked: { type: Sequelize.BOOLEAN, defaultValue: false, comment: '是否解锁' },
      completed: { type: Sequelize.BOOLEAN, defaultValue: false, comment: '是否完成' },
      unlock_time: Sequelize.DATE,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });

    // 创建用户问题回答表
    await queryInterface.createTable('user_question_answer', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, comment: '用户ID' },
      question_id: { type: Sequelize.INTEGER, comment: '问题ID' },
      question_version: { type: Sequelize.STRING(20), comment: '问题版本' },
      session_id: { type: Sequelize.INTEGER, comment: '会话ID' },
      answer_value: { type: Sequelize.TEXT, comment: '回答内容' },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_question_answer');
    await queryInterface.dropTable('user_topic_progress');
    await queryInterface.dropTable('question');
    await queryInterface.dropTable('topic');
    await queryInterface.dropTable('category');
  }
};