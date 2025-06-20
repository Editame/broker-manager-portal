import { 
  BrokerConnection, 
  CreateConnectionRequest, 
  UpdateConnectionRequest, 
  TestConnectionRequest, 
  TestConnectionResponse 
} from '@/types/connection';

const API_BASE = 'http://localhost:8080/api/connections';

export async function getAllConnections(): Promise<BrokerConnection[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error(`Error fetching connections: ${response.status}`);
  }
  return response.json();
}

export async function getActiveConnection(): Promise<BrokerConnection | null> {
  const response = await fetch(`${API_BASE}/active`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Error fetching active connection: ${response.status}`);
  }
  return response.json();
}

export async function getConnection(id: string): Promise<BrokerConnection> {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching connection: ${response.status}`);
  }
  return response.json();
}

export async function createConnection(request: CreateConnectionRequest): Promise<BrokerConnection> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error creating connection: ${error}`);
  }
  
  return response.json();
}

export async function updateConnection(id: string, request: UpdateConnectionRequest): Promise<BrokerConnection> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error updating connection: ${error}`);
  }
  
  return response.json();
}

export async function deleteConnection(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error deleting connection: ${error}`);
  }
}

export async function testConnection(id: string): Promise<BrokerConnection> {
  const response = await fetch(`${API_BASE}/${id}/test`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error testing connection: ${error}`);
  }
  
  return response.json();
}

export async function testConnectionConfig(request: TestConnectionRequest): Promise<TestConnectionResponse> {
  const response = await fetch(`${API_BASE}/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error testing connection config: ${error}`);
  }
  
  return response.json();
}

export async function activateConnection(id: string): Promise<BrokerConnection> {
  const response = await fetch(`${API_BASE}/${id}/activate`, {
    method: 'PUT',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error activating connection: ${error}`);
  }
  
  return response.json();
}
