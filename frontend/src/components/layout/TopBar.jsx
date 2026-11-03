import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../../theme/ColorModeContext';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { ROLE_LABELS } from '../../constants/roles';
import { THEME_COLORS } from '../../theme/theme';
import { ElliotIcon } from '../common/ElliotLogo';

export function TopBar({ onMobileToggle }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotification();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'

  // Probe backend health status on mount
  useEffect(() => {
    let active = true;
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/health');
        if (res.ok) {
          const data = await res.json();
          if (active && data.status === 'healthy') {
            setBackendStatus('connected');
            return;
          }
        }
      } catch {
        // backend not reachable
      }
      if (active) {
        setBackendStatus('offline');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleNotifOpen = (event) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, minHeight: 64 }}>
        {/* Left: Mobile hamburger, Elliot Logo & Connection Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <ElliotIcon size={28} />
          </Box>

          {/* Backend Connection Status Badge */}
          <Tooltip
            title={
              backendStatus === 'connected'
                ? 'Backend API (port 8000) is running and healthy'
                : 'Backend API is currently offline. Operating on high-fidelity mock layer'
            }
          >
            <Chip
              size="small"
              label={
                backendStatus === 'connected'
                  ? 'API: Connected (8000)'
                  : 'API: Mock Mode'
              }
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                height: 24,
                backgroundColor:
                  backendStatus === 'connected'
                    ? isDark
                      ? 'rgba(34, 197, 94, 0.2)'
                      : '#DCFCE7'
                    : isDark
                    ? 'rgba(245, 158, 11, 0.2)'
                    : '#FEF3C7',
                color:
                  backendStatus === 'connected'
                    ? isDark
                      ? '#86EFAC'
                      : '#166534'
                    : isDark
                    ? '#FDE047'
                    : '#92400E',
                border: 'none',
              }}
            />
          </Tooltip>
        </Box>

        {/* Right tools: Theme toggle, Notifications, Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Theme Mode Toggle */}
          <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
            <IconButton onClick={toggleColorMode} color="inherit" size="small">
              {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Notifications Bell */}
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotifOpen} color="inherit" size="small">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Popover */}
          <Popover
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 340, p: 1, borderRadius: 3 } }}
          >
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllRead} sx={{ fontSize: '0.75rem', p: 0 }}>
                  Mark all read
                </Button>
              )}
            </Box>
            <Divider />
            <List dense sx={{ maxHeight: 280, overflowY: 'auto' }}>
              {notifications.map((n) => (
                <ListItem key={n.id} sx={{ px: 1.5, py: 1 }}>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={n.isRead ? 400 : 600}>{n.title}</Typography>}
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {n.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem' }}>
                          {n.time}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Popover>

          <Divider orientation="vertical" flexItem sx={{ my: 1.5, mx: 0.5 }} />

          {/* User Avatar + Name */}
          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 2,
              '&:hover': { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: THEME_COLORS.primary,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ROLE_LABELS[user?.role] || user?.role || ''}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            PaperProps={{ sx: { minWidth: 180, borderRadius: 2, mt: 1 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={logout} sx={{ gap: 1.5, color: 'error.main' }}>
              <LogoutOutlinedIcon fontSize="small" />
              Sign out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;

