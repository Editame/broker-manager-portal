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

export async function activateConnection(connectionId: string): Promise<BrokerConnection> {
  try {
    // PASO 1: Probar la conectividad ANTES de activar
    console.log(`🔍 Probando conectividad de la conexión: ${connectionId}`);
    const testResult = await testConnection(connectionId);
    
    if (testResult.lastTestStatus !== 'CONNECTED') {
      throw new Error(`Conexión fallida: ${testResult.lastTestMessage || 'No se pudo conectar al broker'}`);
    }
    
    console.log(`✅ Conectividad confirmada, procediendo a activar...`);
    
    // PASO 2: Si la conectividad es exitosa, activar la conexión
    const allConnections = await getAllConnections();
    const targetConnection = allConnections.find(conn => conn.id === connectionId);
    
    if (!targetConnection) {
      throw new Error('Conexión no encontrada');
    }
    
    // Actualizamos la conexión objetivo para activarla
    const updatedConnection = {
      name: targetConnection.name,
      host: targetConnection.host,
      port: targetConnection.port,
      username: targetConnection.username,
      password: targetConnection.password || '',
      environment: targetConnection.environment,
      description: targetConnection.description,
      active: true
    };
    
    const response = await fetch(`${API_BASE}/${connectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedConnection),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Conexión activada exitosamente: ${result.name}`);
    return result;
    
  } catch (error) {
    console.error('❌ Error activating connection:', error);
    throw error;
  }
}
