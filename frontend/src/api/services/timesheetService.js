import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_TIMESHEET_WEEKS, MOCK_TIME_ENTRIES } from '../../mocks/timesheets';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryWeeks = [...MOCK_TIMESHEET_WEEKS];
let inMemoryEntries = [...MOCK_TIME_ENTRIES];

export function normalizeTimesheetWeek(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    employeeId: raw.employee_id || raw.employeeId,
    employeeName: raw.employee_name || raw.employeeName,
    weekStart: raw.week_start || raw.weekStart,
    hoursLogged: Number(raw.hours_logged || raw.hoursLogged || 0),
    weeklyCapacity: Number(raw.weekly_capacity || raw.weeklyCapacity || 40),
    status: raw.status || 'draft',
    isOverCapacity: Boolean(raw.is_over_capacity || raw.isOverCapacity),
    returnNote: raw.return_note || raw.returnNote || null,
  };
}

export async function getTimesheetWeeks(filters = {}) {
  if (USE_MOCK) {
    let list = inMemoryWeeks;
    if (filters.employeeId) {
      list = list.filter((w) => w.employeeId === filters.employeeId);
    }
    if (filters.status) {
      list = list.filter((w) => w.status === filters.status);
    }
    return mockDelay(list.map(normalizeTimesheetWeek));
  }

  const { data } = await axiosClient.get(ENDPOINTS.timesheets.approve('all'));
  const list = Array.isArray(data) ? data : data.weeks || [];
  return list.map(normalizeTimesheetWeek);
}

export async function getTimeEntries(filters = {}) {
  if (USE_MOCK) {
    let list = inMemoryEntries;
    if (filters.employeeId) {
      list = list.filter((e) => e.employeeId === filters.employeeId);
    }
    return mockDelay(list);
  }

  const { data } = await axiosClient.get(ENDPOINTS.timeEntries.create, { params: filters });
  return data;
}

export async function createTimeEntry(entry) {
  // Client business rules check
  if (!entry.note || entry.note.trim().length < 10) {
    throw new Error('Timesheet note must be at least 10 characters long.');
  }
  if (!entry.hours || entry.hours <= 0 || entry.hours > 12) {
    throw new Error('Logged hours must be between 0 and 12 hours.');
  }

  if (USE_MOCK) {
    const newEntry = {
      id: `te-${Date.now()}`,
      taskId: entry.taskId,
      taskTitle: entry.taskTitle || 'Task',
      employeeId: entry.employeeId || 'emp-4',
      workDate: entry.workDate,
      hours: Number(entry.hours),
      note: entry.note,
      reasonOverEstimate: entry.reasonOverEstimate || null,
      source: 'app',
    };
    inMemoryEntries.unshift(newEntry);
    return mockDelay(newEntry, 300);
  }

  const { data } = await axiosClient.post(ENDPOINTS.timeEntries.create, entry);
  return data;
}

export async function submitWeek(weekStart, employeeId = 'emp-4') {
  if (USE_MOCK) {
    let week = inMemoryWeeks.find((w) => w.weekStart === weekStart && w.employeeId === employeeId);
    if (week) {
      week.status = 'submitted';
    } else {
      week = {
        id: `tsw-${Date.now()}`,
        employeeId,
        employeeName: 'Test Employee',
        weekStart,
        hoursLogged: 40,
        weeklyCapacity: 40,
        status: 'submitted',
      };
      inMemoryWeeks.push(week);
    }
    return mockDelay(normalizeTimesheetWeek(week), 350);
  }

  const { data } = await axiosClient.post(ENDPOINTS.timesheets.submit(weekStart));
  return normalizeTimesheetWeek(data);
}

export async function approveTimesheet(weekId) {
  if (USE_MOCK) {
    const week = inMemoryWeeks.find((w) => w.id === weekId);
    if (week) {
      week.status = 'approved';
    }
    return mockDelay({ success: true, week: normalizeTimesheetWeek(week) });
  }

  const { data } = await axiosClient.post(ENDPOINTS.timesheets.approve(weekId));
  return data;
}

export async function returnTimesheet(weekId, note) {
  if (!note || note.trim().length < 5) {
    throw new Error('A return reason note is required to return a timesheet.');
  }

  if (USE_MOCK) {
    const week = inMemoryWeeks.find((w) => w.id === weekId);
    if (week) {
      week.status = 'returned';
      week.returnNote = note;
    }
    return mockDelay({ success: true, week: normalizeTimesheetWeek(week) });
  }

  const { data } = await axiosClient.post(ENDPOINTS.timesheets.return(weekId), { note });
  return data;
}

