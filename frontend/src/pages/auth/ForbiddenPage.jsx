import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME } from '../../constants/roles';

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user?.role && ROLE_HOME[user.role]) {
      navigate(ROLE_HOME[user.role]);
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          p: { xs: 3, sm: 5 },
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1 }}>
          403 — Access Forbidden
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You do not have permission to access this dashboard or resource with your current role.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleGoHome} sx={{ py: 1, px: 3 }}>
          Go to my dashboard
        </Button>
      </Card>
    </Box>
  );
}

export default ForbiddenPage;

