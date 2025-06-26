// Configuración centralizada de la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  ENDPOINTS: {
    // Conexiones
    CONNECTIONS: '/api/connections',
    CONNECTION_BY_ID: (id: string) => `/api/connections/${id}`,
    CONNECTION_ACTIVATE: (id: string) => `/api/connections/${id}/activate`,
    CONNECTION_TEST: (id: string) => `/api/connections/${id}/test`,
    CONNECTION_DISCONNECT: '/api/connections/disconnect',
    
    // Broker
    BROKER_METRICS: '/api/broker/metrics',
    
    // Colas
    QUEUES: '/api/queues',
    QUEUE_BY_NAME: (queueName: string) => `/api/queues/${queueName}`,
    QUEUE_MESSAGES: (queueName: string) => `/api/queues/${queueName}/messages`,
    QUEUE_MESSAGE: (queueName: string, messageId: string) => `/api/queues/${queueName}/messages/${messageId}`,
    QUEUE_PAUSE: (queueName: string) => `/api/queues/${queueName}/pause`,
    QUEUE_RESUME: (queueName: string) => `/api/queues/${queueName}/resume`,
    QUEUE_REQUEUE: (sourceQueue: string, targetQueue: string) => `/api/queues/${sourceQueue}/requeue/${targetQueue}`,
  }
} as const;

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Helper para endpoints con connectionId
export const buildApiUrlWithConnection = (endpoint: string, connectionId: string, additionalParams?: Record<string, string>) => {
  const params = { connectionId, ...additionalParams };
  return buildApiUrl(endpoint, params);
};
