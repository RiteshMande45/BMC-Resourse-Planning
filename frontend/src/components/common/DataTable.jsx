import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import { LoadingState, EmptyState, ErrorState } from './LoadingState';

export function DataTable({
  columns = [],
  rows = [],
  loading = false,
  error = null,
  emptyText = 'No records available',
  onRowClick,
  onRetry,
}) {
  if (loading) {
    return <LoadingState message="Loading table data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title="No items" description={emptyText} />;
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.field || col.headerName}
                align={col.align || 'left'}
                sx={{
                  width: col.width,
                  minWidth: col.minWidth,
                  ...(col.sx || {}),
                }}
              >
                {col.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              hover={Boolean(onRowClick)}
              onClick={() => onRowClick && onRowClick(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:last-child td, &:last-child th': { border: 0 },
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.field || col.headerName}
                  align={col.align || 'left'}
                  sx={col.sx}
                >
                  {col.renderCell ? col.renderCell(row) : row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;

