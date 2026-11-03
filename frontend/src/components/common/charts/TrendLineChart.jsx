import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { THEME_COLORS } from '../../../theme/theme';

export function TrendLineChart({ data = [], title = 'Utilisation Trend Over Time', height = 260 }) {
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
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E5E7EB'} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#E5E7EB' }}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis
              domain={[50, 100]}
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
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
              formatter={(val) => <span style={{ color: theme.palette.text.primary }}>{val}</span>}
            />
            <Line
              type="monotone"
              dataKey="planned"
              name="Planned %"
              stroke={THEME_COLORS.chart.planned}
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual %"
              stroke={THEME_COLORS.chart.actual}
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default TrendLineChart;

