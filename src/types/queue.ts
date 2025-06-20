export interface QueueInfo {
  name: string;
  queueSize: number;
  enqueueCount: number;
  dequeueCount: number;
  consumerCount: number;
  messageGroups?: MessageGroupInfo[];
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
