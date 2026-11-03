import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { createClient } from '../../../api/services/salesService';
import { useNotification } from '../../../context/NotificationContext';

export function ClientsTab({ clients = [], onRefresh }) {
  const { showNotification } = useNotification();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await createClient(clientForm);
      showNotification('New client registered', 'success');
      setClientDialogOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Client Organization',
      minWidth: 180,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={700}>
          {row.name}
        </Typography>
      ),
    },
    { field: 'contactName', headerName: 'Contact Person', minWidth: 160 },
    { field: 'contactEmail', headerName: 'Email', minWidth: 180 },
    { field: 'contactPhone', headerName: 'Phone', minWidth: 140 },
    {
      field: 'projectsCount',
      headerName: 'Active Projects',
      minWidth: 130,
      align: 'center',
    },
  ];

  return (
    <SectionCard
      title="Client Directory"
      subtitle="Master directory of client accounts, sponsors, and commercial relationships."
      noPadding
      actions={
        <Button variant="contained" color="primary" onClick={() => setClientDialogOpen(true)}>
          + Add Client
        </Button>
      }
    >
      <DataTable columns={columns} rows={clients} />

      {/* Add Client Dialog */}
      <Dialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateClient}>
          <DialogTitle sx={{ fontWeight: 600 }}>Register New Client</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  label="Client Organization Name"
                  required
                  fullWidth
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="e.g. BMC Software"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Primary Contact Person"
                  required
                  fullWidth
                  value={clientForm.contactName}
                  onChange={(e) => setClientForm({ ...clientForm, contactName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Email"
                  type="email"
                  required
                  fullWidth
                  value={clientForm.contactEmail}
                  onChange={(e) => setClientForm({ ...clientForm, contactEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Contact Phone"
                  fullWidth
                  value={clientForm.contactPhone}
                  onChange={(e) => setClientForm({ ...clientForm, contactPhone: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setClientDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Add Client</Button>
          </DialogActions>
        </form>
      </Dialog>
    </SectionCard>
  );
}

export default ClientsTab;

