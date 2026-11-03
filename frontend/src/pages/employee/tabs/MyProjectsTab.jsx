import React from 'react';
import Typography from '@mui/material/Typography';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { formatDate } from '../../../utils/dates';

export function MyProjectsTab({ allocations = [] }) {
  const columns = [
    {
      field: 'projectName',
      headerName: 'Project',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={700}>
          {row.projectName}
        </Typography>
      ),
    },
    { field: 'role', headerName: 'Role', minWidth: 140 },
    {
      field: 'percent',
      headerName: 'Allocation',
      minWidth: 180,
      renderCell: (row) => <ProgressCell percent={row.percent} />,
    },
    {
      field: 'period',
      headerName: 'Committed Window',
      minWidth: 180,
      renderCell: (row) => `${formatDate(row.fromDate)} – ${formatDate(row.toDate)}`,
    },
    { field: 'managerName', headerName: 'Manager', minWidth: 140 },
  ];

  return (
    <SectionCard title="Active Project Assignments" subtitle="Projects where you are currently allocated." noPadding>
      <DataTable columns={columns} rows={allocations} />
    </SectionCard>
  );
}

export default MyProjectsTab;

