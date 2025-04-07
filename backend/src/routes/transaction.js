const express = require('express');
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// すべてのルートで認証が必要
router.use(authenticate);

// 取引履歴一覧の取得
router.get('/', transactionController.getAllTransactions);

// 取引履歴詳細の取得
router.get('/:id', transactionController.getTransactionById);

// 手動取引の実行
router.post(
  '/execute',
  [
    body('apiKeyId').isInt().withMessage('有効なAPIキーIDを指定してください'),
    body('amount').isNumeric().withMessage('有効な金額を指定してください'),
    validateRequest,
  ],
  transactionController.executeManualTransaction
);

// 手動送金の実行 - 既存のパス
router.post(
  '/transfer',
  [
    body('apiKeyId').isInt().withMessage('有効なAPIキーIDを指定してください'),
    body('amount').isNumeric().withMessage('有効な金額を指定してください'),
    body('currency').isIn(['btc', 'eth', 'BTC', 'ETH']).withMessage('有効な通貨を指定してください'),
    body('walletAddress').notEmpty().withMessage('有効なウォレットアドレスを指定してください'),
    validateRequest,
  ],
  transactionController.executeManualTransfer
);

// フロントエンドからの呼び出しに対応するための追加ルート
router.post(
  '/execute-transfer',
  [
    body('apiKeyId').isInt().withMessage('有効なAPIキーIDを指定してください'),
    body('amount').isNumeric().withMessage('有効な金額を指定してください'),
    body('currency').isIn(['btc', 'eth', 'BTC', 'ETH']).withMessage('有効な通貨を指定してください'),
    body('walletAddress').notEmpty().withMessage('有効なウォレットアドレスを指定してください'),
    validateRequest,
  ],
  transactionController.executeManualTransfer
);

module.exports = router;
