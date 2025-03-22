import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Button,
  Link,
  Alert,
  Breadcrumbs,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

import transactionService from '../services/transactionService';
import { formatDateTime } from '../utils/dateUtils';

// 取引タイプに応じたチップのカラー
const getTypeColor = (type) => {
  switch (type) {
    case 'deposit':
      return 'primary';
    case 'purchase':
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
      return '購入';
    case 'transfer':
      return '送金';
    case 'error':
      return 'エラー';
    default:
      return type;
  }
};

const TransactionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 状態
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 取引情報の読み込み
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await transactionService.getTransactionById(id);
        setTransaction(data);
      } catch (error) {
        console.error('取引詳細の取得に失敗:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadTransaction();
  }, [id]);
  
  // ローディング表示
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
        >
          取引一覧に戻る
        </Button>
      </Box>
    );
  }
  
  // 取引情報がない場合
  if (!transaction) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          取引情報が見つかりませんでした
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
        >
          取引一覧に戻る
        </Button>
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
          onClick={() => navigate('/transactions')}
        >
          取引履歴
        </Link>
        <Typography color="text.primary">
          取引詳細 #{transaction.id}
        </Typography>
      </Breadcrumbs>
      
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReceiptIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            取引詳細 #{transaction.id}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
        >
          一覧に戻る
        </Button>
      </Box>
      
      {/* 取引情報カード */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                取引タイプ
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={getTypeName(transaction.type)}
                  color={getTypeColor(transaction.type)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                ステータス
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={transaction.status}
                  color={getStatusColor(transaction.status)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                日時
              </Typography>
              <Typography variant="body1">
                {formatDateTime(transaction.createdAt)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                APIキー
              </Typography>
              <Typography variant="body1">
                {transaction.apiKey ? (
                  <Link
                    component="button"
                    variant="body1"
                    onClick={() => navigate(`/api-keys/${transaction.apiKey.id}`)}
                  >
                    {transaction.apiKey.name}
                  </Link>
                ) : '-'}
              </Typography>
            </Grid>
            
            {/* 入金情報 */}
            {transaction.type === 'deposit' && (
              <>
                <Grid item xs={12}>
                  <Divider textAlign="left">入金情報</Divider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    入金ID
                  </Typography>
                  <Typography variant="body1">
                    {transaction.depositId || '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    入金額
                  </Typography>
                  <Typography variant="body1">
                    {transaction.depositAmount ? `${transaction.depositAmount} BTC` : '-'}
                  </Typography>
                </Grid>
              </>
            )}
            
            {/* 購入情報 */}
            {transaction.type === 'purchase' && (
              <>
                <Grid item xs={12}>
                  <Divider textAlign="left">購入情報</Divider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    注文ID
                  </Typography>
                  <Typography variant="body1">
                    {transaction.purchaseId || '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    購入量
                  </Typography>
                  <Typography variant="body1">
                    {transaction.purchaseAmount ? `${transaction.purchaseAmount} BTC` : '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    レート
                  </Typography>
                  <Typography variant="body1">
                    {transaction.purchaseRate ? `${transaction.purchaseRate} JPY/BTC` : '-'}
                  </Typography>
                </Grid>
              </>
            )}
            
            {/* 送金情報 */}
            {transaction.type === 'transfer' && (
              <>
                <Grid item xs={12}>
                  <Divider textAlign="left">送金情報</Divider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    送金ID
                  </Typography>
                  <Typography variant="body1">
                    {transaction.transferId || '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    送金量
                  </Typography>
                  <Typography variant="body1">
                    {transaction.transferAmount ? `${transaction.transferAmount} BTC` : '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    送金先アドレス
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {transaction.walletAddress || '-'}
                  </Typography>
                </Grid>
              </>
            )}
            
            {/* エラー情報 */}
            {transaction.type === 'error' && (
              <>
                <Grid item xs={12}>
                  <Divider textAlign="left">エラー情報</Divider>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    エラーメッセージ
                  </Typography>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {transaction.errorMessage || 'エラー詳細なし'}
                  </Alert>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
      
      {/* 生データ（rawData）があれば表示 */}
      {transaction.rawData && (
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Console log
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 300,
              }}
            >
              {JSON.stringify(transaction.rawData, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TransactionDetailPage;