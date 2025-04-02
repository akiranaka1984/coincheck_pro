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

module.exports = router;