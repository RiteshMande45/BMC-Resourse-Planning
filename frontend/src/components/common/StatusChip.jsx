import React from 'react';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { getStatusConfig } from '../../constants/statuses';
import { THEME_COLORS } from '../../theme/theme';

export function StatusChip({ status, label: customLabel, tone: customTone, size = 'small', sx = {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const config = getStatusConfig(status);
  const displayLabel = customLabel || config.label;
  const tone = customTone || config.tone || 'neutral';

  const chipPalette = isDark ? THEME_COLORS.chipsDark : THEME_COLORS.chips;
  const colors = chipPalette[tone] || chipPalette.neutral;

  return (
    <Chip
      size={size}
      label={displayLabel}
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 24,
        borderRadius: '6px',
        border: 'none',
        ...sx,
      }}
    />
  );
}

export default StatusChip;

