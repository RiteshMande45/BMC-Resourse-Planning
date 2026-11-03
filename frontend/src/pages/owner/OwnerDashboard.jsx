import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import PageHeader from '../../components/layout/PageHeader';
import { KpiCard, KpiGrid } from '../../components/common/KpiCard';
import { TabPanelSet, TabPanel } from '../../components/common/TabPanelSet';
import { useAsync } from '../../hooks/useAsync';
import { getPortfolio, getUtilisation, getRevenue, getAuditLog, getUsers, getSettings } from '../../api/services/reportService';
import { getProjects } from '../../api/services/projectService';
import { getAllocations } from '../../api/services/allocationService';
import { getResourceRequests } from '../../api/services/resourceRequestService';

import OverviewTab from './tabs/OverviewTab';
import RequestsInboxTab from './tabs/RequestsInboxTab';
import RolesResponsibilitiesTab from './tabs/RolesResponsibilitiesTab';
import UtilisationRevenueTab from './tabs/UtilisationRevenueTab';
import UsersSettingsTab from './tabs/UsersSettingsTab';
import AuditLogTab from './tabs/AuditLogTab';

export function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  // Fetch data through services
  const { data: portfolioData, reload: reloadPortfolio } = useAsync(getPortfolio);
  const { data: projects = [], loading: projectsLoading, error: projectsError } = useAsync(getProjects);
  const { data: allocations = [] } = useAsync(getAllocations);
  const { data: monthlyUtilisation = [] } = useAsync(getUtilisation);
  const { data: revenueData = [] } = useAsync(getRevenue);
  const { data: requests = [], reload: reloadRequests } = useAsync(getResourceRequests);
  const { data: users = [], reload: reloadUsers } = useAsync(getUsers);
  const { data: settings = {} } = useAsync(getSettings);
  const { data: auditLog = [] } = useAsync(getAuditLog);

  const kpis = portfolioData?.kpis || [];
  const needsAttention = portfolioData?.needsAttention || [];

  const tabs = [
    { label: 'Overview' },
    { label: 'Requests inbox' },
    { label: 'Roles & responsibilities' },
    { label: 'Utilisation & revenue' },
    { label: 'Users & settings' },
    { label: 'Audit log' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <PageHeader
        eyebrow="OWNER"
        title="Portfolio overview"
        subtitle="Portfolio health, utilisation, bench and revenue on one screen. Sample data shown."
        actions={
          <Button
            variant="outlined"
            onClick={() => setActiveTab(1)}
            sx={{ fontWeight: 600, py: 0.75, px: 2 }}
          >
            Approve requests (3)
          </Button>
        }
      />

      {/* KPI Cards: 2 rows of 4 (OW-1) */}
      <KpiGrid>
        {kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            label={kpi.label}
            value={kpi.value}
            caption={kpi.caption}
            tone={kpi.tone}
          />
        ))}
      </KpiGrid>

      {/* Navigation Tabs */}
      <TabPanelSet tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <OverviewTab
          projects={projects}
          projectsLoading={projectsLoading}
          projectsError={projectsError}
          needsAttention={needsAttention}
          monthlyUtilisation={monthlyUtilisation}
          onNavigateTab={(targetTab) => setActiveTab(targetTab)}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <RequestsInboxTab
          requests={requests}
          onRefresh={() => {
            reloadRequests();
            reloadPortfolio();
          }}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <RolesResponsibilitiesTab allocations={allocations} projects={projects} />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <UtilisationRevenueTab
          monthlyUtilisation={monthlyUtilisation}
          revenueData={revenueData}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <UsersSettingsTab users={users} settings={settings} onRefresh={reloadUsers} />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <AuditLogTab auditLog={auditLog} />
      </TabPanel>
    </Box>
  );
}

export default OwnerDashboard;

