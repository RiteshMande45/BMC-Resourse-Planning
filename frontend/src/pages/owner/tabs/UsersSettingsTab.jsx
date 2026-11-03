import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { ALL_ROLES, ROLE_LABELS } from '../../../constants/roles';
import { useNotification } from '../../../context/NotificationContext';
import { updateUserRole, toggleUserActive } from '../../../api/services/reportService';

export function UsersSettingsTab({ users = [], settings = {}, loading = false, onRefresh }) {
  const { showNotification } = useNotification();
  const [formSettings, setFormSettings] = useState({
    defaultWeeklyHoursFullTime: settings.defaultWeeklyHoursFullTime || 40,
    defaultWeeklyHoursPartTime: settings.defaultWeeklyHoursPartTime || 20,
    thresholdOnTrack: settings.thresholdOnTrack || 8,
    thresholdAtRisk: settings.thresholdAtRisk || 20,
    reminderDays: settings.reminderDays?.join(', ') || '30, 14, 7, 0',
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      showNotification('User role updated successfully', 'success');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await toggleUserActive(userId);
      showNotification('User status toggled', 'success');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showNotification('System parameters saved successfully (mock preview)', 'success');
  };

  const userColumns = [
    {
      field: 'name',
      headerName: 'User',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
    },
    { field: 'email', headerName: 'Email', minWidth: 180 },
    {
      field: 'role',
      headerName: 'System Role',
      minWidth: 180,
      renderCell: (row) => (
        <Select
          size="small"
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          sx={{ minWidth: 140, fontSize: '0.8125rem' }}
        >
          {ALL_ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {ROLE_LABELS[r]}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Active Status',
      minWidth: 120,
      renderCell: (row) => (
        <Switch
          checked={Boolean(row.isActive)}
          onChange={() => handleToggleActive(row.id)}
          color="primary"
          size="small"
        />
      ),
    },
  ];

  return (
    <Box>
      <SectionCard title="System Users & Role Management" noPadding sx={{ mb: 4 }}>
        <DataTable columns={userColumns} rows={users} loading={loading} />
      </SectionCard>

      <SectionCard title="Operational Configuration & Thresholds">
        <Box component="form" onSubmit={handleSaveSettings}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full-time Default Weekly Hours"
                type="number"
                fullWidth
                value={formSettings.defaultWeeklyHoursFullTime}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, defaultWeeklyHoursFullTime: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Part-time Default Weekly Hours"
                type="number"
                fullWidth
                value={formSettings.defaultWeeklyHoursPartTime}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, defaultWeeklyHoursPartTime: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Health On-Track Threshold (diff ≤ N%)"
                type="number"
                fullWidth
                value={formSettings.thresholdOnTrack}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, thresholdOnTrack: e.target.value })
                }
                helperText="time% − work% ≤ 8 → On track"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Health At-Risk Threshold (diff ≤ N%)"
                type="number"
                fullWidth
                value={formSettings.thresholdAtRisk}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, thresholdAtRisk: e.target.value })
                }
                helperText="time% − work% between 9% and 20% → At risk"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Due Date Reminder Days (comma-separated)"
                fullWidth
                value={formSettings.reminderDays}
                onChange={(e) => setFormSettings({ ...formSettings, reminderDays: e.target.value })}
                helperText="Days before project due date to trigger automated manager alert"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary">
              Save Configuration
            </Button>
          </Box>
        </Box>
      </SectionCard>
    </Box>
  );
}

export default UsersSettingsTab;

