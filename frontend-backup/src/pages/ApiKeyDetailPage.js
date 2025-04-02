import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Alert,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import apiKeyService from '../services/apiKeyService';

const ApiKeyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // 状態
  const [apiKey, setApiKey] = useState({
    name: '',
    accessKey: '',
    secretKey: '',
    btcWalletAddress: '',
    ethWalletAddress: '',
    cryptocurrencyType: 'btc', // デフォルトはBTC
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // パスワード表示の切り替え
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  // APIキー情報の読み込み（編集モードの場合）
  useEffect(() => {
    const loadApiKey = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiKeyService.getApiKeyById(id, true);
        setApiKey({
          ...data,
          cryptocurrencyType: data.cryptocurrencyType || 'btc' // デフォルト値の設定
        });
      } catch (error) {
        console.error('APIキーの取得に失敗:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKey();
  }, [id, isEditMode]);
  
  // フォーム入力の変更ハンドラ
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    // チェックボックス（Switch）の場合
    if (name === 'isActive') {
      setApiKey((prev) => ({ ...prev, [name]: checked }));
    } else {
      setApiKey((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // 選択された暗号資産タイプのウォレットアドレスバリデーション
      if (apiKey.cryptocurrencyType === 'btc' && !apiKey.btcWalletAddress) {
        setError('BTCを選択した場合、BTCウォレットアドレスは必須です');
        setSaving(false);
        return;
      }
      
      if (apiKey.cryptocurrencyType === 'eth' && !apiKey.ethWalletAddress) {
        setError('ETHを選択した場合、ETHウォレットアドレスは必須です');
        setSaving(false);
        return;
      }
      
      if (isEditMode) {
        // 既存APIキーの更新
        await apiKeyService.updateApiKey(id, apiKey);
        toast.success('APIキーを更新しました');
      } else {
        // 新規APIキーの作成
        await apiKeyService.createApiKey(apiKey);
        toast.success('APIキーを登録しました');
      }
      
      // APIキー一覧に戻る
      navigate('/api-keys');
    } catch (error) {
      console.error('APIキーの保存に失敗:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };
  
  // ローディング表示
  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* パンくずリスト */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          ホーム
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/api-keys')}
        >
          APIキー
        </Link>
        <Typography color="text.primary">
          {isEditMode ? 'APIキー編集' : 'APIキー追加'}
        </Typography>
      </Breadcrumbs>
      
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'APIキーの編集' : 'APIキーの追加'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/api-keys')}
        >
          一覧に戻る
        </Button>
      </Box>
      
      {/* エラーアラート */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* APIキーフォーム */}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  name="name"
                  label="APIキー名"
                  value={apiKey.name}
                  onChange={handleChange}
                  disabled={saving}
                  helperText="APIキーの識別に使用する名前を入力してください"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="accessKey"
                  name="accessKey"
                  label="アクセスキー"
                  value={apiKey.accessKey}
                  onChange={handleChange}
                  disabled={saving}
                  helperText="Coincheckで発行されたアクセスキーを入力してください"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="secretKey"
                  name="secretKey"
                  label="シークレットキー"
                  type={showSecretKey ? 'text' : 'password'}
                  value={apiKey.secretKey}
                  onChange={handleChange}
                  disabled={saving}
                  helperText="Coincheckで発行されたシークレットキーを入力してください"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="シークレットキーの表示切替"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          edge="end"
                        >
                          {showSecretKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* 暗号資産タイプ選択 */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="cryptocurrencyType-label">暗号資産タイプ</InputLabel>
                  <Select
                    labelId="cryptocurrencyType-label"
                    id="cryptocurrencyType"
                    name="cryptocurrencyType"
                    value={apiKey.cryptocurrencyType}
                    onChange={handleChange}
                    label="暗号資産タイプ"
                    disabled={saving}
                  >
                    <MenuItem value="btc">Bitcoin (BTC)</MenuItem>
                    <MenuItem value="eth">Ethereum (ETH)</MenuItem>
                  </Select>
                  <FormHelperText>
                    入金された日本円で購入する暗号資産の種類を選択してください
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              {/* BTC ウォレットアドレス */}
              <Grid item xs={12}>
                <TextField
                  required={apiKey.cryptocurrencyType === 'btc'}
                  fullWidth
                  id="btcWalletAddress"
                  name="btcWalletAddress"
                  label="送金先BTCウォレットアドレス"
                  value={apiKey.btcWalletAddress}
                  onChange={handleChange}
                  disabled={saving || apiKey.cryptocurrencyType !== 'btc'}
                  helperText="BTCを選択した場合、送金先BTCウォレットアドレスを入力してください"
                  error={apiKey.cryptocurrencyType === 'btc' && !apiKey.btcWalletAddress}
                />
              </Grid>
              
              {/* ETH ウォレットアドレス */}
              <Grid item xs={12}>
                <TextField
                  required={apiKey.cryptocurrencyType === 'eth'}
                  fullWidth
                  id="ethWalletAddress"
                  name="ethWalletAddress"
                  label="送金先ETHウォレットアドレス"
                  value={apiKey.ethWalletAddress || ''}
                  onChange={handleChange}
                  disabled={saving || apiKey.cryptocurrencyType !== 'eth'}
                  helperText="ETHを選択した場合、送金先ETHウォレットアドレスを入力してください"
                  error={apiKey.cryptocurrencyType === 'eth' && !apiKey.ethWalletAddress}
                />
              </Grid>
              
              {isEditMode && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={apiKey.isActive}
                        onChange={handleChange}
                        name="isActive"
                        color="primary"
                      />
                    }
                    label="このAPIキーを有効にする"
                  />
                  <Typography variant="body2" color="text.secondary">
                    無効にすると、このAPIキーでの自動取引が停止します
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/api-keys')}
                    disabled={saving}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {isEditMode ? '更新' : '登録'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiKeyDetailPage;