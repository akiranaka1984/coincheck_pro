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
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as ExecuteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import transactionService from '../services/transactionService';
import apiKeyService from '../services/apiKeyService';
import { formatDateTime } from '../utils/dateUtils';

// 取引タイプに応じたチップのカラー
const getTypeColor = (type) => {
  switch (type) {
    case 'deposit':
      return 'primary';
    case 'purchase':
    case 'eth_purchase':
      return 'info';
    case 'transfer':
      return 'success';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

// 取引ステータスに応じたチップのカラー
const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

// 取引タイプの日本語名
const getTypeName = (type) => {
  switch (type) {
    case 'deposit':
      return '入金';
    case 'purchase':
      return 'BTC購入';
    case 'eth_purchase':
      return 'ETH購入';
    case 'transfer':
      return 'BTC送金';
    case 'eth_transfer':
      return 'ETH送金';
    case 'error':
      return 'エラー';
    default:
      return type;
  }
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  
  // 状態
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    limit: 10,
    pages: 0,
  });
  
  // 手動取引ダイアログ
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [executingTransaction, setExecutingTransaction] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    apiKeyId: '',
    amount: '',
    currency: 'BTC',
  });
  
  // 取引履歴の読み込み
  const loadTransactions = async (page = 0, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const { transactions: data, pagination: paginationData } = await transactionService.getAllTransactions({
        page: page + 1, // APIは1ベース、MUIは0ベース
        limit,
      });
      
      setTransactions(data);
      setPagination({
        ...paginationData,
        page, // MUIは0ベース
      });
    } catch (error) {
      console.error('取引履歴の取得に失敗:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 初回ロード
  useEffect(() => {
    loadTransactions();
  }, []);
  
  // ページネーション変更ハンドラ
  const handleChangePage = (event, newPage) => {
    loadTransactions(newPage, pagination.limit);
  };
  
  // 1ページあたりの件数変更ハンドラ
  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    loadTransactions(0, newLimit);
  };
  
  // 手動取引ダイアログを開く
  const handleOpenExecuteDialog = async () => {
    try {
      // APIキー一覧を取得
      const apiKeyList = await apiKeyService.getAllApiKeys();
      setApiKeys(apiKeyList.filter(key => key.isActive));
      
      // フォームをリセット
      setTransactionForm({
        apiKeyId: apiKeyList.length > 0 ? apiKeyList[0].id : '',
        amount: '',
        currency: 'BTC',
      });
      
      setExecuteDialogOpen(true);
    } catch (error) {
      console.error('APIキーの取得に失敗:', error);
      toast.error('APIキーの取得に失敗しました');
    }
  };
  
  // フォーム入力の変更ハンドラ
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm((prev) => ({ ...prev, [name]: value }));
  };
  
  // 手動取引を実行
  const handleExecuteTransaction = async () => {
    try {
      setExecutingTransaction(true);
      
      // バリデーション
      if (!transactionForm.apiKeyId || !transactionForm.amount) {
        toast.error('APIキーと金額を入力してください');
        return;
      }
      
      // 取引実行
      const result = await transactionService.executeManualTransaction(transactionForm);
      
      toast.success('取引を実行しました');
      
      // ダイアログを閉じる
      setExecuteDialogOpen(false);
      
      // 取引詳細ページに遷移
      navigate(`/transactions/${result.id}`);
    } catch (error) {
      console.error('取引実行に失敗:', error);
      toast.error(error.message || '取引の実行に失敗しました');
    } finally {
      setExecutingTransaction(false);
    }
  };
  
  // ローディング表示
  if (loading && transactions.length === 0) {
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
          取引履歴
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<ExecuteIcon />}
            onClick={handleOpenExecuteDialog}
            sx={{ mr: 1 }}
          >
            手動取引実行
          </Button>
          <IconButton
            onClick={() => loadTransactions(pagination.page, pagination.limit)}
            disabled={loading}
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>
      
      {/* 取引一覧 */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>日時</TableCell>
              <TableCell>種類</TableCell>
              <TableCell>APIキー</TableCell>
              <TableCell>金額</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeName(transaction.type)}
                      color={getTypeColor(transaction.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {transaction.apiKey ? transaction.apiKey.name : '-'}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 'deposit' && transaction.depositAmount ? 
                      `${transaction.depositAmount} BTC` : null}
                    {transaction.type === 'purchase' && transaction.purchaseAmount ? 
                      `${transaction.purchaseAmount} BTC` : null}
                    {transaction.type === 'eth_purchase' && transaction.purchaseAmount ? 
                      `${transaction.purchaseAmount} ETH` : null}
                    {transaction.type === 'transfer' && transaction.transferAmount ? 
                      `${transaction.transferAmount} BTC` : null}
                    {transaction.type === 'eth_transfer' && transaction.transferAmount ? 
                      `${transaction.transferAmount} ETH` : null}
                    {transaction.type === 'error' ? '-' : null}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="詳細を表示">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/transactions/${transaction.id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    取引履歴がありません
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* ページネーション */}
      {transactions.length > 0 && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="1ページあたりの件数:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} / ${count}`}
        />
      )}
      
      {/* 手動取引ダイアログ */}
      <Dialog
        open={executeDialogOpen}
        onClose={() => !executingTransaction && setExecuteDialogOpen(false)}
      >
        <DialogTitle>手動取引の実行</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            選択したAPIキーを使用して、指定した金額の日本円で暗号資産を購入し、<br />
            API設定で登録されたウォレットに送金します。
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="api-key-select-label">APIキー</InputLabel>
            <Select
              labelId="api-key-select-label"
              id="apiKeyId"
              name="apiKeyId"
              value={transactionForm.apiKeyId}
              onChange={handleFormChange}
              label="APIキー"
              disabled={executingTransaction || apiKeys.length === 0}
            >
              {apiKeys.length > 0 ? (
                apiKeys.map((apiKey) => (
                  <MenuItem key={apiKey.id} value={apiKey.id}>
                    {apiKey.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>有効なAPIキーがありません</MenuItem>
              )}
            </Select>
          </FormControl>
          
          {/* 通貨選択フォームの追加 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="currency-select-label">通貨</InputLabel>
            <Select
              labelId="currency-select-label"
              id="currency"
              name="currency"
              value={transactionForm.currency}
              onChange={handleFormChange}
              label="通貨"
              disabled={executingTransaction}
            >
              <MenuItem value="BTC">ビットコイン (BTC)</MenuItem>
              <MenuItem value="ETH">イーサリアム (ETH)</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            id="amount"
            name="amount"
            label="金額 (日本円)"
            type="number"
            value={transactionForm.amount}
            onChange={handleFormChange}
            disabled={executingTransaction}
            InputProps={{
              endAdornment: <Typography variant="body2">JPY</Typography>,
            }}
            helperText={`購入する${transactionForm.currency}の金額を日本円で入力してください`}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setExecuteDialogOpen(false)}
            disabled={executingTransaction}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleExecuteTransaction}
            color="primary"
            variant="contained"
            disabled={executingTransaction || !transactionForm.apiKeyId || !transactionForm.amount}
          >
            {executingTransaction ? <CircularProgress size={24} /> : '実行'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;