import axios from 'axios';

// APIクライアントのインスタンスを作成
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    // リクエスト送信前にローカルストレージからトークンを取得
    const token = localStorage.getItem('token');
    
    // トークンがある場合はヘッダーに追加
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 認証エラーの場合（401）
    if (error.response && error.response.status === 401) {
      // ログイン画面に戻す処理
      // ローカルストレージをクリア
      localStorage.removeItem('token');
      
      // ログインページへリダイレクト
      // 注意: この方法は理想的ではありませんが、シンプルな実装のために使用
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;