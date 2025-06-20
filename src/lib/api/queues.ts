export interface QueueInfo {
    name: string;
    consumerCount: number;
    queueSize: number;
    enqueueCount: number;
    dequeueCount: number;
}

export async function fetchQueues(): Promise<QueueInfo[]> {
    const res = await fetch('http://localhost:3001/queues'); // o tu endpoint real
    if (!res.ok) {
        throw new Error('No se pudieron obtener las colas');
    }
    return res.json();
}

export async function fetchMessages(queueName: string) {
    const res = await fetch(`http://localhost:3001/queues/${queueName}/messages`);
    if (!res.ok) {
        throw new Error('No se pudieron obtener los mensajes de la cola');
    }
    return res.json();
}
