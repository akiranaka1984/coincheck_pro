const Queue = require('bull');
const config = require('../config/bull');

/**
 * 残高チェックジョブの定義
 * APIキーごとに残高をチェックするジョブ
 */

// 残高チェックキューの作成
const createBalanceCheckQueue = () => {
  const balanceCheckQueue = new Queue('balance-check', {
    redis: config.redis,
    defaultJobOptions: config.defaultJobOptions,
  });
  
  return balanceCheckQueue;
};

// APIキーごとの残高チェックジョブを追加
const addBalanceCheckJob = (queue, apiKeyId) => {
  return queue.add(
    'check_single_apikey_balance',
    {
      type: 'check_single',
      apiKeyId,
    },
    {
      // ジョブ固有のオプション
      priority: 2, // 中程度の優先度
      attempts: 3, // 失敗時の再試行回数
    }
  );
};

module.exports = {
  createBalanceCheckQueue,
  addBalanceCheckJob,
};