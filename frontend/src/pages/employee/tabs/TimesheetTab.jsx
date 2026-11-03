import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusChip } from '../../../components/common/StatusChip';
import { submitWeek } from '../../../api/services/timesheetService';
import { useNotification } from '../../../context/NotificationContext';

export function TimesheetTab({ tasks = [], onOpenLogHours }) {
  const { showNotification } = useNotification();
  const [weekStatus, setWeekStatus] = useState('draft');

  const days = ['Mon (2 Nov)', 'Tue (3 Nov)', 'Wed (4 Nov)', 'Thu (5 Nov)', 'Fri (6 Nov)'];

  const gridData = [
    { task: 'Write API tests', project: 'BMC Control-M', hours: [0, 0, 0, 0, 0], total: 0 },
    { task: 'Build allocation form', project: 'BMC Control-M', hours: [3.5, 0, 0, 0, 0], total: 3.5 },
  ];

  const dailyTotals = [3.5, 0, 0, 0, 0];
  const weeklyTotal = 3.5;
  const weeklyCapacity = 40;

  const handleSubmitWeek = async () => {
    try {
      await submitWeek('2026-11-02');
      setWeekStatus('submitted');
      showNotification('Timesheet submitted for manager review', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <Box>
      <SectionCard
        title="Weekly Timesheet (2 Nov 2026 – 6 Nov 2026)"
        subtitle="Log actual daily hours across tasks. Submit on Friday for manager approval."
        noPadding
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StatusChip status={weekStatus} />
            <Button
              variant="contained"
              color="primary"
              disabled={weekStatus === 'approved' || weekStatus === 'submitted'}
              onClick={handleSubmitWeek}
            >
              Submit Week
            </Button>
          </Box>
        }
      >
        {weekStatus === 'returned' && (
          <Alert severity="error" sx={{ m: 2.5, borderRadius: 2 }}>
            <strong>Manager Note:</strong> Please verify hours logged on Thursday. Deliverable scope was revised.
          </Alert>
        )}

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 220 }}>TASK & PROJECT</TableCell>
                {days.map((d) => (
                  <TableCell key={d} align="center" sx={{ minWidth: 90 }}>
                    {d}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ minWidth: 100, fontWeight: 700 }}>
                  TOTAL
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gridData.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.task}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.project}
                    </Typography>
                  </TableCell>
                  {row.hours.map((h, hIdx) => (
                    <TableCell key={hIdx} align="center">
                      <Typography variant="body2" fontWeight={h > 0 ? 700 : 400}>
                        {h > 0 ? `${h}h` : '—'}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700} color="primary">
                      {row.total}h
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}

              {/* Summary Row */}
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Daily Totals (Capacity: {weeklyCapacity}h)
                  </Typography>
                </TableCell>
                {dailyTotals.map((tot, idx) => (
                  <TableCell key={idx} align="center">
                    <Typography variant="body2" fontWeight={700}>
                      {tot}h
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={800} color="primary">
                    {weeklyTotal}h
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Box>
  );
}

export default TimesheetTab;

