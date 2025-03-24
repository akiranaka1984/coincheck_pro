const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
// 1つだけ残す - 相対パスの方が望ましい
const { authenticate } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

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
