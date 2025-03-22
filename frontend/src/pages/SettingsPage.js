import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  ListItemText,
  ListItemIcon,
  MenuItem,
  MenuList,
  Paper,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  Sync as SyncIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/dateUtils';
import SyncSettingsContent from '../components/settings/SyncSettingsContent';

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 現在選択されているメニュー項目を管理するステート
  const [selectedMenu, setSelectedMenu] = useState('profile');

  // メニュー項目を選択したときのハンドラー
  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
  };

  // プロフィール情報のコンテンツ
  const renderProfileContent = () => (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            プロフィール情報
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                ユーザー名
              </Typography>
              <Typography variant="body1">
                {user?.username || '-'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                メールアドレス
              </Typography>
              <Typography variant="body1">
                {user?.email || '-'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                ロール
              </Typography>
              <Typography variant="body1">
                {user?.role === 'admin' ? '管理者' : 'ユーザー'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                最終ログイン
              </Typography>
              <Typography variant="body1">
                {user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : '-'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                登録日
              </Typography>
              <Typography variant="body1">
                {user?.createdAt ? formatDateTime(user.createdAt) : '-'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                アカウント設定
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Button variant="outlined" color="primary">
                プロフィールを編集
              </Button>
              <Button variant="outlined" color="primary" sx={{ ml: 2 }}>
                パスワードを変更
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );

  // セキュリティのコンテンツ
  const renderSecurityContent = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          セキュリティ設定
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Alert severity="info" sx={{ mb: 3 }}>
          この機能は現在開発中です。近日中に利用可能になります。
        </Alert>
        
        {/* ここにセキュリティ設定の内容を追加 */}
        <Typography variant="body1">
          セキュリティ設定では、アカウントの保護に関する設定を行います。
        </Typography>
      </CardContent>
    </Card>
  );

  // APIキー管理のコンテンツ
  const renderApiKeyContent = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          APIキー管理
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Alert severity="info" sx={{ mb: 3 }}>
          APIキー管理はメインメニューの「APIキー管理」から行えます。
        </Alert>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/api-keys')}
        >
          APIキー管理へ移動
        </Button>
      </CardContent>
    </Card>
  );

  // 自動同期設定のコンテンツ
  const renderSyncContent = () => (
    <SyncSettingsContent />
  );

  // 通知設定のコンテンツ
  const renderNotificationContent = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          通知設定
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Alert severity="info" sx={{ mb: 3 }}>
          この機能は現在開発中です。近日中に利用可能になります。
        </Alert>
        
        {/* ここに通知設定の内容を追加 */}
        <Typography variant="body1">
          通知設定では、取引完了時やエラー発生時の通知方法を設定できます。
        </Typography>
      </CardContent>
    </Card>
  );

  // システム情報のコンテンツ
  const renderSystemInfoContent = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          システム情報
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              システム名
            </Typography>
            <Typography variant="body1">
              Coincheck 自動取引システム
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              バージョン
            </Typography>
            <Typography variant="body1">
              1.0.0
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              最終更新日
            </Typography>
            <Typography variant="body1">
              2023-05-01
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              開発者
            </Typography>
            <Typography variant="body1">
              システム開発チーム
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // 選択されたメニューに応じたコンテンツを表示する関数
  const renderContent = () => {
    switch (selectedMenu) {
      case 'profile':
        return renderProfileContent();
      case 'security':
        return renderSecurityContent();
      case 'apiKey':
        return renderApiKeyContent();
      case 'sync':
        return renderSyncContent();
      case 'notification':
        return renderNotificationContent();
      case 'systemInfo':
        return renderSystemInfoContent();
      default:
        return renderProfileContent();
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* ヘッダー */}
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        設定
      </Typography>
      
      <Grid container spacing={3}>
        {/* サイドメニュー */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ width: '100%' }}>
            <MenuList>
              <MenuItem 
                selected={selectedMenu === 'profile'} 
                onClick={() => handleMenuSelect('profile')}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>プロフィール</ListItemText>
              </MenuItem>
              <MenuItem 
                selected={selectedMenu === 'security'} 
                onClick={() => handleMenuSelect('security')}
              >
                <ListItemIcon>
                  <SecurityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>セキュリティ</ListItemText>
              </MenuItem>
              <MenuItem 
                selected={selectedMenu === 'apiKey'} 
                onClick={() => handleMenuSelect('apiKey')}
              >
                <ListItemIcon>
                  <VpnKeyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>APIキー管理</ListItemText>
              </MenuItem>
              <MenuItem 
                selected={selectedMenu === 'sync'} 
                onClick={() => handleMenuSelect('sync')}
              >
                <ListItemIcon>
                  <SyncIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>自動同期設定</ListItemText>
              </MenuItem>
              <MenuItem 
                selected={selectedMenu === 'notification'} 
                onClick={() => handleMenuSelect('notification')}
              >
                <ListItemIcon>
                  <NotificationsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>通知設定</ListItemText>
              </MenuItem>
              <MenuItem 
                selected={selectedMenu === 'systemInfo'} 
                onClick={() => handleMenuSelect('systemInfo')}
              >
                <ListItemIcon>
                  <InfoIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>システム情報</ListItemText>
              </MenuItem>
            </MenuList>
          </Paper>
        </Grid>
        
        {/* メインコンテンツ */}
        <Grid item xs={12} md={9}>
          {renderContent()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;