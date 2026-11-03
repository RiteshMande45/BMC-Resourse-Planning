import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';
import { THEME_COLORS } from '../../theme/theme';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS, ROLE_HOME } from '../../constants/roles';
import { useNavigate } from 'react-router-dom';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  hideRoleSwitcher = false,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, switchMockRole } = useAuth();
  const [roleAnchor, setRoleAnchor] = useState(null);

  const handleRoleClick = (e) => setRoleAnchor(e.currentTarget);
  const handleRoleClose = () => setRoleAnchor(null);

  const handleSelectRole = (r) => {
    switchMockRole(r);
    handleRoleClose();
    navigate(ROLE_HOME[r]);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3,
        pt: 1,
      }}
    >
      <Box>
        {eyebrow && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: THEME_COLORS.primary,
              mb: 0.5,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            color: theme.palette.text.primary,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mt: 0.5,
              fontSize: '0.9375rem',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Right side actions & Mock Role Switcher */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Mock Dev Role Switcher */}
        {USE_MOCK && !hideRoleSwitcher && (
          <>
            <Button
              variant="outlined"
              size="medium"
              onClick={handleRoleClick}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                fontSize: '0.875rem',
                py: 0.75,
                px: 2,
                '&:hover': {
                  borderColor: THEME_COLORS.primary,
                },
              }}
            >
              Viewing as: {ROLE_LABELS[user?.role] || user?.role || 'Role'}
            </Button>
            <Menu
              anchorEl={roleAnchor}
              open={Boolean(roleAnchor)}
              onClose={handleRoleClose}
              PaperProps={{ sx: { minWidth: 200, borderRadius: 2, mt: 1 } }}
            >
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                SWITCH VIEW (DEV MOCK)
              </Typography>
              {Object.values(ROLES).map((r) => (
                <MenuItem
                  key={r}
                  selected={user?.role === r}
                  onClick={() => handleSelectRole(r)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {ROLE_LABELS[r]}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {/* Custom Actions Slot (e.g. Log hours, Approve requests, New project) */}
        {actions}
      </Box>
    </Box>
  );
}

export default PageHeader;

