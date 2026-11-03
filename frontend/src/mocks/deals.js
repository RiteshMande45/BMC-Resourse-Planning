export const MOCK_CLIENTS = [
  {
    id: 'cli-1',
    name: 'BMC Software',
    contactName: 'Robert Vance',
    contactEmail: 'rvance@bmc.com',
    contactPhone: '+1-555-0199',
    projectsCount: 2,
  },
  {
    id: 'cli-corel',
    name: 'Corel',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sjenkins@corel.com',
    contactPhone: '+1-555-0144',
    projectsCount: 1,
  },
  {
    id: 'cli-mistplay',
    name: 'MistPlay',
    contactName: 'Luc Moreau',
    contactEmail: 'lmoreau@mistplay.com',
    contactPhone: '+1-555-0123',
    projectsCount: 1,
  },
  {
    id: 'cli-firstup',
    name: 'FirstUp',
    contactName: 'David Chen',
    contactEmail: 'dchen@firstup.io',
    contactPhone: '+1-555-0188',
    projectsCount: 0,
  },
];

export const MOCK_DEALS = [
  {
    id: 'deal-1',
    name: 'Control-M Enterprise Expansion',
    clientId: 'cli-1',
    clientName: 'BMC Software',
    stage: 'Negotiation',
    winProbability: 80,
    value: 7500000,
    expectedStart: '2026-11-20', // starts in next 30 days!
    contactName: 'Robert Vance',
    contactEmail: 'rvance@bmc.com',
  },
  {
    id: 'deal-2',
    name: 'FirstUp Employee Experience Portal',
    clientId: 'cli-firstup',
    clientName: 'FirstUp',
    stage: 'Proposal',
    winProbability: 60,
    value: 4800000,
    expectedStart: '2026-12-05',
    contactName: 'David Chen',
    contactEmail: 'dchen@firstup.io',
  },
  {
    id: 'deal-3',
    name: 'Corel Vector Graphics AI Plugin',
    clientId: 'cli-corel',
    clientName: 'Corel',
    stage: 'Discovery',
    winProbability: 40,
    value: 3200000,
    expectedStart: '2027-01-15',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sjenkins@corel.com',
  },
];

