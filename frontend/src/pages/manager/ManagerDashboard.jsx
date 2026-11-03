import React, { useState } from 'react';
import Box from '@mui/material/Box';
import PageHeader from '../../components/layout/PageHeader';
import { KpiCard, KpiGrid } from '../../components/common/KpiCard';
import { TabPanelSet, TabPanel } from '../../components/common/TabPanelSet';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { getProjects, getProjectMatches, getProjectStaffing } from '../../api/services/projectService';
import { getEmployees, getEmployeeAvailability } from '../../api/services/employeeService';
import { getAllocations } from '../../api/services/allocationService';
import { getTasks } from '../../api/services/taskService';
import { getTimesheetWeeks } from '../../api/services/timesheetService';
import { getResourceRequests } from '../../api/services/resourceRequestService';

import ProjectsTab from './tabs/ProjectsTab';
import PlanProjectTab from './tabs/PlanProjectTab';
import StaffingRequestsTab from './tabs/StaffingRequestsTab';
import ResourcesTab from './tabs/ResourcesTab';
import AvailabilityTab from './tabs/AvailabilityTab';
import TasksTab from './tabs/TasksTab';
import TimesheetsTab from './tabs/TimesheetsTab';

export function ManagerDashboard() {
  const { user } = useAuth();
  // Default tab: Plan project (index 1 as specified in PRD section 10.3)
  const [activeTab, setActiveTab] = useState(1);

  // Data fetching
  const { data: projects = [], reload: reloadProjects } = useAsync(getProjects);
  const { data: matches = [], reload: reloadMatches } = useAsync(() => getProjectMatches('proj-1'));
  const { data: staffing = [], reload: reloadStaffing } = useAsync(() => getProjectStaffing('proj-1'));
  const { data: employees = [], reload: reloadEmployees } = useAsync(getEmployees);
  const { data: availabilityData = {} } = useAsync(getEmployeeAvailability);
  const { data: allocations = [], reload: reloadAllocations } = useAsync(getAllocations);
  const { data: tasks = [], reload: reloadTasks } = useAsync(getTasks);
  const { data: timesheetWeeks = [], reload: reloadTimesheets } = useAsync(getTimesheetWeeks);
  const { data: requests = [], reload: reloadRequests } = useAsync(getResourceRequests);

  const activeProject = (projects || []).find((p) => p.id === 'proj-1') || (projects || [])[0];

  const tabs = [
    { label: 'Projects' },
    { label: 'Plan project' },
    { label: 'Staffing & requests' },
    { label: 'Resources' },
    { label: 'Availability' },
    { label: 'Tasks' },
    { label: 'Timesheets' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStartPlanning = (proj) => {
    setActiveTab(1); // switch to Plan project tab
  };

  const reloadAll = () => {
    reloadProjects();
    reloadMatches();
    reloadStaffing();
    reloadEmployees();
    reloadAllocations();
    reloadTasks();
    reloadTimesheets();
    reloadRequests();
  };

  // Section 10.3 & Screenshot 2 KPIs
  const managerKpis = [
    { label: 'MY PROJECTS', value: 1, caption: '1 active' },
    { label: 'NEW TO PLAN', value: 0, caption: 'None waiting' },
    { label: 'TEAM', value: 15, caption: 'People on my projects' },
    { label: 'AVG ALLOCATION', value: '75%', caption: 'Planned, today' },
    { label: 'TEMPORARILY FREE', value: 1, caption: 'Blocked tasks free capacity' },
    { label: 'LATE / BLOCKED', value: '1 / 1', caption: 'Tasks' },
    { label: 'TO APPROVE', value: 11, caption: 'Timesheets, last week' },
    { label: 'MY REQUESTS', value: 0, caption: 'Open to Owner / HR' },
  ];

  return (
    <Box>
      <PageHeader
        eyebrow="MANAGER / TEAM LEAD"
        title={user?.name || 'Durgadas Barhate'}
        subtitle="Pick up new projects from Sales, find the right people, split their time across projects and follow tasks and timesheets."
      />

      {/* KPI Cards: 2 rows of 4 (MG-1 / Screenshot 2) */}
      <KpiGrid>
        {managerKpis.map((kpi, idx) => (
          <KpiCard key={idx} label={kpi.label} value={kpi.value} caption={kpi.caption} />
        ))}
      </KpiGrid>

      {/* Tabs in exact order: Projects · Plan project · Staffing & requests · Resources · Availability · Tasks · Timesheets */}
      <TabPanelSet tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      <TabPanel value={activeTab} index={0}>
        <ProjectsTab projects={projects} onStartPlanning={handleStartPlanning} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <PlanProjectTab
          project={activeProject}
          matches={matches}
          tasks={tasks}
          allocations={allocations}
          onRefresh={reloadAll}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <StaffingRequestsTab
          staffing={staffing}
          requests={requests}
          projects={projects}
          onRefresh={reloadAll}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <ResourcesTab employees={employees} />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <AvailabilityTab availabilityData={availabilityData} />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <TasksTab tasks={tasks} onRefresh={reloadAll} />
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        <TimesheetsTab weeks={timesheetWeeks} onRefresh={reloadAll} />
      </TabPanel>
    </Box>
  );
}

export default ManagerDashboard;

