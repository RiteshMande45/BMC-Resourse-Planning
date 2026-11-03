import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PageHeader from '../../components/layout/PageHeader';
import { KpiCard, KpiGrid } from '../../components/common/KpiCard';
import { TabPanelSet, TabPanel } from '../../components/common/TabPanelSet';
import { useAsync } from '../../hooks/useAsync';
import { getTasks } from '../../api/services/taskService';
import { getAllocations } from '../../api/services/allocationService';
import { getLeaves, getCertificates } from '../../api/services/hrService';

import MyTasksTab from './tabs/MyTasksTab';
import MyProjectsTab from './tabs/MyProjectsTab';
import SkillsCertificatesTab from './tabs/SkillsCertificatesTab';
import TimesheetTab from './tabs/TimesheetTab';
import LeaveTab from './tabs/LeaveTab';
import LogHoursDialog from './LogHoursDialog';

export function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [logHoursOpen, setLogHoursOpen] = useState(false);
  const [selectedTaskForLog, setSelectedTaskForLog] = useState(null);

  // Fetch employee's tasks and allocations
  const { data: tasks = [], reload: reloadTasks } = useAsync(() => getTasks({ assigneeId: 'emp-4' }));
  const { data: allocations = [], reload: reloadAllocations } = useAsync(() => getAllocations({ employeeId: 'emp-4' }));
  const { data: leaveData = {} } = useAsync(getLeaves);
  const { data: certificates = [] } = useAsync(getCertificates);

  const tabs = [
    { label: 'My tasks' },
    { label: 'My projects' },
    { label: 'Skills & certificates' },
    { label: 'Timesheet' },
    { label: 'Leave' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenLogHours = (task = null) => {
    setSelectedTaskForLog(task);
    setLogHoursOpen(true);
  };

  const handleRefreshAll = () => {
    reloadTasks();
    reloadAllocations();
  };

  // Section 10.4 & Screenshot 1 KPIs (One row of four)
  const employeeKpis = [
    { label: 'MY ALLOCATION', value: '100%', caption: 'Across 2 projects' },
    { label: 'FREE CAPACITY', value: '0%', caption: 'Next 2 weeks' },
    { label: 'HOURS TODAY', value: '3.5', caption: 'Of 8' },
    { label: 'OPEN / BLOCKED', value: '4 / 1', caption: 'Tasks' },
  ];

  return (
    <Box>
      <PageHeader
        eyebrow="EMPLOYEE"
        title="My work"
        subtitle="Log time against tasks, update status, report blockers and keep your skills current."
        actions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenLogHours(null)}
            sx={{ fontWeight: 600, py: 0.75, px: 2.5 }}
          >
            Log hours
          </Button>
        }
      />

      {/* KPI Cards: One row of four (EM-1 / Screenshot 1) */}
      <KpiGrid>
        {employeeKpis.map((kpi, idx) => (
          <KpiCard key={idx} label={kpi.label} value={kpi.value} caption={kpi.caption} />
        ))}
      </KpiGrid>

      {/* Tabs */}
      <TabPanelSet tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      <TabPanel value={activeTab} index={0}>
        <MyTasksTab
          tasks={tasks || []}
          myProjects={allocations || []}
          onOpenLogHours={handleOpenLogHours}
          onRefresh={handleRefreshAll}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <MyProjectsTab allocations={allocations || []} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <SkillsCertificatesTab certificates={certificates || []} />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <TimesheetTab tasks={tasks || []} onOpenLogHours={handleOpenLogHours} />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <LeaveTab leaves={leaveData?.leaves || []} leaveSummary={leaveData?.summary || {}} />
      </TabPanel>

      {/* Log Hours Dialog */}
      <LogHoursDialog
        open={logHoursOpen}
        initialTask={selectedTaskForLog}
        tasks={tasks || []}
        leaves={leaveData?.leaves || []}
        onClose={() => setLogHoursOpen(false)}
        onSuccess={handleRefreshAll}
      />
    </Box>
  );
}

export default EmployeeDashboard;

