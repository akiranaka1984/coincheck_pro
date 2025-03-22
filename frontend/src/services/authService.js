import api from './api';

/**
 * 認証関連のAPI呼び出しを行うサービス
 */
class AuthService {
  /**
   * ログイン処理
   * @param {string} username ユーザー名
   * @param {string} password パスワード
   * @returns {Promise<Object>} ログイン結果（トークンとユーザー情報）
   */
  async login(username, password) {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      
      if (response.data.status === 'success') {
        return {
          token: response.data.data.token,
          user: response.data.data.user,
        };
      }
      
      throw new Error(response.data.message || 'ログインに失敗しました');
    } catch (error) {
      if (error.response) {
        // サーバーからのエラーレスポンス
        throw new Error(error.response.data.message || 'ログインに失敗しました');
      }
      
      // ネットワークエラーなど
      throw new Error('サーバーに接続できません。インターネット接続を確認してください。');
    }
  }

  /**
   * ユーザープロフィール取得
   * @returns {Promise<Object>} ユーザー情報
   */
  async getProfile() {
    try {
      const response = await api.get('/api/auth/profile');
      
      if (response.data.status === 'success') {
        return response.data.data.user;
      }
      
      throw new Error(response.data.message || 'プロフィール取得に失敗しました');
    } catch (error) {
      if (error.response) {
        // サーバーからのエラーレスポンス
        throw new Error(error.response.data.message || 'プロフィール取得に失敗しました');
      }
      
      // ネットワークエラーなど
      throw new Error('サーバーに接続できません。インターネット接続を確認してください。');
    }
  }
}

export default new AuthService();