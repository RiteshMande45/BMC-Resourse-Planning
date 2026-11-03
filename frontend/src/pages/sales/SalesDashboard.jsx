import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PageHeader from '../../components/layout/PageHeader';
import { KpiCard, KpiGrid } from '../../components/common/KpiCard';
import { TabPanelSet, TabPanel } from '../../components/common/TabPanelSet';
import { useAsync } from '../../hooks/useAsync';
import { getProjects } from '../../api/services/projectService';
import { getClients, getDeals } from '../../api/services/salesService';
import { getRevenue } from '../../api/services/reportService';
import { formatCurrency } from '../../utils/formatters';

import ProjectsTab from './tabs/ProjectsTab';
import CreateProjectTab from './tabs/CreateProjectTab';
import PipelineTab from './tabs/PipelineTab';
import ClientsTab from './tabs/ClientsTab';
import RevenueTab from './tabs/RevenueTab';

export function SalesDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  // Note SA-6 Hard Rule: No employee/availability endpoints are called in Sales
  const { data: projects = [], reload: reloadProjects } = useAsync(getProjects);
  const { data: clients = [], reload: reloadClients } = useAsync(getClients);
  const { data: deals = [], reload: reloadDeals } = useAsync(getDeals);
  const { data: revenueData = [] } = useAsync(getRevenue);

  const tabs = [
    { label: 'Projects' },
    { label: 'Create project' },
    { label: 'Pipeline' },
    { label: 'Clients' },
    { label: 'Revenue' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    reloadProjects();
    reloadClients();
    reloadDeals();
  };

  // Compute Sales KPIs
  const safeDeals = deals || [];
  const safeProjects = projects || [];
  const safeClients = clients || [];

  const pipelineTotal = safeDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const startsNext30Days = safeDeals.filter((d) => d.expectedStart?.includes('2026-11') || d.expectedStart?.includes('2026-12')).length;
  const awaitingManagerCount = safeProjects.filter((p) => !p.managerId || p.managerName === 'Unassigned').length;
  const dueSoonCount = safeProjects.filter((p) => p.dueDate?.includes('2026-11') || p.dueDate?.includes('2026-12')).length;

  const salesKpis = [
    { label: 'MY PROJECTS', value: safeProjects.length, caption: 'Total portfolio' },
    { label: 'PIPELINE VALUE', value: formatCurrency(pipelineTotal), caption: 'Active negotiations' },
    { label: 'EXPECTED STARTS', value: startsNext30Days, caption: 'Next 30 days' },
    { label: 'CONTRACT VALUE', value: null, caption: 'Sample (₹—)' },
    { label: 'INVOICED', value: null, caption: 'Sample (₹—)' },
    { label: 'DUE SOON', value: dueSoonCount, caption: 'Due in ≤ 30 days' },
    { label: 'AWAITING MANAGER', value: awaitingManagerCount, caption: 'Needs manager assignment' },
    { label: 'CLIENTS', value: safeClients.length, caption: 'Active accounts' },
  ];

  return (
    <Box>
      <PageHeader
        eyebrow="SALES"
        title="Projects & revenue"
        subtitle="Create won projects, upload documents, assign a manager and track the pipeline."
        actions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => setActiveTab(1)}
            sx={{ fontWeight: 600, py: 0.75, px: 2.5 }}
          >
            New project
          </Button>
        }
      />

      {/* KPI Cards (Two rows of four) */}
      <KpiGrid>
        {salesKpis.map((kpi, idx) => (
          <KpiCard key={idx} label={kpi.label} value={kpi.value} caption={kpi.caption} />
        ))}
      </KpiGrid>

      {/* Navigation Tabs */}
      <TabPanelSet tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      <TabPanel value={activeTab} index={0}>
        <ProjectsTab projects={projects} onRefresh={handleRefresh} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CreateProjectTab
          clients={clients}
          onSuccess={() => {
            handleRefresh();
            setActiveTab(0);
          }}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <PipelineTab deals={deals} clients={clients} onRefresh={handleRefresh} />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <ClientsTab clients={clients} onRefresh={handleRefresh} />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <RevenueTab revenueData={revenueData} />
      </TabPanel>
    </Box>
  );
}

export default SalesDashboard;

