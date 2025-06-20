export const ITEMS_PER_PAGE = 15;

export const QUEUE_STATUS = {
  HIGH_LOAD: 'HIGH_LOAD',
  MEDIUM_LOAD: 'MEDIUM_LOAD',
  NO_CONSUMERS: 'NO_CONSUMERS',
  NORMAL: 'NORMAL',
} as const;

export const QUEUE_THRESHOLDS = {
  HIGH_LOAD: 100,
  MEDIUM_LOAD: 10,
} as const;
