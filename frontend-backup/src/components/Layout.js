import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  VpnKey as VpnKeyIcon,
  CompareArrows as CompareArrowsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/images/logo0317.png';

// ドロワーの幅
const drawerWidth = 240;

// スタイル付きコンポーネント
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // ツールバーの下に余白を作成
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// レイアウトコンポーネント
const Layout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // ドロワーの開閉状態
  const [open, setOpen] = useState(true);
  
  // ユーザーメニューの状態
  const [anchorEl, setAnchorEl] = useState(null);
  const userMenuOpen = Boolean(anchorEl);
  
  // ドロワーを開く
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  // ドロワーを閉じる
  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  // ユーザーメニューを開く
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // ユーザーメニューを閉じる
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // ログアウト処理
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // メニュー項目
  const menuItems = [
    { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/' },
    { text: 'APIキー管理', icon: <VpnKeyIcon />, path: '/api-keys' },
    { text: '取引履歴', icon: <CompareArrowsIcon />, path: '/transactions' },
    { text: '設定', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  // 現在のパスに基づいてタイトルを取得
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'ダッシュボード';
    if (path === '/api-keys') return 'APIキー管理';
    if (path.startsWith('/api-keys/new')) return 'APIキー新規登録';
    if (path.startsWith('/api-keys/')) return 'APIキー詳細';
    if (path === '/transactions') return '取引履歴';
    if (path.startsWith('/transactions/')) return '取引詳細';
    if (path === '/settings') return '設定';
    
    return 'Coincheck 自動取引システム';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ヘッダー */}
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          
          {/* ユーザーメニュー */}
          <IconButton
            onClick={handleUserMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={userMenuOpen ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={userMenuOpen ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              プロフィール
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              ログアウト
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      
      {/* サイドバー */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <img 
            src={logoImage} 
            alt="TransFi Logo" 
            style={{ 
              height: 25, 
              marginRight: 10 
            }} 
          />
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* メインコンテンツ */}
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default Layout;