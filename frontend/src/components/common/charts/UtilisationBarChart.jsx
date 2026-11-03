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
import { THEME_COLORS } from '../../../theme/theme';

export function UtilisationBarChart({
  data = [],
  title = 'Utilisation by month — planned (dark) vs actual (light)',
  height = 260,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ width: '100%', pt: 1 }}>
      {title && (
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          {title}
        </Typography>
      )}

      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            barCategoryGap={32}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E5E7EB'} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#E5E7EB' }}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, '']}
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E5E7EB',
                borderRadius: 8,
                fontSize: 12,
                color: theme.palette.text.primary,
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
              formatter={(val) => <span style={{ color: theme.palette.text.primary }}>{val}</span>}
            />
            <Bar
              dataKey="planned"
              name="Planned"
              fill={THEME_COLORS.chart.planned}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="actual"
              name="Actual"
              fill={THEME_COLORS.chart.actual}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default UtilisationBarChart;

