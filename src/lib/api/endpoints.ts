export const API_BASE_URL = 'http://localhost:8080/api';

export const ENDPOINTS = {
  QUEUES: `${API_BASE_URL}/queues`,
  QUEUE_MESSAGES: (queueName: string) => `${API_BASE_URL}/queues/${queueName}/messages`,
  QUEUE_MESSAGE: (queueName: string, messageId: string) => `${API_BASE_URL}/queues/${queueName}/messages/${messageId}`,
  QUEUE_PURGE: (queueName: string) => `${API_BASE_URL}/queues/${queueName}/messages`,
  QUEUE_DELETE: (queueName: string) => `${API_BASE_URL}/queues/${queueName}`,
  QUEUE_REQUEUE: (sourceQueue: string, targetQueue: string) => `${API_BASE_URL}/queues/${sourceQueue}/requeue/${targetQueue}`,
} as const;
