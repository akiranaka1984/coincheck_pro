import api from './api';

/**
 * トランザクション関連のAPI呼び出しを行うサービス
 */
class TransactionService {
  /**
   * トランザクション一覧を取得
   * @param {Object} params クエリパラメータ
   * @returns {Promise<Object>} トランザクションデータとページネーション情報
   */
  async getAllTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // パラメータを追加
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get(`/api/transactions${query}`);
      
      if (response.data.status === 'success') {
        return {
          transactions: response.data.data.transactions,
          pagination: response.data.data.pagination,
        };
      }
      
      throw new Error(response.data.message || '取引履歴の取得に失敗しました');
    } catch (error) {
      this._handleError(error, '取引履歴の取得に失敗しました');
    }
  }

  /**
   * トランザクションの詳細を取得
   * @param {number} id トランザクションID
   * @returns {Promise<Object>} トランザクション情報
   */
  async getTransactionById(id) {
    try {
      const response = await api.get(`/api/transactions/${id}`);
      
      if (response.data.status === 'success') {
        return response.data.data.transaction;
      }
      
      throw new Error(response.data.message || '取引詳細の取得に失敗しました');
    } catch (error) {
      this._handleError(error, '取引詳細の取得に失敗しました');
    }
  }

  /**
   * 手動取引を実行
   * @param {Object} data 取引データ
   * @returns {Promise<Object>} 実行結果
   */
  async executeManualTransaction(data) {
    try {
      const response = await api.post('/api/transactions/execute', data);
      
      if (response.data.status === 'success') {
        return response.data.data.transaction;
      }
      
      throw new Error(response.data.message || '取引の実行に失敗しました');
    } catch (error) {
      this._handleError(error, '取引の実行に失敗しました');
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

export default new TransactionService();