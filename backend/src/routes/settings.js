const express = require('express');
const { authenticate } = require('../middlewares/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// すべてのルートで認証が必要
router.use(authenticate);

// 同期設定の取得
router.get('/sync', settingsController.getSettings);

// 同期設定の更新
router.post('/sync', settingsController.updateSettings);

module.exports = router;