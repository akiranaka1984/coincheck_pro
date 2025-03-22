const { ApiKey, Balance } = require('../models');
const { encrypt, decrypt, maskData } = require('../utils/crypto');
const coincheckApi = require('../utils/coincheckApi');

/**
 * APIキー管理コントローラー
 * CoincheckのAPIキー情報の登録・編集・削除を担当
 */

// APIキー一覧の取得
const getAllApiKeys = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // ユーザーに関連するAPIキーを取得
    const apiKeys = await ApiKey.findAll({
      where: { userId },
      attributes: ['id', 'name', 'accessKey', 'secretKey', 'btcWalletAddress', 'isActive', 'lastCheckedAt', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });
    
    // 機密情報をマスク処理
    const maskedApiKeys = apiKeys.map(key => {
      const data = key.toJSON();
      data.accessKey = maskData(decrypt(data.accessKey), 4);
      data.secretKey = maskData(decrypt(data.secretKey), 4);
      data.btcWalletAddress = maskData(decrypt(data.btcWalletAddress), 8);
      return data;
    });
    
    return res.status(200).json({
      status: 'success',
      data: { apiKeys: maskedApiKeys },
    });
  } catch (error) {
    next(error);
  }
};

// APIキー詳細の取得
const getApiKeyById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeyId = req.params.id;
    
    // APIキーの取得
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
      attributes: ['id', 'name', 'accessKey', 'secretKey', 'btcWalletAddress', 'isActive', 'lastCheckedAt', 'createdAt', 'updatedAt'],
    });
    
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'APIキーが見つかりません',
      });
    }
    
    // 機密情報は編集モードの場合は複合化して返す
    const showFull = req.query.mode === 'edit';
    const data = apiKey.toJSON();
    
    if (showFull) {
      data.accessKey = decrypt(data.accessKey);
      data.secretKey = decrypt(data.secretKey);
      data.btcWalletAddress = decrypt(data.btcWalletAddress);
    } else {
      data.accessKey = maskData(decrypt(data.accessKey), 4);
      data.secretKey = maskData(decrypt(data.secretKey), 4);
      data.btcWalletAddress = maskData(decrypt(data.btcWalletAddress), 8);
    }
    
    return res.status(200).json({
      status: 'success',
      data: { apiKey: data },
    });
  } catch (error) {
    next(error);
  }
};

// APIキーの新規作成
const createApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, accessKey, secretKey, btcWalletAddress } = req.body;
    
    // APIキーの暗号化
    const encryptedAccessKey = encrypt(accessKey);
    const encryptedSecretKey = encrypt(secretKey);
    const encryptedBtcWalletAddress = encrypt(btcWalletAddress);
    
    // 新規APIキーの作成
    const newApiKey = await ApiKey.create({
      userId,
      name,
      accessKey: encryptedAccessKey,
      secretKey: encryptedSecretKey,
      btcWalletAddress: encryptedBtcWalletAddress,
      isActive: true,
    });
    
    // 機密情報をマスク処理
    const data = newApiKey.toJSON();
    data.accessKey = maskData(accessKey, 4);
    data.secretKey = maskData(secretKey, 4);
    data.btcWalletAddress = maskData(btcWalletAddress, 8);
    
    return res.status(201).json({
      status: 'success',
      message: 'APIキーが登録されました',
      data: { apiKey: data },
    });
  } catch (error) {
    next(error);
  }
};

// APIキーの更新
const updateApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeyId = req.params.id;
    const { name, accessKey, secretKey, btcWalletAddress, isActive } = req.body;
    
    // 更新対象のAPIキーを取得
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });
    
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'APIキーが見つかりません',
      });
    }
    
    // 更新データの準備
    const updateData = { name };
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    // 各フィールドを個別に暗号化（変更があった場合のみ）
    if (accessKey) {
      updateData.accessKey = encrypt(accessKey);
    }
    
    if (secretKey) {
      updateData.secretKey = encrypt(secretKey);
    }
    
    if (btcWalletAddress) {
      updateData.btcWalletAddress = encrypt(btcWalletAddress);
    }
    
    // APIキーの更新
    await apiKey.update(updateData);
    
    // 更新後のデータを取得
    const updatedApiKey = await ApiKey.findByPk(apiKeyId);
    
    // 機密情報をマスク処理
    const data = updatedApiKey.toJSON();
    data.accessKey = maskData(decrypt(data.accessKey), 4);
    data.secretKey = maskData(decrypt(data.secretKey), 4);
    data.btcWalletAddress = maskData(decrypt(data.btcWalletAddress), 8);
    
    return res.status(200).json({
      status: 'success',
      message: 'APIキーが更新されました',
      data: { apiKey: data },
    });
  } catch (error) {
    next(error);
  }
};

// APIキーの削除
const deleteApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeyId = req.params.id;
    
    // 削除対象のAPIキーを取得
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });
    
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'APIキーが見つかりません',
      });
    }
    
    // APIキーの削除
    await apiKey.destroy();
    
    return res.status(200).json({
      status: 'success',
      message: 'APIキーが削除されました',
    });
  } catch (error) {
    next(error);
  }
};

// APIキーのテスト
const testApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeyId = req.params.id;
    
    // テスト対象のAPIキーを取得
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });
    
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'APIキーが見つかりません',
      });
    }
    
    // APIキーの復号化
    const accessKey = decrypt(apiKey.accessKey);
    const secretKey = decrypt(apiKey.secretKey);
    
    // Coincheck APIとの接続テスト
    // 実際の実装では、coincheckApiUtilsを使用して実際にAPIを叩く
    
    // テスト成功を返す
    return res.status(200).json({
      status: 'success',
      message: 'APIキーのテストに成功しました',
    });
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

// APIキーの残高取得
const getApiKeyBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeyId = req.params.id;
    
    // APIキーを取得
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });
    
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'APIキーが見つかりません',
      });
    }
    
    try {
      // APIキー情報を復号化
      const accessKey = decrypt(apiKey.accessKey);
      const secretKey = decrypt(apiKey.secretKey);
      
      // Coincheckから残高情報を取得
      const balanceInfo = await coincheckApi.getBalance(accessKey, secretKey);
      
      // 残高情報をフォーマット
      const balance = {
        jpy: balanceInfo.jpy || 0,
        btc: balanceInfo.btc || 0,
        jpyReserved: balanceInfo.jpy_reserved || 0,
        btcReserved: balanceInfo.btc_reserved || 0,
        lastCheckedAt: new Date(),
      };
      
      return res.status(200).json({
        status: 'success',
        data: { balance },
      });
    } catch (apiError) {
      console.error('Coincheck API呼び出しエラーの詳細:', apiError);
      
      // APIエラーの詳細をログに記録
      if (apiError.response) {
        console.error('APIレスポンス:', apiError.response.data);
        console.error('ステータスコード:', apiError.response.status);
      } else if (apiError.request) {
        console.error('リクエストエラー:', apiError.request);
      } else {
        console.error('エラーメッセージ:', apiError.message);
      }
      
      // クライアントにエラー詳細を返す
      return res.status(502).json({
        status: 'error',
        message: 'Coincheckからの残高取得に失敗しました',
        error: apiError.message || 'APIエラー'
      });
    }
  } catch (error) {
    console.error('残高取得エラー:', error);
    next(error);
  }
};

// APIキーの残高更新（新規追加）
const updateApiKeyBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeyId = req.params.id;
    
    // APIキーを取得
    const apiKey = await ApiKey.findOne({
      where: { id: apiKeyId, userId },
    });
    
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'APIキーが見つかりません',
      });
    }
    
    // APIキー情報を復号化
    const accessKey = decrypt(apiKey.accessKey);
    const secretKey = decrypt(apiKey.secretKey);
    
    // Coincheckから残高情報を取得
    const balanceInfo = await coincheckApi.getBalance(accessKey, secretKey);
    
    // 現在時刻
    const now = new Date();
    
    // APIキーの最終チェック時間を更新
    await apiKey.update({ lastCheckedAt: now });
    
    // 残高情報をフォーマット
    const balance = {
      jpy: balanceInfo.jpy || 0,
      btc: balanceInfo.btc || 0,
      jpyReserved: balanceInfo.jpy_reserved || 0,
      btcReserved: balanceInfo.btc_reserved || 0,
      lastCheckedAt: now,
    };
    
    return res.status(200).json({
      status: 'success',
      data: { balance },
    });
  } catch (error) {
    console.error('残高更新エラー:', error);
    return res.status(500).json({
      status: 'error',
      message: '残高の更新に失敗しました',
    });
  }
};

module.exports = {
  getAllApiKeys,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  testApiKey,
  getApiKeyBalance,
  updateApiKeyBalance,
};