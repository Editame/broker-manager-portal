// src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import {
    Send,
    Trash2,
    XCircle,
    LogOut,
    Users,
    Eye,
    RefreshCcw,
    Plus,
    Filter,
    Table,
    Download,
} from 'lucide-react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/Dialog';
import '@/app/globals.css';

interface QueueInfo {
    name: string;
    consumerCount: number;
    queueSize: number;
    enqueueCount: number;
    dequeueCount: number;
}

interface Message {
    id: string;
    timestamp: string;
    body: string;
}

export default function HomePage() {
    const [queues, setQueues] = useState<QueueInfo[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedQueue, setSelectedQueue] = useState<QueueInfo | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [prefixFilter, setPrefixFilter] = useState('');
    const [suffixFilter, setSuffixFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        const mockQueues: QueueInfo[] = Array.from({ length: 20 }).map((_, i) => ({
            name: `queue-${i + 1}`,
            consumerCount: Math.floor(Math.random() * 5),
            queueSize: Math.floor(Math.random() * 100),
            enqueueCount: Math.floor(Math.random() * 200),
            dequeueCount: Math.floor(Math.random() * 150),
        }));
        setQueues(mockQueues);
        setLoading(false);
    }, []);

    const filteredQueues = queues.filter((q) =>
        q.name.includes(filter) &&
        (prefixFilter ? q.name.startsWith(prefixFilter) : true) &&
        (suffixFilter ? q.name.endsWith(suffixFilter) : true)
    );

    const paginatedQueues = filteredQueues.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openQueue = (queue: QueueInfo) => {
        setSelectedQueue(queue);
        // Datos simulados por ahora
        setMessages([
            {
                id: `ID:${queue.name}-1`,
                timestamp: new Date().toISOString(),
                body: JSON.stringify({ hola: 'mundo', cola: queue.name }, null, 2),
            },
        ]);
        setSelectedMessage(null);
    };

    return (
        <TooltipProvider>
            <main className="bg-[#121212] min-h-screen py-10 px-4 text-[#E0E0E0] font-sans">
                <div className="max-w-8xl mx-auto w-full bg-[#1F1F1F] rounded-2xl shadow-2xl shadow-black/40 p-16">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-semibold tracking-tight">Broker Manager</h1>
                        <div className="flex items-center gap-4">
                            <div className="bg-[#2A2A2A] px-4 py-2 rounded-md shadow-inner text-sm text-gray-200 border border-white/10">
                                <div>Broker: <span className="text-green-400 font-medium">ActiveMq</span></div>
                                <div>Estado: <span className="text-green-400 font-medium">Activo</span></div>
                                <div>CPU: 42%</div>
                                <div>Memoria: 68%</div>
                            </div>
                            <Button className="bg-[#E57373] hover:bg-red-700 text-white shadow">
                                <LogOut className="w-4 h-4 inline mr-1" /> Salir
                            </Button>
                        </div>
                    </div>

                    <div className="mb-8 flex flex-wrap items-center gap-4">
                        <input
                            type="text"
                            placeholder="Filtrar por nombre..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 rounded bg-[#2A2A2A] text-white border border-white/20"
                        />
                        <input
                            type="text"
                            placeholder="Prefijo..."
                            value={prefixFilter}
                            onChange={(e) => setPrefixFilter(e.target.value)}
                            className="px-3 py-2 rounded bg-[#2A2A2A] text-white border border-white/20"
                        />
                        <input
                            type="text"
                            placeholder="Sufijo..."
                            value={suffixFilter}
                            onChange={(e) => setSuffixFilter(e.target.value)}
                            className="px-3 py-2 rounded bg-[#2A2A2A] text-white border border-white/20"
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded bg-[#2A2A2A]" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] text-sm text-white divide-x divide-[#2A2A2A] border border-white/10 rounded-md bg-[#1F1F1F] shadow shadow-black/30">
                                <div className="text-center py-3">Nombre</div>
                                <div className="text-center py-3">En cola</div>
                                <div className="text-center py-3">Consumidores</div>
                                <div className="text-center py-3">Encolados</div>
                                <div className="text-center py-3">Desencolados</div>
                                <div className="text-center py-3">Acciones</div>
                            </div>

                            {paginatedQueues.map((queue) => (
                                <div
                                    key={queue.name}
                                    className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] bg-[#1F1F1F] px-2 py-3 rounded-md text-sm items-center divide-x divide-[#2A2A2A] border border-white/10 shadow-md shadow-black/20 hover:bg-[#232323] transition"
                                >
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div
                                                className="truncate pl-2 font-medium text-white flex items-center gap-2 cursor-pointer"
                                                onClick={() => openQueue(queue)}
                                            >
                                                {queue.name}
                                                <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">
                          {queue.consumerCount} <Users className="inline w-3 h-3" />
                        </span>
                                            </div>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-6xl h-[80vh] overflow-hidden p-6">
                                            <div className="flex gap-4 mb-4 text-white border-b border-white/10 pb-2">
                                                <Tooltip content="Refrescar">
                                                    <Button variant="ghost" size="icon">
                                                        <RefreshCcw className="w-5 h-5" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Añadir mensaje">
                                                    <Button variant="ghost" size="icon">
                                                        <Plus className="w-5 h-5" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Exportar">
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="w-5 h-5" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Filtrar mensajes">
                                                    <Button variant="ghost" size="icon">
                                                        <Filter className="w-5 h-5" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Configurar columnas">
                                                    <Button variant="ghost" size="icon">
                                                        <Table className="w-5 h-5" />
                                                    </Button>
                                                </Tooltip>
                                            </div>

                                            <div className="grid grid-cols-[3fr_1fr_1fr_auto] text-sm text-white border border-white/10 rounded mb-2 bg-[#2A2A2A]">
                                                <div className="p-2">Message ID</div>
                                                <div className="p-2">Timestamp</div>
                                                <div className="p-2">Operaciones</div>
                                            </div>

                                            <div className="h-40 overflow-y-auto mb-4">
                                                {messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className="grid grid-cols-[3fr_1fr_1fr_auto] items-center border-t border-white/10 px-2 py-2 text-sm hover:bg-[#1F1F1F] transition cursor-pointer"
                                                        onClick={() => setSelectedMessage(msg)}
                                                    >
                                                        <div className="truncate">{msg.id}</div>
                                                        <div>{msg.timestamp}</div>
                                                        <div>
                                                            <Tooltip content="Eliminar">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-400 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="text-white">
                                                <label className="block mb-1 font-medium">Contenido del mensaje:</label>
                                                <textarea
                                                    value={selectedMessage?.body || ''}
                                                    onChange={(e) =>
                                                        setSelectedMessage((msg) => msg ? { ...msg, body: e.target.value } : null)
                                                    }
                                                    className="w-full h-40 bg-[#121212] text-white border border-white/10 rounded p-2 font-mono resize-none"
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <div className="text-center text-white">{queue.queueSize}</div>
                                    <div className="text-center text-white">{queue.consumerCount}</div>
                                    <div className="text-center text-white">{queue.enqueueCount}</div>
                                    <div className="text-center text-white">{queue.dequeueCount}</div>
                                    <div className="flex justify-center gap-2 px-2">
                                        <Tooltip content="Enviar mensaje">
                                            <Button className="bg-[#4B8DF8] hover:bg-[#5EA0FC] text-white shadow-sm">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Purgar cola">
                                            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm">
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Eliminar cola">
                                            <Button className="bg-[#E57373] hover:bg-red-700 text-white shadow-sm">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="px-4 py-2 bg-[#4B8DF8] hover:bg-[#5EA0FC] text-white rounded disabled:opacity-50 shadow"
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </button>
                                <span className="text-white">Página {currentPage}</span>
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            prev * itemsPerPage < filteredQueues.length ? prev + 1 : prev
                                        )
                                    }
                                    className="px-4 py-2 bg-[#4B8DF8] hover:bg-[#5EA0FC] text-white rounded disabled:opacity-50 shadow"
                                    disabled={currentPage * itemsPerPage >= filteredQueues.length}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </TooltipProvider>
    );
}
