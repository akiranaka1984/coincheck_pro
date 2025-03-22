'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SyncSetting extends Model {
    static associate(models) {
      // ユーザーとの関連付け
      SyncSetting.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  
  SyncSetting.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    balanceSyncInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    depositCheckInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    startTime: {
      type: DataTypes.STRING,
      defaultValue: '00:00',
    },
    endTime: {
      type: DataTypes.STRING,
      defaultValue: '23:59',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    notifyOnError: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'SyncSetting',
    tableName: 'sync_settings',
  });
  
  return SyncSetting;
};