import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import apiKeyService from '../services/apiKeyService';
import { formatRelativeTime } from '../utils/dateUtils';

const ApiKeysPage = () => {
  const navigate = useNavigate();
  
  // 状態
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteApiKeyId, setDeleteApiKeyId] = useState(null);
  const [testingApiKeyId, setTestingApiKeyId] = useState(null);
  
  // APIキー一覧の読み込み
  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiKeyService.getAllApiKeys();
      setApiKeys(data);
    } catch (error) {
      console.error('APIキーの取得に失敗:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 初回ロード
  useEffect(() => {
    loadApiKeys();
  }, []);
  
  // APIキーのテスト
  const handleTestApiKey = async (id) => {
    try {
      setTestingApiKeyId(id);
      
      const success = await apiKeyService.testApiKey(id);
      
      if (success) {
        toast.success('APIキーのテストに成功しました');
      }
    } catch (error) {
      console.error('APIキーのテスト失敗:', error);
      toast.error(error.message || 'APIキーのテストに失敗しました');
    } finally {
      setTestingApiKeyId(null);
    }
  };
  
  // APIキーの削除ダイアログを表示
  const handleOpenDeleteDialog = (id) => {
    setDeleteApiKeyId(id);
    setDeleteDialogOpen(true);
  };
  
  // APIキーの削除を実行
  const handleDeleteApiKey = async () => {
    if (!deleteApiKeyId) return;
    
    try {
      const success = await apiKeyService.deleteApiKey(deleteApiKeyId);
      
      if (success) {
        toast.success('APIキーを削除しました');
        // 一覧を再読み込み
        loadApiKeys();
      }
    } catch (error) {
      console.error('APIキーの削除に失敗:', error);
      toast.error(error.message || 'APIキーの削除に失敗しました');
    } finally {
      // ダイアログを閉じる
      setDeleteDialogOpen(false);
      setDeleteApiKeyId(null);
    }
  };
  
  // ローディング表示
  if (loading && apiKeys.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* エラーアラート */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          APIキー管理
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/api-keys/new')}
            sx={{ mr: 1 }}
          >
            APIキー追加
          </Button>
          <IconButton
            onClick={loadApiKeys}
            disabled={loading}
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>
      
      {/* APIキー一覧 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>アクセスキー</TableCell>
              <TableCell>ウォレットアドレス</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>最終チェック</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>{apiKey.name}</TableCell>
                  <TableCell>{apiKey.accessKey}</TableCell>
                  <TableCell>{apiKey.btcWalletAddress}</TableCell>
                  <TableCell>
                    <Chip
                      label={apiKey.isActive ? '有効' : '無効'}
                      color={apiKey.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {apiKey.lastCheckedAt
                      ? formatRelativeTime(apiKey.lastCheckedAt)
                      : 'まだチェックされていません'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="テスト">
                      <IconButton
                        color="primary"
                        onClick={() => handleTestApiKey(apiKey.id)}
                        disabled={testingApiKeyId === apiKey.id}
                      >
                        {testingApiKeyId === apiKey.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <PlayArrowIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="編集">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/api-keys/${apiKey.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="削除">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(apiKey.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    APIキーが登録されていません
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/api-keys/new')}
                  >
                    APIキーを追加
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* APIキー削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>APIキーを削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このAPIキーを削除すると、関連する自動取引処理も停止します。<br />
            本当に削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteApiKey}
            color="error"
            variant="contained"
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeysPage;