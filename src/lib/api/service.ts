import { QueueInfo } from '@/types/queue';
import { Message } from '@/types/message';
import { BrokerQueuesResponse } from './types';
import { ENDPOINTS } from './endpoints';

export async function fetchQueues(): Promise<QueueInfo[]> {
    try {
        const res = await fetch(ENDPOINTS.QUEUES);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // El backend devuelve directamente un array, no un objeto con propiedad queues
        return Array.isArray(data) ? data : data.queues || [];
    } catch (error) {
        console.error('Error fetching queues:', error);
        throw new Error('No se pudieron obtener las colas del broker');
    }
}

export async function fetchMessages(queueName: string): Promise<Message[]> {
    try {
        console.log('Fetching messages for queue:', queueName);
        const url = ENDPOINTS.QUEUE_MESSAGES(queueName);
        console.log('URL:', url);
        
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log('Messages data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw new Error('No se pudieron obtener los mensajes de la cola');
    }
}

export interface SendMessageRequest {
    body: string;
    headers?: Record<string, any>;
    type?: string;
    priority?: number;
    timeToLive?: number;
}

export async function sendMessage(queueName: string, messageData: SendMessageRequest): Promise<string> {
    try {
        console.log('Sending message to queue:', queueName, messageData);
        
        const res = await fetch(ENDPOINTS.QUEUE_MESSAGES(queueName), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const response = await res.text();
        console.log('Message sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('No se pudo enviar el mensaje a la cola');
    }
}

export async function deleteMessage(queueName: string, messageId: string): Promise<void> {
    try {
        console.log('Deleting message:', messageId, 'from queue:', queueName);
        
        const res = await fetch(ENDPOINTS.QUEUE_MESSAGE(queueName, messageId), {
            method: 'DELETE',
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        console.log('Message deleted successfully');
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error('No se pudo eliminar el mensaje');
    }
}
