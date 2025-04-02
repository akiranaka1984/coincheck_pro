const { Transaction, ApiKey } = require('../models');
const { decrypt } = require('../utils/crypto');
const coincheckApi = require('../utils/coincheckApi');

/**
 * 取引履歴管理コントローラー
 * 取引履歴の取得と手動取引の実行を担当
 */

// 取引履歴一覧の取得
const getAllTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    
    // 取引履歴の総数を取得
    const count = await Transaction.count({
      where: { userId },
    });
    
    // 取引履歴を取得
    const transactions = await Transaction.findAll({
      where: { userId },
      attributes: { exclude: ['rawData'] }, // 生データは除外
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: ApiKey,
          as: 'apiKey',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    return res.status(200).json({
      status: 'success',
      data: { 
        transactions,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 取引履歴詳細の取得
const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    
    // 取引履歴を取得
    const transaction = await Transaction.findOne({
      where: { id: transactionId, userId },
      include: [
        {
          model: ApiKey,
          as: 'apiKey',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: '取引履歴が見つかりません',
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

// 手動取引の実行
const executeManualTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { apiKeyId, amount } = req.body;
    
    // APIキーの取得
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId, isActive: true },
    });
    
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: '有効なAPIキーが見つかりません',
      });
    }
    
    // APIキーの復号化
    const accessKey = decrypt(apiKey.accessKey);
    const secretKey = decrypt(apiKey.secretKey);
    const walletAddress = decrypt(apiKey.btcWalletAddress);
    
    // 取引履歴の作成（初期状態）
    const transaction = await Transaction.create({
      userId,
      apiKeyId,
      type: 'purchase',
      status: 'pending',
    });
    
    try {
      // 成行注文を作成
      const purchaseResult = await coincheckApi.createMarketBuyOrder(
        accessKey,
        secretKey,
        amount
      );
      
      // 購入成功を記録
      await transaction.update({
        purchaseId: purchaseResult.id.toString(),
        purchaseAmount: purchaseResult.amount,
        purchaseRate: purchaseResult.rate,
        status: 'completed',
        rawData: purchaseResult,
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'BTCの購入が完了しました',
        data: { transaction },
      });
    } catch (error) {
      // エラーを記録
      await transaction.update({
        status: 'failed',
        errorMessage: error.message,
        rawData: error.details || error.message,
      });
      
      throw error;
    }
  } catch (error) {
    // API接続エラーの場合は専用メッセージを返す
    if (error.name === 'TooManyRequestsError') {
      return res.status(429).json({
        status: 'error',
        message: 'APIリクエスト制限を超えました。しばらく待ってから再試行してください',
      });
    }
    
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  executeManualTransaction,
};