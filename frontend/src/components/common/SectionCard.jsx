import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  sx = {},
  contentSx = {},
  noPadding = false,
}) {
  const theme = useTheme();

  return (
    <Card sx={{ mb: 3, ...sx }}>
      {(title || subtitle || actions) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            px: 3,
            pt: 2.5,
            pb: 1.5,
            borderBottom: noPadding ? `1px solid ${theme.palette.divider}` : 'none',
          }}
        >
          <Box>
            {title && (
              <Typography variant="h2" sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>}
        </Box>
      )}
      <CardContent sx={{ p: noPadding ? 0 : 3, '&:last-child': { pb: noPadding ? 0 : 3 }, ...contentSx }}>
        {children}
      </CardContent>
    </Card>
  );
}

export default SectionCard;

