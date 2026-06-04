import {
  ActivityItem,
  BoardState,
  MetricTile,
  ProjectCard,
} from '../models/taskflow.model';

export const DASHBOARD_METRICS: MetricTile[] = [
  {
    label: 'Active projects',
    value: '12',
    delta: '+3 this week',
    tone: 'teal',
    helperText: 'Across 4 squads',
    icon: 'rocket_launch',
  },
  {
    label: 'Tasks in flight',
    value: '48',
    delta: '+9 today',
    tone: 'amber',
    helperText: 'Focus time protected',
    icon: 'task_alt',
  },
  {
    label: 'Blocked items',
    value: '3',
    delta: '-2 since yesterday',
    tone: 'rose',
    helperText: 'Needs quick attention',
    icon: 'report_problem',
  },
  {
    label: 'Cycle time',
    value: '1.8d',
    delta: '-12%',
    tone: 'violet',
    helperText: 'Compared with last sprint',
    icon: 'schedule',
  },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    actor: 'Aline',
    action: 'moved',
    subject: 'TaskFlow auth refresh flow to Review',
    time: '12m ago',
    tone: 'teal',
  },
  {
    actor: 'Bruno',
    action: 'commented on',
    subject: 'Board websocket subscription handling',
    time: '35m ago',
    tone: 'amber',
  },
  {
    actor: 'Camila',
    action: 'uploaded',
    subject: 'API contract draft and sample payloads',
    time: '1h ago',
    tone: 'violet',
  },
  {
    actor: 'Diego',
    action: 'closed',
    subject: 'Docker compose bootstrap tasks',
    time: '2h ago',
    tone: 'rose',
  },
];

export const PROJECT_CARDS: ProjectCard[] = [
  {
    id: 'atlas',
    name: 'Atlas migration',
    owner: 'Aline',
    status: 'On track',
    progress: 68,
    members: ['Aline', 'Bruno', 'Camila'],
    dueDate: 'Sep 18',
    description: 'Consolidating the board flows, audit trail, and upload pipeline.',
    color: '#0f766e',
  },
  {
    id: 'orbit',
    name: 'Orbit mobile polish',
    owner: 'Diego',
    status: 'At risk',
    progress: 41,
    members: ['Diego', 'Fernanda'],
    dueDate: 'Oct 2',
    description: 'Reworking dense project screens for touch and compact layouts.',
    color: '#c2410c',
  },
  {
    id: 'harbor',
    name: 'Harbor operations',
    owner: 'Marina',
    status: 'Stable',
    progress: 82,
    members: ['Marina', 'Rafael', 'Lucas', 'Priya'],
    dueDate: 'Aug 30',
    description: 'Keeping the delivery pipeline healthy and the backlog transparent.',
    color: '#7c3aed',
  },
];

export const BOARD_STATE: BoardState = {
  id: 'board-001',
  projectId: 'atlas',
  projectName: 'Atlas migration',
  columns: [
    {
      id: 'backlog',
      title: 'Backlog',
      color: '#0f766e',
      tasks: [
        {
          id: 'task-1',
          title: 'Seed dev admin user',
          description: 'Create admin@taskflow.com on dev startup.',
          priority: 'HIGH',
          assignee: 'Marina',
          dueDate: 'Today',
          labels: ['Auth', 'Dev'],
        },
        {
          id: 'task-2',
          title: 'Persist refresh tokens',
          description: 'Store rotating refresh tokens in PostgreSQL.',
          priority: 'CRITICAL',
          assignee: 'Aline',
          dueDate: 'Tomorrow',
          labels: ['Security', 'JWT'],
        },
      ],
    },
    {
      id: 'progress',
      title: 'In progress',
      color: '#c2410c',
      tasks: [
        {
          id: 'task-3',
          title: 'Build board drag and drop',
          description: 'CDK drop lists with smooth task movement.',
          priority: 'MEDIUM',
          assignee: 'Bruno',
          dueDate: 'Thu',
          labels: ['Angular', 'CDK'],
        },
        {
          id: 'task-4',
          title: 'Wire JWT interceptor',
          description: 'Refresh once and retry requests automatically.',
          priority: 'HIGH',
          assignee: 'Camila',
          dueDate: 'Fri',
          labels: ['Auth', 'HTTP'],
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: '#7c3aed',
      tasks: [
        {
          id: 'task-5',
          title: 'Audit endpoint pagination',
          description: 'Paginated timeline for project actions.',
          priority: 'LOW',
          assignee: 'Fernanda',
          dueDate: 'Fri',
          labels: ['Audit'],
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: '#0369a1',
      tasks: [
        {
          id: 'task-6',
          title: 'Bootstrap monorepo',
          description: 'Create API, web, Docker, and docs scaffolding.',
          priority: 'LOW',
          assignee: 'You',
          dueDate: 'Done',
          labels: ['Foundation'],
        },
      ],
    },
  ],
};
