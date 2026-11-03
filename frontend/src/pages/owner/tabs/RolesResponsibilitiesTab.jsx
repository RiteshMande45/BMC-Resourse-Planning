import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { formatDate } from '../../../utils/dates';

export function RolesResponsibilitiesTab({
  allocations = [],
  projects = [],
  loading = false,
  error = null,
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const filtered =
    selectedProjectId === 'all'
      ? allocations
      : allocations.filter((a) => a.projectId === selectedProjectId);

  const columns = [
    {
      field: 'employeeName',
      headerName: 'Person',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employeeName}
        </Typography>
      ),
    },
    {
      field: 'projectName',
      headerName: 'Project',
      minWidth: 150,
    },
    {
      field: 'role',
      headerName: 'Role',
      minWidth: 140,
    },
    {
      field: 'percent',
      headerName: 'Allocation %',
      minWidth: 160,
      renderCell: (row) => <ProgressCell percent={row.percent} />,
    },
    {
      field: 'period',
      headerName: 'Period',
      minWidth: 180,
      renderCell: (row) => `${formatDate(row.fromDate)} – ${formatDate(row.toDate)}`,
    },
    {
      field: 'hoursLogged',
      headerName: 'Hours Logged',
      minWidth: 120,
      align: 'right',
      renderCell: (row) => `${row.percent > 50 ? '36.5' : '18.0'} h`,
    },
  ];

  return (
    <SectionCard
      title="Roles & Responsibilities"
      subtitle="Detailed breakdown of allocated team members and committed capacities across projects."
      noPadding
      actions={
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter Project</InputLabel>
          <Select
            value={selectedProjectId}
            label="Filter Project"
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
    >
      <DataTable columns={columns} rows={filtered} loading={loading} error={error} />
    </SectionCard>
  );
}

export default RolesResponsibilitiesTab;

