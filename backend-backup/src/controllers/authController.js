const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * ユーザー認証コントローラー
 * ログイン・ログアウト処理を担当
 */

// ユーザーログイン
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // ユーザーの検索
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'ユーザー名またはパスワードが正しくありません',
      });
    }
    
    // パスワードの検証
    const isPasswordValid = await user.isValidPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'ユーザー名またはパスワードが正しくありません',
      });
    }
    
    // 最終ログイン日時を更新
    await user.update({ lastLoginAt: new Date() });
    
    // JWTトークンの生成
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    // レスポンス
    return res.status(200).json({
      status: 'success',
      message: 'ログインに成功しました',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ユーザー情報の取得
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role', 'lastLoginAt', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'ユーザーが見つかりません',
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getProfile,
};