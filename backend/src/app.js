require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

// アプリケーションの初期化
const app = express();
const PORT = process.env.PORT || 4000;

// ミドルウェアのセットアップ
app.use(helmet()); // セキュリティヘッダを追加
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
})); // CORS設定
app.use(morgan('dev')); // リクエストログ
app.use(express.json()); // JSONパース
app.use(express.urlencoded({ extended: true })); // URLエンコードされたボディをパース

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ルートハンドラ
app.use('/api', routes);

// エラーハンドラ
app.use(errorHandler);

// app.js内のエラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('エラーをキャッチ:', err);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'サーバーエラーが発生しました',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// サーバー起動
(async () => {
  try {
    // データベース接続テスト
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // サーバー起動
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
})();

module.exports = app; // テスト用にエクスポート