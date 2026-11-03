import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';

export function AuditLogTab({ auditLog = [], loading = false }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const columns = [
    { field: 'when', headerName: 'When', minWidth: 150 },
    { field: 'user', headerName: 'User', minWidth: 140 },
    {
      field: 'table',
      headerName: 'Table',
      minWidth: 160,
      renderCell: (row) => <code>{row.table}</code>,
    },
    {
      field: 'action',
      headerName: 'Action',
      minWidth: 110,
      renderCell: (row) => {
        const colors = {
          INSERT: 'success',
          UPDATE: 'info',
          DELETE: 'error',
        };
        return <Chip label={row.action} size="small" color={colors[row.action] || 'default'} />;
      },
    },
    { field: 'record', headerName: 'Record ID', minWidth: 120 },
    {
      field: 'diff',
      headerName: 'Before → After (Snapshot)',
      minWidth: 260,
      renderCell: (row) => {
        const isExpanded = expandedId === row.id;
        return (
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleExpand(row.id)}
            >
              <Typography variant="caption" color="text.secondary">
                {isExpanded ? 'Hide changes' : 'View JSON changes'}
              </Typography>
              <IconButton size="small">
                {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={isExpanded}>
              <Box
                sx={{
                  p: 1.5,
                  mt: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 1.5,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                }}
              >
                <div><strong>Before:</strong> {JSON.stringify(row.before, null, 2) || 'null'}</div>
                <div><strong>After:</strong> {JSON.stringify(row.after, null, 2)}</div>
              </Box>
            </Collapse>
          </Box>
        );
      },
    },
  ];

  return (
    <SectionCard title="System Audit Trail & Event Logs" noPadding>
      <DataTable columns={columns} rows={auditLog} loading={loading} />
    </SectionCard>
  );
}

export default AuditLogTab;

