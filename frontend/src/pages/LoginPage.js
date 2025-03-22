import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error } = useAuth();
  
  // フォーム状態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 認証済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // フォーム送信ハンドラー
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!username || !password) {
      setFormError('ユーザー名とパスワードを入力してください');
      return;
    }
    
    setFormError('');
    setIsSubmitting(true);
    
    try {
      // ログイン処理
      const success = await login(username, password);
      
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setFormError(err.message || 'ログインに失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[8],
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <VpnKeyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography component="h1" variant="h5" align="center" gutterBottom>
                TransFi Login
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                ログインフォーム
              </Typography>
            </Box>
            
            {/* エラーメッセージ */}
            {(formError || error) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {formError || error}
              </Alert>
            )}
            
            {/* ログインフォーム */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="ユーザー名"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'ログイン'}
              </Button>
              
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                デモアカウント: admin / password
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;