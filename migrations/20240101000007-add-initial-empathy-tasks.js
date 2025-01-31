'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建共情任务表
    await queryInterface.createTable('empathy_task', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: Sequelize.STRING(100),
      description: Sequelize.TEXT,
      exp_reward: Sequelize.INTEGER,
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'active',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建用户任务表
    await queryInterface.createTable('user_task', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: Sequelize.INTEGER,
      task_id: Sequelize.INTEGER,
      response: Sequelize.TEXT,
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      completed_at: Sequelize.DATE,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建用户进度表
    await queryInterface.createTable('user_progress', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: Sequelize.INTEGER,
      experience: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
    // 添加初始共情任务数据
    await queryInterface.bulkInsert('empathy_task', [
      {
        title: '换位思考日记',
        description: '记录一件让伴侣感到困扰的事情，试着从Ta的角度思考和感受',
        exp_reward: 30,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '感恩日记',
        description: '写下今天想要感谢伴侣的三件小事',
        exp_reward: 25,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '深度倾听练习',
        description: '用15分钟时间专注倾听伴侣分享，不打断，只是倾听和理解',
        exp_reward: 35,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '情绪识别挑战',
        description: '观察伴侣一天的情绪变化，尝试理解背后的原因',
        exp_reward: 28,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '共同回忆',
        description: '和伴侣一起回忆一个快乐的时刻，分享各自的感受',
        exp_reward: 20,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('empathy_task', null, {});
    await queryInterface.dropTable('user_progress');
    await queryInterface.dropTable('user_task');
  },
};
