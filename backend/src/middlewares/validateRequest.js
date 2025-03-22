const { validationResult } = require('express-validator');

/**
 * リクエストバリデーションミドルウェア
 * express-validatorを使用して、リクエストデータのバリデーションを行う
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // バリデーションエラーがある場合は、エラーレスポンスを返す
    return res.status(400).json({
      status: 'error',
      message: 'リクエストデータが不正です',
      errors: errors.array(),
    });
  }
  
  // バリデーションが成功した場合は、次のミドルウェアに進む
  next();
};

module.exports = validateRequest;