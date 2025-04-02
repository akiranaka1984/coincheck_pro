const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// すべてのルートで認証が必要
router.use(authenticate);

// ダッシュボード情報の取得
router.get('/', dashboardController.getDashboardInfo);

module.exports = router;