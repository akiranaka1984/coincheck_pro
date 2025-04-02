const { SyncSetting } = require('../models');
// Redis依存を削除
// const redis = require('redis');

/**
 * 設定管理コントローラー
 * ユーザーの自動同期設定を管理
 */

// 設定の取得
// 設定の取得
const getSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // ユーザーの設定を取得
    let settings = await SyncSetting.findOne({
      where: { userId }
    });
    
    // 設定がなければデフォルト値で作成
    if (!settings) {
      settings = await SyncSetting.create({
        userId,
        isEnabled: true,
        balanceSyncInterval: 15,
        depositCheckInterval: 5,
        startTime: '00:00:00',
        endTime: '23:59:00',
        retryCount: 3,
        notifyOnError: true
      });
    }
    
    // フロントエンドに直接そのまま返す
    // プロパティ名を変更せず、そのまま返す
    return res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// 設定の更新処理
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;
    
    console.log('設定更新リクエスト受信:', settings);
    
    // 処理用にデータを準備
    const settingsData = {
      userId,
      isEnabled: settings.isEnabled,
      balanceSyncInterval: settings.balanceSyncInterval,
      depositCheckInterval: settings.depositCheckInterval,
      startTime: settings.startTime,
      endTime: settings.endTime,
      retryCount: settings.retryCount,
      notifyOnError: settings.notifyOnError
    };
    
    console.log('処理するデータ:', settingsData);
    
    // 既存の設定を検索 (db. を削除)
    let syncSetting = await SyncSetting.findOne({
      where: { userId },
    });
    
    // 存在しなければ新規作成
    if (!syncSetting) {
      syncSetting = await SyncSetting.create(settingsData);
      console.log('新規設定を作成しました:', syncSetting.id);
    } else {
      // 存在する場合は更新
      await syncSetting.update(settingsData);
      console.log('設定を更新しました:', syncSetting.id);
    }
    
    return res.status(200).json({
      status: 'success',
      message: '設定が更新されました',
      data: {
        settings: syncSetting
      }
    });
  } catch (error) {
    console.log('設定更新中にエラーが発生しました:', error);
    
    // テーブルが存在しない場合のエラー処理
    if (error.name === 'SequelizeDatabaseError' && error.parent && error.parent.code === '42P01') {
      return res.status(500).json({
        status: 'error',
        message: 'データベーステーブルが存在しません。マイグレーションを実行してください。',
        error: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: '設定の更新中にエラーが発生しました',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};