// routes/index.js の中
const express = require('express');
const authRoutes = require('./auth');
const apiKeyRoutes = require('./apiKey');
const transactionRoutes = require('./transaction');
const dashboardRoutes = require('./dashboard');
const balanceRoutes = require('./balance');
const settingsRoutes = require('./settings'); // 新しく追加

const router = express.Router();

// 各ルーターのマウント
router.use('/auth', authRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/balance', balanceRoutes);
router.use('/settings', settingsRoutes); // 新しく追加

module.exports = router;