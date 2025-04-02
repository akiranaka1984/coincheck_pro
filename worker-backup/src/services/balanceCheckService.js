const db = require('../models');
const { decrypt } = require('../utils/crypto');
const coincheckApi = require('../utils/coincheckApi');
const logger = require('../utils/logger');

/**
 * 残高チェックサービス
 * APIキー毎の残高をチェックして更新する
 */

// すべてのアクティブなAPIキーの残高をチェック
const checkAllApiKeysBalance = async () => {
  logger.info("すべてのAPIキーの残高チェックを開始します");
  
  try {
    // アクティブなAPIキーをすべて取得
    const apiKeys = await db.ApiKey.findAll({
      where: { isActive: true },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });
    
    logger.info(`${apiKeys.length}件のアクティブなAPIキーが見つかりました`);
    
    // 各APIキーについて非同期でチェック
    const results = await Promise.allSettled(
      apiKeys.map(apiKey => checkBalanceForApiKey(apiKey))
    );
    
    // 結果の集計
    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    
    logger.info(`残高チェック完了: 成功=${succeeded}, 失敗=${failed}`);
    
    return { succeeded, failed };
  } catch (error) {
    logger.error(`残高チェック中にエラーが発生しました: ${error.message}`, { error });
    throw error;
  }
};

// 特定のAPIキーの残高をチェック
const checkSingleApiKeyBalance = async (apiKeyId) => {
  logger.info(`APIキー ID: ${apiKeyId} の残高チェックを開始します`);
  
  try {
    // APIキーを取得
    const apiKey = await db.ApiKey.findOne({
      where: { id: apiKeyId, isActive: true },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });
    
    if (!apiKey) {
      logger.warn(`APIキー ID: ${apiKeyId} が見つからないか非アクティブです`);
      return null;
    }
    
    return await checkBalanceForApiKey(apiKey);
  } catch (error) {
    logger.error(`APIキー ID: ${apiKeyId} の残高チェック中にエラーが発生しました: ${error.message}`, { error });
    throw error;
  }
};

// 特定のAPIキーに対する残高チェックと更新
const checkBalanceForApiKey = async (apiKey) => {
  const apiKeyId = apiKey.id;
  
  logger.info(`APIキー ID: ${apiKeyId} の残高チェック処理を開始`, {
    apiKeyName: apiKey.name,
    userId: apiKey.userId,
  });
  
  try {
    // APIキーとシークレットを復号化
    const accessKey = decrypt(apiKey.accessKey);
    const secretKey = decrypt(apiKey.secretKey);
    
    if (!accessKey || !secretKey) {
      throw new Error("APIキーの復号化に失敗しました");
    }
    
    // 現在時刻を設定
    const now = new Date();
    
    // Coincheckから残高情報を取得
    const balanceInfo = await coincheckApi.getBalance(accessKey, secretKey);
    
    // 残高の作成または更新
    let balance = await db.Balance.findOne({ where: { apiKeyId } });
    
    if (balance) {
      // 既存の残高を更新
      await balance.update({
        jpy: balanceInfo.jpy || 0,
        btc: balanceInfo.btc || 0,
        jpyReserved: balanceInfo.jpy_reserved || 0,
        btcReserved: balanceInfo.btc_reserved || 0,
        lastCheckedAt: now,
      });
    } else {
      // 新規残高を作成
      balance = await db.Balance.create({
        apiKeyId,
        jpy: balanceInfo.jpy || 0,
        btc: balanceInfo.btc || 0,
        jpyReserved: balanceInfo.jpy_reserved || 0,
        btcReserved: balanceInfo.btc_reserved || 0,
        lastCheckedAt: now,
      });
    }
    
    // APIキーの最終チェック時間を更新
    await apiKey.update({ lastCheckedAt: now });
    
    logger.info(`APIキー ID: ${apiKeyId} の残高チェック処理が完了しました`);
    
    return {
      apiKeyId,
      balance,
    };
  } catch (error) {
    logger.error(`APIキー ID: ${apiKeyId} の残高チェック処理中にエラーが発生しました: ${error.message}`, { error });
    
    throw error;
  }
};

module.exports = {
  checkAllApiKeysBalance,
  checkSingleApiKeyBalance,
};