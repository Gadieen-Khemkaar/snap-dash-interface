export interface Process {
  id: number;
  size: number;
}

export interface PageTableEntry {
  processId: number;
  pageNumber: number;
  frameNumber: number;
  size: number;
}

export interface SegmentTableEntry {
  processId: number;
  segmentNumber: number;
  base: number;
  limit: number;
  size: number;
}

export interface MemoryBlock {
  id: number;
  start: number;
  size: number;
  processId?: number;
  type: 'free' | 'allocated';
}

export type AllocationStrategy = 'first-fit' | 'best-fit' | 'worst-fit';

export interface AllocationResult {
  blocks: MemoryBlock[];
  internalFragmentation: number;
  externalFragmentation: number;
  totalAllocated: number;
  totalFree: number;
}

export interface MemoryAccess {
  processId: number;
  address: number;
  timestamp: number;
}
