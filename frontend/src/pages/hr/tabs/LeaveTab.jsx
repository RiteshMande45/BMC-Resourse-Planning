import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatDate } from '../../../utils/dates';

export function LeaveTab({ leaves = [], leaveSummary = {} }) {
  // Find clashes where employee has an approved leave overlapping a deliverable
  const clashes = leaves.filter((l) => l.clashTaskTitle);

  const columns = [
    {
      field: 'employeeName',
      headerName: 'Employee',
      minWidth: 150,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employeeName}
        </Typography>
      ),
    },
    { field: 'type', headerName: 'Leave Type', minWidth: 140 },
    {
      field: 'period',
      headerName: 'Leave Window',
      minWidth: 180,
      renderCell: (row) => `${formatDate(row.fromDate)} – ${formatDate(row.toDate)}`,
    },
    { field: 'days', headerName: 'Days', minWidth: 80, align: 'center' },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'clash',
      headerName: 'Schedule Clash Warning',
      minWidth: 260,
      renderCell: (row) =>
        row.clashTaskTitle ? (
          <Typography variant="caption" color="error.main" fontWeight={600}>
            Clashes with: "{row.clashTaskTitle}" (Due {formatDate(row.clashTaskDue)})
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">None</Typography>
        ),
    },
  ];

  return (
    <Box>
      {clashes.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Critical Schedule Conflict:</strong> {clashes.length} approved leave window overlaps with committed project task due dates. Please notify the assigned Project Manager.
        </Alert>
      )}

      <SectionCard
        title="Leave Management & Delivery Clashes (HR-5)"
        subtitle={`Live synchronization from HR portal · Last synced: ${leaveSummary.lastSynced || 'Today 08:30 AM'}`}
        noPadding
      >
        <DataTable columns={columns} rows={leaves} />
      </SectionCard>
    </Box>
  );
}

export default LeaveTab;

