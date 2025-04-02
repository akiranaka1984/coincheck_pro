const Queue = require('bull');
const config = require('../config/bull');

/**
 * 入金チェックジョブの定義
 * APIキーごとに入金状況をチェックするジョブ
 */

// 入金チェックキューの作成
const createDepositCheckQueue = () => {
  const depositCheckQueue = new Queue('deposit-check', {
    redis: config.redis,
    defaultJobOptions: config.defaultJobOptions,
  });
  
  return depositCheckQueue;
};

// APIキーごとの入金チェックジョブを追加
const addDepositCheckJob = (queue, apiKeyId) => {
  return queue.add(
    'check_single_apikey_deposit',
    {
      type: 'check_single',
      apiKeyId,
    },
    {
      // ジョブ固有のオプション
      priority: 1, // 高優先度
      attempts: 5, // 失敗時の再試行回数を増やす
    }
  );
};

module.exports = {
  createDepositCheckQueue,
  addDepositCheckJob,
};