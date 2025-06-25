import { QueueInfo } from '@/types/queue';
import { Message } from '@/types/message';
import { BrokerQueuesResponse } from './types';
import { ENDPOINTS } from './endpoints';
import { cachedFetch } from '@/lib/cache';

export async function fetchQueues(): Promise<QueueInfo[]> {
    return cachedFetch(
        'queues',
        async () => {
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
        },
        10 // Cache por 10 segundos
    );
}

export async function fetchMessages(queueName: string): Promise<Message[]> {
    console.log(`🔄 API: Starting fetchMessages for queue: ${queueName}`);
    const apiStartTime = performance.now();
    
    return cachedFetch(
        `messages-${queueName}`,
        async () => {
            try {
                console.log(`🌐 API: Making HTTP request for queue: ${queueName}`);
                const httpStartTime = performance.now();
                
                const url = ENDPOINTS.QUEUE_MESSAGES(queueName);
                console.log('📡 API: Request URL:', url);
                
                const res = await fetch(url);
                const httpEndTime = performance.now();
                console.log(`⏱️ API: HTTP request took ${(httpEndTime - httpStartTime).toFixed(2)}ms`);
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const parseStartTime = performance.now();
                const data = await res.json();
                const parseEndTime = performance.now();
                console.log(`📋 API: JSON parsing took ${(parseEndTime - parseStartTime).toFixed(2)}ms`);
                console.log(`📊 API: Retrieved ${data.length} messages from backend`);
                
                return data;
            } catch (error) {
                console.error('❌ API: Error fetching messages:', error);
                throw new Error('No se pudieron obtener los mensajes de la cola');
            }
        },
        3 // Reducir cache a 3 segundos para mejor respuesta
    ).finally(() => {
        const apiEndTime = performance.now();
        console.log(`🏁 API: Total fetchMessages took ${(apiEndTime - apiStartTime).toFixed(2)}ms`);
    });
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
        
        // Invalidar cache de mensajes para esta cola
        const { apiCache } = await import('@/lib/cache');
        if (apiCache && typeof apiCache.cache?.delete === 'function') {
          apiCache.cache.delete(`messages-${queueName}`);
        }
        
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
        
        // Invalidar cache de mensajes para esta cola
        const { apiCache } = await import('@/lib/cache');
        if (apiCache && typeof apiCache.cache?.delete === 'function') {
          apiCache.cache.delete(`messages-${queueName}`);
        }
        
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error('No se pudo eliminar el mensaje');
    }
}
