import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { createTimeEntry } from '../../api/services/timesheetService';
import { useNotification } from '../../context/NotificationContext';

export function LogHoursDialog({
  open,
  initialTask = null,
  tasks = [],
  leaves = [],
  onClose,
  onSuccess,
}) {
  const { showNotification } = useNotification();

  const [taskId, setTaskId] = useState('');
  const [workDate, setWorkDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [hours, setHours] = useState(3.5);
  const [note, setNote] = useState('');
  const [reasonOverEstimate, setReasonOverEstimate] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTaskId(initialTask?.id || (tasks[0]?.id || ''));
      setWorkDate(dayjs().format('YYYY-MM-DD'));
      setHours(3.5);
      setNote('');
      setReasonOverEstimate('');
      setError(null);
    }
  }, [open, initialTask, tasks]);

  const selectedTask = (tasks || []).find((t) => t.id === taskId);

  // Check if date is > 2 days back
  const diffDays = dayjs().diff(dayjs(workDate), 'day');
  const isOlderThanTwoDays = diffDays > 2;

  // Check if on leave
  const isOnLeave = (leaves || []).some(
    (l) =>
      l.status === 'approved' &&
      l.fromDate &&
      l.toDate &&
      workDate >= l.fromDate &&
      workDate <= l.toDate
  );

  // Check over-estimate (120% rule)
  const currentLogged = Number(selectedTask?.loggedHrs || 0);
  const estimate = Number(selectedTask?.estimateHrs || 8);
  const newCumulative = currentLogged + Number(hours || 0);
  const isOver120Percent = estimate > 0 && newCumulative > estimate * 1.2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskId) {
      setError('Please select a valid assigned task.');
      return;
    }
    if (isOnLeave) {
      setError('Cannot log work on an approved leave day.');
      return;
    }
    if (hours <= 0 || hours > 12) {
      setError('Logged hours must be between 0.5 and 12 hours.');
      return;
    }
    if (note.trim().length < 10) {
      setError('Note must be at least 10 characters long explaining the work.');
      return;
    }
    if (isOver120Percent && !reasonOverEstimate.trim()) {
      setError('A reason is required because total hours exceed 120% of estimate.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createTimeEntry({
        taskId,
        taskTitle: selectedTask?.title || 'Task',
        workDate,
        hours: Number(hours),
        note: note.trim(),
        reasonOverEstimate: reasonOverEstimate.trim() || null,
      });
      showNotification(`Successfully logged ${hours}h against ${selectedTask?.title || 'task'}`, 'success');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit time entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600 }}>Log Hours</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Record actual hours logged against an assigned project deliverable.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {isOlderThanTwoDays && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Date is older than 2 working days. This entry will require Project Manager approval.
            </Alert>
          )}

          {isOnLeave && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              You are marked on approved leave for this date.
            </Alert>
          )}

          <TextField
            select
            label="Assigned Task"
            fullWidth
            required
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          >
            {tasks.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.title} ({t.projectName})
              </MenuItem>
            ))}
          </TextField>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Work Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hours (Max 12h/day)"
                type="number"
                fullWidth
                required
                inputProps={{ step: 0.5, min: 0.5, max: 12 }}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </Grid>
          </Grid>

          {isOver120Percent && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Total hours ({newCumulative}h) exceed 120% of estimate ({estimate}h). Please state the reason below.
            </Alert>
          )}

          {isOver120Percent && (
            <TextField
              label="Reason for Exceeding Estimate"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={reasonOverEstimate}
              onChange={(e) => setReasonOverEstimate(e.target.value)}
              placeholder="e.g. Additional integration bugs and edge case handling..."
            />
          )}

          <TextField
            label="Work Summary / Description Note (Min 10 characters)"
            multiline
            rows={3}
            fullWidth
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe the tasks, features, or commits worked on..."
            helperText={`${note.trim().length}/10 min characters`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || isOnLeave || note.trim().length < 10}
          >
            Submit Hours
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LogHoursDialog;

