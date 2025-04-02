// worker/src/services/settingsService.js
const db = require('../models');
const logger = require('../utils/logger');

/**
 * 設定サービス
 * データベースから同期設定を取得する
 */

// デフォルト設定値（分単位の設定をミリ秒に変換）
const DEFAULT_SETTINGS = {
  isEnabled: true,
  depositCheckInterval: 5 * 60 * 1000,  // 5分（ミリ秒）
  balanceSyncInterval: 15 * 60 * 1000,  // 15分（ミリ秒）
  retryCount: 3
};

/**
 * 全ユーザー設定を取得
 * ※シンプルな実装のため、単一ユーザー（admin）のみの設定を使用
 */
const getSystemSettings = async () => {
  try {
    logger.info('システム設定を取得します');
    
    // システム設定（adminユーザーの設定）を取得
    const adminUser = await db.User.findOne({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      logger.warn('adminユーザーが見つかりません。デフォルト設定を使用します');
      return DEFAULT_SETTINGS;
    }
    
    // adminユーザーの設定を取得
    const settings = await db.SyncSetting.findOne({
      where: { userId: adminUser.id }
    });
    
    if (!settings) {
      logger.warn('設定が見つかりません。デフォルト設定を使用します');
      return DEFAULT_SETTINGS;
    }
    
    // 分単位の設定をミリ秒に変換
    return {
      isEnabled: settings.isEnabled,
      depositCheckInterval: settings.depositCheckInterval * 60 * 1000,
      balanceSyncInterval: settings.balanceSyncInterval * 60 * 1000,
      retryCount: settings.retryCount
    };
  } catch (error) {
    logger.error('設定取得中にエラーが発生しました', { error });
    return DEFAULT_SETTINGS;
  }
};

/**
 * 設定が有効な時間帯かどうかをチェック
 */
const isWithinActiveHours = async () => {
  try {
    // システム設定を取得
    const adminUser = await db.User.findOne({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      return true; // デフォルトでは常に有効
    }
    
    const settings = await db.SyncSetting.findOne({
      where: { userId: adminUser.id }
    });
    
    if (!settings || !settings.isEnabled) {
      return false; // 設定が無い、または無効化されている場合
    }
    
    // 現在時刻が開始時間と終了時間の間かどうかチェック
    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0];
    
    return currentTimeStr >= settings.startTime && currentTimeStr <= settings.endTime;
  } catch (error) {
    logger.error('アクティブ時間チェック中にエラーが発生しました', { error });
    return true; // エラー時はデフォルトで有効とする
  }
};

module.exports = {
  getSystemSettings,
  isWithinActiveHours
};