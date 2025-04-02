module.exports = (sequelize, DataTypes) => {
  const Balance = sequelize.define('Balance', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    apiKeyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'api_keys',
        key: 'id',
      },
    },
    jpy: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0,
    },
    btc: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0,
    },
    jpyReserved: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0,
    },
    btcReserved: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0,
    },
    lastCheckedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    eth: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0,
    },
    ethReserved: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0,
    },
  }, {
    tableName: 'balances',
    timestamps: true,
  });

  // モデル関連付け
  Balance.associate = (models) => {
    Balance.belongsTo(models.ApiKey, {
      foreignKey: 'apiKeyId',
      as: 'apiKey',
    });
  };

  return Balance;
};
