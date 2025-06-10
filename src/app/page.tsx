'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Send, Trash2, XCircle } from 'lucide-react';
import {TooltipContent, TooltipProvider, TooltipTrigger} from '@radix-ui/react-tooltip';
import {Tooltip} from "@/components/ui/Tooltip";

interface QueueInfo {
  name: string;
  consumerCount: number;
  queueSize: number;
  enqueueCount: number;
  dequeueCount: number;
}

export default function HomePage() {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalMs] = useState(15000); // Intervalo de 15 segundos por defecto
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Simulación de datos (mock)
  useEffect(() => {
    const mockData: QueueInfo[] = Array.from({ length: 20 }).map((_, i) => ({
      name: `queue-${i + 1}`,
      consumerCount: Math.floor(Math.random() * 5),
      queueSize: Math.floor(Math.random() * 100),
      enqueueCount: Math.floor(Math.random() * 200),
      dequeueCount: Math.floor(Math.random() * 150),
    }));
    setQueues(mockData);
    setLoading(false);
  }, []);

  // Filtro y paginación
  const filteredQueues = queues.filter((q) => q.name.includes(filter));
  const paginatedQueues = filteredQueues.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  return (
      <TooltipProvider>
        <main className="p-6 bg-gray-900 min-h-screen text-white">
          <h1 className="text-3xl font-bold mb-6">Listado de Colas</h1>

          <div className="mb-4 flex items-center gap-4">
            <input
                type="text"
                placeholder="Filtrar por nombre..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
            />
          </div>

          {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded bg-gray-800" />
                ))}
              </div>
          ) : error ? (
              <p className="text-red-400">{error}</p>
          ) : (
              <div className="space-y-2">
                {/* Cabeceras globales */}
                <div className="grid grid-cols-6 gap-4 px-4 text-sm text-gray-400">
                  <div>Nombre</div>
                  <div>En cola</div>
                  <div>Consumidores</div>
                  <div>Encolados</div>
                  <div>Desencolados</div>
                  <div>Acciones</div>
                </div>

                {paginatedQueues.map((queue) => (
                    <div
                        key={queue.name}
                        className="grid grid-cols-6 gap-4 bg-gray-800 p-2 rounded-lg shadow-sm text-sm items-center"
                    >
                      <div>{queue.name}</div>
                      <div>{queue.queueSize}</div>
                      <div>{queue.consumerCount}</div>
                      <div>{queue.enqueueCount}</div>
                      <div>{queue.dequeueCount}</div>
                      <div className="flex gap-2">
                        <Tooltip content={queue.name}>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => alert(`Enviar mensaje a ${queue.name}`)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                        </Tooltip>

                        <Tooltip content={queue.name}>
                            <Button
                                size="sm"
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                onClick={() => alert(`Purgar cola ${queue.name}`)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                        </Tooltip>

                        <Tooltip content={queue.name}>
                            <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => alert(`Eliminar cola ${queue.name}`)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                      </div>
                    </div>
                ))}

                {/* Paginación */}
                <div className="flex justify-between items-center mt-4">
                  <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                      disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span className="text-gray-300">Página {currentPage}</span>
                  <button
                      onClick={() =>
                          setCurrentPage((prev) =>
                              prev * itemsPerPage < filteredQueues.length ? prev + 1 : prev
                          )
                      }
                      className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
                      disabled={currentPage * itemsPerPage >= filteredQueues.length}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
          )}
        </main>
      </TooltipProvider>
  );
}
