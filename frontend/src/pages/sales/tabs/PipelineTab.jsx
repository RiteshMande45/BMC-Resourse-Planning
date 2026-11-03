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
import Grid from '@mui/material/Grid';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { formatDate } from '../../../utils/dates';
import { formatCurrency } from '../../../utils/formatters';
import { createDeal } from '../../../api/services/salesService';
import { useNotification } from '../../../context/NotificationContext';

export function PipelineTab({ deals = [], clients = [], onRefresh }) {
  const { showNotification } = useNotification();
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [dealForm, setDealForm] = useState({
    name: '',
    clientId: clients[0]?.id || 'cli-1',
    clientName: 'BMC Software',
    stage: 'Proposal',
    winProbability: 60,
    value: 5000000,
    expectedStart: '2026-12-01',
    contactName: 'Robert Vance',
    contactEmail: 'rvance@bmc.com',
  });

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await createDeal(dealForm);
      showNotification('Pipeline deal created', 'success');
      setDealDialogOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Deal Opportunity',
      minWidth: 180,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
    },
    { field: 'clientName', headerName: 'Client', minWidth: 140 },
    { field: 'stage', headerName: 'Pipeline Stage', minWidth: 130 },
    {
      field: 'winProbability',
      headerName: 'Win Prob',
      minWidth: 100,
      align: 'center',
      renderCell: (row) => `${row.winProbability}%`,
    },
    {
      field: 'value',
      headerName: 'Deal Value',
      minWidth: 140,
      renderCell: (row) => formatCurrency(row.value),
    },
    {
      field: 'expectedStart',
      headerName: 'Expected Start',
      minWidth: 140,
      renderCell: (row) => formatDate(row.expectedStart),
    },
    {
      field: 'contact',
      headerName: 'Client Contact',
      minWidth: 180,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2">{row.contactName}</Typography>
          <Typography variant="caption" color="text.secondary">{row.contactEmail}</Typography>
        </Box>
      ),
    },
  ];

  return (
    <SectionCard
      title="Sales Opportunity Pipeline (SA-4)"
      subtitle="Track probability, deal values, and expected starts for resource forecasting."
      noPadding
      actions={
        <Button variant="contained" color="primary" onClick={() => setDealDialogOpen(true)}>
          + Add Opportunity
        </Button>
      }
    >
      <DataTable columns={columns} rows={deals} />

      {/* Add Deal Dialog */}
      <Dialog open={dealDialogOpen} onClose={() => setDealDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateDeal}>
          <DialogTitle sx={{ fontWeight: 600 }}>Add Deal Opportunity</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  label="Deal Title"
                  required
                  fullWidth
                  value={dealForm.name}
                  onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                  placeholder="e.g. Corel Cloud Migration Phase 2"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Client"
                  required
                  fullWidth
                  value={dealForm.clientId}
                  onChange={(e) => {
                    const c = clients.find((x) => x.id === e.target.value);
                    setDealForm({
                      ...dealForm,
                      clientId: e.target.value,
                      clientName: c?.name || '',
                      contactName: c?.contactName || '',
                      contactEmail: c?.contactEmail || '',
                    });
                  }}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Stage"
                  required
                  fullWidth
                  value={dealForm.stage}
                  onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
                >
                  <MenuItem value="Discovery">Discovery</MenuItem>
                  <MenuItem value="Proposal">Proposal</MenuItem>
                  <MenuItem value="Negotiation">Negotiation</MenuItem>
                  <MenuItem value="Closing">Closing</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Deal Value (₹)"
                  type="number"
                  required
                  fullWidth
                  value={dealForm.value}
                  onChange={(e) => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Win Probability %"
                  type="number"
                  required
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                  value={dealForm.winProbability}
                  onChange={(e) => setDealForm({ ...dealForm, winProbability: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Expected Start Date"
                  type="date"
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={dealForm.expectedStart}
                  onChange={(e) => setDealForm({ ...dealForm, expectedStart: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDealDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save Deal</Button>
          </DialogActions>
        </form>
      </Dialog>
    </SectionCard>
  );
}

export default PipelineTab;

