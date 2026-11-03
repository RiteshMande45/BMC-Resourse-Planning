import React from 'react';
import Box from '@mui/material/Box';
import { SectionCard } from '../../../components/common/SectionCard';
import { RevenueBarChart } from '../../../components/common/charts/RevenueBarChart';
import { DataTable } from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/formatters';

export function RevenueTab({ revenueData = [] }) {
  const columns = [
    { field: 'project', headerName: 'Project Name', minWidth: 160 },
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
    {
      field: 'pending',
      headerName: 'Remaining to Invoice',
      minWidth: 160,
      renderCell: (row) =>
        row.contractValue && row.invoiced !== null
          ? formatCurrency(row.contractValue - row.invoiced)
          : '₹—',
    },
  ];

  return (
    <Box>
      <SectionCard title="Contract Value & Revenue Realization" sx={{ mb: 3 }}>
        <RevenueBarChart data={revenueData} title="Contract Value vs Invoiced per Project" />
      </SectionCard>

      <SectionCard title="Project Billing Status" noPadding>
        <DataTable columns={columns} rows={revenueData} />
      </SectionCard>
    </Box>
  );
}

export default RevenueTab;

