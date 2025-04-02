'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sync_settings', {
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
      isEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      balanceSyncInterval: {
        type: Sequelize.INTEGER,
        defaultValue: 15
      },
      depositCheckInterval: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      startTime: {
        type: Sequelize.STRING,
        defaultValue: '00:00'
      },
      endTime: {
        type: Sequelize.STRING,
        defaultValue: '23:59'
      },
      retryCount: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      notifyOnError: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('sync_settings');
  }
};