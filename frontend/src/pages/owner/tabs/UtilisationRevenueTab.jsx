import React from 'react';
import Box from '@mui/material/Box';
import { SectionCard } from '../../../components/common/SectionCard';
import { TrendLineChart } from '../../../components/common/charts/TrendLineChart';
import { RevenueBarChart } from '../../../components/common/charts/RevenueBarChart';
import { DataTable } from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/formatters';

export function UtilisationRevenueTab({
  monthlyUtilisation = [],
  revenueData = [],
  loading = false,
  error = null,
}) {
  const revenueColumns = [
    { field: 'project', headerName: 'Project', minWidth: 160 },
    { field: 'client', headerName: 'Client', minWidth: 140 },
    {
      field: 'contractValue',
      headerName: 'Contract Value',
      minWidth: 140,
      renderCell: (row) => formatCurrency(row.contractValue),
    },
    {
      field: 'invoiced',
      headerName: 'Invoiced to Date',
      minWidth: 140,
      renderCell: (row) => formatCurrency(row.invoiced),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <SectionCard title="Utilisation Trend">
          <TrendLineChart data={monthlyUtilisation} />
        </SectionCard>

        <SectionCard title="Revenue Breakdown">
          <RevenueBarChart data={revenueData} />
        </SectionCard>
      </Box>

      <SectionCard title="Financial Portfolio Summary" noPadding>
        <DataTable columns={revenueColumns} rows={revenueData} loading={loading} error={error} />
      </SectionCard>
    </Box>
  );
}

export default UtilisationRevenueTab;

