'use client';

import { useState } from 'react';
import { ActiveConnectionProvider, useActiveConnection } from '@/contexts/ActiveConnectionContext';
import { useBrokerMetrics } from '@/hooks/useBrokerMetrics';
import { useQueues } from '@/hooks/useQueues';

export default function TestNewStructure() {
  return (
    <ActiveConnectionProvider>
      <TestContent />
    </ActiveConnectionProvider>
  );
}

function TestContent() {
  const { activeConnection, isConnected } = useActiveConnection();
  const { metrics, loading: metricsLoading, error: metricsError } = useBrokerMetrics(activeConnection?.id || null);
  const { queues, loading: queuesLoading, error: queuesError } = useQueues(activeConnection?.id || null);

  return (
    <div className="p-4 bg-purple-100 border border-purple-400 rounded mb-4">
      <h3 className="font-bold">🧪 NUEVA ESTRUCTURA CON CONTEXTO</h3>
      
      <div className="mt-2 space-y-2 text-sm">
        <div>
          <strong>Conexión Activa:</strong> {activeConnection?.name || 'Ninguna'}
        </div>
        <div>
          <strong>Estado:</strong> {isConnected ? '✅ Conectado' : '❌ Desconectado'}
        </div>
        <div>
          <strong>ID:</strong> {activeConnection?.id || 'N/A'}
        </div>
        
        <div className="border-t pt-2">
          <strong>Métricas:</strong> 
          {metricsLoading ? ' Cargando...' : 
           metricsError ? ` Error: ${metricsError}` : 
           metrics ? ` CPU: ${(metrics.cpuUsage * 100).toFixed(1)}%, RAM: ${(metrics.memoryUsage / 1024 / 1024).toFixed(0)}MB` : 
           ' Sin datos'}
        </div>
        
        <div>
          <strong>Colas:</strong> 
          {queuesLoading ? ' Cargando...' : 
           queuesError ? ` Error: ${queuesError}` : 
           ` ${queues.length} colas encontradas`}
        </div>
      </div>
    </div>
  );
}
