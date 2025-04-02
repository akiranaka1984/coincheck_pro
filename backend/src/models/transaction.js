module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    apiKeyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'api_keys',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('deposit', 'purchase', 'transfer', 'error', 'eth_purchase', 'eth_transfer'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    depositId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    depositAmount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    purchaseId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchaseAmount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    purchaseRate: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    transferId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transferAmount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rawData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  }, {
    tableName: 'transactions',
    timestamps: true,
  });

  // モデル関連付け
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    Transaction.belongsTo(models.ApiKey, {
      foreignKey: 'apiKeyId',
      as: 'apiKey',
    });
  };

  return Transaction;
};