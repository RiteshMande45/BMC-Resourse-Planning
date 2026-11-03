import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { SectionCard } from '../../../components/common/SectionCard';
import { formatDate } from '../../../utils/dates';
import { updateTask } from '../../../api/services/taskService';
import { useNotification } from '../../../context/NotificationContext';

export function TasksTab({ tasks = [], onRefresh }) {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [activeTask, setActiveTask] = React.useState(null);

  const columns = [
    { key: 'todo', label: 'To Do', color: '#6B7280' },
    { key: 'in_progress', label: 'In Progress', color: '#FB6600' },
    { key: 'blocked', label: 'Blocked', color: '#EF4444' },
    { key: 'done', label: 'Done', color: '#22C55E' },
  ];

  const handleOpenMenu = (e, task) => {
    setMenuAnchor(e.currentTarget);
    setActiveTask(task);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setActiveTask(null);
  };

  const handleMoveStatus = async (newStatus) => {
    if (!activeTask) return;
    try {
      await updateTask(activeTask.id, { status: newStatus });
      showNotification(`Moved task to ${newStatus}`, 'success');
      handleCloseMenu();
      onRefresh && onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <SectionCard title="Task & Milestone Tracking" subtitle="Kanban status of deliverables across managed projects.">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);

          return (
            <Box
              key={col.key}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB',
                borderRadius: 2.5,
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                minHeight: 400,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {col.label}
                </Typography>
                <Chip
                  label={colTasks.length}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 22,
                    bgcolor: col.color,
                    color: '#FFFFFF',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {colTasks.map((task) => {
                  const isLate = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                  const isOverEstimate = task.loggedHrs > task.estimateHrs;

                  return (
                    <Card
                      key={task.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
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

                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        {task.projectName} · {task.assigneeName}
                      </Typography>

                      {task.blockedReason && (
                        <Box sx={{ p: 1, mb: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 1 }}>
                          <Typography variant="caption" color="error.main" fontWeight={600} display="block">
                            BLOCKER:
                          </Typography>
                          <Typography variant="caption" color="error.dark">
                            {task.blockedReason}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Due {formatDate(task.dueDate)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {isLate && <Chip label="Late" size="small" color="error" sx={{ height: 20, fontSize: '0.6875rem' }} />}
                          {isOverEstimate && <Chip label="Over Est" size="small" color="warning" sx={{ height: 20, fontSize: '0.6875rem' }} />}
                        </Box>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Task status change menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary' }}>
          MOVE STATUS
        </Typography>
        <MenuItem onClick={() => handleMoveStatus('todo')}>To Do</MenuItem>
        <MenuItem onClick={() => handleMoveStatus('in_progress')}>In Progress</MenuItem>
        <MenuItem onClick={() => handleMoveStatus('blocked')}>Blocked</MenuItem>
        <MenuItem onClick={() => handleMoveStatus('done')}>Done</MenuItem>
      </Menu>
    </SectionCard>
  );
}

export default TasksTab;

