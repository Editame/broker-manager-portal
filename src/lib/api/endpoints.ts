export const API_BASE_URL = 'http://localhost:8080/api';

export const ENDPOINTS = {
  QUEUES: `${API_BASE_URL}/queues`,
  QUEUE_MESSAGES: (queueName: string) => `${API_BASE_URL}/queues/${queueName}/messages`,
  QUEUE_PURGE: (queueName: string) => `${API_BASE_URL}/queues/${queueName}/purge`,
  QUEUE_DELETE: (queueName: string) => `${API_BASE_URL}/queues/${queueName}`,
} as const;
