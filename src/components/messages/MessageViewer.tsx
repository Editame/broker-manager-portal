import { Message } from '@/types/message';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { X, Eye, Copy, Calendar, Hash } from 'lucide-react';

interface MessageViewerProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageViewer({ message, isOpen, onClose }: MessageViewerProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  const formatJson = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  };

  if (!message) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border border-slate-700 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Detalles del Mensaje
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[70vh] p-6 gap-6">
          {/* Información del mensaje */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">ID del Mensaje</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono break-all">{message.id}</span>
                <Button
                  onClick={() => copyToClipboard(message.id)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-slate-300">Fecha y Hora</span>
              </div>
              <span className="text-sm text-white">{new Date(message.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Cuerpo del mensaje */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-slate-300">Cuerpo del Mensaje</h3>
              <Button
                onClick={() => copyToClipboard(message.body)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="flex-1 bg-slate-700 p-4 rounded-lg overflow-auto">
              <pre className="text-sm text-white font-mono whitespace-pre-wrap break-words">
                {formatJson(message.body)}
              </pre>
            </div>
          </div>

          {/* Headers */}
          {message.headers && Object.keys(message.headers).length > 0 && (
            <div className="flex-shrink-0">
              <h3 className="text-lg font-medium text-slate-300 mb-3">Headers</h3>
              <div className="bg-slate-700 p-4 rounded-lg max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {Object.entries(message.headers).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium text-sm min-w-0 flex-shrink-0">
                        {key}:
                      </span>
                      <span className="text-white text-sm font-mono break-all">
                        {value?.toString() || 'null'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex-shrink-0 flex justify-end pt-4 border-t border-slate-700">
            <Button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
