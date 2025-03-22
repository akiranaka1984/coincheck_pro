'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('balances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      apiKeyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'api_keys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      jpy: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        defaultValue: 0
      },
      btc: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        defaultValue: 0
      },
      jpyReserved: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        defaultValue: 0
      },
      btcReserved: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        defaultValue: 0
      },
      lastCheckedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('balances');
  }
};
