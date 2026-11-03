import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTheme } from '@mui/material/styles';
import { SectionCard } from '../../../components/common/SectionCard';
import { DataTable } from '../../../components/common/DataTable';
import { ProgressCell } from '../../../components/common/ProgressCell';
import { NoteDialog } from '../../../components/common/NoteDialog';
import { formatDate } from '../../../utils/dates';
import { updateTask } from '../../../api/services/taskService';
import { useNotification } from '../../../context/NotificationContext';

export function MyTasksTab({
  tasks = [],
  myProjects = [],
  onOpenLogHours,
  onRefresh,
}) {
  const theme = useTheme();
  const { showNotification } = useNotification();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [blockerDialogOpen, setBlockerDialogOpen] = useState(false);

  const columns = [
    { key: 'todo', label: 'To Do', countColor: '#6B7280' },
    { key: 'in_progress', label: 'In Progress', countColor: '#FB6600' },
    { key: 'blocked', label: 'Blocked', countColor: '#EF4444', isDanger: true },
    { key: 'done', label: 'Done', countColor: '#16A34A', isSuccess: true },
  ];

  const handleOpenMenu = (e, task) => {
    setMenuAnchor(e.currentTarget);
    setSelectedTask(task);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, { status: newStatus });
      showNotification(`Task status updated to ${newStatus}`, 'success');
      handleCloseMenu();
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleOpenBlocker = () => {
    handleCloseMenu();
    setBlockerDialogOpen(true);
  };

  const handleSaveBlocker = async (reason) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, {
        status: 'blocked',
        blockedReason: reason,
        blockedReportedDaysAgo: 0,
      });
      showNotification('Blocker reported and team notified', 'warning');
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const projectColumns = [
    {
      field: 'projectName',
      headerName: 'Project',
      minWidth: 160,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={700}>
          {row.projectName}
        </Typography>
      ),
    },
    { field: 'role', headerName: 'Role', minWidth: 140 },
    {
      field: 'percent',
      headerName: 'Allocation',
      minWidth: 200,
      renderCell: (row) => <ProgressCell percent={row.percent} />,
    },
    {
      field: 'toDate',
      headerName: 'Until',
      minWidth: 140,
      renderCell: (row) => formatDate(row.toDate),
    },
  ];

  return (
    <Box>
      {/* 1. Four-Column Kanban Board (Matches Screenshot 1) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        {columns.map((col) => {
          const colTasks = (tasks || []).filter((t) => t.status === col.key);

          return (
            <Box
              key={col.key}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB',
                borderRadius: 2.5,
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                minHeight: 320,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {col.label}
                </Typography>
                <Chip
                  label={colTasks.length}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 20,
                    minWidth: 22,
                    bgcolor: col.isDanger ? '#FEE2E2' : col.isSuccess ? '#DCFCE7' : 'rgba(0, 0, 0, 0.06)',
                    color: col.isDanger ? '#991B1B' : col.isSuccess ? '#166534' : 'text.primary',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {colTasks.map((task) => (
                  <Card
                    key={task.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                        {task.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, task)}
                        sx={{ p: 0.25, mt: -0.5, mr: -0.5 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Subtitle matching Screenshot 1 */}
                    {task.status === 'in_progress' ? (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {task.projectName} · {task.loggedHrs} of {task.estimateHrs} h
                      </Typography>
                    ) : task.status === 'blocked' ? (
                      <Typography variant="caption" color="error.main" fontWeight={500} display="block">
                        {task.blockedReason || 'Waiting on: HR · reported 2 days ago'}
                      </Typography>
                    ) : task.status === 'done' ? (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Completed {formatDate(task.completedAt || '2026-11-03')}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {task.projectName} · due {formatDate(task.dueDate)}
                      </Typography>
                    )}

                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onOpenLogHours && onOpenLogHours(task)}
                        sx={{ fontSize: '0.75rem', p: 0, minWidth: 0, color: 'primary.main' }}
                      >
                        Log hours
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 2. My Projects Summary Table (Matches Screenshot 1) */}
      <SectionCard title="My projects" noPadding>
        <DataTable columns={projectColumns} rows={myProjects} />
      </SectionCard>

      {/* Task Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => { handleCloseMenu(); onOpenLogHours && onOpenLogHours(selectedTask); }}>
          Log Hours
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('in_progress')}>
          Set In Progress
        </MenuItem>
        <MenuItem onClick={handleOpenBlocker} sx={{ color: 'error.main' }}>
          Report Blocker
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('done')} sx={{ color: 'success.main' }}>
          Mark as Done
        </MenuItem>
      </Menu>

      {/* Report Blocker Dialog */}
      <NoteDialog
        open={blockerDialogOpen}
        title="Report Task Blocker"
        prompt="Explain what or who is blocking this task (e.g. Waiting on HR credentials / API dependencies):"
        placeholder="Describe the blocker..."
        minLength={5}
        confirmLabel="Report Blocker"
        confirmColor="error"
        onClose={() => setBlockerDialogOpen(false)}
        onSubmit={handleSaveBlocker}
      />
    </Box>
  );
}

export default MyTasksTab;

