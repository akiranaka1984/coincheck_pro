import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Grid, Button, CircularProgress, Box } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";
import dashboardService from "../services/dashboardService";
import balanceService from "../services/balanceService";
import { formatCurrency, formatBitcoin, formatEthereum } from "../utils/formatters";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  // ダッシュボードデータの取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("ダッシュボードデータの取得に失敗:", error);
      }
    };

    const fetchBalanceData = async () => {
      try {
        const balance = await balanceService.getTotalBalance();
        setBalanceData(balance);
      } catch (error) {
        console.error("残高データの取得に失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchBalanceData();
  }, []);

  // 残高の手動更新
  const handleRefreshBalance = async () => {
    setRefreshingBalance(true);
    try {
      // APIキーのリストを取得して各APIキーの残高を更新
      const apiKeys = dashboardData?.apiKeys || [];
      for (const apiKey of apiKeys) {
        await balanceService.updateBalance(apiKey.id);
      }
      
      // 更新後に残高を再取得
      const balance = await balanceService.getTotalBalance();
      setBalanceData(balance);
    } catch (error) {
      console.error("残高の更新に失敗:", error);
    } finally {
      setRefreshingBalance(false);
    }
  };

  // ビットコイン価格の計算（JPY）
  const calculateBtcValue = (btc, btcPrice) => {
    if (!btc || !btcPrice) return 0;
    return parseFloat(btc) * parseFloat(btcPrice);
  };

  // イーサリアム価格の計算（JPY）
  const calculateEthValue = (eth, ethPrice) => {
    if (!eth || !ethPrice) return 0;
    return parseFloat(eth) * parseFloat(ethPrice);
  };

  // 合計資産額の計算
  const calculateTotalAssets = () => {
    if (!balanceData || !dashboardData) return 0;
    
    const { jpy, btc, eth } = balanceData;
    const btcPrice = dashboardData.currentPrice?.jpy || 0;
    const ethPrice = dashboardData.currentPrice?.eth_jpy || 0;
    
    const jpyBalance = parseFloat(jpy) || 0;
    const btcValue = calculateBtcValue(btc, btcPrice);
    const ethValue = calculateEthValue(eth, ethPrice);
    
    return jpyBalance + btcValue + ethValue;
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        ダッシュボード
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* 残高情報カード */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="textSecondary">
                      総資産額
                    </Typography>
                    <AccountBalanceWalletIcon color="primary" />
                  </Box>
                  <Typography variant="h4">
                    {formatCurrency(calculateTotalAssets())}
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <Button
                      startIcon={<RefreshIcon />}
                      size="small"
                      onClick={handleRefreshBalance}
                      disabled={refreshingBalance}
                    >
                      {refreshingBalance ? "更新中..." : "残高更新"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    日本円残高
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(balanceData?.jpy || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    取引用: {formatCurrency(balanceData?.jpyReserved || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    BTC残高
                  </Typography>
                  <Typography variant="h4">
                    {formatBitcoin(balanceData?.btc || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    取引用: {formatBitcoin(balanceData?.btcReserved || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    BTC価値 (JPY)
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(
                      calculateBtcValue(
                        balanceData?.btc || 0, 
                        dashboardData?.currentPrice?.jpy || 0
                      )
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    現在価格: {formatCurrency(dashboardData?.currentPrice?.jpy || 0)}/BTC
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ETH残高情報カード */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    ETH残高
                  </Typography>
                  <Typography variant="h4">
                    {formatEthereum(balanceData?.eth || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    取引用: {formatEthereum(balanceData?.ethReserved || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    ETH価値 (JPY)
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(
                      calculateEthValue(
                        balanceData?.eth || 0, 
                        dashboardData?.currentPrice?.eth_jpy || 0
                      )
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    現在価格: {formatCurrency(dashboardData?.currentPrice?.eth_jpy || 0)}/ETH
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 既存のダッシュボード内容 */}
          {/* ... */}
        </>
      )}
    </div>
  );
};

export default Dashboard;