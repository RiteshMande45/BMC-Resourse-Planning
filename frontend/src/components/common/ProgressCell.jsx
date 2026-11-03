import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { THEME_COLORS } from '../../theme/theme';

export function ProgressCell({ percent, timePercent, label }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const val = Math.min(100, Math.max(0, Number(percent || 0)));
  const trackBg = isDark ? '#334155' : '#E5E7EB';
  const barColor = THEME_COLORS.primary;

  // If both workPercent & timePercent are provided (e.g. 62% / 58%)
  const displayLabel = label || (timePercent !== undefined ? `${val}% / ${timePercent}%` : `${val}%`);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
      <Box
        sx={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          backgroundColor: trackBg,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${val}%`,
            borderRadius: 3,
            backgroundColor: barColor,
            transition: 'width 0.4s ease-in-out',
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: theme.palette.text.primary,
          whiteSpace: 'nowrap',
          minWidth: 40,
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );
}

export default ProgressCell;

