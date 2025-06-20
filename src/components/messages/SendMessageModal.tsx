import { useState } from 'react';
import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Send, X, Plus, Trash2, Wand2, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react';

interface SendMessageModalProps {
  queue: QueueInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (messageData: SendMessageData) => void;
}

export interface SendMessageData {
  body: string;
  headers: Record<string, string>;
}

export function SendMessageModal({ queue, isOpen, onClose, onSend }: SendMessageModalProps) {
  const [messageData, setMessageData] = useState<SendMessageData>({
    body: '',
    headers: {},
  });

  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [jsonStatus, setJsonStatus] = useState<'valid' | 'invalid' | 'text' | null>(null);

  const validateAndFormatJson = () => {
    const text = messageData.body.trim();
    
    if (!text) {
      setJsonStatus(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      
      setMessageData(prev => ({
        ...prev,
        body: formatted
      }));
      
      setJsonStatus('valid');
    } catch (error) {
      setJsonStatus('invalid');
    }
  };

  const handleBodyChange = (value: string) => {
    setMessageData(prev => ({ ...prev, body: value }));
    
    if (value.trim()) {
      try {
        JSON.parse(value.trim());
        setJsonStatus('valid');
      } catch {
        setJsonStatus('text');
      }
    } else {
      setJsonStatus(null);
    }
  };

  const handleSend = () => {
    if (!messageData.body.trim()) {
      return;
    }
    
    onSend(messageData);
    handleClose();
  };

  const handleClose = () => {
    setMessageData({
      body: '',
      headers: {},
    });
    setHeaderKey('');
    setHeaderValue('');
    setJsonStatus(null);
    onClose();
  };

  const addHeader = () => {
    if (headerKey.trim() && headerValue.trim()) {
      setMessageData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [headerKey.trim()]: headerValue.trim()
        }
      }));
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    setMessageData(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return {
        ...prev,
        headers: newHeaders
      };
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addHeader();
    }
  };

  const getJsonStatusIcon = () => {
    switch (jsonStatus) {
      case 'valid':
        return <CheckCircle className="h-3 w-3 text-emerald-400" />;
      case 'invalid':
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      case 'text':
        return <AlertCircle className="h-3 w-3 text-amber-400" />;
      default:
        return null;
    }
  };

  if (!queue) return null;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogContent className="max-w-5xl bg-slate-800 border border-slate-700 max-h-[85vh] overflow-hidden">
        {/* Header Compacto */}
        <DialogHeader className="border-b border-slate-700 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-teal-400" />
              <DialogTitle className="text-white text-lg">
                Enviar a: <span className="text-teal-400 font-mono text-base">{queue.name}</span>
              </DialogTitle>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[70vh] p-4 gap-4">
          {/* Área de Mensaje - Principal */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Contenido del Mensaje *
              </label>
              <div className="flex items-center gap-2">
                {jsonStatus && (
                  <div className="flex items-center gap-1 text-xs">
                    {getJsonStatusIcon()}
                    <span className={`${
                      jsonStatus === 'valid' ? 'text-emerald-400' :
                      jsonStatus === 'invalid' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {jsonStatus === 'valid' ? 'JSON válido' :
                       jsonStatus === 'invalid' ? 'JSON inválido' : 'Texto'}
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={validateAndFormatJson}
                  disabled={!messageData.body.trim()}
                  size="sm"
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 text-xs h-7"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Formatear
                </Button>
              </div>
            </div>
            
            <textarea
              value={messageData.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder={`{"orderId": "12345", "amount": 99.99, "status": "pending"}`}
              className="flex-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 resize-none font-mono text-sm leading-relaxed min-h-[300px]"
            />
          </div>

          {/* Headers - Área Secundaria Colapsable */}
          <div className="flex-shrink-0">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white transition-colors mb-2 list-none">
                <span className="flex items-center gap-2">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  Headers Personalizados ({Object.keys(messageData.headers).length})
                </span>
              </summary>
              
              <div className="space-y-3 mt-3">
                {/* Agregar header */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={headerKey}
                    onChange={(e) => setHeaderKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Clave"
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50 text-sm"
                  />
                  <input
                    type="text"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Valor"
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={addHeader}
                    disabled={!headerKey.trim() || !headerValue.trim()}
                    size="sm"
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 disabled:opacity-30 h-9 w-9 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de headers */}
                {Object.entries(messageData.headers).length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto bg-slate-700/20 border border-slate-600/30 rounded p-2">
                    {Object.entries(messageData.headers).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-slate-700/50 px-2 py-1 rounded text-xs">
                        <span className="text-white font-mono truncate">
                          <span className="text-teal-400">{key}:</span> {value}
                        </span>
                        <Button
                          type="button"
                          onClick={() => removeHeader(key)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-6 w-6 p-0 ml-2 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Botones */}
          <div className="flex-shrink-0 flex justify-end gap-2 pt-3 border-t border-slate-700/50">
            <Button
              type="button"
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-600/50"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!messageData.body.trim()}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-30"
            >
              <Send className="h-3 w-3 mr-1" />
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
