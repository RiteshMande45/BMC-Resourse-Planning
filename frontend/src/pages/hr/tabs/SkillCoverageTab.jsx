import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { THEME_COLORS } from '../../../theme/theme';

export function SkillCoverageTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const coverageData = [
    { skill: 'Control-M', totalPeople: 3, expertLevel3: 2, freePeople: 1, gapStatus: 'Healthy' },
    { skill: 'Python', totalPeople: 7, expertLevel3: 3, freePeople: 2, gapStatus: 'Healthy' },
    { skill: 'React', totalPeople: 4, expertLevel3: 2, freePeople: 1, gapStatus: 'Healthy' },
    { skill: 'PostgreSQL', totalPeople: 3, expertLevel3: 2, freePeople: 1, gapStatus: 'Healthy' },
    { skill: 'AWS', totalPeople: 2, expertLevel3: 1, freePeople: 0, gapStatus: 'Critical Gap' },
    { skill: 'Deep Learning', totalPeople: 1, expertLevel3: 1, freePeople: 0, gapStatus: 'Gap' },
    { skill: 'QA Testing', totalPeople: 3, expertLevel3: 2, freePeople: 1, gapStatus: 'Healthy' },
  ];

  const columns = [
    { field: 'skill', headerName: 'Technology Domain', minWidth: 160 },
    { field: 'totalPeople', headerName: 'Total Headcount', minWidth: 130, align: 'center' },
    { field: 'expertLevel3', headerName: 'Level 3 (Experts)', minWidth: 140, align: 'center' },
    { field: 'freePeople', headerName: 'Available Now', minWidth: 130, align: 'center' },
    {
      field: 'gapStatus',
      headerName: 'Bench Coverage',
      minWidth: 140,
      renderCell: (row) => (
        <StatusChip
          label={row.gapStatus}
          tone={row.gapStatus === 'Healthy' ? 'success' : row.gapStatus === 'Gap' ? 'warning' : 'danger'}
        />
      ),
    },
  ];

  return (
    <Box>
      <SectionCard title="Enterprise Skill Distribution & Expertise" sx={{ mb: 3 }}>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coverageData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E5E7EB'} />
              <XAxis dataKey="skill" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
              <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E5E7EB',
                  borderRadius: 8,
                }}
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
              <Bar dataKey="totalPeople" name="Total People" fill="#FB6600" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expertLevel3" name="Level 3 Experts" fill="#FDBA74" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SectionCard>

      <SectionCard title="Skill Capacity & Gap Analysis" noPadding>
        <DataTable columns={columns} rows={coverageData} />
      </SectionCard>
    </Box>
  );
}

export default SkillCoverageTab;

