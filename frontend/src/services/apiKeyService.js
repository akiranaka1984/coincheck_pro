import api from './api';

/**
 * APIキー関連のAPI呼び出しを行うサービス
 */
class ApiKeyService {
  /**
   * APIキー一覧を取得
   * @returns {Promise<Array>} APIキーの配列
   */
  async getAllApiKeys() {
    try {
      const response = await api.get('/api/api-keys');
      
      if (response.data.status === 'success') {
        return response.data.data.apiKeys;
      }
      
      throw new Error(response.data.message || 'APIキーの取得に失敗しました');
    } catch (error) {
      this._handleError(error, 'APIキーの取得に失敗しました');
    }
  }

  /**
   * APIキーの詳細を取得
   * @param {number} id APIキーID
   * @param {boolean} edit 編集モードかどうか
   * @returns {Promise<Object>} APIキー情報
   */
  async getApiKeyById(id, edit = false) {
    try {
      const url = edit 
        ? `/api/api-keys/${id}?mode=edit`
        : `/api/api-keys/${id}`;
        
      const response = await api.get(url);
      
      if (response.data.status === 'success') {
        return response.data.data.apiKey;
      }
      
      throw new Error(response.data.message || 'APIキーの取得に失敗しました');
    } catch (error) {
      this._handleError(error, 'APIキーの取得に失敗しました');
    }
  }

  /**
   * 新しいAPIキーを作成
   * @param {Object} apiKeyData APIキーデータ
   * @returns {Promise<Object>} 作成されたAPIキー
   */
  async createApiKey(apiKeyData) {
    try {
      const response = await api.post('/api/api-keys', apiKeyData);
      
      if (response.data.status === 'success') {
        return response.data.data.apiKey;
      }
      
      throw new Error(response.data.message || 'APIキーの作成に失敗しました');
    } catch (error) {
      this._handleError(error, 'APIキーの作成に失敗しました');
    }
  }

  /**
   * APIキーを更新
   * @param {number} id APIキーID
   * @param {Object} apiKeyData 更新するAPIキーデータ
   * @returns {Promise<Object>} 更新されたAPIキー
   */
  async updateApiKey(id, apiKeyData) {
    try {
      const response = await api.put(`/api/api-keys/${id}`, apiKeyData);
      
      if (response.data.status === 'success') {
        return response.data.data.apiKey;
      }
      
      throw new Error(response.data.message || 'APIキーの更新に失敗しました');
    } catch (error) {
      this._handleError(error, 'APIキーの更新に失敗しました');
    }
  }

  /**
   * APIキーを削除
   * @param {number} id APIキーID
   * @returns {Promise<boolean>} 削除成功かどうか
   */
  async deleteApiKey(id) {
    try {
      const response = await api.delete(`/api/api-keys/${id}`);
      
      return response.data.status === 'success';
    } catch (error) {
      this._handleError(error, 'APIキーの削除に失敗しました');
    }
  }

  /**
   * APIキーをテスト
   * @param {number} id APIキーID
   * @returns {Promise<boolean>} テスト成功かどうか
   */
  async testApiKey(id) {
    try {
      const response = await api.post(`/api/api-keys/${id}/test`);
      
      return response.data.status === 'success';
    } catch (error) {
      this._handleError(error, 'APIキーのテストに失敗しました');
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

export default new ApiKeyService();