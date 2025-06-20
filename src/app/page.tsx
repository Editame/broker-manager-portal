'use client';

import { useState } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Hooks
import { useQueues } from '@/hooks/useQueues';
import { useMessages } from '@/hooks/useMessages';

// Components
import { QueueFilters } from '@/components/queues/QueueFilters';
import { QueueList } from '@/components/queues/QueueList';
import { MessagePanel } from '@/components/messages/MessagePanel';
import { MessageViewer } from '@/components/messages/MessageViewer';
import { SendMessageModal, SendMessageData } from '@/components/messages/SendMessageModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

// Types
import { QueueInfo, QueueFilters as QueueFiltersType } from '@/types/queue';
import { Message } from '@/types/message';
import { sendMessage, deleteMessage } from '@/lib/api/service';

import '@/app/globals.css';

export default function HomePage() {
  // Queue management
  const { queues, loading: queuesLoading, error: queuesError, refetch: refetchQueues } = useQueues();
  const { messages, loading: messagesLoading, error: messagesError, loadMessages, clearMessages } = useMessages();

  // UI State
  const [selectedQueue, setSelectedQueue] = useState<QueueInfo | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sendMessageQueue, setSendMessageQueue] = useState<QueueInfo | null>(null);
  const [filters, setFilters] = useState<QueueFiltersType>({
    general: '',
    prefix: '',
    suffix: '',
  });

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
                      <div className="font-semibold text-slate-700">45%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">RAM</div>
                      <div className="font-semibold text-slate-700">2.1GB</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Conexiones</div>
                      <div className="font-semibold text-slate-700">23</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Uptime</div>
                      <div className="font-semibold text-slate-700">5d 3h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles Sutiles */}
              <div className="flex items-center gap-3">
                {/* Estado y Colas */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">Activo</span>
                  </div>
                  <div className="text-slate-500">
                    <span className="font-medium text-slate-700">{queues.length}</span> colas
                  </div>
                </div>

                {/* Actualizar Sutil */}
                <Button
                  variant="ghost"
                  onClick={refetchQueues}
                  disabled={queuesLoading}
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  title="Actualizar datos"
                >
                  <RefreshCcw className={`h-4 w-4 ${queuesLoading ? 'animate-spin' : ''}`} />
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
            {/* Filters */}
            <QueueFilters
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Main Layout: Lista de Colas + Panel de Mensajes */}
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
              {/* Lista de Colas - Columna Izquierda */}
              <div className="col-span-5 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
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
                    filters={filters}
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