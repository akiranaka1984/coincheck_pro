import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// 認証コンテキスト
const AuthContext = createContext(null);

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初回レンダリング時にローカルストレージからトークンを取得
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // トークンが存在する場合はユーザー情報を取得
          const userData = await authService.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // エラーが発生した場合はローカルストレージをクリア
        console.error('認証初期化エラー:', err);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setError('セッションの有効期限が切れました。再度ログインしてください。');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ログイン処理
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // 認証APIを呼び出す
      const { token, user } = await authService.login(username, password);
      
      // トークンをローカルストレージに保存
      localStorage.setItem('token', token);
      
      // ユーザー情報を設定
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      setError(err.message || 'ログインに失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const logout = () => {
    // ローカルストレージからトークンを削除
    localStorage.removeItem('token');
    
    // 状態をリセット
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // コンテキスト値
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 認証コンテキストを使用するためのフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};