import api from './api';

/**
 * ダッシュボード関連のAPI呼び出しを行うサービス
 */
class DashboardService {
  /**
   * ダッシュボード情報を取得
   * @returns {Promise<Object>} ダッシュボード情報
   */
  async getDashboardInfo() {
    try {
      const response = await api.get('/api/dashboard');
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'ダッシュボード情報の取得に失敗しました');
    } catch (error) {
      this._handleError(error, 'ダッシュボード情報の取得に失敗しました');
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

export default new DashboardService();