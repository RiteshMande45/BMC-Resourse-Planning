import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { formatDate } from '../../../utils/dates';
import { formatCurrency } from '../../../utils/formatters';

export function ProjectsTab({ projects = [], onStartPlanning }) {
  const newProjects = projects.filter((p) => p.status === 'new');
  const myProjects = projects.filter((p) => p.status !== 'new');

  const myProjectColumns = [
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
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'period',
      headerName: 'Schedule',
      minWidth: 180,
      renderCell: (row) => `${formatDate(row.startDate)} – ${formatDate(row.dueDate)}`,
    },
    {
      field: 'teamCount',
      headerName: 'Team',
      minWidth: 80,
      align: 'center',
    },
    {
      field: 'progress',
      headerName: 'Progress',
      minWidth: 180,
      renderCell: (row) => (
        <ProgressCell percent={row.workPercent} timePercent={row.timePercent} />
      ),
    },
  ];

  return (
    <Box>
      {/* 1. New Projects from Sales (MG-1) */}
      <SectionCard title="New Projects from Sales (Pending Plan)">
        {newProjects.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {newProjects.map((p) => (
              <Box
                key={p.id}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {p.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Client: {p.client} · Due: {formatDate(p.dueDate)} · Budget: {formatCurrency(p.budget)}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {p.technologies?.map((tech) => (
                      <Chip key={tech} label={tech} size="small" />
                    ))}
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onStartPlanning && onStartPlanning(p)}
                >
                  Start Planning
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No new unassigned projects waiting for planning.
          </Typography>
        )}
      </SectionCard>

      {/* 2. My Active Projects */}
      <SectionCard title="My Managed Projects" noPadding>
        <DataTable columns={myProjectColumns} rows={myProjects} />
      </SectionCard>
    </Box>
  );
}

export default ProjectsTab;

