import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  SentimentDissatisfied as SadIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
        <SadIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          404 - ページが見つかりません
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          お探しのページは存在しないか、移動された可能性があります。
          URLが正しいかご確認ください。
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          size="large"
        >
          ホームに戻る
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;