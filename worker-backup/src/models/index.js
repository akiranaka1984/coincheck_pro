const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];
const db = {};

// Sequelizeインスタンスの作成
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// ワーカーでは基本的にモデルはバックエンドと共有するが、
// ここではモデル定義を簡易的に行う

// User モデル
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  role: Sequelize.STRING,
  lastLoginAt: Sequelize.DATE,
}, {
  tableName: 'users',
  timestamps: true,
});

// ApiKey モデル
const ApiKey = sequelize.define('ApiKey', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: Sequelize.INTEGER,
  name: Sequelize.STRING,
  accessKey: Sequelize.TEXT,
  secretKey: Sequelize.TEXT,
  btcWalletAddress: Sequelize.STRING,
  isActive: Sequelize.BOOLEAN,
  lastCheckedAt: Sequelize.DATE,
}, {
  tableName: 'api_keys',
  timestamps: true,
});

// Transaction モデル
const Transaction = sequelize.define('Transaction', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: Sequelize.INTEGER,
  apiKeyId: Sequelize.INTEGER,
  type: Sequelize.STRING,
  status: Sequelize.STRING,
  depositId: Sequelize.STRING,
  depositAmount: Sequelize.DECIMAL(18, 8),
  purchaseId: Sequelize.STRING,
  purchaseAmount: Sequelize.DECIMAL(18, 8),
  purchaseRate: Sequelize.DECIMAL(18, 2),
  transferId: Sequelize.STRING,
  transferAmount: Sequelize.DECIMAL(18, 8),
  walletAddress: Sequelize.STRING,
  errorMessage: Sequelize.TEXT,
  rawData: Sequelize.JSONB,
}, {
  tableName: 'transactions',
  timestamps: true,
});

// リレーションシップの設定
User.hasMany(ApiKey, { foreignKey: 'userId', as: 'apiKeys' });
ApiKey.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ApiKey.hasMany(Transaction, { foreignKey: 'apiKeyId', as: 'transactions' });
Transaction.belongsTo(ApiKey, { foreignKey: 'apiKeyId', as: 'apiKey' });

// モデルをdbオブジェクトに追加
db.User = User;
db.ApiKey = ApiKey;
db.Transaction = Transaction;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;