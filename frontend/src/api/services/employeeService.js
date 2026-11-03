import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_EMPLOYEES } from '../../mocks/employees';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export function normalizeEmployee(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    userId: raw.user_id || raw.userId,
    name: raw.name,
    email: raw.email,
    type: raw.type,
    designation: raw.designation || 'Specialist',
    weeklyHours: Number(raw.weekly_hours || raw.weeklyHours || 40),
    internEnd: raw.intern_end || raw.internEnd,
    hasSkillsForm: raw.has_skills_form !== undefined ? raw.has_skills_form : raw.hasSkillsForm,
    skills: raw.skills || [],
    freePct: Number(raw.free_pct || raw.freePct || 0),
    availability: raw.availability || (raw.freePct >= 100 ? 'available' : raw.freePct > 0 ? 'partially_available' : 'fully_allocated'),
    currentProjects: raw.current_projects || ['BMC Control-M'],
  };
}

export async function getEmployees(filters = {}) {
  if (USE_MOCK) {
    let list = [...MOCK_EMPLOYEES];

    if (filters.skill) {
      const q = filters.skill.toLowerCase();
      list = list.filter((e) =>
        (e.skills || []).some((s) => s.name?.toLowerCase().includes(q))
      );
    }
    if (filters.minFree) {
      list = list.filter((e) => Number(e.freePct || 0) >= Number(filters.minFree));
    }
    if (filters.onBench) {
      list = list.filter((e) => Number(e.freePct || 0) >= 40);
    }

    return mockDelay(list.map(normalizeEmployee));
  }

  const { data } = await axiosClient.get(ENDPOINTS.employees.list, { params: filters });
  const list = Array.isArray(data) ? data : data.employees || [];
  return list.map(normalizeEmployee);
}

export async function getEmployeeById(id) {
  if (USE_MOCK) {
    const found = MOCK_EMPLOYEES.find((e) => e.id === id);
    return mockDelay(found ? normalizeEmployee(found) : null);
  }
  const { data } = await axiosClient.get(ENDPOINTS.employees.detail(id));
  return normalizeEmployee(data.employee || data);
}

/**
 * Returns week-by-week booked % for next 8 weeks (MG-8)
 */
export async function getEmployeeAvailability(weeks = 8) {
  if (USE_MOCK) {
    const weekLabels = [
      'W1 (3 Nov)',
      'W2 (10 Nov)',
      'W3 (17 Nov)',
      'W4 (24 Nov)',
      'W5 (1 Dec)',
      'W6 (8 Dec)',
      'W7 (15 Dec)',
      'W8 (22 Dec)',
    ].slice(0, weeks);

    const people = [
      { name: 'S. Iyer', designation: 'Developer', weeks: [0, 0, 0, 0, 50, 50, 50, 50], leaveWeek: 1 },
      { name: 'K. Desai', designation: 'Developer', weeks: [0, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'A. Rao', designation: 'Developer', weeks: [40, 40, 40, 40, 40, 40, 40, 40], leaveWeek: 3 },
      { name: 'P. Nair', designation: 'QA', weeks: [60, 60, 60, 60, 60, 60, 60, 60] },
      { name: 'R. Joshi', designation: 'Developer', weeks: [80, 80, 80, 80, 80, 80, 80, 80] },
      { name: 'Test Employee', designation: 'Developer', weeks: [100, 100, 100, 100, 100, 100, 100, 100] },
      { name: 'Ananya Sharma', designation: 'Frontend Lead', weeks: [110, 110, 110, 110, 110, 110, 110, 110] }, // > 100%
      { name: 'Sneha Patel', designation: 'Database Architect', weeks: [110, 110, 110, 110, 110, 110, 110, 110] }, // > 100%
    ];

    return mockDelay({ weekLabels, people });
  }

  const { data } = await axiosClient.get(ENDPOINTS.employees.availability('all'), { params: { weeks } });
  return data;
}

