import { Message } from '@/types/message';
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Copy, Download } from 'lucide-react';

interface MessageViewerProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageViewer({ message, isOpen, onClose }: MessageViewerProps) {
  if (!message) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar una notificación de éxito
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const downloadMessage = () => {
    const blob = new Blob([message.body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${message.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles del Mensaje</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(message.body)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadMessage}
              >
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Mensaje
              </label>
              <div className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                {message.id}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timestamp
              </label>
              <div className="text-sm text-gray-900 bg-white p-2 rounded border">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido del Mensaje
            </label>
            <div className="flex-1 overflow-auto bg-gray-50 p-4 rounded-lg border">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                {message.body}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
