import { 
  BrokerConnection, 
  CreateConnectionRequest, 
  UpdateConnectionRequest, 
  TestConnectionRequest, 
  TestConnectionResponse 
} from '@/types/connection';
import { API_CONFIG, buildApiUrl } from '@/lib/config/api';

export async function getAllConnections(): Promise<BrokerConnection[]> {
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONNECTIONS));
  if (!response.ok) {
    throw new Error(`Error fetching connections: ${response.status}`);
  }
  return response.json();
}

export async function createConnection(request: CreateConnectionRequest): Promise<BrokerConnection> {
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONNECTIONS), {
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
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONNECTION_BY_ID(id)), {
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
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONNECTION_BY_ID(id)), {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error deleting connection: ${error}`);
  }
}

export async function testConnection(id: string): Promise<TestConnectionResponse> {
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONNECTION_TEST(id)), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error testing connection: ${error}`);
  }
  
  return response.json();
}

export async function activateConnection(connectionId: string): Promise<BrokerConnection> {
  try {
    // PASO 1: Probar la conectividad ANTES de activar
    console.log(`🔍 Probando conectividad de la conexión: ${connectionId}`);
    const testResult = await testConnection(connectionId);
    
    if (testResult.status !== 'CONNECTED') {
      throw new Error(`Conexión fallida: ${testResult.status || 'No se pudo conectar al broker'}`);
    }
    
    console.log(`✅ Conectividad confirmada, procediendo a activar...`);
    
    // PASO 2: Si la conectividad es exitosa, activar la conexión usando el endpoint específico
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONNECTION_ACTIVATE(connectionId)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error activating connection: ${error}`);
    }
    
    const activatedConnection = await response.json();
    console.log(`✅ Conexión activada exitosamente: ${activatedConnection.name}`);
    
    return activatedConnection;
  } catch (error) {
    console.error(`❌ Error en activateConnection:`, error);
    throw error;
  }
}
