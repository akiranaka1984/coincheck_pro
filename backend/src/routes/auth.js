const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('/app/src/middlewares/auth');
const validateRequest = require('/app/src/middlewares/validateRequest');

const router = express.Router();

// ログイン
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('ユーザー名は必須です'),
    body('password').notEmpty().withMessage('パスワードは必須です'),
    validateRequest,
  ],
  authController.login
);

// ユーザープロフィール取得
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
