export interface ReceivedNotification {
  id: number;
  userId: number;
  taskId: number;
  taskTitle: string;
  type: 'task_reminder';
  receivedAt: string; // ISO string
  read: boolean;
  readAt?: string; // ISO string
}

export interface CreateNotificationInput {
  taskId: number;
  taskTitle: string;
  type: 'task_reminder';
}
