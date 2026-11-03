import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_EMPLOYEES } from '../../mocks/employees';
import { MOCK_LEAVES, MOCK_LEAVE_SUMMARY } from '../../mocks/leaves';
import { CERTIFICATE_STATUS } from '../../constants/statuses';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryCertificates = [
  {
    id: 'cert-1',
    employeeId: 'emp-iyer',
    employeeName: 'S. Iyer',
    skillName: 'Control-M',
    title: 'BMC Certified Associate: Control-M 20.x Administrator',
    status: CERTIFICATE_STATUS.SELF_REPORTED,
    fileUrl: '#',
    submittedAt: '2026-10-25',
  },
  {
    id: 'cert-2',
    employeeId: 'emp-rao',
    employeeName: 'A. Rao',
    skillName: 'AWS',
    title: 'AWS Certified Solutions Architect – Associate',
    status: CERTIFICATE_STATUS.SELF_REPORTED,
    fileUrl: '#',
    submittedAt: '2026-10-28',
  },
  {
    id: 'cert-3',
    employeeId: 'emp-desai',
    employeeName: 'K. Desai',
    skillName: 'PostgreSQL',
    title: 'PostgreSQL Professional Certification',
    status: CERTIFICATE_STATUS.VERIFIED,
    fileUrl: '#',
    submittedAt: '2026-10-15',
    verifiedAt: '2026-10-18',
  },
];

export async function getSkillsFormsStatus() {
  if (USE_MOCK) {
    const missing = MOCK_EMPLOYEES.filter((e) => !e.hasSkillsForm).map((e) => ({
      ...e,
      lastReminded: null,
    }));
    return mockDelay({
      total: MOCK_EMPLOYEES.length,
      filled: MOCK_EMPLOYEES.length - missing.length,
      missingCount: missing.length,
      missingList: missing,
    });
  }

  const { data } = await axiosClient.get(ENDPOINTS.skills.list);
  return data;
}

export async function sendSkillsFormReminder(employeeIds = []) {
  if (USE_MOCK) {
    return mockDelay({ success: true, count: employeeIds.length }, 300);
  }
  const { data } = await axiosClient.post('/skills/reminder', { employeeIds });
  return data;
}

export async function getCertificates() {
  if (USE_MOCK) {
    return mockDelay(inMemoryCertificates);
  }
  const { data } = await axiosClient.get(ENDPOINTS.certificates.list);
  return data;
}

export async function verifyCertificate(id) {
  if (USE_MOCK) {
    const c = inMemoryCertificates.find((x) => x.id === id);
    if (c) {
      c.status = CERTIFICATE_STATUS.VERIFIED;
      c.verifiedAt = new Date().toISOString();
    }
    return mockDelay(c);
  }
  const { data } = await axiosClient.post(ENDPOINTS.certificates.verify(id));
  return data;
}

export async function rejectCertificate(id, reason) {
  if (!reason || reason.trim().length < 5) {
    throw new Error('A reason is required to reject a certificate.');
  }
  if (USE_MOCK) {
    const c = inMemoryCertificates.find((x) => x.id === id);
    if (c) {
      c.status = CERTIFICATE_STATUS.REJECTED;
      c.rejectionReason = reason;
    }
    return mockDelay(c);
  }
  const { data } = await axiosClient.post(ENDPOINTS.certificates.reject(id), { reason });
  return data;
}

export async function getLeaves() {
  if (USE_MOCK) {
    return mockDelay({
      leaves: MOCK_LEAVES,
      summary: MOCK_LEAVE_SUMMARY,
    });
  }
  const { data } = await axiosClient.get(ENDPOINTS.leaves.list);
  return data;
}

export async function getInterns() {
  if (USE_MOCK) {
    const interns = MOCK_EMPLOYEES.filter(
      (e) => e.type === 'intern' || e.type === 'intern_unpaid'
    ).map((i) => ({
      ...i,
      mentor: 'Durgadas Barhate',
      team: 'BMC Control-M',
      allocationPercent: i.type === 'intern_unpaid' ? 50 : 80,
    }));
    return mockDelay(interns);
  }
  const { data } = await axiosClient.get(ENDPOINTS.employees.list, { params: { type: 'intern' } });
  return data;
}

