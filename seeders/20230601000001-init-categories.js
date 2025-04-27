'use strict';
const categoriesMap = require('../app/data/categories');
module.exports = {
  up: async (queryInterface) => {
    // 插入分类数据
    await queryInterface.bulkInsert('category', categoriesMap);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('category', null, {});
  }
};