import React from 'react';
import Box from '@mui/material/Box';

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

export default KpiGrid;

