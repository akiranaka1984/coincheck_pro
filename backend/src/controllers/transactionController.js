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
    const { apiKeyId, amount, currency = 'BTC' } = req.body;

    if (!amount || 
        isNaN(parseFloat(amount)) || 
        parseFloat(amount) <= 0 || 
        amount === 'Infinity') {
      return res.status(400).json({
        status: 'error',
        message: '有効な金額を指定してください'
      });
    }
    
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
    
    // 通貨に応じたウォレットアドレスの取得
    let walletAddress;
    if (currency === 'ETH' && apiKey.ethWalletAddress) {
      walletAddress = decrypt(apiKey.ethWalletAddress);
    } else {
      walletAddress = decrypt(apiKey.btcWalletAddress);
    }
    
    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: `送金先${currency}ウォレットアドレスが設定されていません`,
      });
    }
    
    // 取引履歴の作成（初期状態）
    const transaction = await Transaction.create({
      userId,
      apiKeyId,
      type: currency === 'ETH' ? 'eth_purchase' : 'purchase',
      status: 'pending',
    });
    
    try {
      let purchaseResult;
      
      // 通貨タイプに応じた処理
      if (currency === 'ETH') {
        // ETHの成行注文を作成
        purchaseResult = await coincheckApi.createMarketBuyOrderETH(
          accessKey,
          secretKey,
          amount
        );
        
        // ETH購入成功を記録
        await transaction.update({
          purchaseId: purchaseResult.id.toString(),
          purchaseAmount: purchaseResult.amount,
          purchaseRate: purchaseResult.rate,
          status: 'pending', // 処理中に変更
          rawData: purchaseResult,
        });
        
        // ETH送金処理を実行
        const transferResult = await coincheckApi.sendEthereum(
          accessKey,
          secretKey,
          walletAddress,
          purchaseResult.amount || purchaseResult.market_buy_amount / purchaseResult.rate
        );
        
        // 送金処理の結果を記録
        await transaction.update({
          transferId: transferResult.id.toString(),
          transferAmount: transferResult.amount,
          walletAddress: walletAddress,
          status: 'completed',
          rawData: { ...purchaseResult, transfer: transferResult },
        });
        
        return res.status(200).json({
          status: 'success',
          message: 'ETHの購入と送金が完了しました',
          data: { transaction },
        });
      } else {
        // BTCの成行注文を作成
        purchaseResult = await coincheckApi.createMarketBuyOrder(
          accessKey,
          secretKey,
          amount
        );
        
        // BTC購入成功を記録
        await transaction.update({
          purchaseId: purchaseResult.id.toString(),
          purchaseAmount: purchaseResult.amount,
          purchaseRate: purchaseResult.rate,
          status: 'pending', // 処理中に変更
          rawData: purchaseResult,
        });
        
        // BTC送金処理を実行
        const transferResult = await coincheckApi.sendBitcoin(
          accessKey,
          secretKey,
          walletAddress,
          purchaseResult.amount
        );
        
        // 送金処理の結果を記録
        await transaction.update({
          transferId: transferResult.id.toString(),
          transferAmount: transferResult.amount,
          walletAddress: walletAddress,
          status: 'completed',
          rawData: { ...purchaseResult, transfer: transferResult },
        });
        
        return res.status(200).json({
          status: 'success',
          message: 'BTCの購入と送金が完了しました',
          data: { transaction },
        });
      }
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

// 手動送金の実行
const executeManualTransfer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { apiKeyId, amount, currency = 'BTC', walletAddress } = req.body;
    
    if (!amount || 
        isNaN(parseFloat(amount)) || 
        parseFloat(amount) <= 0 || 
        amount === 'Infinity') {
      return res.status(400).json({
        status: 'error',
        message: '有効な金額を指定してください'
      });
    }
    
    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: '送金先ウォレットアドレスを指定してください'
      });
    }
    
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
    
    // 取引履歴の作成（初期状態）
    const transaction = await Transaction.create({
      userId,
      apiKeyId,
      type: currency.toLowerCase() === 'eth' ? 'eth_transfer' : 'transfer',
      status: 'pending',
      walletAddress,
    });
    
    try {
      // 暗号資産の送金処理
      let transferResult;
      
      if (currency.toLowerCase() === 'eth') {
        transferResult = await coincheckApi.sendEthereum(
          accessKey,
          secretKey,
          walletAddress,
          amount
        );
      } else {
        transferResult = await coincheckApi.sendBitcoin(
          accessKey,
          secretKey,
          walletAddress,
          amount
        );
      }
      
      // 送金成功を記録
      await transaction.update({
        transferId: transferResult.id.toString(),
        transferAmount: transferResult.amount,
        status: 'completed',
        rawData: transferResult,
      });
      
      return res.status(200).json({
        status: 'success',
        message: `${currency.toUpperCase()}の送金が完了しました`,
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
  executeManualTransfer,
};
