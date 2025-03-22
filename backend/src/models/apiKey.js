module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define('ApiKey', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    accessKey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    secretKey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    btcWalletAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastCheckedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'api_keys',
    timestamps: true,
  });

  // モデル関連付け
  ApiKey.associate = (models) => {
    ApiKey.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    ApiKey.hasMany(models.Transaction, {
      foreignKey: 'apiKeyId',
      as: 'transactions',
    });
  };

  return ApiKey;
};