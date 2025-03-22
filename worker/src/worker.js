// worker/src/worker.js
require('dotenv').config();
const { createDepositCheckQueue } = require('./jobs/depositCheck');
const { createBalanceCheckQueue } = require('./jobs/balanceCheck');
const settingsService = require('./services/settingsService');
const redis = require('redis');
const logger = require('./utils/logger');

/**
 * ワーカープロセスのメインファイル
 * ジョブキューを初期化し、動的に設定されたタスクを実行
 */

// キューのインスタンス
let depositCheckQueue;
let balanceCheckQueue;

// 現在のリピートジョブID
let currentDepositJobId = null;
let currentBalanceJobId = null;

// 開始メッセージ
logger.info('ワーカープロセスを開始しています...');

// キューの初期化
const initializeQueues = () => {
  // 入金チェックキュー作成
  depositCheckQueue = createDepositCheckQueue();
  
  // 残高チェックキュー作成
  balanceCheckQueue = createBalanceCheckQueue();
  
  // 入金チェックキュープロセスの設定
  depositCheckQueue.process(async (job) => {
    // アクティブ時間外の場合はスキップ
    if (!(await settingsService.isWithinActiveHours())) {
      logger.info('非アクティブ時間帯のため入金チェックをスキップします');
      return { success: true, skipped: true };
    }
    
    logger.info('入金チェック処理を実行します');
    
    try {
      // ジョブデータの取得
      const { type } = job.data;
      
      if (type === 'check_all') {
        // すべてのAPIキーをチェック
        await require('./services/depositCheckService').checkAllApiKeys();
      } else if (type === 'check_single') {
        // 特定のAPIキーをチェック
        const { apiKeyId } = job.data;
        await require('./services/depositCheckService').checkSingleApiKey(apiKeyId);
      }
      
      logger.info('入金チェック処理が完了しました');
      return { success: true };
    } catch (error) {
      logger.error('入金チェック処理中にエラーが発生しました', { error });
      throw error; // 再試行のためにエラーをスロー
    }
  });
  
  // 残高チェックキュープロセスの設定
  balanceCheckQueue.process(async (job) => {
    // アクティブ時間外の場合はスキップ
    if (!(await settingsService.isWithinActiveHours())) {
      logger.info('非アクティブ時間帯のため残高チェックをスキップします');
      return { success: true, skipped: true };
    }
    
    logger.info('残高チェック処理を実行します');
    
    try {
      // ジョブデータの取得
      const { type } = job.data;
      
      if (type === 'check_all') {
        // すべてのAPIキーをチェック
        await require('./services/balanceCheckService').checkAllApiKeysBalance();
      } else if (type === 'check_single') {
        // 特定のAPIキーをチェック
        const { apiKeyId } = job.data;
        await require('./services/balanceCheckService').checkSingleApiKeyBalance(apiKeyId);
      }
      
      logger.info('残高チェック処理が完了しました');
      return { success: true };
    } catch (error) {
      logger.error('残高チェック処理中にエラーが発生しました', { error });
      throw error; // 再試行のためにエラーをスロー
    }
  });
  // 設定更新通知ジョブの処理を追加
balanceCheckQueue.process('settings_updated', async (job) => {
  logger.info('設定更新通知ジョブを受信しました');
  
  try {
    // ジョブデータからユーザーIDを取得
    const { userId, timestamp } = job.data;
    logger.info(`ユーザーID: ${userId} が ${timestamp} に設定を更新しました`);
    
    // ジョブを再スケジュール
    await scheduleJobs();
    
    return { success: true };
  } catch (error) {
    logger.error('設定更新の処理中にエラーが発生しました', { error });
    throw error;
  }
});
};

// タスクのスケジュール設定
const scheduleJobs = async () => {
  try {
    // 既存のリピートジョブをクリア
    if (currentDepositJobId) {
      await depositCheckQueue.removeRepeatableByKey(currentDepositJobId);
    }
    if (currentBalanceJobId) {
      await balanceCheckQueue.removeRepeatableByKey(currentBalanceJobId);
    }
    
    // 設定を取得
    const settings = await settingsService.getSystemSettings();
    logger.info('設定を読み込みました', { settings });
    
    // 入金チェックのスケジュール設定
    const depositJob = await depositCheckQueue.add(
      'check_all_deposits',
      { type: 'check_all' },
      {
        repeat: {
          every: settings.depositCheckInterval, // 設定から取得した間隔
        },
        attempts: settings.retryCount
      }
    );
    
    currentDepositJobId = depositJob.opts.repeat.key;
    logger.info(`入金チェックジョブをスケジュール設定しました (${settings.depositCheckInterval}ms間隔)`);
    
    // 残高チェックのスケジュール設定
    const balanceJob = await balanceCheckQueue.add(
      'check_all_balances',
      { type: 'check_all' },
      {
        repeat: {
          every: settings.balanceSyncInterval, // 設定から取得した間隔
        },
        attempts: settings.retryCount
      }
    );
    
    currentBalanceJobId = balanceJob.opts.repeat.key;
    logger.info(`残高チェックジョブをスケジュール設定しました (${settings.balanceSyncInterval}ms間隔)`);
    
    return true;
  } catch (error) {
    logger.error('ジョブのスケジュール設定中にエラーが発生しました', { error });
    throw error;
  }
};

// Redis Pub/Subで設定変更通知を監視
const setupSettingsUpdateListener = () => {
  const subscriber = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  });
  
  subscriber.on('connect', () => {
    logger.info('Redis Pub/Sub チャンネルに接続しました');
    subscriber.subscribe('settings:updated');
  });
  
  subscriber.on('message', async (channel, message) => {
    if (channel === 'settings:updated') {
      logger.info('設定更新通知を受信しました: ジョブのスケジュールを再構築します');
      await scheduleJobs();
    }
  });
  
  subscriber.on('error', (error) => {
    logger.error('Redis Pub/Sub エラー', { error });
  });
};

// メイン処理
const start = async () => {
  try {
    // キューの初期化
    initializeQueues();
    
    // 設定更新リスナーのセットアップ
    setupSettingsUpdateListener();
    
    // 初期ジョブスケジュール
    await scheduleJobs();
    
    logger.info('ワーカープロセスが起動しました');
  } catch (error) {
    logger.error('ワーカープロセスの起動に失敗しました', { error });
    process.exit(1);
  }
};

// プロセスを開始
start();