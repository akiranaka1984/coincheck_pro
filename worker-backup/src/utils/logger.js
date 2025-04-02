const winston = require('winston');

/**
 * アプリケーションロガー
 * 構造化ログを提供するためのWinstonロガー
 */

// ログレベルの設定（環境によって変更）
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Winstonロガーの設定
const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'coincheck-worker' },
  transports: [
    // コンソール出力
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) => {
            return `${timestamp} ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`;
          }
        )
      ),
    }),
    // 本番環境ではファイル出力も追加可能
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = logger;