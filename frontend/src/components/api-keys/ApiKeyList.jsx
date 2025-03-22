import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  CircularProgress
} from "@mui/material";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import apiKeyService from "../../services/apiKeyService";
import balanceService from "../../services/balanceService";
import { formatCurrency, formatBitcoin } from "../../utils/formatters";
import ConfirmDialog from "../common/ConfirmDialog";

const ApiKeyList = ({ onRefreshDashboard }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [error, setError] = useState(null);

  // APIキーと残高情報の取得
  const fetchApiKeys = async () => {
    try {
      const keys = await apiKeyService.getAllApiKeys();
      
      // 各APIキーの残高情報を取得
      const keysWithBalance = await Promise.all(
        keys.map(async (key) => {
          try {
            const balance = await balanceService.getBalanceByApiKey(key.id);
            return { ...key, balance };
          } catch (error) {
            console.error(`APIキー ${key.id} の残高取得に失敗:`, error);
            return { ...key, balance: null };
          }
        })
      );
      
      setApiKeys(keysWithBalance);
      setError(null);
    } catch (error) {
      console.error("APIキーの取得に失敗:", error);
      setError("APIキーの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード時にデータを取得
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // 選択したAPIキーの残高を更新
  const handleRefreshBalance = async (apiKeyId) => {
    setRefreshingId(apiKeyId);
    try {
      await balanceService.updateBalance(apiKeyId);
      await fetchApiKeys();
      if (onRefreshDashboard) {
        onRefreshDashboard();
      }
    } catch (error) {
      console.error("残高の更新に失敗:", error);
    } finally {
      setRefreshingId(null);
    }
  };

  // 削除ダイアログを開く
  const handleOpenDeleteDialog = (apiKey) => {
    setSelectedApiKey(apiKey);
    setDeleteDialogOpen(true);
  };

  // APIキーの削除
  const handleDeleteApiKey = async () => {
    if (!selectedApiKey) return;
    
    try {
      await apiKeyService.deleteApiKey(selectedApiKey.id);
      setApiKeys(apiKeys.filter(key => key.id !== selectedApiKey.id));
      if (onRefreshDashboard) {
        onRefreshDashboard();
      }
    } catch (error) {
      console.error("APIキーの削除に失敗:", error);
      setError("APIキーの削除に失敗しました。");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedApiKey(null);
    }
  };

  // 最終更新日時のフォーマット
  const formatLastChecked = (date) => {
    if (!date) return "未更新";
    return new Date(date).toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">APIキー一覧</Typography>
            <Button 
              component={Link} 
              to="/api-keys/new" 
              variant="contained" 
              color="primary"
            >
              新規APIキー登録
            </Button>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : apiKeys.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              登録されたAPIキーがありません。「新規APIキー登録」から追加してください。
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>名前</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>残高（JPY）</TableCell>
                    <TableCell>残高（BTC）</TableCell>
                    <TableCell>最終更新</TableCell>
                    <TableCell align="right">アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {apiKey.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={apiKey.isActive ? "アクティブ" : "無効"} 
                          color={apiKey.isActive ? "success" : "default"} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {apiKey.balance ? formatCurrency(apiKey.balance.jpy || 0) : "未取得"}
                      </TableCell>
                      <TableCell>
                        {apiKey.balance ? formatBitcoin(apiKey.balance.btc || 0) : "未取得"}
                      </TableCell>
                      <TableCell>
                        {formatLastChecked(apiKey.balance?.lastCheckedAt || apiKey.lastCheckedAt)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="残高更新">
                          <IconButton 
                            size="small" 
                            onClick={() => handleRefreshBalance(apiKey.id)}
                            disabled={refreshingId === apiKey.id}
                          >
                            {refreshingId === apiKey.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <RefreshIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="詳細">
                          <IconButton 
                            component={Link} 
                            to={`/api-keys/${apiKey.id}`} 
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="編集">
                          <IconButton 
                            component={Link} 
                            to={`/api-keys/${apiKey.id}/edit`} 
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="削除">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDeleteDialog(apiKey)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      
      <ConfirmDialog 
        open={deleteDialogOpen}
        title="APIキーの削除"
        content={`「${selectedApiKey?.name}」を削除してもよろしいですか？この操作は元に戻せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDeleteApiKey}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default ApiKeyList;
