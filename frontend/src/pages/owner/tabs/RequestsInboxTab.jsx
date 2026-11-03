import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { NoteDialog } from '../../../components/common/NoteDialog';
import { formatDate } from '../../../utils/dates';
import { forwardToHr, returnToManager } from '../../../api/services/resourceRequestService';
import { useNotification } from '../../../context/NotificationContext';

export function RequestsInboxTab({ requests = [], loading = false, error = null, onRefresh }) {
  const { showNotification } = useNotification();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [forwardNote, setForwardNote] = useState('');
  const [historyReq, setHistoryReq] = useState(null);

  const handleOpenForward = (req) => {
    setSelectedReq(req);
    setForwardNote('');
    setForwardDialogOpen(true);
  };

  const handleConfirmForward = async () => {
    if (!selectedReq) return;
    try {
      await forwardToHr(selectedReq.id, forwardNote);
      showNotification('Request forwarded to HR successfully', 'success');
      setForwardDialogOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleOpenReturn = (req) => {
    setSelectedReq(req);
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = async (note) => {
    if (!selectedReq) return;
    try {
      await returnToManager(selectedReq.id, note);
      showNotification('Request returned to manager with note', 'warning');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const columns = [
    {
      field: 'projectName',
      headerName: 'Project',
      minWidth: 150,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.projectName}
        </Typography>
      ),
    },
    {
      field: 'managerName',
      headerName: 'Manager',
      minWidth: 130,
    },
    {
      field: 'skills',
      headerName: 'Skills Requested',
      minWidth: 170,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {row.lines?.map((line, idx) => (
            <Chip
              key={idx}
              label={`${line.skillName} (${line.peopleCount}p @ ${line.percent}%)`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'dates',
      headerName: 'Required Period',
      minWidth: 160,
      renderCell: (row) => `${formatDate(row.fromDate)} – ${formatDate(row.toDate)}`,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 260,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 'sent_to_owner' && (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleOpenForward(row)}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Forward to HR
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
          <Button
            size="small"
            color="inherit"
            onClick={() => setHistoryReq(row)}
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            History
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <SectionCard
        title="Requests Inbox"
        subtitle="Review resource staffing requests submitted by Project Managers."
        noPadding
      >
        <DataTable columns={columns} rows={requests} loading={loading} error={error} />
      </SectionCard>

      {/* Forward to HR Dialog */}
      <Dialog open={forwardDialogOpen} onClose={() => setForwardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Approve & Forward to HR</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Approve staffing request for <strong>{selectedReq?.projectName}</strong>. You may optionally add guidance for the HR team.
          </Typography>
          <TextField
            label="Owner Guidance / Note (Optional)"
            multiline
            rows={3}
            fullWidth
            value={forwardNote}
            onChange={(e) => setForwardNote(e.target.value)}
            placeholder="e.g. Approved. Priority for Q4 production rollout."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setForwardDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmForward} variant="contained" color="primary">
            Confirm & Forward
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return to Manager Dialog (Note mandatory) */}
      <NoteDialog
        open={returnDialogOpen}
        title="Return Request to Manager"
        prompt={`Please provide a reason why this request for ${selectedReq?.projectName} cannot be forwarded to HR:`}
        placeholder="Explain what needs adjustment before this can be approved..."
        minLength={5}
        confirmLabel="Return to Manager"
        confirmColor="error"
        onClose={() => setReturnDialogOpen(false)}
        onSubmit={handleConfirmReturn}
      />

      {/* Event History Dialog */}
      <Dialog open={Boolean(historyReq)} onClose={() => setHistoryReq(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Request Timeline & Audit Trail</DialogTitle>
        <DialogContent>
          {historyReq && (
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                {historyReq.projectName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {historyReq.note || 'No description note provided.'}
              </Typography>

              {historyReq.ownerNote && (
                <Box sx={{ p: 1.5, backgroundColor: 'rgba(251, 102, 0, 0.08)', borderRadius: 2, mb: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="primary" display="block">
                    OWNER NOTE:
                  </Typography>
                  <Typography variant="body2">{historyReq.ownerNote}</Typography>
                </Box>
              )}

              {historyReq.hrNote && (
                <Box sx={{ p: 1.5, backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: 2, mb: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="warning.main" display="block">
                    HR NOTE:
                  </Typography>
                  <Typography variant="body2">{historyReq.hrNote}</Typography>
                </Box>
              )}

              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                TIMELINE EVENTS:
              </Typography>
              <Stepper orientation="vertical">
                {historyReq.events?.map((ev) => (
                  <Step key={ev.id} active completed>
                    <StepLabel>
                      <Typography variant="body2" fontWeight={600}>
                        {ev.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {ev.userName} · {ev.at}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHistoryReq(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RequestsInboxTab;

