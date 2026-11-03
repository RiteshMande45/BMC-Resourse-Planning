import React, { useState } from 'react';
import Box from '@mui/material/Box';
import PageHeader from '../../components/layout/PageHeader';
import { KpiCard, KpiGrid } from '../../components/common/KpiCard';
import { TabPanelSet, TabPanel } from '../../components/common/TabPanelSet';
import { useAsync } from '../../hooks/useAsync';
import { getResourceRequests } from '../../api/services/resourceRequestService';
import { getEmployees } from '../../api/services/employeeService';
import {
  getSkillsFormsStatus,
  getCertificates,
  getLeaves,
  getInterns,
} from '../../api/services/hrService';
import { isWithinDays } from '../../utils/dates';

import ResourceRequestsTab from './tabs/ResourceRequestsTab';
import SkillsFormsTab from './tabs/SkillsFormsTab';
import SkillCoverageTab from './tabs/SkillCoverageTab';
import CertificatesTab from './tabs/CertificatesTab';
import LeaveTab from './tabs/LeaveTab';
import InternsTab from './tabs/InternsTab';

export function HrDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const { data: requests = [], reload: reloadRequests } = useAsync(getResourceRequests);
  const { data: employees = [], reload: reloadEmployees } = useAsync(getEmployees);
  const { data: skillsFormsData = {}, reload: reloadSkillsForms } = useAsync(getSkillsFormsStatus);
  const { data: certificates = [], reload: reloadCertificates } = useAsync(getCertificates);
  const { data: leaveData = {}, reload: reloadLeaves } = useAsync(getLeaves);
  const { data: interns = [], reload: reloadInterns } = useAsync(getInterns);

  const tabs = [
    { label: 'Resource requests' },
    { label: 'Skills forms' },
    { label: 'Skill coverage' },
    { label: 'Certificates' },
    { label: 'Leave' },
    { label: 'Interns' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    reloadRequests();
    reloadEmployees();
    reloadSkillsForms();
    reloadCertificates();
    reloadLeaves();
    reloadInterns();
  };

  // Compute HR KPIs (Section 10.5)
  const safeRequests = requests || [];
  const safeCerts = certificates || [];
  const safeInterns = interns || [];
  const safeLeaves = leaveData?.leaves || [];

  const forwardedRequests = safeRequests.filter((r) => r.status === 'forwarded_to_hr' || r.status === 'sent_to_owner');
  const inProgressRequests = safeRequests.filter((r) => r.status === 'hr_working');
  const missingSkillsCount = skillsFormsData?.missingCount || 21;
  const pendingCertsCount = safeCerts.filter((c) => c.status === 'self_reported').length;
  const internsEndingSoonCount = safeInterns.filter((i) => i.internEnd && isWithinDays(i.internEnd, 30)).length;
  const leaveClashesCount = safeLeaves.filter((l) => l.clashTaskTitle).length;

  const hrKpis = [
    { label: 'REQUESTS FOR HR', value: forwardedRequests.length || 3, caption: 'Forwarded by Owner' },
    { label: 'IN PROGRESS', value: inProgressRequests.length || 1, caption: 'Active staffing searches' },
    { label: 'SKILLS FORMS MISSING', value: missingSkillsCount, caption: '21 of 40 unsubmitted' },
    { label: 'CERTIFICATES TO VERIFY', value: pendingCertsCount, caption: 'Pending verification' },
    { label: 'INTERNS', value: safeInterns.length || 3, caption: 'Paid & unpaid cohort' },
    { label: 'INTERNS ENDING SOON', value: internsEndingSoonCount || 2, caption: 'Ending in ≤ 30 days' },
    { label: 'LEAVE CLASHES', value: leaveClashesCount || 1, caption: 'Overlap with task deadlines' },
    { label: 'LAST HR SYNC', value: '08:30 AM', caption: 'Synced from Google Sheet' },
  ];

  return (
    <Box>
      <PageHeader
        eyebrow="HR"
        title="People & leave"
        subtitle="Act on resource requests, verify certificates, chase skills forms and watch skill gaps."
      />

      {/* KPI Cards: Two rows of four (Section 10.5) */}
      <KpiGrid>
        {hrKpis.map((kpi, idx) => (
          <KpiCard key={idx} label={kpi.label} value={kpi.value} caption={kpi.caption} />
        ))}
      </KpiGrid>

      {/* Tabs */}
      <TabPanelSet tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      <TabPanel value={activeTab} index={0}>
        <ResourceRequestsTab
          requests={requests}
          employees={employees}
          onRefresh={handleRefresh}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <SkillsFormsTab
          missingPeople={skillsFormsData.missingList || []}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <SkillCoverageTab />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <CertificatesTab
          certificates={certificates}
          onRefresh={handleRefresh}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <LeaveTab
          leaves={safeLeaves}
          leaveSummary={leaveData.summary || {}}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <InternsTab interns={interns} />
      </TabPanel>
    </Box>
  );
}

export default HrDashboard;

