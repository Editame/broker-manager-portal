'use client';

import { useState, useEffect } from 'react';

export default function TestConnections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(null);

  const fetchConnections = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/connections');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activateConnection = async (id, name) => {
    try {
      setActivating(id);
      console.log(`Activando conexión: ${name} (${id})`);
      
      // Usar la función de la API
      const response = await fetch('http://localhost:8080/api/connections');
      const allConnections = await response.json();
      const targetConnection = allConnections.find(conn => conn.id === id);
      
      if (!targetConnection) {
        throw new Error('Conexión no encontrada');
      }
      
      // Actualizar la conexión
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
      
      const updateResponse = await fetch(`http://localhost:8080/api/connections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConnection),
      });
      
      console.log('Respuesta:', updateResponse.status, updateResponse.ok);
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${updateResponse.status}: ${errorText}`);
      }
      
      // Refrescar conexiones
      await fetchConnections();
      console.log(`✅ Conexión ${name} activada correctamente`);
      
    } catch (err) {
      console.error('Error activating connection:', err);
      alert(`Error al activar conexión: ${err.message}`);
    } finally {
      setActivating(null);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) return <div>Cargando conexiones de prueba...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded mb-4">
      <h3 className="font-bold">🔗 PRUEBA DE CONEXIONES</h3>
      <div className="mt-2 space-y-2">
        {connections.map((conn) => (
          <div key={conn.id} className="flex items-center justify-between bg-white p-2 rounded text-sm">
            <div className="flex items-center gap-2">
              <span className={conn.active ? '🟢' : '⚪'}></span>
              <span className="font-medium">{conn.name}</span>
              <span className="text-gray-500">({conn.host}:{conn.port})</span>
              {conn.active && <span className="text-green-600 font-bold">ACTIVA</span>}
            </div>
            <button
              onClick={() => activateConnection(conn.id, conn.name)}
              disabled={conn.active || activating === conn.id}
              className={`px-3 py-1 rounded text-xs ${
                conn.active 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                  : activating === conn.id
                  ? 'bg-yellow-100 text-yellow-700'
                  : conn.lastTestStatus === 'ERROR'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              title={conn.lastTestStatus === 'ERROR' ? `Error: ${conn.lastTestMessage}` : ''}
            >
              {conn.active ? 'Activa' : 
               activating === conn.id ? 'Activando...' : 
               conn.lastTestStatus === 'ERROR' ? '⚠️ Activar' : 
               'Activar'}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={fetchConnections}
        className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
      >
        🔄 Refrescar
      </button>
    </div>
  );
}
