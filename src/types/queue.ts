export interface QueueInfo {
  name: string;
  type: string;
  status: string;
  queueSize: number;
  enqueueCount: number;
  dequeueCount: number;
  inflightCount: number;
  expiredCount: number;
  consumerCount: number;
  producerCount: number;
  memoryLimit: number;
  memoryPercentUsage: number;
  paused: boolean;
  createdAt: string;
  lastMessageTime?: string;
  messageGroups?: MessageGroupInfo[];
  empty: boolean;
  hasConsumers: boolean;
  highLoad: boolean;
  processingRate: number;
}

export interface MessageGroupInfo {
  id: string;
  name: string;
}

export interface QueueFilters {
  general: string;
  prefix: string;
  suffix: string;
}
