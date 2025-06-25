'use client';

import { useState, useEffect } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { RefreshCcw, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Hooks
import { useQueues } from '@/hooks/useQueues';
import { useMessages } from '@/hooks/useMessages';
import { useBrokerMetrics } from '@/hooks/useBrokerMetrics';
import { useConnections } from '@/hooks/useConnections';
import { useDebounce } from '@/hooks/useDebounce';

// Components
import { QueueFilters } from '@/components/queues/QueueFilters';
import { QueueList } from '@/components/queues/QueueList';
import { MessagePanel } from '@/components/messages/MessagePanel';
import { MessageViewer } from '@/components/messages/MessageViewer';
import { SendMessageModal, SendMessageData } from '@/components/messages/SendMessageModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ConnectionStatus } from '@/components/connections/ConnectionStatus';
import { ConnectionModal } from '@/components/connections/ConnectionModal';

// Types
import { QueueInfo, QueueFilters as QueueFiltersType } from '@/types/queue';
import { Message } from '@/types/message';
import { sendMessage, deleteMessage } from '@/lib/api/service';

// Styles
import '@/app/globals.css';

export default function HomePage() {
  // Connection management
  const { activeConnection, loading: connectionsLoading } = useConnections();
  
  // Broker metrics - VERSIÓN ULTRA SEGURA
  const metricsHookResult = useBrokerMetrics(!!activeConnection);
  
  // DEBUG: Log para ver qué está retornando el hook
  console.log('metricsHookResult:', metricsHookResult);
  
  // Verificar que el hook retorne un objeto válido
  const metrics = (metricsHookResult && typeof metricsHookResult === 'object') ? metricsHookResult.metrics : null;
  const metricsLoading = (metricsHookResult && typeof metricsHookResult === 'object') ? Boolean(metricsHookResult.loading) : false;
  const metricsError = (metricsHookResult && typeof metricsHookResult === 'object') ? metricsHookResult.error : null;
  const refetchMetrics = (metricsHookResult && typeof metricsHookResult === 'object' && typeof metricsHookResult.refetch === 'function') ? metricsHookResult.refetch : () => Promise.resolve();
  
  // DEBUG: Log para ver los valores extraídos
  console.log('metricsLoading:', metricsLoading, 'type:', typeof metricsLoading);
  
  // Queue management - solo si hay conexión activa
  const { queues, loading: queuesLoading, error: queuesError, refetch: refetchQueues } = useQueues(!!activeConnection);
  const { messages, loading: messagesLoading, error: messagesError, loadMessages, clearMessages } = useMessages();

  // UI State
  const [selectedQueue, setSelectedQueue] = useState<QueueInfo | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sendMessageQueue, setSendMessageQueue] = useState<QueueInfo | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const [filters, setFilters] = useState<QueueFiltersType>({
    general: '',
    prefix: '',
    suffix: '',
  });

  // Debounce filtros para mejor rendimiento
  const debouncedFilters = useDebounce(filters, 300);

  // Handlers
  const handleSelectQueue = async (queue: QueueInfo) => {
    setSelectedQueue(queue);
    await loadMessages(queue.name);
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleCloseMessageViewer = () => {
    setSelectedMessage(null);
  };

  const handleRefreshMessages = () => {
    if (selectedQueue) {
      loadMessages(selectedQueue.name);
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchQueues(),
      refetchMetrics(),
      selectedQueue ? loadMessages(selectedQueue.name) : Promise.resolve()
    ]);
  };

  const handleSendMessage = (queue: QueueInfo) => {
    setSendMessageQueue(queue);
  };

  const handleSendMessageSubmit = async (messageData: SendMessageData) => {
    if (!sendMessageQueue) return;
    
    try {
      await sendMessage(sendMessageQueue.name, {
        body: messageData.body,
        headers: messageData.headers,
        priority: 4, // Prioridad por defecto
        timeToLive: 0, // Sin expiración por defecto
      });
      
      // Refrescar las colas para ver el nuevo mensaje
      refetchQueues();
      
      // Si la cola seleccionada es la misma, refrescar los mensajes
      if (selectedQueue?.name === sendMessageQueue.name) {
        loadMessages(sendMessageQueue.name);
      }
      
      alert('Mensaje enviado correctamente');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    }
  };

  const handleCloseSendMessage = () => {
    setSendMessageQueue(null);
  };

  const handleOpenConnectionModal = () => {
    setShowConnectionModal(true);
  };

  const handleCloseConnectionModal = () => {
    setShowConnectionModal(false);
  };

  const handleConnectionChange = () => {
    // Refrescar datos cuando cambie la conexión
    if (activeConnection) {
      refetchQueues();
      refetchMetrics();
    }
  };

  // Verificar conexión al cargar la página
  useEffect(() => {
    if (!connectionsLoading) {
      setHasCheckedConnection(true);
      if (!activeConnection) {
        setShowConnectionModal(true);
      }
    }
  }, [activeConnection, connectionsLoading]);

  // Mostrar loading mientras se verifica la conexión
  if (!hasCheckedConnection) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando conexión...</p>
        </div>
      </div>
    );
  }

  // Mostrar modal de conexión si no hay conexión activa
  if (!activeConnection) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-blue-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <RefreshCcw className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Broker Manager</h1>
            <p className="text-slate-600 mb-6">Configura una conexión para comenzar</p>
          </div>
          
          <ConnectionModal
            isOpen={showConnectionModal}
            onClose={() => {}}
            onConnectionChange={handleConnectionChange}
            canClose={false}
          />
        </div>
      </TooltipProvider>
    );
  }

  const handlePurgeQueue = (queue: QueueInfo) => {
    // TODO: Implementar confirmación y purga
    console.log('Purgar cola:', queue.name);
  };

  const handleDeleteQueue = (queue: QueueInfo) => {
    // TODO: Implementar confirmación y eliminación
    console.log('Eliminar cola:', queue.name);
  };

  const handlePauseQueue = (queue: QueueInfo) => {
    // TODO: Implementar pausa/reanudación
    console.log('Pausar/Reanudar cola:', queue.name);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedQueue) return;
    
    try {
      await deleteMessage(selectedQueue.name, messageId);
      
      // Refrescar los mensajes para ver el cambio
      await loadMessages(selectedQueue.name);
      
      // También refrescar las colas para actualizar el contador
      refetchQueues();
      
      alert('Mensaje eliminado correctamente');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error al eliminar el mensaje');
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-100">
        {/* Header con Métricas del Broker */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-full mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo y Título */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                    <RefreshCcw className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                      Broker Manager
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      ActiveMQ Administration
                    </p>
                  </div>
                </div>

                {/* Métricas del Broker */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-slate-500">CPU</div>
                      <div className="font-semibold text-slate-700">
                        {metricsLoading ? '...' : `${metrics?.cpuUsage?.toFixed(1) || '0.0'}%`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">RAM</div>
                      <div className="font-semibold text-slate-700">
                        {metricsLoading ? '...' : `${((metrics?.memoryUsage || 0) / 1024 / 1024 / 1024).toFixed(1)}GB`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Conexiones</div>
                      <div className="font-semibold text-slate-700">
                        {metricsLoading ? '...' : metrics?.activeConnections || '0'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Uptime</div>
                      <div className="font-semibold text-slate-700">
                        {metricsLoading ? '...' : metrics?.uptimeFormatted || '0m'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles Sutiles */}
              <div className="flex items-center gap-3">
                {/* Estado de Conexión y Colas */}
                <div className="flex items-center gap-4 text-sm">
                  <ConnectionStatus onOpenSettings={handleOpenConnectionModal} />
                  <div className="text-slate-500">
                    <span className="font-medium text-slate-700">{queues.length}</span> colas
                  </div>
                </div>

                {/* Actualizar Sutil */}
                <Button
                  variant="ghost"
                  onClick={handleRefreshAll}
                  disabled={queuesLoading || (metricsLoading === true)}
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  title="Actualizar todo"
                >
                  <RefreshCcw className={`h-4 w-4 ${(queuesLoading || (metricsLoading === true)) ? 'animate-spin' : ''}`} />
                </Button>

                {/* Logout/Perfil */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  title="Perfil"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-full mx-auto px-6 py-4">
          <div className="space-y-4">
            {/* Main Layout: Lista de Colas + Panel de Mensajes */}
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
              {/* Lista de Colas - Columna Izquierda */}
              <div className="col-span-5 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                {/* Header del Panel de Colas con Filtros y Botón */}
                <div className="p-4 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Colas ({queues.length})
                    </h2>
                    <div className="flex items-center gap-3">
                      <QueueFilters 
                        filters={filters}
                        onFiltersChange={setFilters}
                        compact={true}
                      />
                      <Button
                        variant="ghost"
                        onClick={refetchQueues}
                        disabled={queuesLoading}
                        size="sm"
                        className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                        title="Actualizar colas"
                      >
                        <Database className={`h-4 w-4 ${queuesLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>

                {queuesLoading ? (
                  <div className="p-4">
                    <LoadingSpinner count={8} />
                  </div>
                ) : queuesError ? (
                  <div className="p-4">
                    <ErrorMessage message={queuesError} onRetry={refetchQueues} />
                  </div>
                ) : (
                  <QueueList
                    queues={queues}
                    filters={debouncedFilters}
                    selectedQueue={selectedQueue}
                    onSelectQueue={handleSelectQueue}
                    onSendMessage={handleSendMessage}
                    onPurgeQueue={handlePurgeQueue}
                    onDeleteQueue={handleDeleteQueue}
                    onPauseQueue={handlePauseQueue}
                  />
                )}
              </div>

              {/* Panel de Mensajes - Columna Derecha */}
              <div className="col-span-7 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <MessagePanel
                  queue={selectedQueue}
                  messages={messages}
                  loading={messagesLoading}
                  error={messagesError}
                  onViewMessage={handleViewMessage}
                  onRefresh={handleRefreshMessages}
                  onDeleteMessage={handleDeleteMessage}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Send Message Modal */}
        <SendMessageModal
          queue={sendMessageQueue}
          isOpen={!!sendMessageQueue}
          onClose={handleCloseSendMessage}
          onSend={handleSendMessageSubmit}
        />

        {/* Connection Management Modal */}
        <ConnectionModal
          isOpen={showConnectionModal}
          onClose={handleCloseConnectionModal}
          onConnectionChange={handleConnectionChange}
          canClose={true}
        />

        {/* Message Viewer Modal */}
        <MessageViewer
          message={selectedMessage}
          isOpen={!!selectedMessage}
          onClose={handleCloseMessageViewer}
        />
      </div>
    </TooltipProvider>
  );
}