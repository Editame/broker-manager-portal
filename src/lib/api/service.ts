import { QueueInfo } from '@/types/queue';
import {BrokerQueuesResponse, Message} from './types';
import { ENDPOINTS } from './endpoints';

export async function fetchQueues(): Promise<QueueInfo[]> {
    try {
        const res = await fetch(ENDPOINTS.QUEUES);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: BrokerQueuesResponse = await res.json();
        return data.queues;
    } catch (error) {
        console.error('Error fetching queues:', error);
        throw new Error('No se pudieron obtener las colas del broker');
    }
}

export async function fetchMessages(queueName: string): Promise<Message[]> {
    try {
        const res = await fetch(ENDPOINTS.QUEUE_MESSAGES(queueName));
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw new Error('No se pudieron obtener los mensajes de la cola');
    }
}
