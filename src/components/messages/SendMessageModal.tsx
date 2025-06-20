import { useState } from 'react';
import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Send, X, Plus, Trash2, Wand2, AlertCircle, CheckCircle } from 'lucide-react';

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
      // Intentar parsear como JSON
      const parsed = JSON.parse(text);
      // Si es válido, formatearlo con indentación
      const formatted = JSON.stringify(parsed, null, 2);
      
      setMessageData(prev => ({
        ...prev,
        body: formatted
      }));
      
      setJsonStatus('valid');
    } catch (error) {
      // No es JSON válido, mantener como texto
      setJsonStatus('invalid');
    }
  };

  const handleBodyChange = (value: string) => {
    setMessageData(prev => ({ ...prev, body: value }));
    
    // Auto-detectar si es JSON válido
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
      alert('El cuerpo del mensaje es requerido');
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
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'text':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getJsonStatusText = () => {
    switch (jsonStatus) {
      case 'valid':
        return 'JSON válido';
      case 'invalid':
        return 'JSON inválido';
      case 'text':
        return 'Texto plano';
      default:
        return '';
    }
  };

  if (!queue) return null;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogContent className="max-w-7xl bg-slate-800 border border-slate-700 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-400" />
            Enviar Mensaje a: {queue.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[80vh] p-6 gap-6">
          {/* Cuerpo del mensaje - ÁREA PRINCIPAL */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-lg font-medium text-slate-300">
                Mensaje *
              </label>
              <div className="flex items-center gap-3">
                {jsonStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    {getJsonStatusIcon()}
                    <span className={`font-medium ${
                      jsonStatus === 'valid' ? 'text-green-400' :
                      jsonStatus === 'invalid' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {getJsonStatusText()}
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={validateAndFormatJson}
                  disabled={!messageData.body.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Formatear JSON
                </Button>
              </div>
            </div>
            <textarea
              value={messageData.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder={`{
  "orderId": "ORD-2024-001",
  "amount": 1250.75,
  "currency": "USD",
  "status": "pending",
  "customer": {
    "id": "cust_12345",
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "address": {
      "street": "Calle Principal 123",
      "city": "Madrid",
      "country": "España",
      "zipCode": "28001"
    }
  },
  "items": [
    {
      "id": "item_001",
      "name": "Producto A",
      "quantity": 2,
      "price": 500.00
    },
    {
      "id": "item_002", 
      "name": "Producto B",
      "quantity": 1,
      "price": 250.75
    }
  ],
  "metadata": {
    "source": "web",
    "timestamp": "2024-06-20T10:30:00Z",
    "version": "1.0"
  }
}`}
              className="flex-1 w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed min-h-[400px]"
            />
            <p className="text-sm text-slate-500 mt-2">
              Ingresa tu mensaje en formato JSON o texto plano. Usa el botón "Formatear JSON" para validar y embellecer el JSON.
            </p>
          </div>

          {/* Headers personalizados - ÁREA SECUNDARIA */}
          <div className="flex-shrink-0">
            <label className="block text-lg font-medium text-slate-300 mb-3">
              Headers Personalizados
            </label>
            
            {/* Agregar header */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={headerKey}
                onChange={(e) => setHeaderKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Clave del header"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={headerValue}
                onChange={(e) => setHeaderValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Valor del header"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                onClick={addHeader}
                disabled={!headerKey.trim() || !headerValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de headers */}
            {Object.entries(messageData.headers).length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Headers agregados:</h4>
                {Object.entries(messageData.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-slate-700 px-4 py-2 rounded">
                    <span className="text-sm text-white font-mono">
                      <span className="text-blue-400 font-medium">{key}:</span> {value}
                    </span>
                    <Button
                      type="button"
                      onClick={() => removeHeader(key)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones - ÁREA FIJA */}
          <div className="flex-shrink-0 flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 px-6 py-2"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!messageData.body.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 px-6 py-2"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
