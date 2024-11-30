'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('families', 'status', {
      type: Sequelize.ENUM('pending', 'active', 'inactive'),
      defaultValue: 'pending',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('families', 'status');
  },
};
