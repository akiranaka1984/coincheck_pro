import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  CircularProgress, 
  Box,
  Divider 
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";
import balanceService from "../../services/balanceService";
import { formatCurrency, formatBitcoin } from "../../utils/formatters";

const ApiKeyBalance = ({ apiKeyId, btcPrice }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 残高情報の取得
  const fetchBalance = async () => {
    try {
      const balanceData = await balanceService.getBalanceByApiKey(apiKeyId);
      setBalance(balanceData);
      setError(null);
    } catch (error) {
      console.error("APIキーの残高取得に失敗:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード時に残高情報を取得
  useEffect(() => {
    if (apiKeyId) {
      fetchBalance();
    }
  }, [apiKeyId]);

  // 残高の手動更新
  const handleRefreshBalance = async () => {
    setRefreshing(true);
    try {
      await balanceService.updateBalance(apiKeyId);
      await fetchBalance();
    } catch (error) {
      console.error("残高の更新に失敗:", error);
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // ビットコイン価格の計算（JPY）
  const calculateBtcValue = (btc) => {
    if (!btc || !btcPrice) return 0;
    return parseFloat(btc) * parseFloat(btcPrice);
  };

  // 合計資産額の計算
  const calculateTotalAssets = () => {
    if (!balance) return 0;
    
    const { jpy, btc } = balance;
    
    const jpyBalance = parseFloat(jpy) || 0;
    const btcValue = calculateBtcValue(btc);
    
    return jpyBalance + btcValue;
  };

  // 残高の最終更新日時
  const getLastCheckedTime = () => {
    if (!balance || !balance.lastCheckedAt) return "まだ更新されていません";
    
    const date = new Date(balance.lastCheckedAt);
    return date.toLocaleString("ja-JP", { 
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <AccountBalanceWalletIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            残高情報
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            onClick={handleRefreshBalance}
            disabled={refreshing}
          >
            {refreshing ? "更新中..." : "残高更新"}
          </Button>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        ) : !balance ? (
          <Typography variant="body2" color="textSecondary">
            残高情報はまだ取得されていません。「残高更新」ボタンをクリックして更新してください。
          </Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  総資産額
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {formatCurrency(calculateTotalAssets())}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  最終更新
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {getLastCheckedTime()}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  日本円残高
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(balance.jpy || 0)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  取引中の日本円
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(balance.jpyReserved || 0)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  ビットコイン残高
                </Typography>
                <Typography variant="body1">
                  {formatBitcoin(balance.btc || 0)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  取引中のビットコイン
                </Typography>
                <Typography variant="body1">
                  {formatBitcoin(balance.btcReserved || 0)}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyBalance;
