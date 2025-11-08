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
