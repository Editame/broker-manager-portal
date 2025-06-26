import { Button } from '@/components/ui/Button';
import { X, AlertCircle } from 'lucide-react';
import { QueueInfo } from '@/types/queue';
import { Message } from '@/types/message';

interface RequeueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sourceQueue: string | null;
  targetQueue: QueueInfo | null;
  messages: Message[];
  operation: 'copy' | 'cut' | null;
}

export function RequeueModal({
  isOpen,
  onClose,
  onConfirm,
  sourceQueue,
  targetQueue,
  messages,
  operation
}: RequeueModalProps) {
  if (!isOpen) return null;

  const operationText = operation === 'cut' ? 'mover' : 'copiar';
  const operationColor = operation === 'cut' ? 'text-amber-600' : 'text-blue-600';
  const operationIcon = operation === 'cut' ? '✂️' : '📋';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Confirmar Operación</h2>
          </div>
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que deseas {operationText} <span className="font-semibold">{messages.length}</span> mensaje(s) 
              {sourceQueue && <> de <span className="font-semibold text-blue-600">{sourceQueue}</span></>} a 
              {targetQueue && <> <span className="font-semibold text-green-600">{targetQueue.name}</span></>}?
            </p>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{operationIcon}</span>
                <span className={`font-medium ${operationColor}`}>
                  {operation === 'cut' ? 'Mover mensajes' : 'Copiar mensajes'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {operation === 'cut' 
                  ? 'Los mensajes serán eliminados de la cola origen después de ser copiados a la cola destino.'
                  : 'Los mensajes serán copiados a la cola destino, manteniendo los originales en la cola origen.'}
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Esta operación no se puede deshacer.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className={operation === 'cut' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {operation === 'cut' ? 'Mover mensajes' : 'Copiar mensajes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
