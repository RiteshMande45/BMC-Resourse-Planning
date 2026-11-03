import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export function TabPanelSet({ tabs = [], activeTab = 0, onChange, sx = {} }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, ...sx }}>
      <Tabs
        value={activeTab}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 44,
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
            height: 2.5,
            borderRadius: '2px 2px 0 0',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.9375rem',
            fontWeight: 500,
            minHeight: 44,
            minWidth: 'auto',
            px: { xs: 1.5, sm: 2.5 },
            py: 1,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
              fontWeight: 700,
            },
          },
        }}
      >
        {tabs.map((tab, idx) => (
          <Tab
            key={tab.label || idx}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            id={`tab-${idx}`}
            aria-controls={`tabpanel-${idx}`}
            disabled={tab.disabled}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 1 }}>{children}</Box>}
    </div>
  );
}

export default TabPanelSet;

