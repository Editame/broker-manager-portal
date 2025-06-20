import {QueueInfo} from "@/types/queue";

export interface MessageGroupInfo {
  id: string;
  name: string;
}

export interface BrokerQueuesResponse {
  queues: QueueInfo[];
}

// Re-export types from main types folder
export type { QueueInfo } from '@/types/queue';
export type { Message } from '@/types/message';
