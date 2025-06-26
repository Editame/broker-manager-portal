import { QueueInfo } from '@/types/queue';
import { Message } from '@/types/message';
import { BrokerQueuesResponse } from './types';
import { API_CONFIG, buildApiUrl, buildApiUrlWithConnection } from '@/lib/config/api';
import { cachedFetch } from '@/lib/cache';

export async function fetchQueues(connectionId: string): Promise<QueueInfo[]> {
    return cachedFetch(
        `queues-${connectionId}`,
        async () => {
            try {
                const res = await fetch(buildApiUrlWithConnection(API_CONFIG.ENDPOINTS.QUEUES, connectionId));
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

export async function fetchMessages(queueName: string, connectionId: string): Promise<Message[]> {
    console.log(`🔄 API: Starting fetchMessages for queue: ${queueName} on connection: ${connectionId}`);
    const apiStartTime = performance.now();
    
    return cachedFetch(
        `messages-${queueName}-${connectionId}`,
        async () => {
            try {
                console.log(`🌐 API: Making HTTP request for queue: ${queueName}`);
                const httpStartTime = performance.now();
                
                const url = buildApiUrlWithConnection(API_CONFIG.ENDPOINTS.QUEUE_MESSAGES(queueName), connectionId);
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
    persistent?: boolean;
}

export async function sendMessage(queueName: string, messageData: SendMessageRequest, connectionId: string): Promise<string> {
    try {
        console.log('Sending message to queue:', queueName, 'on connection:', connectionId, messageData);
        
        const res = await fetch(buildApiUrlWithConnection(API_CONFIG.ENDPOINTS.QUEUE_MESSAGES(queueName), connectionId), {
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
        if (apiCache && typeof apiCache.delete === 'function') {
          apiCache.delete(`messages-${queueName}-${connectionId}`);
        }
        
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('No se pudo enviar el mensaje a la cola');
    }
}

export async function deleteMessage(queueName: string, messageId: string, connectionId: string): Promise<void> {
    try {
        console.log('Deleting message:', messageId, 'from queue:', queueName, 'on connection:', connectionId);
        
        const res = await fetch(buildApiUrlWithConnection(API_CONFIG.ENDPOINTS.QUEUE_MESSAGE(queueName, messageId), connectionId), {
            method: 'DELETE',
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        console.log('Message deleted successfully');
        
        // Invalidar cache de mensajes para esta cola
        const { apiCache } = await import('@/lib/cache');
        if (apiCache && typeof apiCache.delete === 'function') {
          apiCache.delete(`messages-${queueName}-${connectionId}`);
        }
        
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error('No se pudo eliminar el mensaje');
    }
}
export async function requeueMessages(sourceQueue: string, targetQueue: string, messageIds: string[], operation: 'copy' | 'cut' = 'copy', connectionId: string): Promise<boolean> {
    console.log(`🔄 API: ${operation === 'cut' ? 'Moving' : 'Copying'} ${messageIds.length} messages from ${sourceQueue} to ${targetQueue}`);
    
    try {
        // 1. Obtener los mensajes completos de la cola origen
        const messages = await fetchMessages(sourceQueue, connectionId);
        const messagesToRequeue = messages.filter(msg => messageIds.includes(msg.id));
        
        if (messagesToRequeue.length === 0) {
            throw new Error('No se encontraron los mensajes a reencolar');
        }
        
        console.log(`📦 API: Encontrados ${messagesToRequeue.length} mensajes para ${operation === 'cut' ? 'mover' : 'copiar'}`);
        
        // 2. Enviar cada mensaje a la cola destino
        for (const message of messagesToRequeue) {
            await sendMessage(targetQueue, {
                body: message.body,
                headers: {}, // Los mensajes simples no tienen headers
                priority: 4, // Prioridad por defecto
                timeToLive: 0,
                persistent: true
            }, connectionId);
        }
        
        console.log(`✅ API: ${messagesToRequeue.length} mensajes enviados a ${targetQueue}`);
        
        // 3. Si es operación de "cortar", eliminar los mensajes de la cola origen
        if (operation === 'cut') {
            console.log(`🗑️ API: Eliminando ${messageIds.length} mensajes de la cola origen ${sourceQueue}`);
            
            for (const messageId of messageIds) {
                try {
                    await deleteMessage(sourceQueue, messageId, connectionId);
                    console.log(`✅ API: Mensaje ${messageId} eliminado de ${sourceQueue}`);
                } catch (error) {
                    console.error(`❌ API: Error eliminando mensaje ${messageId} de ${sourceQueue}:`, error);
                    // Continuamos con los demás mensajes aunque uno falle
                }
            }
            
            console.log(`✅ API: Operación de mover completada`);
        }
        
        return true;
    } catch (error) {
        console.error('Error requeueing messages:', error);
        throw new Error('No se pudieron reencolar los mensajes');
    }
}
export async function purgeQueue(queueName: string, connectionId: string): Promise<void> {
    try {
        console.log('Purgando cola:', queueName, 'on connection:', connectionId);
        
        const res = await fetch(buildApiUrlWithConnection(API_CONFIG.ENDPOINTS.QUEUE_MESSAGES(queueName), connectionId), {
            method: 'DELETE',
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        console.log('Cola purgada exitosamente');
        
        // Invalidar cache de mensajes para esta cola
        const { apiCache } = await import('@/lib/cache');
        if (apiCache && typeof apiCache.delete === 'function') {
          apiCache.delete(`messages-${queueName}-${connectionId}`);
          apiCache.delete(`queues-${connectionId}`); // También invalidar la caché de colas
        }
        
    } catch (error) {
        console.error('Error purgando cola:', error);
        throw new Error('No se pudo purgar la cola');
    }
}
