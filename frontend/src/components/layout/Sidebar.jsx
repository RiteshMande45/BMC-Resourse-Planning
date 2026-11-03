import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { DASHBOARD_NAV_ITEMS, DRAWER_WIDTH } from '../../constants/navigation';
import { ROLES } from '../../constants/roles';
import { THEME_COLORS } from '../../theme/theme';
import { useAuth } from '../../hooks/useAuth';
import { ElliotBrand } from '../common/ElliotLogo';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export function Sidebar({ mobileOpen, onMobileClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const location = useLocation();
  const { user } = useAuth();

  // In mock mode, show all dashboards so reviewer can switch easily;
  // In real mode, show only the user's dashboard (Owner sees all)
  const visibleDashboardItems = DASHBOARD_NAV_ITEMS.filter((item) => {
    if (USE_MOCK) return true;
    if (user?.role === ROLES.OWNER) return true;
    return item.role === user?.role;
  });

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Brand Header: Elliot Logo with Resource Planning / Elliot Systems Pvt Ltd */}
      <Box sx={{ p: 2.5 }}>
        <ElliotBrand
          title="Resource Planning"
          subtitle="Elliot Systems Pvt Ltd"
          iconSize={38}
        />
      </Box>

      <Divider />

      {/* Nav List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
        {/* DASHBOARDS Group */}
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: 'block',
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.palette.text.secondary,
          }}
        >
          DASHBOARDS
        </Typography>

        <List disablePadding sx={{ mb: 3 }}>
          {visibleDashboardItems.map((item) => {
            const isSelected = location.pathname.startsWith(item.path);
            const activeBg = isDark ? 'rgba(251, 102, 0, 0.22)' : THEME_COLORS.primaryTint;
            const activeColor = THEME_COLORS.primary;

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.75 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={() => onMobileClose && onMobileClose()}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 2,
                    backgroundColor: isSelected ? activeBg : 'transparent',
                    color: isSelected ? activeColor : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: isSelected
                        ? activeBg
                        : isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? activeColor : 'inherit',
                          fontSize: '0.9375rem',
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? activeColor : theme.palette.text.secondary,
                          opacity: isSelected ? 0.9 : 1,
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      aria-label="navigation drawers"
    >
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: (t) => `1px solid ${t.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;

