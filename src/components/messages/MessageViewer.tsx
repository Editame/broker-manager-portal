import { Message } from '@/types/message';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { X, Copy, Calendar, Hash, MessageCircle } from 'lucide-react';

interface MessageViewerProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageViewer({ message, isOpen, onClose }: MessageViewerProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Feedback simple sin alert
    const button = document.activeElement as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Copiado';
      setTimeout(() => {
        if (button.textContent === '✓ Copiado') {
          button.textContent = originalText;
        }
      }, 1500);
    }
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
      <DialogContent className="max-w-4xl bg-slate-800 border border-slate-700 max-h-[85vh] overflow-hidden">
        {/* Header Compacto */}
        <DialogHeader className="border-b border-slate-700 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-cyan-400" />
              <DialogTitle className="text-white text-lg">
                Mensaje
              </DialogTitle>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[70vh] p-4 gap-4">
          {/* Metadatos Compactos */}
          <div className="flex items-center gap-4 text-sm bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400">ID:</span>
              <span className="text-white font-mono text-xs">{message.id.substring(0, 16)}...</span>
              <Button
                onClick={() => copyToClipboard(message.id)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white h-6 w-6 p-0 ml-1"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400">Fecha:</span>
              <span className="text-white text-xs">
                {new Date(message.timestamp).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Contenido del Mensaje */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-300">Contenido</h3>
              <Button
                onClick={() => copyToClipboard(message.body)}
                size="sm"
                variant="ghost"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 text-xs h-7"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
            <div className="flex-1 bg-slate-900/50 border border-slate-600/30 rounded-lg overflow-hidden">
              <div className="h-full overflow-auto p-3">
                <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
                  {formatJson(message.body)}
                </pre>
              </div>
            </div>
          </div>

          {/* Headers (si existen) - Colapsable */}
          {message.headers && Object.keys(message.headers).length > 0 && (
            <div className="flex-shrink-0">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white transition-colors mb-2 list-none">
                  <span className="flex items-center gap-2">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    Headers ({Object.keys(message.headers).length})
                  </span>
                </summary>
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="space-y-1">
                    {Object.entries(message.headers).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-xs">
                        <span className="text-cyan-400 font-medium min-w-0 flex-shrink-0">
                          {key}:
                        </span>
                        <span className="text-slate-200 font-mono break-all">
                          {value?.toString() || 'null'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
