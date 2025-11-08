import { Process, PageTableEntry, SegmentTableEntry } from '@/types/memory';

const PAGE_SIZE = 4096; // 4KB
const MAX_MEMORY = 1048576; // 1MB

export const calculatePaging = (processes: Process[]): PageTableEntry[] => {
  const pageTable: PageTableEntry[] = [];
  let currentFrame = 0;

  processes.forEach((process) => {
    const pagesNeeded = Math.ceil(process.size / PAGE_SIZE);
    
    for (let i = 0; i < pagesNeeded; i++) {
      const remainingSize = process.size - (i * PAGE_SIZE);
      const pageSize = Math.min(PAGE_SIZE, remainingSize);
      
      pageTable.push({
        processId: process.id,
        pageNumber: i,
        frameNumber: currentFrame++,
        size: pageSize,
      });
    }
  });

  return pageTable;
};

export const calculateSegmentation = (processes: Process[]): SegmentTableEntry[] => {
  const segmentTable: SegmentTableEntry[] = [];
  let currentBase = 0;

  processes.forEach((process, index) => {
    segmentTable.push({
      processId: process.id,
      segmentNumber: index,
      base: currentBase,
      limit: process.size,
      size: process.size,
    });
    currentBase += process.size;
  });

  return segmentTable;
};

export const getProcessColors = (processId: number): string => {
  const colors = [
    'hsl(187 100% 50%)', // Cyan
    'hsl(145 65% 50%)',  // Green
    'hsl(40 90% 55%)',   // Yellow
    'hsl(280 70% 60%)',  // Purple
    'hsl(15 85% 60%)',   // Orange
    'hsl(200 100% 45%)', // Blue
  ];
  return colors[processId % colors.length];
};
