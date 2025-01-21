'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建积分余额表
    await queryInterface.createTable('points_balance', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: Sequelize.INTEGER,
      balance: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
        comment: '当前积分余额',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建积分记录表
    await queryInterface.createTable('points_record', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: Sequelize.INTEGER,
      target_id: Sequelize.INTEGER,
      type: Sequelize.STRING(20),
      points: Sequelize.INTEGER,
      description: Sequelize.TEXT,
      category: Sequelize.STRING(50),
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建兑换项目表
    await queryInterface.createTable('exchange_item', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: Sequelize.STRING(100),
      description: Sequelize.TEXT,
      points_cost: Sequelize.INTEGER,
      is_system: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      creator_id: Sequelize.INTEGER,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 为现有用户初始化积分余额
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM wx_users',
      { type: Sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert(
      'points_balance',
      users.map((user) => ({
        user_id: user.id,
        balance: 50,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
    // 为每个用户添加系统初始赠予的积分记录
    await queryInterface.bulkInsert(
      'points_record',
      users.map((user) => ({
        user_id: 0, // 0 表示系统
        target_id: user.id,
        type: 'system_init',
        points: 50,
        description: '系统初始赠予积分',
        category: 'system',
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
    // 添加默认兑换项目
    await queryInterface.bulkInsert('exchange_item', [
      {
        title: '15分钟按摩',
        description: '享受15分钟的放松按摩',
        points_cost: 15,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '一个笑话',
        description: '听对方讲一个有趣的笑话',
        points_cost: 5,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '深度倾听30分钟',
        description: '专注倾听对方分享30分钟',
        points_cost: 30,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '做顿晚餐',
        description: '为对方准备一顿温暖的晚餐',
        points_cost: 50,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exchange_item');
    await queryInterface.dropTable('points_record');
    await queryInterface.dropTable('points_balance');
  }
};