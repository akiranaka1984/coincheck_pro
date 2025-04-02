/**
 * Bullジョブキューの設定
 */
module.exports = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: {
    attempts: 3,         // 失敗時の再試行回数
    backoff: {
      type: 'exponential',  // 指数関数的なバックオフ（再試行間隔が徐々に増加）
      delay: 1000,          // 初回の遅延（ミリ秒）
    },
    removeOnComplete: 100, // 完了したジョブを100件まで保持
    removeOnFail: 100,     // 失敗したジョブを100件まで保持
  },
};