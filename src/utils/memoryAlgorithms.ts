import { Process, PageTableEntry, SegmentTableEntry, MemoryBlock, AllocationStrategy, AllocationResult } from '@/types/memory';

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

// Memory Allocation Strategies
export const allocateMemory = (
  processes: Process[],
  strategy: AllocationStrategy
): AllocationResult => {
  const blocks: MemoryBlock[] = [];
  let totalInternalFragmentation = 0;
  
  // Pre-fragment memory strategically to show differences between strategies
  // Create free blocks sized relative to typical process sizes
  // This ensures different strategies will make different choices
  const freeBlocks: MemoryBlock[] = [];
  
  // Calculate average process size to create strategic gaps
  const avgProcessSize = processes.reduce((sum, p) => sum + p.size, 0) / processes.length || 10000;
  
  // Create fragmented memory with strategic block sizes
  const gaps = [
    { start: 0, size: Math.floor(avgProcessSize * 0.8) },           // Small gap - fits only small processes
    { start: 50000, size: Math.floor(avgProcessSize * 1.5) },       // Medium gap - fits small/medium
    { start: 120000, size: Math.floor(avgProcessSize * 0.9) },      // Small gap
    { start: 200000, size: Math.floor(avgProcessSize * 2.5) },      // Large gap - fits most processes
    { start: 320000, size: Math.floor(avgProcessSize * 1.2) },      // Medium gap
    { start: 420000, size: MAX_MEMORY - 420000 }                     // Huge remaining space
  ];
  
  gaps.forEach((gap, idx) => {
    freeBlocks.push({
      id: idx,
      start: gap.start,
      size: gap.size,
      type: 'free'
    });
  });

  processes.forEach((process, index) => {
    let selectedBlockIndex = -1;

    switch (strategy) {
      case 'first-fit':
        selectedBlockIndex = freeBlocks.findIndex(block => block.size >= process.size);
        break;
      
      case 'best-fit':
        let minSize = Infinity;
        freeBlocks.forEach((block, i) => {
          if (block.size >= process.size && block.size < minSize) {
            minSize = block.size;
            selectedBlockIndex = i;
          }
        });
        break;
      
      case 'worst-fit':
        let maxSize = -1;
        freeBlocks.forEach((block, i) => {
          if (block.size >= process.size && block.size > maxSize) {
            maxSize = block.size;
            selectedBlockIndex = i;
          }
        });
        break;
    }

    console.log(`[${strategy}] Process ${process.id} (${process.size} bytes):`, {
      availableBlocks: freeBlocks.map(b => b.size),
      selectedBlockIndex,
      selectedBlockSize: selectedBlockIndex >= 0 ? freeBlocks[selectedBlockIndex].size : 'N/A'
    });

    if (selectedBlockIndex !== -1) {
      const selectedBlock = freeBlocks[selectedBlockIndex];
      
      // Allocate memory
      blocks.push({
        id: blocks.length,
        start: selectedBlock.start,
        size: process.size,
        processId: process.id,
        type: 'allocated'
      });

      // Calculate internal fragmentation (unused space within allocated block)
      const blockSize = Math.ceil(process.size / PAGE_SIZE) * PAGE_SIZE;
      totalInternalFragmentation += blockSize - process.size;

      // Update free blocks
      const remainingSize = selectedBlock.size - process.size;
      if (remainingSize > 0) {
        freeBlocks[selectedBlockIndex] = {
          id: freeBlocks.length,
          start: selectedBlock.start + process.size,
          size: remainingSize,
          type: 'free'
        };
      } else {
        freeBlocks.splice(selectedBlockIndex, 1);
      }
    }
  });

  // Calculate external fragmentation (free space that can't be used)
  const totalFree = freeBlocks.reduce((sum, block) => sum + block.size, 0);
  const totalAllocated = blocks.reduce((sum, block) => sum + block.size, 0);
  const largestFreeBlock = Math.max(0, ...freeBlocks.map(b => b.size));
  const externalFragmentation = totalFree - largestFreeBlock;

  return {
    blocks,
    internalFragmentation: totalInternalFragmentation,
    externalFragmentation,
    totalAllocated,
    totalFree
  };
};

export const calculateFragmentation = (processes: Process[]): {
  paging: { internal: number; external: number };
  segmentation: { internal: number; external: number };
} => {
  // Paging fragmentation
  let pagingInternal = 0;
  processes.forEach(process => {
    const pagesNeeded = Math.ceil(process.size / PAGE_SIZE);
    const allocatedSize = pagesNeeded * PAGE_SIZE;
    pagingInternal += allocatedSize - process.size;
  });

  // Segmentation fragmentation - simulate with variable allocation
  // In segmentation, processes are allocated contiguously but can leave gaps
  const blocks: MemoryBlock[] = [];
  let currentAddress = 0;
  let segmentationExternal = 0;
  
  processes.forEach((process, index) => {
    // Simulate variable gaps between segments (realistic scenario)
    // Add a small gap after every other process to simulate fragmentation
    if (index > 0 && index % 2 === 0) {
      const gap = Math.floor(process.size * 0.15); // 15% gap
      currentAddress += gap;
      segmentationExternal += gap;
    }
    
    blocks.push({
      id: blocks.length,
      start: currentAddress,
      size: process.size,
      processId: process.id,
      type: 'allocated'
    });
    
    currentAddress += process.size;
  });

  // Segmentation has minimal internal fragmentation (segments are exact fit)
  // But has external fragmentation (gaps between segments)
  return {
    paging: {
      internal: pagingInternal,
      external: 0 // Paging has no external fragmentation
    },
    segmentation: {
      internal: 0, // Segments are allocated exactly as needed
      external: segmentationExternal
    }
  };
};
