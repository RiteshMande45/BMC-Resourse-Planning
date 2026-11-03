import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { SectionCard } from '../../../components/common/SectionCard';
import { LoadingState } from '../../../components/common/LoadingState';

export function AvailabilityTab({ availabilityData = {}, loading = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return <LoadingState message="Calculating week-by-week availability..." />;
  }

  const { weekLabels = [], people = [] } = availabilityData;

  const getCellStyles = (pct, hasLeave) => {
    if (hasLeave) {
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
        color: isDark ? '#FCA5A5' : '#991B1B',
        label: 'Leave',
      };
    }
    if (pct > 100) {
      return {
        bg: isDark ? 'rgba(220, 38, 38, 0.35)' : '#FEE2E2',
        color: '#DC2626',
        label: `${pct}%`,
      };
    }
    if (pct === 100) {
      return {
        bg: '#FB6600',
        color: '#FFFFFF',
        label: '100%',
      };
    }
    if (pct >= 61) {
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7',
        color: isDark ? '#FDE047' : '#92400E',
        label: `${pct}%`,
      };
    }
    return {
      bg: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
      color: isDark ? '#86EFAC' : '#166534',
      label: `${pct}%`,
    };
  };

  return (
    <SectionCard
      title="Team Availability Matrix (Next 8 Weeks)"
      subtitle="Week-by-week booked capacity. Cells indicate planned load and approved/applied leave."
      noPadding
    >
      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="caption" fontWeight={700}>LEGEND:</Typography>
        <Chip label="≤ 60% Light Load" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534' }} />
        <Chip label="61–99% Moderate" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E' }} />
        <Chip label="100% Fully Booked" size="small" sx={{ bgcolor: '#FB6600', color: '#FFFFFF' }} />
        <Chip label="> 100% Over-allocated" size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626' }} />
        <Chip label="Leave (Approved/Applied)" size="small" variant="outlined" color="error" />
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 180 }}>PERSON</TableCell>
              {weekLabels.map((w, idx) => (
                <TableCell key={idx} align="center" sx={{ minWidth: 100 }}>
                  {w}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map((person, idx) => (
              <TableRow key={idx} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {person.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {person.designation}
                  </Typography>
                </TableCell>
                {person.weeks.map((pct, weekIdx) => {
                  const hasLeave = person.leaveWeek === weekIdx;
                  const style = getCellStyles(pct, hasLeave);
                  return (
                    <TableCell key={weekIdx} align="center" sx={{ p: 1 }}>
                      <Tooltip
                        title={
                          hasLeave
                            ? `${person.name} on approved leave during ${weekLabels[weekIdx]}`
                            : `${pct}% booked load on ${weekLabels[weekIdx]}`
                        }
                      >
                        <Box
                          sx={{
                            backgroundColor: style.bg,
                            color: style.color,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            py: 0.75,
                            px: 1,
                            borderRadius: 1.5,
                            display: 'inline-block',
                            minWidth: 54,
                            textAlign: 'center',
                          }}
                        >
                          {style.label}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
}

export default AvailabilityTab;

