import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { sendSkillsFormReminder } from '../../../api/services/hrService';
import { useNotification } from '../../../context/NotificationContext';

export function SkillsFormsTab({ missingPeople = [] }) {
  const { showNotification } = useNotification();
  const [selectedIds, setSelectedIds] = useState([]);
  const [remindedMap, setRemindedMap] = useState({});

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === missingPeople.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(missingPeople.map((p) => p.id));
    }
  };

  const handleSendReminders = async () => {
    if (selectedIds.length === 0) return;
    try {
      await sendSkillsFormReminder(selectedIds);
      const newMap = { ...remindedMap };
      selectedIds.forEach((id) => {
        newMap[id] = 'Just now';
      });
      setRemindedMap(newMap);
      showNotification(`Reminder sent to ${selectedIds.length} employee(s)`, 'success');
      setSelectedIds([]);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const columns = [
    {
      field: 'select',
      headerName: (
        <Checkbox
          size="small"
          checked={missingPeople.length > 0 && selectedIds.length === missingPeople.length}
          indeterminate={selectedIds.length > 0 && selectedIds.length < missingPeople.length}
          onChange={handleSelectAll}
        />
      ),
      minWidth: 70,
      renderCell: (row) => (
        <Checkbox
          size="small"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleToggleSelect(row.id)}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Employee',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
    },
    { field: 'email', headerName: 'Email Address', minWidth: 180 },
    { field: 'type', headerName: 'Employment Type', minWidth: 130 },
    { field: 'designation', headerName: 'Designation', minWidth: 140 },
    {
      field: 'lastReminded',
      headerName: 'Last Reminded',
      minWidth: 140,
      renderCell: (row) => remindedMap[row.id] || 'Never',
    },
  ];

  return (
    <SectionCard
      title={`Missing Skills Profiles (${missingPeople.length} of 40)`}
      subtitle="Employees who have not yet completed their skill matrix submission."
      noPadding
      actions={
        <Button
          variant="contained"
          color="primary"
          disabled={selectedIds.length === 0}
          onClick={handleSendReminders}
        >
          Send Reminder ({selectedIds.length})
        </Button>
      }
    >
      <DataTable columns={columns} rows={missingPeople} />
    </SectionCard>
  );
}

export default SkillsFormsTab;

