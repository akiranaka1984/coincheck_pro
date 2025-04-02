'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Temp extends Model {
    static associate(models) {
      // 関連定義
    }
  }
  Temp.init({
    name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Temp',
    timestamps: true
  });
  return Temp;
};
