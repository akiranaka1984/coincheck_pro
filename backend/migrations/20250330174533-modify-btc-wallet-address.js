'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('api_keys', 'btcWalletAddress', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('api_keys', 'btcWalletAddress', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
