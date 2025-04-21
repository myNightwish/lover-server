'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    
    // 插入分类数据
    await queryInterface.bulkInsert('category', [
      {
        code: 'starters',
        name: '入门话题',
        description: '适合初次了解的轻松话题',
        icon: '💜',
        order: 1,
        version: '1.0',
        status: 1,
        created_at: now,
        updated_at: now
      },
      {
        code: 'relationship',
        name: '关系话题',
        description: '探索你们关系中的深层次问题',
        icon: '💙',
        order: 2,
        version: '1.0',
        status: 1,
        created_at: now,
        updated_at: now
      },
      {
        code: 'sex-love',
        name: '性爱话题',
        description: '探讨亲密关系中的重要部分',
        icon: '❤️',
        order: 3,
        version: '1.0',
        status: 1,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('category', null, {});
  }
};