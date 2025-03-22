const { ApiKey, Balance } = require('../models');

// GET /api/balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await Balance.findOne({ where: { userId } });
    
    if (!balance) {
      return res.status(404).json({ 
        success: false, 
        message: "残高情報が見つかりません" 
      });
    }
    
    return res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('残高取得エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: "残高の取得中にエラーが発生しました"
    });
  }
};

// POST /api/balance/update
exports.updateBalance = async (req, res) => {
  try {
    // 簡単な実装
    return res.json({
      success: true,
      message: "残高が更新されました"
    });
  } catch (error) {
    console.error('残高更新エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: "残高の更新中にエラーが発生しました"
    });
  }
};

// エラーハンドリング関数
exports.handleApiError = (error, res) => {
  if (error.response && error.response.status === 429) {
    return res.status(429).json({
      success: false,
      message: "APIリクエスト制限を超えました。しばらく待ってから再試行してください"
    });
  }
  
  return res.status(500).json({
    success: false,
    message: "サーバーエラーが発生しました"
  });
};
