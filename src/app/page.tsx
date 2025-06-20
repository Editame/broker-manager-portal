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
import { MessageList } from '@/components/messages/MessageList';
import { MessageViewer } from '@/components/messages/MessageViewer';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

// Types
import { QueueInfo, QueueFilters as QueueFiltersType } from '@/types/queue';
import { Message } from '@/types/message';

import '@/app/globals.css';

export default function HomePage() {
  // Queue management
  const { queues, loading: queuesLoading, error: queuesError, refetch: refetchQueues } = useQueues();
  const { messages, loading: messagesLoading, error: messagesError, loadMessages, clearMessages } = useMessages();

  // UI State
  const [selectedQueue, setSelectedQueue] = useState<QueueInfo | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filters, setFilters] = useState<QueueFiltersType>({
    general: '',
    prefix: '',
    suffix: '',
  });

  // Handlers
  const handleSelectQueue = (queue: QueueInfo) => {
    setSelectedQueue(queue);
    clearMessages();
  };

  const handleViewMessages = async (queue: QueueInfo) => {
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

  const handlePurgeQueue = (queue: QueueInfo) => {
    // TODO: Implementar purga de cola
    console.log('Purgar cola:', queue.name);
  };

  const handleDeleteQueue = (queue: QueueInfo) => {
    // TODO: Implementar eliminación de cola
    console.log('Eliminar cola:', queue.name);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Broker Manager
                </h1>
                <p className="text-sm text-gray-600">
                  Administrador de colas ActiveMQ
                </p>
              </div>
              <Button
                variant="outline"
                onClick={refetchQueues}
                disabled={queuesLoading}
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${queuesLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Filters */}
            <QueueFilters
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Queues Section */}
            <div>
              {queuesLoading ? (
                <LoadingSpinner count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
              ) : queuesError ? (
                <ErrorMessage message={queuesError} onRetry={refetchQueues} />
              ) : (
                <QueueList
                  queues={queues}
                  filters={filters}
                  selectedQueue={selectedQueue}
                  onSelectQueue={handleSelectQueue}
                  onViewMessages={handleViewMessages}
                  onPurgeQueue={handlePurgeQueue}
                  onDeleteQueue={handleDeleteQueue}
                />
              )}
            </div>

            {/* Messages Section */}
            <MessageList
              queue={selectedQueue}
              messages={messages}
              loading={messagesLoading}
              error={messagesError}
              onViewMessage={handleViewMessage}
              onRefresh={handleRefreshMessages}
            />
          </div>
        </main>

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