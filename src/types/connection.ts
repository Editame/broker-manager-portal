export interface BrokerConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username?: string;
  environment: string;
  description: string;
  active: boolean;
  jmxUrl: string;
  requiresAuth: boolean;
  lastTested?: string;
  lastTestStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'TESTING' | 'UNKNOWN';
  lastTestMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConnectionRequest {
  name: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  environment: string;
  description: string;
}

export interface UpdateConnectionRequest extends CreateConnectionRequest {
  active: boolean;
}

export interface TestConnectionRequest {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface TestConnectionResponse {
  status: string;
  success: boolean;
  message: string;
  timestamp: string;
}
