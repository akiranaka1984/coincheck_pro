const express = require('express');
const { body } = require('express-validator');
const apiKeyController = require('../controllers/apiKeyController');
const { authenticate } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// すべてのルートで認証が必要
router.use(authenticate);

// APIキー一覧の取得
router.get('/', apiKeyController.getAllApiKeys);

// APIキー詳細の取得
router.get('/:id', apiKeyController.getApiKeyById);

// APIキーの残高取得（新規追加）
router.get('/:id/balance', apiKeyController.getApiKeyBalance);

// APIキーの残高更新（新規追加）
router.post('/:id/balance/update', apiKeyController.updateApiKeyBalance);

// APIキーの新規作成
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('名前は必須です'),
    body('accessKey').notEmpty().withMessage('アクセスキーは必須です'),
    body('secretKey').notEmpty().withMessage('シークレットキーは必須です'),
    body('btcWalletAddress').notEmpty().withMessage('BTCウォレットアドレスは必須です'),
    validateRequest,
  ],
  apiKeyController.createApiKey
);

// APIキーの更新
router.put(
  '/:id',
  [
    body('name').notEmpty().withMessage('名前は必須です'),
    validateRequest,
  ],
  apiKeyController.updateApiKey
);

// APIキーの削除
router.delete('/:id', apiKeyController.deleteApiKey);

// APIキーのテスト
router.post('/:id/test', apiKeyController.testApiKey);

module.exports = router;