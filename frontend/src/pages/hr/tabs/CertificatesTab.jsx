import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { NoteDialog } from '../../../components/common/NoteDialog';
import { verifyCertificate, rejectCertificate } from '../../../api/services/hrService';
import { useNotification } from '../../../context/NotificationContext';

export function CertificatesTab({ certificates = [], onRefresh }) {
  const { showNotification } = useNotification();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const handleVerify = async (id) => {
    try {
      await verifyCertificate(id);
      showNotification('Certificate verified successfully', 'success');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleOpenReject = (cert) => {
    setSelectedCert(cert);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async (reason) => {
    if (!selectedCert) return;
    try {
      await rejectCertificate(selectedCert.id, reason);
      showNotification('Certificate marked rejected with reason', 'warning');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const columns = [
    {
      field: 'employeeName',
      headerName: 'Employee',
      minWidth: 150,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employeeName}
        </Typography>
      ),
    },
    { field: 'title', headerName: 'Certificate Title', minWidth: 220 },
    { field: 'skillName', headerName: 'Associated Skill', minWidth: 130 },
    {
      field: 'fileUrl',
      headerName: 'Document',
      minWidth: 110,
      renderCell: () => (
        <Link href="#" underline="hover" onClick={(e) => e.preventDefault()}>
          View Doc
        </Link>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'actions',
      headerName: 'Verification Actions',
      minWidth: 180,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 'self_reported' && (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleVerify(row.id)}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Verify
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleOpenReject(row)}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Reject
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <SectionCard title="Employee Certificate Verification (HR-4)" noPadding>
      <DataTable columns={columns} rows={certificates} />

      {/* Reject Certificate Dialog with mandatory reason */}
      <NoteDialog
        open={rejectDialogOpen}
        title="Reject Certificate"
        prompt={`Specify reason why ${selectedCert?.title} cannot be verified:`}
        placeholder="e.g. Expired credential or unreadable credential attachment..."
        minLength={5}
        confirmLabel="Reject Certificate"
        confirmColor="error"
        onClose={() => setRejectDialogOpen(false)}
        onSubmit={handleConfirmReject}
      />
    </SectionCard>
  );
}

export default CertificatesTab;

