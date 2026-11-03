import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatDate } from '../../../utils/dates';
import { formatCurrency } from '../../../utils/formatters';
import { postponeDueDate, recordSignOff } from '../../../api/services/salesService';
import { useNotification } from '../../../context/NotificationContext';

export function ProjectsTab({ projects = [], onRefresh }) {
  const { showNotification } = useNotification();
  const [selectedProj, setSelectedProj] = useState(null);
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [postponeForm, setPostponeForm] = useState({ newDueDate: '', reason: '' });

  const handleOpenPostpone = (proj) => {
    setSelectedProj(proj);
    setPostponeForm({ newDueDate: proj.dueDate || '', reason: '' });
    setPostponeDialogOpen(true);
  };

  const handleConfirmPostpone = async (e) => {
    e.preventDefault();
    try {
      await postponeDueDate(selectedProj.id, postponeForm);
      showNotification(`Due date updated for ${selectedProj.name}`, 'warning');
      setPostponeDialogOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleRecordSignOff = async (proj) => {
    try {
      await recordSignOff(proj.id, { clientSignOff: true });
      showNotification(`Customer review & sign-off recorded for ${proj.name}`, 'success');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Project',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {row.name}
        </Typography>
      ),
    },
    { field: 'client', headerName: 'Client', minWidth: 140 },
    { field: 'managerName', headerName: 'Assigned Manager', minWidth: 150 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'startDate',
      headerName: 'Start',
      minWidth: 120,
      renderCell: (row) => formatDate(row.startDate),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      minWidth: 120,
      renderCell: (row) => formatDate(row.dueDate),
    },
    {
      field: 'budget',
      headerName: 'Contract Value',
      minWidth: 130,
      renderCell: (row) => formatCurrency(row.budget || row.contractValue),
    },
    {
      field: 'actions',
      headerName: 'Due-Date Actions',
      minWidth: 220,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              handleRecordSignOff(row);
            }}
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            Sign-off
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPostpone(row);
            }}
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            Postpone
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <SectionCard title="Projects & Due Date Management" noPadding>
        <DataTable
          columns={columns}
          rows={projects}
          onRowClick={(row) => setSelectedProj(row)}
        />
      </SectionCard>

      {/* Postpone Due Date Dialog (DD-3: requires new date + reason) */}
      <Dialog open={postponeDialogOpen} onClose={() => setPostponeDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleConfirmPostpone}>
          <DialogTitle sx={{ fontWeight: 600 }}>Postpone Project Due Date</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Postponing the delivery milestone for <strong>{selectedProj?.name}</strong> requires an explanatory reason for audit.
            </Typography>

            <TextField
              label="New Due Date"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={postponeForm.newDueDate}
              onChange={(e) => setPostponeForm({ ...postponeForm, newDueDate: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />

            <TextField
              label="Justification Reason (Mandatory)"
              multiline
              rows={3}
              required
              fullWidth
              value={postponeForm.reason}
              onChange={(e) => setPostponeForm({ ...postponeForm, reason: e.target.value })}
              placeholder="e.g. Scope extension agreed with customer in Q3 review..."
              helperText={`${postponeForm.reason.trim().length}/5 characters minimum`}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setPostponeDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={postponeForm.reason.trim().length < 5}
            >
              Confirm Postponement
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Project Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedProj && !postponeDialogOpen)}
        onClose={() => setSelectedProj(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 3 } }}
      >
        {selectedProj && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                {selectedProj.name}
              </Typography>
              <IconButton onClick={() => setSelectedProj(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <StatusChip status={selectedProj.status} />
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">CLIENT</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedProj.client}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">MANAGER</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedProj.managerName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">START DATE</Typography>
                <Typography variant="body2">{formatDate(selectedProj.startDate)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">DUE DATE</Typography>
                <Typography variant="body2" fontWeight={600}>{formatDate(selectedProj.dueDate)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">CONTRACT BUDGET</Typography>
                <Typography variant="body2" fontWeight={700} color="primary">
                  {formatCurrency(selectedProj.budget || selectedProj.contractValue)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                DOCUMENTS ATTACHED
              </Typography>
              {selectedProj.documents?.length > 0 ? (
                selectedProj.documents.map((d) => (
                  <Box
                    key={d.id}
                    sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, mb: 1 }}
                  >
                    <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{d.type}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">No documents uploaded.</Typography>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

export default ProjectsTab;

