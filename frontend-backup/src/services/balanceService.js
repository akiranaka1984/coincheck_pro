import api from './api';

/**
 * 残高関連のAPI呼び出しを行うサービス
 */
class BalanceService {
  /**
   * ユーザーの総残高を取得
   * @returns {Promise<Object>} 総残高情報
   */
  async getTotalBalance() {
    try {
      const response = await api.get('/api/balance');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '残高の取得に失敗しました');
    } catch (error) {
      this._handleError(error, '残高の取得に失敗しました');
    }
  }

  /**
   * APIキーごとの残高を取得
   * @param {number} apiKeyId APIキーID
   * @returns {Promise<Object>} 残高情報
   */
  async getBalanceByApiKey(apiKeyId) {
    try {
      const response = await api.get(`/api/api-keys/${apiKeyId}/balance`);
      
      if (response.data.status === 'success') {
        return response.data.data.balance;
      }
      
      throw new Error(response.data.message || '残高の取得に失敗しました');
    } catch (error) {
      this._handleError(error, '残高の取得に失敗しました');
    }
  }

  /**
   * 残高を手動で更新
   * @param {number} apiKeyId APIキーID
   * @returns {Promise<Object>} 更新された残高情報
   */
  async updateBalance(apiKeyId) {
    try {
      const response = await api.post(`/api/api-keys/${apiKeyId}/balance/update`);
      
      if (response.data.status === 'success') {
        return response.data.data.balance;
      }
      
      throw new Error(response.data.message || '残高の更新に失敗しました');
    } catch (error) {
      this._handleError(error, '残高の更新に失敗しました');
    }
  }

  /**
   * エラーハンドリング
   * @private
   */
  _handleError(error, defaultMessage) {
    if (error.response) {
      // レート制限エラー
      if (error.response.status === 429) {
        throw new Error('APIリクエスト制限を超えました。しばらく待ってから再試行してください');
      }
      
      // その他のサーバーエラー
      throw new Error(error.response.data.message || defaultMessage);
    }
    
    // ネットワークエラーなど
    throw new Error('サーバーに接続できません。インターネット接続を確認してください。');
  }
}

export default new BalanceService();