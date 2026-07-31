export interface DashboardStats {
  totalEvents: number;
  deliveredEvents: number;
  retryingEvents: number;
  deadLetteredEvents: number;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}