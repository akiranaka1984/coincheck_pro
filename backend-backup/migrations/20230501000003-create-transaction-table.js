'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      type: {
        type: Sequelize.ENUM('deposit', 'purchase', 'transfer', 'error'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      depositId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      depositAmount: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: true
      },
      purchaseId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      purchaseAmount: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: true
      },
      purchaseRate: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true
      },
      transferId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      transferAmount: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: true
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rawData: {
        type: Sequelize.JSONB,
        allowNull: true
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
    await queryInterface.dropTable('transactions');
  }
};