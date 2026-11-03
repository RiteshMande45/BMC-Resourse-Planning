import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { formatDate, isWithinDays } from '../../../utils/dates';

export function InternsTab({ interns = [] }) {
  const columns = [
    {
      field: 'name',
      headerName: 'Intern Name',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
    },
    {
      field: 'type',
      headerName: 'Category',
      minWidth: 130,
      renderCell: (row) => (
        <Chip
          label={row.type === 'intern_unpaid' ? 'Unpaid Intern' : 'Paid Intern'}
          size="small"
          variant="outlined"
          color={row.type === 'intern_unpaid' ? 'default' : 'primary'}
        />
      ),
    },
    { field: 'team', headerName: 'Assigned Team', minWidth: 140 },
    { field: 'mentor', headerName: 'Mentor', minWidth: 140 },
    {
      field: 'internEnd',
      headerName: 'Internship End Date',
      minWidth: 170,
      renderCell: (row) => {
        const endingSoon = row.internEnd && isWithinDays(row.internEnd, 30);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{formatDate(row.internEnd)}</span>
            {endingSoon && (
              <Chip label="Ending ≤ 30d" size="small" color="error" sx={{ height: 20, fontSize: '0.6875rem' }} />
            )}
          </Box>
        );
      },
    },
    {
      field: 'allocation',
      headerName: 'Project Load',
      minWidth: 160,
      renderCell: (row) => <ProgressCell percent={row.allocationPercent || 60} />,
    },
  ];

  return (
    <SectionCard
      title="Internship Cohort & Succession Pipeline (HR-6)"
      subtitle="Track mentorship, project allocations, and highlight interns reaching program completion within 30 days."
      noPadding
    >
      <DataTable columns={columns} rows={interns} />
    </SectionCard>
  );
}

export default InternsTab;

