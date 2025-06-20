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
import { sendMessage } from '@/lib/api/service';

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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 shadow-lg border-b border-slate-700">
          <div className="max-w-full mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Broker Manager
                </h1>
                <p className="text-sm text-slate-300 font-medium">
                  Administrador de colas ActiveMQ
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-700 px-4 py-2 rounded-lg text-sm text-slate-200 border border-slate-600 font-medium">
                  <div>Colas: <span className="text-blue-400 font-semibold">{queues.length}</span></div>
                  <div>Estado: <span className="text-green-400 font-semibold">Activo</span></div>
                </div>
                <Button
                  variant="outline"
                  onClick={refetchQueues}
                  disabled={queuesLoading}
                  className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white font-medium transition-all duration-200"
                >
                  <RefreshCcw className={`h-4 w-4 mr-2 ${queuesLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-full mx-auto px-6 py-6">
          <div className="space-y-6">
            {/* Filters */}
            <QueueFilters
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Main Layout: Lista de Colas + Panel de Mensajes */}
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
              {/* Lista de Colas - Columna Izquierda */}
              <div className="col-span-5 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
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
              <div className="col-span-7 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <MessagePanel
                  queue={selectedQueue}
                  messages={messages}
                  loading={messagesLoading}
                  error={messagesError}
                  onViewMessage={handleViewMessage}
                  onRefresh={handleRefreshMessages}
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