const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "認証トークンがありません" 
      });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          success: false, 
          message: "無効なトークンです" 
        });
      }
      
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "ユーザーが見つかりません" 
        });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('認証エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: "認証処理中にエラーが発生しました" 
    });
  }
};
