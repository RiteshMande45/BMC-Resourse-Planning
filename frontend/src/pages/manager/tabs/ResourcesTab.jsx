import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { StatusChip } from '../../../components/common/StatusChip';

export function ResourcesTab({ employees = [], loading = false }) {
  const [filterMode, setFilterMode] = useState('all'); // all | on_bench | has_free
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = employees.filter((emp) => {
    // Mode filter
    if (filterMode === 'on_bench' && emp.freePct < 40) return false;
    if (filterMode === 'has_free' && emp.freePct <= 0) return false;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchSkill = (emp.skills || []).some((s) => s.name?.toLowerCase().includes(q));
      if (!matchName && !matchSkill) return false;
    }

    return true;
  });

  const columns = [
    {
      field: 'name',
      headerName: 'Resource',
      minWidth: 160,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email}
          </Typography>
        </Box>
      ),
    },
    { field: 'type', headerName: 'Type', minWidth: 110 },
    { field: 'designation', headerName: 'Designation', minWidth: 140 },
    {
      field: 'currentProjects',
      headerName: 'Current Projects',
      minWidth: 160,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {row.currentProjects?.map((p) => (
            <Chip key={p} label={p} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      field: 'allocation',
      headerName: 'Booked %',
      minWidth: 140,
      renderCell: (row) => <ProgressCell percent={100 - row.freePct} />,
    },
    {
      field: 'freePct',
      headerName: 'Free Capacity',
      minWidth: 120,
      renderCell: (row) => (
        <StatusChip
          label={`${row.freePct}% Free`}
          tone={row.freePct >= 40 ? 'success' : row.freePct > 0 ? 'warning' : 'danger'}
        />
      ),
    },
  ];

  return (
    <SectionCard
      title="Workforce & Capacity Explorer"
      subtitle="Search skills and inspect current commitments across full-time and intern resources."
      noPadding
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Chip
              label="All employees"
              clickable
              color={filterMode === 'all' ? 'primary' : 'default'}
              onClick={() => setFilterMode('all')}
            />
            <Chip
              label="On bench (≥ 40% free)"
              clickable
              color={filterMode === 'on_bench' ? 'primary' : 'default'}
              onClick={() => setFilterMode('on_bench')}
            />
            <Chip
              label="Has free time"
              clickable
              color={filterMode === 'has_free' ? 'primary' : 'default'}
              onClick={() => setFilterMode('has_free')}
            />
          </Box>
          <TextField
            size="small"
            placeholder="Search name or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 220 }}
          />
        </Box>
      }
    >
      <DataTable columns={columns} rows={filtered} loading={loading} />
    </SectionCard>
  );
}

export default ResourcesTab;

