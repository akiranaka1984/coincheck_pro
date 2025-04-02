/**
 * グローバルエラーハンドラミドルウェア
 * アプリケーション内で発生したエラーを適切に処理し、
 * クライアントに一貫したエラーレスポンスを返す
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // エラータイプに応じたステータスコードとメッセージを設定
  let statusCode = 500;
  let message = 'サーバーエラーが発生しました';
  let errors = [];

  // バリデーションエラー（express-validator）
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'リクエストが不正です';
    errors = err.array();
  } 
  // シーケライズのエラー
  else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'データベースのバリデーションエラーが発生しました';
    errors = err.errors.map(e => ({
      param: e.path,
      msg: e.message,
    }));
  } 
  // 認証エラー
  else if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
    statusCode = 401;
    message = '認証に失敗しました';
  } 
  // アクセス不許可エラー
  else if (err.name === 'ForbiddenError' || err.message === 'Forbidden') {
    statusCode = 403;
    message = 'アクセスが拒否されました';
  } 
  // リソースが見つからないエラー
  else if (err.name === 'NotFoundError' || err.message === 'Not Found') {
    statusCode = 404;
    message = 'リソースが見つかりません';
  }
  // Coincheck API レート制限エラー
  else if (err.name === 'TooManyRequestsError' || err.response?.status === 429) {
    statusCode = 429;
    message = 'APIリクエスト制限を超えました。しばらく待ってから再試行してください';
  }
  // カスタムステータスコードがある場合
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
  }

  // エラーレスポンスを返す
  res.status(statusCode).json({
    status: 'error',
    message,
    errors: errors.length > 0 ? errors : undefined,
    // 開発環境のみスタックトレースを含める
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;