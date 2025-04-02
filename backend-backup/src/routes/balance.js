const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');

// 認証機能は一時的に無効化
// const { authenticateToken } = require('../middleware/auth');
// router.use(authenticateToken);

// 認証なしでアクセス可能
router.get('/', balanceController.getBalance);
router.post('/update', balanceController.updateBalance);

module.exports = router;
