import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  IconButton,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import dashboardService from '../services/dashboardService';
import balanceService from '../services/balanceService';
import apiKeyService from '../services/apiKeyService';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { formatCurrency, formatBitcoin } from '../utils/formatters';

// ChartJSの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 取引タイプに応じたチップのカラー
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

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // 状態
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // APIキー別残高情報の状態
  const [apiKeysWithBalance, setApiKeysWithBalance] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(0);
  
  // ダッシュボードデータの読み込み
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getDashboardInfo();
      setDashboardData(data);
      
      // BTC価格があれば設定
      if (data.currentPrice && data.currentPrice.jpy) {
        setBtcPrice(data.currentPrice.jpy);
      }
      
      // 残高情報も読み込む
      await loadApiKeysWithBalance();
    } catch (error) {
      console.error('ダッシュボード情報の取得に失敗:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // APIキー別残高情報の読み込み
  const loadApiKeysWithBalance = async () => {
    try {
      setBalanceLoading(true);
      
      // APIキー一覧を取得
      const apiKeys = await apiKeyService.getAllApiKeys();
      
      // 各APIキーの残高情報を取得
      const keysWithBalance = await Promise.all(
        apiKeys.map(async (key) => {
          try {
            // 残高情報を取得
            const balance = await balanceService.getBalanceByApiKey(key.id);
            return { ...key, balance };
          } catch (err) {
            console.error(`APIキー ${key.id} の残高取得に失敗:`, err);
            return { ...key, balance: null };
          }
        })
      );
      
      setApiKeysWithBalance(keysWithBalance.filter(key => key.isActive));
    } catch (err) {
      console.error('APIキー残高の取得に失敗:', err);
    } finally {
      setBalanceLoading(false);
    }
  };
  
  // 残高の更新
  const handleRefreshBalance = async (apiKeyId) => {
    try {
      await balanceService.updateBalance(apiKeyId);
      await loadApiKeysWithBalance();
    } catch (err) {
      console.error('残高の更新に失敗:', err);
    }
  };
  
  // 初回ロード
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // チャートデータの変換
  const getChartData = () => {
    if (!dashboardData || !dashboardData.dailyTransactions) return null;
    
    // 最新30日間のデータを取得
    const transactions = [...dashboardData.dailyTransactions].slice(-30);
    
    const labels = transactions.map(tx => formatDate(tx.date));
    const depositData = transactions.map(tx => parseFloat(tx.depositAmount) || 0);
    const purchaseData = transactions.map(tx => parseFloat(tx.purchaseAmount) || 0);
    
    return {
      labels,
      datasets: [
        {
          label: '入金量',
          data: depositData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
        {
          label: '購入量',
          data: purchaseData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
        },
      ],
    };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 11 // レジェンドのフォントサイズを小さく
          }
        }
      },
      title: {
        display: true,
        text: '日次取引量',
        font: {
          size: 13 // タイトルのフォントサイズを小さく
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10 // Y軸のフォントサイズを小さく
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10 // X軸のフォントサイズを小さく
          }
        }
      }
    },
  };
  
  // BTC価値の計算（JPY）
  const calculateBtcValue = (btcAmount) => {
    if (!btcAmount || !btcPrice) return 0;
    return parseFloat(btcAmount) * parseFloat(btcPrice);
  };
  
  // ローディング表示
  if (loading && !dashboardData) {
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
        <Typography variant="h5" component="h1" sx={{ 
          fontFamily: 'Arial Black, Arial, sans-serif', 
          fontWeight: 'bold',
          letterSpacing: '0.5px', // 文字間隔を少し広く
          fontSize: '1.6rem' // フォントサイズを少し小さく
        }}>
          Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/api-keys/new')}
            sx={{ mr: 1, textTransform: 'none', fontSize: '0.85rem' }}
          >
            APIキー追加
          </Button>
          <IconButton
            onClick={loadDashboardData}
            disabled={loading}
            color="primary"
            size="small"
          >
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>
      
      {/* APIキー別残高表示 */}
      <Card sx={{ mb: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CardHeader
          title="APIキー別残高"
          titleTypographyProps={{
            variant: 'h6',
            fontSize: '0.95rem',
            fontWeight: 500
          }}
          action={
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => loadApiKeysWithBalance()}
              disabled={balanceLoading}
              sx={{ fontSize: '0.75rem', textTransform: 'none' }}
            >
              残高更新
            </Button>
          }
          sx={{ padding: '12px 16px' }}
        />
        <Divider />
        <CardContent sx={{ padding: '12px 16px' }}>
          {balanceLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : apiKeysWithBalance.length > 0 ? (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>APIキー名</TableCell>
                    <TableCell align="right">JPY残高</TableCell>
                    <TableCell align="right">BTC残高</TableCell>
                    <TableCell align="right">BTC価値 (JPY)</TableCell>
                    <TableCell align="right">総資産額</TableCell>
                    <TableCell align="right">最終更新</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeysWithBalance.map((apiKey) => {
                    // 残高情報の取得
                    const balance = apiKey.balance || {};
                    
                    // 金額の計算
                    const jpyBalance = parseFloat(balance.jpy || 0) + parseFloat(balance.jpyReserved || 0);
                    const btcBalance = parseFloat(balance.btc || 0) + parseFloat(balance.btcReserved || 0);
                    const btcValueInJPY = calculateBtcValue(btcBalance);
                    const totalValue = jpyBalance + btcValueInJPY;
                    
                    return (
                      <TableRow key={apiKey.id}>
                        <TableCell>
                          <Typography variant="body2">{apiKey.name}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatCurrency(jpyBalance)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatBitcoin(btcBalance)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatCurrency(btcValueInJPY)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">{formatCurrency(totalValue)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {balance.lastCheckedAt ? formatDate(balance.lastCheckedAt) : '未取得'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleRefreshBalance(apiKey.id)}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                APIキーが登録されていないか、残高情報が取得できません。
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/api-keys/new')}
                sx={{ mt: 1 }}
              >
                APIキーを追加
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* 統計カード */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ padding: '16px', '&:last-child': { paddingBottom: '16px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" component="div" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  アクティブAPIキー
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="text.primary" sx={{ fontSize: '1.8rem', mb: 1 }}>
                {dashboardData?.activeApiKeys || 0}
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/api-keys')}
                sx={{ mt: 0, fontSize: '0.75rem', textTransform: 'none' }}
              >
                詳細を見る
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ padding: '16px', '&:last-child': { paddingBottom: '16px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'success.main', fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" component="div" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  総入金処理
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="text.primary" sx={{ fontSize: '1.8rem', mb: 1 }}>
                {dashboardData?.stats?.deposit?.completed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                完了: {dashboardData?.stats?.deposit?.completed || 0} /
                保留: {dashboardData?.stats?.deposit?.pending || 0} /
                失敗: {dashboardData?.stats?.deposit?.failed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ padding: '16px', '&:last-child': { paddingBottom: '16px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'info.main', fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" component="div" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  総購入処理
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="text.primary" sx={{ fontSize: '1.8rem', mb: 1 }}>
                {dashboardData?.stats?.purchase?.completed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                完了: {dashboardData?.stats?.purchase?.completed || 0} /
                保留: {dashboardData?.stats?.purchase?.pending || 0} /
                失敗: {dashboardData?.stats?.purchase?.failed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ padding: '16px', '&:last-child': { paddingBottom: '16px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CompareArrowsIcon sx={{ mr: 1, color: 'warning.main', fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" component="div" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  総送金処理
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="text.primary" sx={{ fontSize: '1.8rem', mb: 1 }}>
                {dashboardData?.stats?.transfer?.completed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                完了: {dashboardData?.stats?.transfer?.completed || 0} /
                保留: {dashboardData?.stats?.transfer?.pending || 0} /
                失敗: {dashboardData?.stats?.transfer?.failed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* チャートとリスト */}
      <Grid container spacing={2}>
        {/* チャート */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <CardHeader 
              title="取引量の推移" 
              titleTypographyProps={{ 
                variant: 'h6', 
                fontSize: '0.95rem',
                fontWeight: 500
              }}
              sx={{ padding: '12px 16px' }}
            />
            <Divider />
            <CardContent sx={{ padding: '12px 16px' }}>
              <Box sx={{ height: 350 }}>
                {getChartData() ? (
                  <Line data={getChartData()} options={chartOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      データがありません
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 最近の取引 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <CardHeader 
              title="最近の取引" 
              titleTypographyProps={{ 
                variant: 'h6', 
                fontSize: '0.95rem',
                fontWeight: 500
              }}
              action={
                <Button 
                  size="small" 
                  onClick={() => navigate('/transactions')}
                  sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                >
                  すべて表示
                </Button>
              }
              sx={{ padding: '12px 16px' }}
            />
            <Divider />
            <List sx={{ overflow: 'auto', maxHeight: 350, padding: 0 }}>
              {dashboardData?.recentTransactions?.length > 0 ? (
                dashboardData.recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem 
                      alignItems="flex-start"
                      sx={{ cursor: 'pointer', padding: '8px 16px' }}
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
                              取引 #{transaction.id}
                            </Typography>
                            <Chip 
                              label={transaction.status} 
                              size="small" 
                              color={getStatusColor(transaction.status)}
                              sx={{ height: '20px', fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.primary"
                              component="span"
                              sx={{ fontSize: '0.8rem' }}
                            >
                              {transaction.type === 'deposit' && `入金: ${transaction.depositAmount} BTC`}
                              {transaction.type === 'purchase' && `購入: ${transaction.purchaseAmount} BTC`}
                              {transaction.type === 'transfer' && `送金: ${transaction.transferAmount} BTC`}
                              {transaction.type === 'error' && 'エラー発生'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              {formatDateTime(transaction.createdAt)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ padding: '16px' }}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>取引がありません</Typography>}
                    secondary={<Typography variant="caption" sx={{ fontSize: '0.75rem' }}>取引データが登録されるとここに表示されます</Typography>}
                  />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;