import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatDate } from '../../../utils/dates';
import { updateResourceRequest } from '../../../api/services/resourceRequestService';
import { useNotification } from '../../../context/NotificationContext';
import { HR_ACTION, RESOURCE_REQUEST_STATUS } from '../../../constants/statuses';

export function ResourceRequestsTab({ requests = [], employees = [], onRefresh }) {
  const { showNotification } = useNotification();
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionForm, setActionForm] = useState({
    hrAction: HR_ACTION.ASSIGN_INTERNAL,
    status: RESOURCE_REQUEST_STATUS.HR_WORKING,
    hrNote: '',
  });

  const handleOpenDetail = (req) => {
    setSelectedReq(req);
    setActionForm({
      hrAction: req.hrAction || HR_ACTION.ASSIGN_INTERNAL,
      status: req.status || RESOURCE_REQUEST_STATUS.HR_WORKING,
      hrNote: req.hrNote || '',
    });
  };

  const handleUpdate = async () => {
    if (!selectedReq) return;
    if (actionForm.status === RESOURCE_REQUEST_STATUS.FULFILLED && !actionForm.hrNote.trim()) {
      showNotification('An HR note naming who was assigned/trained/hired is required to fulfill.', 'error');
      return;
    }

    try {
      await updateResourceRequest(selectedReq.id, actionForm);
      showNotification(`Resource request updated (${actionForm.status})`, 'success');
      setSelectedReq(null);
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
    { field: 'managerName', headerName: 'Manager', minWidth: 140 },
    {
      field: 'lines',
      headerName: 'Skill Needed',
      minWidth: 160,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {row.lines?.map((line, idx) => (
            <Chip key={idx} label={`${line.skillName} (${line.peopleCount}p)`} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'hrAction',
      headerName: 'HR Strategy',
      minWidth: 140,
      renderCell: (row) => row.hrAction ? <StatusChip status={row.hrAction} /> : 'Pending',
    },
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 130,
      renderCell: (row) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenDetail(row)}
          sx={{ fontSize: '0.75rem', py: 0.5 }}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <SectionCard title="Resource Staffing Inbox (HR-1)" subtitle="Fulfill staffing requests forwarded by the Owner" noPadding>
        <DataTable columns={columns} rows={requests} />
      </SectionCard>

      {/* HR Action & Fulfillment Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedReq)}
        onClose={() => setSelectedReq(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3 } }}
      >
        {selectedReq && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Staffing Request: {selectedReq.projectName}
              </Typography>
              <IconButton onClick={() => setSelectedReq(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manager Note: {selectedReq.note || 'None'}
            </Typography>

            {selectedReq.ownerNote && (
              <Box sx={{ p: 1.5, bgcolor: 'rgba(251, 102, 0, 0.08)', borderRadius: 2, mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="primary" display="block">
                  OWNER GUIDANCE:
                </Typography>
                <Typography variant="body2">{selectedReq.ownerNote}</Typography>
              </Box>
            )}

            <Divider sx={{ mb: 2.5 }} />

            {/* Matching Internal People with Skill and Free Time */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Internal People with Matching Skill:
            </Typography>
            <Box sx={{ mb: 3 }}>
              {employees.slice(0, 3).map((emp) => (
                <Box
                  key={emp.id}
                  sx={{
                    p: 1.25,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{emp.designation}</Typography>
                  </Box>
                  <Chip
                    label={`${emp.freePct}% Free`}
                    size="small"
                    color={emp.freePct >= 40 ? 'success' : 'warning'}
                  />
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* HR Action Selection */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              HR Resolution Action
            </Typography>

            <TextField
              select
              label="Action Strategy"
              fullWidth
              value={actionForm.hrAction}
              onChange={(e) => setActionForm({ ...actionForm, hrAction: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value={HR_ACTION.ASSIGN_INTERNAL}>Assign Internal Person</MenuItem>
              <MenuItem value={HR_ACTION.TRAIN}>Train Existing Employee</MenuItem>
              <MenuItem value={HR_ACTION.HIRE}>Hire New Full-Time Resource</MenuItem>
              <MenuItem value={HR_ACTION.CONTRACTOR}>Engage External Contractor</MenuItem>
            </TextField>

            <TextField
              select
              label="Workflow Stage"
              fullWidth
              value={actionForm.status}
              onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value={RESOURCE_REQUEST_STATUS.HR_WORKING}>HR Working on It</MenuItem>
              <MenuItem value={RESOURCE_REQUEST_STATUS.FULFILLED}>Mark Fulfilled</MenuItem>
            </TextField>

            <TextField
              label="HR Fulfillment Note (Required if Fulfilled)"
              multiline
              rows={3}
              fullWidth
              value={actionForm.hrNote}
              onChange={(e) => setActionForm({ ...actionForm, hrNote: e.target.value })}
              placeholder="Name who was assigned, scheduled for training, or hired..."
              helperText="Enforce: Name person assigned/trained/hired before marking fulfilled"
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleUpdate}
            >
              Save Action & Update Request
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

export default ResourceRequestsTab;

