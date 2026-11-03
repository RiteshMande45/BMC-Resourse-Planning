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
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatDate } from '../../../utils/dates';
import { createResourceRequest } from '../../../api/services/resourceRequestService';
import { useNotification } from '../../../context/NotificationContext';
import { MOCK_SKILLS } from '../../../mocks/skills';

export function StaffingRequestsTab({
  staffing = [],
  requests = [],
  projects = [],
  onRefresh,
}) {
  const { showNotification } = useNotification();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    projectId: 'proj-1',
    kind: 'current',
    fromDate: '2026-11-15',
    toDate: '2027-03-31',
    note: '',
    lines: [{ skillId: 'skl-6', skillName: 'AWS', peopleCount: 1, percent: 100 }],
  });

  const handleAddLine = () => {
    setRequestForm((prev) => ({
      ...prev,
      lines: [...prev.lines, { skillId: 'skl-3', skillName: 'Python', peopleCount: 1, percent: 100 }],
    }));
  };

  const handleRemoveLine = (idx) => {
    setRequestForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const handleLineChange = (index, field, value) => {
    setRequestForm((prev) => {
      const newLines = [...prev.lines];
      newLines[index] = { ...newLines[index], [field]: value };
      if (field === 'skillId') {
        const found = MOCK_SKILLS.find((s) => s.id === value);
        newLines[index].skillName = found?.name || 'Skill';
      }
      return { ...prev, lines: newLines };
    });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await createResourceRequest(requestForm);
      showNotification('Resource staffing request sent to Owner', 'success');
      setRequestDialogOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const staffingColumns = [
    { field: 'skill', headerName: 'Required Technology', minWidth: 160 },
    {
      field: 'coveredBy',
      headerName: 'Allocated on Team',
      minWidth: 200,
      renderCell: (row) =>
        row.coveredBy?.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {row.coveredBy.map((name) => (
              <Chip key={name} label={name} size="small" />
            ))}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">None</Typography>
        ),
    },
    {
      field: 'freeCount',
      headerName: 'Other People Free',
      minWidth: 140,
      align: 'center',
    },
    {
      field: 'status',
      headerName: 'Staffing Status',
      minWidth: 120,
      renderCell: (row) => (
        <StatusChip
          label={row.status}
          tone={row.status === 'Covered' ? 'success' : 'danger'}
        />
      ),
    },
  ];

  const requestColumns = [
    { field: 'projectName', headerName: 'Project', minWidth: 140 },
    {
      field: 'lines',
      headerName: 'Skills & Headcount',
      minWidth: 180,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {row.lines?.map((line, idx) => (
            <Chip key={idx} label={`${line.skillName} (${line.peopleCount}p)`} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      field: 'period',
      headerName: 'Period',
      minWidth: 160,
      renderCell: (row) => `${formatDate(row.fromDate)} – ${formatDate(row.toDate)}`,
    },
    {
      field: 'status',
      headerName: 'Workflow Status',
      minWidth: 160,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'notes',
      headerName: 'Owner / HR Notes',
      minWidth: 200,
      renderCell: (row) => (
        <Typography variant="caption" color="text.secondary">
          {row.ownerNote || row.hrNote || '—'}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      {/* 1. Skill Coverage Check (MG-5) */}
      <SectionCard
        title="Project Staffing & Skill Coverage"
        subtitle="Coverage check against BMC Control-M required skills"
        noPadding
        actions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => setRequestDialogOpen(true)}
          >
            Raise Resource Request
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <DataTable columns={staffingColumns} rows={staffing} />
      </SectionCard>

      {/* 2. My Resource Requests Table (MG-6) */}
      <SectionCard title="My Staffing Requests to Owner" noPadding>
        <DataTable columns={requestColumns} rows={requests} />
      </SectionCard>

      {/* Raise Request Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmitRequest}>
          <DialogTitle sx={{ fontWeight: 600 }}>Raise Resource Request</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Submit a staffing requirement for Owner approval and HR fulfillment.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Project"
                  fullWidth
                  value={requestForm.projectId}
                  onChange={(e) => setRequestForm({ ...requestForm, projectId: e.target.value })}
                >
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Requirement Kind"
                  fullWidth
                  value={requestForm.kind}
                  onChange={(e) => setRequestForm({ ...requestForm, kind: e.target.value })}
                >
                  <MenuItem value="current">Current Project (Urgent)</MenuItem>
                  <MenuItem value="upcoming">Upcoming Project</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Required From"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={requestForm.fromDate}
                  onChange={(e) => setRequestForm({ ...requestForm, fromDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Required To"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={requestForm.toDate}
                  onChange={(e) => setRequestForm({ ...requestForm, toDate: e.target.value })}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Staffing Lines (Skill, Headcount, Allocation %)
            </Typography>

            {requestForm.lines.map((line, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                <TextField
                  select
                  size="small"
                  label="Skill"
                  sx={{ flex: 2 }}
                  value={line.skillId}
                  onChange={(e) => handleLineChange(index, 'skillId', e.target.value)}
                >
                  {MOCK_SKILLS.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  type="number"
                  label="People"
                  sx={{ width: 100 }}
                  value={line.peopleCount}
                  onChange={(e) => handleLineChange(index, 'peopleCount', Number(e.target.value))}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Alloc %"
                  sx={{ width: 100 }}
                  value={line.percent}
                  onChange={(e) => handleLineChange(index, 'percent', Number(e.target.value))}
                />
                {requestForm.lines.length > 1 && (
                  <IconButton onClick={() => handleRemoveLine(index)} color="error" size="small">
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddLine}
              size="small"
              sx={{ mb: 2 }}
            >
              Add Skill Line
            </Button>

            <TextField
              label="Justification Note"
              multiline
              rows={3}
              fullWidth
              required
              placeholder="Explain the urgency, responsibilities, and deliverables..."
              value={requestForm.note}
              onChange={(e) => setRequestForm({ ...requestForm, note: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Send to Owner
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default StaffingRequestsTab;

