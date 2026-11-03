import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { DRAWER_WIDTH } from '../../constants/navigation';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        <TopBar onMobileToggle={handleMobileToggle} />
        <Box
          sx={{
            flexGrow: 1,
            py: { xs: 2.5, md: 3.5 },
            px: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppShell;

