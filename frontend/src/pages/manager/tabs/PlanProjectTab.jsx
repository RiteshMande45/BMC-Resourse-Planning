import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { THEME_COLORS } from '../../../theme/theme';
import { checkAllocation } from '../../../utils/allocationRules';
import { createAllocation } from '../../../api/services/allocationService';
import { createTask } from '../../../api/services/taskService';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/dates';

export function PlanProjectTab({
  project,
  matches = [],
  tasks = [],
  allocations = [],
  onRefresh,
}) {
  const { showNotification } = useNotification();

  // Allocate dialog state
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [allocForm, setAllocForm] = useState({
    role: 'Developer',
    percent: 50,
    fromDate: '2026-04-01',
    toDate: '2026-10-31',
  });
  const [allocError, setAllocError] = useState(null);

  // Add Task dialog state
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    assigneeId: '',
    estimateHrs: 8,
    dueDate: '2026-11-20',
  });

  // Publish plan confirm dialog
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  const handleOpenAllocate = (person) => {
    setSelectedPerson(person);
    setAllocForm({
      role: person.designation || 'Developer',
      percent: person.freeOnStart > 0 ? Math.min(50, person.freeOnStart) : 50,
      fromDate: project?.startDate || '2026-04-01',
      toDate: project?.dueDate || '2027-03-31',
    });
    setAllocError(null);
    setAllocateOpen(true);
  };

  const handleConfirmAllocate = async () => {
    if (!selectedPerson) return;

    // Check client-side 100% rule
    const personExisting = allocations.filter((a) => a.employeeId === selectedPerson.id);
    const proposed = {
      employeeId: selectedPerson.id,
      employeeName: selectedPerson.name,
      projectId: project?.id || 'proj-1',
      projectName: project?.name || 'BMC Control-M',
      role: allocForm.role,
      percent: Number(allocForm.percent),
      fromDate: allocForm.fromDate,
      toDate: allocForm.toDate,
    };

    const ruleCheck = checkAllocation(personExisting, proposed);
    if (!ruleCheck.valid) {
      setAllocError(ruleCheck.message);
      return;
    }

    try {
      await createAllocation(proposed);
      showNotification(`Successfully allocated ${selectedPerson.name} (${allocForm.percent}%)`, 'success');
      setAllocateOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      setAllocError(err.message || 'Cannot complete allocation.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...taskForm,
        projectId: project?.id || 'proj-1',
        projectName: project?.name || 'BMC Control-M',
      });
      showNotification('Task created and added to plan', 'success');
      setTaskOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const matchColumns = [
    {
      field: 'name',
      headerName: 'Person',
      minWidth: 170,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.designation}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'skillMatch',
      headerName: 'Skill Match',
      minWidth: 160,
      renderCell: (row) => <ProgressCell percent={row.skillMatch} />,
    },
    {
      field: 'freeOnStart',
      headerName: 'Free on Start',
      minWidth: 120,
      align: 'center',
      renderCell: (row) => `${row.freeOnStart}%`,
    },
    {
      field: 'availability',
      headerName: 'Availability',
      minWidth: 140,
      renderCell: (row) => <StatusChip status={row.availability} />,
    },
    {
      field: 'score',
      headerName: 'Match Score',
      minWidth: 120,
      align: 'center',
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '1rem' }}>
          {row.score}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      minWidth: 110,
      align: 'right',
      renderCell: (row) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenAllocate(row)}
          sx={{
            py: 0.5,
            px: 2,
            backgroundColor: THEME_COLORS.primary,
            fontSize: '0.8125rem',
          }}
        >
          Allocate
        </Button>
      ),
    },
  ];

  const taskColumns = [
    { field: 'title', headerName: 'Task Title', minWidth: 200 },
    { field: 'assigneeName', headerName: 'Owner', minWidth: 140 },
    { field: 'estimateHrs', headerName: 'Est (Hrs)', minWidth: 90, align: 'center' },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      minWidth: 120,
      renderCell: (row) => formatDate(row.dueDate),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
  ];

  return (
    <Box>
      {/* 1. Project Summary Card (Matches Screenshot 2) */}
      <SectionCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 0.5 }}>
              {project?.name || 'BMC Control-M'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Client: {project?.client || 'BMC'} · {formatDate(project?.startDate || '2026-04-01')} – {formatDate(project?.dueDate || '2027-03-31')} · Budget: sample value
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(project?.technologies || ['Control-M', 'Python', 'React', 'PostgreSQL', 'AWS']).map((tech) => (
                <Chip key={tech} label={tech} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
          <StatusChip status="on_track" label="On track" />
        </Box>
      </SectionCard>

      {/* 2. Step 1: Find People (Matches Screenshot 2) */}
      <SectionCard
        title="1 · Find people"
        subtitle="match score = 60% skill match + 40% free % on start date"
        noPadding
        sx={{ mb: 3 }}
      >
        <DataTable columns={matchColumns} rows={matches} />
      </SectionCard>

      {/* 3. Step 2: Tasks & Milestones */}
      <SectionCard
        title="2 · Tasks & milestones"
        subtitle="Break down milestones and allocate work directly to assigned resources."
        noPadding
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={() => setTaskOpen(true)}>
              + Add Task
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setPublishConfirmOpen(true)}
              sx={{ backgroundColor: THEME_COLORS.primary }}
            >
              Publish plan to team
            </Button>
          </Box>
        }
      >
        <DataTable columns={taskColumns} rows={tasks.slice(0, 5)} />
      </SectionCard>

      {/* Allocate Dialog (MG-3 with 100% rule validation) */}
      <Dialog open={allocateOpen} onClose={() => setAllocateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Allocate {selectedPerson?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign <strong>{selectedPerson?.name}</strong> to project <strong>{project?.name || 'BMC Control-M'}</strong>. Total commitment cannot exceed 100% on any day.
          </Typography>

          {allocError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {allocError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Role on Project"
                fullWidth
                value={allocForm.role}
                onChange={(e) => setAllocForm({ ...allocForm, role: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Allocation % (1–100)"
                type="number"
                fullWidth
                inputProps={{ min: 1, max: 100 }}
                value={allocForm.percent}
                onChange={(e) => setAllocForm({ ...allocForm, percent: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={allocForm.fromDate}
                onChange={(e) => setAllocForm({ ...allocForm, fromDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={allocForm.toDate}
                onChange={(e) => setAllocForm({ ...allocForm, toDate: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAllocateOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmAllocate} variant="contained" color="primary">
            Confirm Allocation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={taskOpen} onClose={() => setTaskOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateTask}>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New Task</DialogTitle>
          <DialogContent>
            <TextField
              label="Task Title"
              fullWidth
              required
              sx={{ mb: 2, mt: 1 }}
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Estimate Hours"
                  type="number"
                  fullWidth
                  required
                  value={taskForm.estimateHrs}
                  onChange={(e) => setTaskForm({ ...taskForm, estimateHrs: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setTaskOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Publish Confirm Dialog */}
      <ConfirmDialog
        open={publishConfirmOpen}
        title="Publish Project Plan?"
        message="This will notify allocated team members and make scheduled tasks visible on their work dashboards."
        confirmLabel="Publish Now"
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={() => showNotification('Project plan published! Team members notified.', 'success')}
      />
    </Box>
  );
}

export default PlanProjectTab;

