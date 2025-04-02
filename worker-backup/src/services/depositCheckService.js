const { Sequelize } = require('sequelize');
const db = require('../models');
const { decrypt } = require('../utils/crypto');
const coincheckApi = require('../utils/coincheckApi');
const logger = require('../utils/logger');

/**
 * 入金チェックサービス
 * APIキー毎の入金状況をチェックし、入金があった場合は取引処理を行う
 */

// すべてのアクティブなAPIキーの入金をチェック
const checkAllApiKeys = async () => {
  logger.info('すべてのAPIキーの入金チェックを開始します');
  
  try {
    // アクティブなAPIキーをすべて取得
    const apiKeys = await db.ApiKey.findAll({
      where: { isActive: true },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });
    
    logger.info(`${apiKeys.length}件のアクティブなAPIキーが見つかりました`);
    
    // 各APIキーについて非同期でチェック
    const results = await Promise.allSettled(
      apiKeys.map(apiKey => checkDepositForApiKey(apiKey))
    );
    
    // 結果の集計
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    logger.info(`入金チェック完了: 成功=${succeeded}, 失敗=${failed}`);
    
    return { succeeded, failed };
  } catch (error) {
    logger.error(`入金チェック中にエラーが発生しました: ${error.message}`, { error });
    throw error;
  }
};

// 特定のAPIキーの入金をチェック
const checkSingleApiKey = async (apiKeyId) => {
  logger.info(`APIキー ID: ${apiKeyId} の入金チェックを開始します`);
  
  try {
    // APIキーを取得
    const apiKey = await db.ApiKey.findOne({
      where: { id: apiKeyId, isActive: true },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });
    
    if (!apiKey) {
      logger.warn(`APIキー ID: ${apiKeyId} が見つからないか非アクティブです`);
      return null;
    }
    
    return await checkDepositForApiKey(apiKey);
  } catch (error) {
    logger.error(`APIキー ID: ${apiKeyId} の入金チェック中にエラーが発生しました: ${error.message}`, { error });
    throw error;
  }
};

// 特定のAPIキーに対する入金チェックと処理
const checkDepositForApiKey = async (apiKey) => {
  const apiKeyId = apiKey.id;
  const userId = apiKey.userId;
  
  logger.info(`APIキー ID: ${apiKeyId} の入金チェック処理を開始`, {
    apiKeyName: apiKey.name,
    userId,
  });
  
  // トランザクション開始
  const transaction = await db.sequelize.transaction();
  
  try {
    // APIキーとシークレットを復号化
    const accessKey = decrypt(apiKey.accessKey);
    const secretKey = decrypt(apiKey.secretKey);
    
    // 暗号資産タイプの取得（デフォルトはBTC）
    const cryptoType = apiKey.cryptocurrencyType || 'btc';
    
    // ウォレットアドレスの復号化
    let walletAddress;
    if (cryptoType === 'eth') {
      walletAddress = decrypt(apiKey.ethWalletAddress);
      if (!walletAddress) {
        throw new Error('ETHウォレットアドレスの復号化に失敗しました');
      }
    } else {
      // デフォルトはBTC
      walletAddress = decrypt(apiKey.btcWalletAddress);
      if (!walletAddress) {
        throw new Error('BTCウォレットアドレスの復号化に失敗しました');
      }
    }
    
    if (!accessKey || !secretKey) {
      throw new Error('APIキーの復号化に失敗しました');
    }
    
    // 前回チェック時間の取得
    const lastCheckedAt = apiKey.lastCheckedAt || new Date(0); // 最初は1970-01-01
    
    // 現在時刻を設定
    const now = new Date();
    
    // 入金履歴を取得
    const deposits = await coincheckApi.getDeposits(accessKey, secretKey, 'JPY');
    
    // 未処理の入金を抽出（前回チェック以降に確認された入金）
    const newDeposits = deposits.deposits.filter(deposit => {
      const confirmedAt = new Date(deposit.confirmed_at);
      return deposit.status === 'confirmed' && confirmedAt > lastCheckedAt;
    });
    
    logger.info(`APIキー ID: ${apiKeyId} - ${newDeposits.length}件の新規入金が見つかりました`);
    
    // 新規入金ごとに処理
    for (const deposit of newDeposits) {
      // トランザクションレコードの作成（入金記録）
      const txRecord = await db.Transaction.create(
        {
          userId,
          apiKeyId,
          type: 'deposit',
          status: 'completed',
          depositId: deposit.id.toString(),
          depositAmount: deposit.amount,
          rawData: deposit,
        },
        { transaction }
      );
      
      logger.info(`入金記録 ID: ${txRecord.id} を作成しました`, {
        depositId: deposit.id,
        amount: deposit.amount,
      });
      
      try {
        let purchaseResult, transferResult;
        let purchaseType, transferType;
        
        // 暗号資産タイプに応じた購入と送金処理
        if (cryptoType === 'eth') {
          // ETHの購入処理
          purchaseResult = await coincheckApi.createMarketBuyOrderETH(
            accessKey,
            secretKey,
            deposit.amount
          );
          purchaseType = 'eth_purchase';
          transferType = 'eth_transfer';
          
          // ETH送金処理
          transferResult = await coincheckApi.sendEthereum(
            accessKey,
            secretKey,
            walletAddress,
            purchaseResult.amount
          );
        } else {
          // BTCの購入処理（デフォルト）
          purchaseResult = await coincheckApi.createMarketBuyOrder(
            accessKey,
            secretKey,
            deposit.amount
          );
          purchaseType = 'purchase';
          transferType = 'transfer';
          
          // BTC送金処理
          transferResult = await coincheckApi.sendBitcoin(
            accessKey,
            secretKey,
            walletAddress,
            purchaseResult.amount
          );
        }
        
        // 購入記録の作成
        const purchaseRecord = await db.Transaction.create(
          {
            userId,
            apiKeyId,
            type: purchaseType,
            status: 'completed',
            purchaseId: purchaseResult.id.toString(),
            purchaseAmount: purchaseResult.amount,
            purchaseRate: purchaseResult.rate,
            rawData: purchaseResult,
          },
          { transaction }
        );
        
        logger.info(`購入記録 ID: ${purchaseRecord.id} を作成しました`, {
          purchaseId: purchaseResult.id,
          amount: purchaseResult.amount,
          rate: purchaseResult.rate,
          cryptoType,
        });
        
        // 送金記録の作成
        const transferRecord = await db.Transaction.create(
          {
            userId,
            apiKeyId,
            type: transferType,
            status: 'completed',
            transferId: transferResult.id.toString(),
            transferAmount: transferResult.amount,
            walletAddress: walletAddress,
            rawData: transferResult,
          },
          { transaction }
        );
        
        logger.info(`送金記録 ID: ${transferRecord.id} を作成しました`, {
          transferId: transferResult.id,
          amount: transferResult.amount,
          address: walletAddress,
          cryptoType,
        });
      } catch (error) {
        // エラー記録を作成
        await db.Transaction.create(
          {
            userId,
            apiKeyId,
            type: 'error',
            status: 'failed',
            errorMessage: error.message,
            rawData: error.details || error.message,
          },
          { transaction }
        );
        
        logger.error(`取引処理中にエラーが発生しました: ${error.message}`, { error });
        
        // 特定のエラー（APIレート制限など）はスローして再試行させる
        if (error.name === 'TooManyRequestsError') {
          throw error;
        }
      }
    }
    
    // 最終チェック時間を更新
    await apiKey.update({ lastCheckedAt: now }, { transaction });
    
    // トランザクションをコミット
    await transaction.commit();
    
    logger.info(`APIキー ID: ${apiKeyId} の入金チェック処理が完了しました`);
    
    return {
      apiKeyId,
      processedDeposits: newDeposits.length,
    };
  } catch (error) {
    // トランザクションをロールバック
    await transaction.rollback();
    
    logger.error(`APIキー ID: ${apiKeyId} の入金チェック処理中にエラーが発生しました: ${error.message}`, { error });
    
    throw error;
  }
};

module.exports = {
  checkAllApiKeys,
  checkSingleApiKey,
};