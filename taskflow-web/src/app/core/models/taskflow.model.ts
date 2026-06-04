import { UserSession } from './auth.model';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BoardEventType =
  | 'TASK_CREATED'
  | 'TASK_MOVED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'COMMENT_ADDED'
  | 'COMMENT_DELETED';

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  labels: string[];
}

export interface BoardColumn {
  id: string;
  title: string;
  color: string;
  tasks: TaskCard[];
}

export interface BoardState {
  id: string;
  projectId: string;
  projectName: string;
  columns: BoardColumn[];
}

export interface ProjectCard {
  id: string;
  name: string;
  owner: string;
  status: string;
  progress: number;
  members: string[];
  dueDate: string;
  description: string;
  color: string;
}

export interface MetricTile {
  label: string;
  value: string;
  delta: string;
  tone: 'teal' | 'amber' | 'violet' | 'rose';
  helperText: string;
  icon: string;
}

export interface ActivityItem {
  actor: string;
  action: string;
  subject: string;
  time: string;
  tone: 'teal' | 'amber' | 'violet' | 'rose';
}

export interface BoardEvent {
  type: BoardEventType;
  boardId: string;
  payload: unknown;
}
