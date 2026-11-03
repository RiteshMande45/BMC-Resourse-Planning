import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME, ROLE_LABELS } from '../../constants/roles';
import { THEME_COLORS } from '../../theme/theme';
import { MOCK_USERS, MOCK_PASSWORD } from '../../mocks/users';
import { ElliotBrand, ElliotIcon } from '../../components/common/ElliotLogo';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export function LoginPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const isSessionExpired = queryParams.get('sessionExpired') === 'true';
  const returnTo = queryParams.get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(isSessionExpired ? 'Session expired, please sign in again.' : null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const user = await login(email, password);
      if (returnTo && !returnTo.includes('/login') && !returnTo.includes('/403')) {
        navigate(decodeURIComponent(returnTo));
      } else {
        navigate(ROLE_HOME[user.role] || '/');
      }
    } catch (err) {
      if (err.code === 'USER_INACTIVE') {
        setError('Your account is inactive. Contact HR or the Owner.');
      } else if (err.code === 'INVALID_CREDENTIALS' || err.status === 401) {
        setError('Invalid email or password.');
      } else if (!window.navigator.onLine || err.message?.includes('Network Error')) {
        setError('Cannot reach the server. Check that the backend is running on port 8000.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(MOCK_PASSWORD);
    setError(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Brand Panel (Desktop left) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ElliotIcon size={52} bracketColor="#FFFFFF" triangleColor="#FB6600" />
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '0.02em', color: '#FFFFFF', lineHeight: 1.2 }}>
              Resource Planning
            </Typography>
            <Typography variant="body2" sx={{ color: '#D1D5DB', letterSpacing: '0.02em', fontWeight: 500, mt: 0.5 }}>
              Elliot Systems Pvt Ltd
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 460 }}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2, lineHeight: 1.25 }}>
            Resource Planning & Talent Allocation.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, lineHeight: 1.6 }}>
            Consolidated resource planning, skill matching, timesheet submissions, and real-time portfolio tracking across enterprise projects.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          © 2026 Elliot Systems Pvt Ltd.
        </Typography>
      </Box>

      {/* Login Form (Right side) */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 4.5 },
            borderRadius: 3,
            boxShadow: isDark
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Mobile Logo Header: Resource Planning / Elliot Systems Pvt Ltd */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
            <ElliotIcon size={38} bracketColor={isDark ? '#FFFFFF' : '#0A0A0A'} triangleColor="#FB6600" />
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '0.02em', lineHeight: 1.2, color: isDark ? '#FFFFFF' : '#0A0A0A' }}>
                Resource Planning
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#D1D5DB' : '#6B7280', display: 'block', fontWeight: 500 }}>
                Elliot Systems Pvt Ltd
              </Typography>
            </Box>
          </Box>

          <Typography variant="h1" sx={{ fontSize: '1.625rem', fontWeight: 700, mb: 1 }}>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your credentials to access your dashboard.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              sx={{ mb: 2.5 }}
              placeholder="e.g. employee@test.com"
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              sx={{ py: 1.25, fontSize: '0.9375rem', mb: 3 }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
            </Button>
          </form>

          {/* Demo Accounts box (Rendered ONLY in mock mode) */}
          {USE_MOCK && (
            <Accordion
              defaultExpanded={false}
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '10px !important',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="caption" fontWeight={700} color="primary">
                  DEMO ACCOUNTS (CLICK TO AUTO-FILL)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Mock password for all: <strong>{MOCK_PASSWORD}</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {MOCK_USERS.filter((u) => u.email !== 'inactive@test.com').map((u) => (
                    <Box
                      key={u.email}
                      onClick={() => handleFillDemo(u.email)}
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor:
                          email === u.email
                            ? isDark
                              ? 'rgba(251, 102, 0, 0.25)'
                              : THEME_COLORS.primaryTint
                            : isDark
                            ? 'rgba(255, 255, 255, 0.03)'
                            : '#F9FAFB',
                        '&:hover': {
                          backgroundColor: isDark
                            ? 'rgba(251, 102, 0, 0.35)'
                            : THEME_COLORS.primaryTint,
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {u.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.email}
                        </Typography>
                      </Box>
                      <Chip label={ROLE_LABELS[u.role] || u.role} size="small" variant="outlined" />
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Card>
      </Box>
    </Box>
  );
}

export default LoginPage;

