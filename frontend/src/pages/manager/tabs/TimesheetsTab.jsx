import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { NoteDialog } from '../../../components/common/NoteDialog';
import { formatDate } from '../../../utils/dates';
import { approveTimesheet, returnTimesheet } from '../../../api/services/timesheetService';
import { useNotification } from '../../../context/NotificationContext';

export function TimesheetsTab({ weeks = [], loading = false, onRefresh }) {
  const { showNotification } = useNotification();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const handleApprove = async (weekId) => {
    try {
      await approveTimesheet(weekId);
      showNotification('Timesheet approved', 'success');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleOpenReturn = (week) => {
    setSelectedWeek(week);
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = async (note) => {
    if (!selectedWeek) return;
    try {
      await returnTimesheet(selectedWeek.id, note);
      showNotification('Timesheet returned to employee with note', 'warning');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const columns = [
    {
      field: 'employeeName',
      headerName: 'Employee',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employeeName}
        </Typography>
      ),
    },
    {
      field: 'weekStart',
      headerName: 'Week Commencing',
      minWidth: 140,
      renderCell: (row) => formatDate(row.weekStart),
    },
    {
      field: 'hours',
      headerName: 'Hours / Capacity',
      minWidth: 160,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {row.hoursLogged}h / {row.weeklyCapacity}h
          </Typography>
          {row.isOverCapacity && (
            <Chip
              label="> 110% Capacity"
              size="small"
              color="warning"
              sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 180,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 'submitted' && (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleApprove(row.id)}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleOpenReturn(row)}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Return
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <SectionCard
      title="Timesheet Approvals"
      subtitle="Verify weekly logged time against capacity. Submissions exceeding 110% of standard capacity are flagged."
      noPadding
      actions={
        <Button
          variant="outlined"
          size="small"
          onClick={() => showNotification('Reminders sent to all pending employees', 'info')}
        >
          Send Reminder
        </Button>
      }
    >
      <DataTable columns={columns} rows={weeks} loading={loading} />

      {/* Return Timesheet Dialog with mandatory note */}
      <NoteDialog
        open={returnDialogOpen}
        title="Return Timesheet for Correction"
        prompt={`Specify what needs correction in ${selectedWeek?.employeeName}'s timesheet for week ${formatDate(selectedWeek?.weekStart)}:`}
        placeholder="e.g. Hours on task #3 exceed allocated scope without explanation..."
        minLength={5}
        confirmLabel="Return Timesheet"
        confirmColor="error"
        onClose={() => setReturnDialogOpen(false)}
        onSubmit={handleConfirmReturn}
      />
    </SectionCard>
  );
}

export default TimesheetsTab;

