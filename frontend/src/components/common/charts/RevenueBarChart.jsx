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
import { formatCurrency } from '../../../utils/formatters';

export function RevenueBarChart({ data = [], title = 'Contract Value vs Invoiced', height = 280 }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ width: '100%', pt: 1 }}>
      {title && (
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E5E7EB'} />
            <XAxis
              dataKey="project"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#E5E7EB' }}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), '']}
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E5E7EB',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
              formatter={(val) => <span style={{ color: theme.palette.text.primary }}>{val}</span>}
            />
            <Bar
              dataKey="contractValue"
              name="Contract Value"
              fill={THEME_COLORS.chart.planned}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="invoiced"
              name="Invoiced"
              fill={THEME_COLORS.chart.actual}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default RevenueBarChart;

