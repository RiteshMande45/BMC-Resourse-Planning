import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { UtilisationBarChart } from '../../../components/common/charts/UtilisationBarChart';
import { formatDate } from '../../../utils/dates';
import { formatCurrency } from '../../../utils/formatters';
import { projectHealth } from '../../../utils/calculations';

export function OverviewTab({
  projects = [],
  projectsLoading = false,
  projectsError = null,
  needsAttention = [],
  monthlyUtilisation = [],
  onNavigateTab,
}) {
  const theme = useTheme();
  const [selectedProject, setSelectedProject] = useState(null);

  const portfolioColumns = [
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
    {
      field: 'managerName',
      headerName: 'Manager',
      minWidth: 130,
    },
    {
      field: 'health',
      headerName: 'Health',
      minWidth: 110,
      renderCell: (row) => {
        // Computed health from time % and work % (PRD §10.3 / section 11)
        const computedHealth = projectHealth(row.timePercent, row.workPercent);
        return <StatusChip status={computedHealth} />;
      },
    },
    {
      field: 'teamCount',
      headerName: 'Team',
      minWidth: 80,
      align: 'center',
    },
    {
      field: 'progress',
      headerName: 'Work % / Time %',
      minWidth: 200,
      renderCell: (row) => (
        <ProgressCell
          percent={row.workPercent}
          timePercent={row.timePercent}
        />
      ),
    },
  ];

  return (
    <Box>
      {/* Upper Grid: Portfolio Table (left) + Needs Attention (right) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Portfolio Table (OW-2) */}
        <SectionCard title="Portfolio" noPadding>
          <DataTable
            columns={portfolioColumns}
            rows={(projects || []).filter((p) => p.status === 'active')}
            loading={projectsLoading}
            error={projectsError}
            onRowClick={(row) => setSelectedProject(row)}
          />
        </SectionCard>

        {/* Needs Attention (OW-4) */}
        <SectionCard title="Needs attention">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {needsAttention.map((item, idx) => (
              <Box
                key={idx}
                onClick={() => onNavigateTab && onNavigateTab(item.targetTab)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFF7ED',
                  },
                }}
              >
                <StatusChip
                  label={item.chipLabel}
                  tone={item.chipTone}
                  size="small"
                  sx={{ minWidth: 90 }}
                />
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      {/* Lower: Utilisation by month (OW-6) */}
      <SectionCard>
        <UtilisationBarChart
          data={monthlyUtilisation}
          title="Utilisation by month — planned (dark) vs actual (light)"
        />
      </SectionCard>

      {/* Project Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 3 } }}
      >
        {selectedProject && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                {selectedProject.name}
              </Typography>
              <IconButton onClick={() => setSelectedProject(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <StatusChip status={selectedProject.status} />
              <StatusChip status={projectHealth(selectedProject.timePercent, selectedProject.workPercent)} />
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">CLIENT</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedProject.client}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">MANAGER</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedProject.managerName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">PERIOD</Typography>
                <Typography variant="body2">{formatDate(selectedProject.startDate)} – {formatDate(selectedProject.dueDate)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">TEAM SIZE</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedProject.teamCount} members</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                WORK COMPLETED VS TIME ELAPSED
              </Typography>
              <ProgressCell percent={selectedProject.workPercent} timePercent={selectedProject.timePercent} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                TECHNOLOGY STACK
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {selectedProject.technologies?.map((t) => (
                  <Chip key={t} label={t} size="small" />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                PROJECT DOCUMENTS
              </Typography>
              {selectedProject.documents?.length > 0 ? (
                selectedProject.documents.map((d) => (
                  <Box key={d.id} sx={{ p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{d.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{d.type}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">No documents uploaded.</Typography>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

export default OverviewTab;

