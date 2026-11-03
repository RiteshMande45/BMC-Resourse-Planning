import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatDate } from '../../../utils/dates';

export function LeaveTab({ leaves = [], leaveSummary = {} }) {
  const columns = [
    { field: 'type', headerName: 'Leave Type', minWidth: 140 },
    {
      field: 'period',
      headerName: 'Dates',
      minWidth: 180,
      renderCell: (row) => `${formatDate(row.fromDate)} – ${formatDate(row.toDate)}`,
    },
    {
      field: 'days',
      headerName: 'Duration',
      minWidth: 110,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{row.days} day(s)</span>
          {row.halfDay && <Chip label="Half day" size="small" variant="outlined" />}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    { field: 'syncedAt', headerName: 'Synced From Portal', minWidth: 160 },
  ];

  const issueColumns = [
    { field: 'row', headerName: 'Row #', minWidth: 80 },
    { field: 'employee', headerName: 'Employee', minWidth: 160 },
    { field: 'reason', headerName: 'Import Rejection Reason', minWidth: 300 },
  ];

  return (
    <Box>
      {/* Balance & Sync Overview */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <SectionCard sx={{ mb: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              LEAVE BALANCE
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ mt: 0.5 }}>
              {leaveSummary?.balance ?? 14} Days
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Available casual & privilege leave remaining
            </Typography>
          </SectionCard>
        </Grid>

        <Grid item xs={12} sm={6}>
          <SectionCard sx={{ mb: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              HR PORTAL STATUS
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
              Synced {leaveSummary?.lastSynced || 'Today at 08:30 AM'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Automated sync connects HR Leave System & Google Sheets
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Leave History Table */}
      <SectionCard title="My Leave History" noPadding sx={{ mb: 3 }}>
        <DataTable columns={columns} rows={leaves || []} />
      </SectionCard>

      {/* Import Issues list */}
      <SectionCard title="HR Portal & Sheet Sync Exceptions" subtitle="Rows rejected during latest batch synchronization" noPadding>
        <DataTable columns={issueColumns} rows={leaveSummary?.importIssues || []} />
      </SectionCard>
    </Box>
  );
}

export default LeaveTab;

