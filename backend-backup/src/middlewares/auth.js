const jwt = require('jsonwebtoken');

/**
 * JWT認証ミドルウェア
 * Authorization ヘッダーからJWTトークンを検証する
 */
const authenticate = (req, res, next) => {
  // ヘッダーからトークンを取得
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: '認証トークンが提供されていません',
    });
  }

  // Bearer プレフィックスを除去してトークンを取得
  const token = authHeader.split(' ')[1];

  try {
    // トークンを検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // リクエストオブジェクトにユーザー情報を追加
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: '認証トークンの有効期限が切れています',
      });
    }

    return res.status(401).json({
      status: 'error',
      message: '無効な認証トークンです',
    });
  }
};

module.exports = { authenticate };
