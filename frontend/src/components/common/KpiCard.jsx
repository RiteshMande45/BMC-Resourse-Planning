import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function KpiCard({ label, value, caption, tone = 'neutral' }) {
  const theme = useTheme();

  // Render value nicely: if null or '₹—'
  let displayValue = value;
  if (value === null || value === undefined) {
    displayValue = '₹—';
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <CardContent sx={{ p: '16px 18px !important' }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: theme.palette.text.secondary,
            mb: 0.75,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', lg: '2rem' },
            lineHeight: 1.15,
            color: theme.palette.text.primary,
            mb: 0.5,
          }}
        >
          {displayValue}
        </Typography>

        {caption && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.8125rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiGrid({ children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      {children}
    </Box>
  );
}

export default KpiCard;

