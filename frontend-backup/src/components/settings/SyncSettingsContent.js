import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import api from '../../services/api'; // パスを修正

// 自動同期設定のコンポーネント
const SyncSettingsContent = () => {
  // 設定値のステート
  const [settings, setSettings] = useState({
    isEnabled: true,
    balanceSyncInterval: 15, // 分単位
    depositCheckInterval: 5, // 分単位
    startTime: '00:00', // 文字列形式に変更
    endTime: '23:59', // 文字列形式に変更
    retryCount: 3,
    notifyOnError: true
  });

  // UI状態管理用のステート
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 設定値を読み込む
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // APIから設定を読み込む
        const response = await api.get('/api/settings/sync');
        
        if (response.data && response.data.status === 'success') {
          setSettings({
            ...response.data.data,
            startTime: response.data.data.startTime || '00:00',
            endTime: response.data.data.endTime || '23:59'
          });
        }
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
        setSnackbar({
          open: true,
          message: '設定の読み込みに失敗しました',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 入力値の変更ハンドラー
  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    
    if (name === 'isEnabled' || name === 'notifyOnError') {
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 設定の保存ハンドラー
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // APIに設定を保存
      const response = await api.post('/api/settings/sync', settings);
      
      if (response.data && response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: '設定を保存しました',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      setSnackbar({
        open: true,
        message: '設定の保存に失敗しました',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // スナックバーを閉じるハンドラー
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          自動同期設定
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* 自動同期の有効/無効 */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.isEnabled}
                  onChange={handleChange}
                  name="isEnabled"
                  color="primary"
                />
              }
              label="自動同期を有効にする"
            />
            <Typography variant="body2" color="text.secondary">
              ONにすると、設定した頻度で自動的にCoincheckと同期します
            </Typography>
          </Grid>
          
          {/* 残高同期頻度 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="balance-sync-interval-label">残高同期頻度</InputLabel>
              <Select
                labelId="balance-sync-interval-label"
                id="balanceSyncInterval"
                name="balanceSyncInterval"
                value={settings.balanceSyncInterval}
                label="残高同期頻度"
                onChange={handleChange}
                disabled={!settings.isEnabled}
              >
                <MenuItem value={5}>5分間隔</MenuItem>
                <MenuItem value={10}>10分間隔</MenuItem>
                <MenuItem value={15}>15分間隔</MenuItem>
                <MenuItem value={30}>30分間隔</MenuItem>
                <MenuItem value={60}>1時間間隔</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Coincheckの残高情報を更新する頻度
            </Typography>
          </Grid>
          
          {/* 入金確認頻度 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="deposit-check-interval-label">入金確認頻度</InputLabel>
              <Select
                labelId="deposit-check-interval-label"
                id="depositCheckInterval"
                name="depositCheckInterval"
                value={settings.depositCheckInterval}
                label="入金確認頻度"
                onChange={handleChange}
                disabled={!settings.isEnabled}
              >
                <MenuItem value={1}>1分間隔</MenuItem>
                <MenuItem value={3}>3分間隔</MenuItem>
                <MenuItem value={5}>5分間隔</MenuItem>
                <MenuItem value={10}>10分間隔</MenuItem>
                <MenuItem value={15}>15分間隔</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              新しい入金があるか確認する頻度
            </Typography>
          </Grid>
          
          {/* 同期開始時間 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="startTime"
              name="startTime"
              label="同期開始時間 (HH:MM)"
              type="time"
              value={settings.startTime}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5分単位
              }}
              disabled={!settings.isEnabled}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              自動同期を開始する時間
            </Typography>
          </Grid>
          
          {/* 同期終了時間 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="endTime"
              name="endTime"
              label="同期終了時間 (HH:MM)"
              type="time"
              value={settings.endTime}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5分単位
              }}
              disabled={!settings.isEnabled}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              自動同期を終了する時間（この時間以降は同期しません）
            </Typography>
          </Grid>
          
          {/* リトライ回数 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="retryCount"
              name="retryCount"
              label="失敗時のリトライ回数"
              type="number"
              value={settings.retryCount}
              onChange={handleChange}
              disabled={!settings.isEnabled}
              InputProps={{ inputProps: { min: 0, max: 10 } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              同期に失敗した場合のリトライ回数
            </Typography>
          </Grid>
          
          {/* エラー通知 */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnError}
                  onChange={handleChange}
                  name="notifyOnError"
                  color="primary"
                  disabled={!settings.isEnabled}
                />
              }
              label="エラー発生時に通知する"
            />
            <Typography variant="body2" color="text.secondary">
              同期エラーが発生した場合に通知します
            </Typography>
          </Grid>
          
          {/* 注意事項 */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                ⚠️ 注意: 同期頻度を短くしすぎると、Coincheck APIの利用制限にかかる可能性があります。推奨値は残高同期15分以上、入金確認5分以上です。
              </Typography>
            </Alert>
          </Grid>
          
          {/* 保存ボタン */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving && <CircularProgress size={20} />}
              >
                {saving ? '保存中...' : '設定を保存'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      
      {/* 通知用スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default SyncSettingsContent;