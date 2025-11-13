import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Process, AllocationStrategy } from '@/types/memory';
import { getProcessColors } from '@/utils/memoryAlgorithms';
import { Play, Pause, RotateCcw, FastForward, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface AllocationAnimationProps {
  processes: Process[];
}

interface AnimationState {
  step: number;
  allocatedProcesses: { process: Process; startAddress: number }[];
  freeBlocks: { start: number; size: number }[];
  currentProcess: Process | null;
  message: string;
}

const MAX_MEMORY = 1048576;
const PAGE_SIZE = 4096;

// Create pre-fragmented memory to show differences between strategies
const createPreFragmentedMemory = () => {
  const preallocatedSizes = [40000, 30000, 25000, 35000];
  const freeBlocks: { start: number; size: number }[] = [];
  let currentPos = 0;
  
  preallocatedSizes.forEach((size, idx) => {
    currentPos += size;
    const gapSize = 20000 + (idx * 10000);
    freeBlocks.push({
      start: currentPos,
      size: gapSize
    });
    currentPos += gapSize;
  });
  
  const remainingSize = MAX_MEMORY - currentPos;
  if (remainingSize > 0) {
    freeBlocks.push({
      start: currentPos,
      size: remainingSize
    });
  }
  
  return freeBlocks;
};

export const AllocationAnimation = ({ processes }: AllocationAnimationProps) => {
  const [strategy, setStrategy] = useState<AllocationStrategy>('first-fit');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AnimationState>({
    step: 0,
    allocatedProcesses: [],
    freeBlocks: createPreFragmentedMemory(),
    currentProcess: null,
    message: 'Click Play to start allocation simulation'
  });

  useEffect(() => {
    if (!isPlaying || processes.length === 0) return;

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.step >= processes.length) {
          setIsPlaying(false);
          return { ...prev, message: 'Allocation complete!' };
        }

        const currentProcess = processes[prev.step];
        const freeBlocks = [...prev.freeBlocks];
        let selectedBlockIndex = -1;

        // Find suitable block based on strategy
        switch (strategy) {
          case 'first-fit':
            selectedBlockIndex = freeBlocks.findIndex(block => block.size >= currentProcess.size);
            break;
          case 'best-fit':
            let minSize = Infinity;
            freeBlocks.forEach((block, i) => {
              if (block.size >= currentProcess.size && block.size < minSize) {
                minSize = block.size;
                selectedBlockIndex = i;
              }
            });
            break;
          case 'worst-fit':
            let maxSize = -1;
            freeBlocks.forEach((block, i) => {
              if (block.size >= currentProcess.size && block.size > maxSize) {
                maxSize = block.size;
                selectedBlockIndex = i;
              }
            });
            break;
        }

        if (selectedBlockIndex === -1) {
          return {
            ...prev,
            step: prev.step + 1,
            message: `❌ Cannot allocate Process ${currentProcess.id} - No suitable block found`,
            currentProcess
          };
        }

        const selectedBlock = freeBlocks[selectedBlockIndex];
        const newAllocated = [
          ...prev.allocatedProcesses,
          { process: currentProcess, startAddress: selectedBlock.start }
        ];

        // Update free blocks
        const remainingSize = selectedBlock.size - currentProcess.size;
        if (remainingSize > 0) {
          freeBlocks[selectedBlockIndex] = {
            start: selectedBlock.start + currentProcess.size,
            size: remainingSize
          };
        } else {
          freeBlocks.splice(selectedBlockIndex, 1);
        }

        return {
          step: prev.step + 1,
          allocatedProcesses: newAllocated,
          freeBlocks,
          currentProcess,
          message: `✓ Allocated Process ${currentProcess.id} at address ${selectedBlock.start} using ${strategy}`
        };
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, processes, strategy, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setState({
      step: 0,
      allocatedProcesses: [],
      freeBlocks: createPreFragmentedMemory(),
      currentProcess: null,
      message: 'Ready to allocate processes'
    });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setScrollPosition(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  const handleStepForward = () => {
    setIsPlaying(false);
    setState(prev => {
      if (prev.step >= processes.length) return prev;

      const currentProcess = processes[prev.step];
      const freeBlocks = [...prev.freeBlocks];
      let selectedBlockIndex = -1;

      switch (strategy) {
        case 'first-fit':
          selectedBlockIndex = freeBlocks.findIndex(block => block.size >= currentProcess.size);
          break;
        case 'best-fit':
          let minSize = Infinity;
          freeBlocks.forEach((block, i) => {
            if (block.size >= currentProcess.size && block.size < minSize) {
              minSize = block.size;
              selectedBlockIndex = i;
            }
          });
          break;
        case 'worst-fit':
          let maxSize = -1;
          freeBlocks.forEach((block, i) => {
            if (block.size >= currentProcess.size && block.size > maxSize) {
              maxSize = block.size;
              selectedBlockIndex = i;
            }
          });
          break;
      }

      if (selectedBlockIndex === -1) {
        return {
          ...prev,
          step: prev.step + 1,
          message: `❌ Cannot allocate Process ${currentProcess.id}`,
          currentProcess
        };
      }

      const selectedBlock = freeBlocks[selectedBlockIndex];
      const newAllocated = [
        ...prev.allocatedProcesses,
        { process: currentProcess, startAddress: selectedBlock.start }
      ];

      const remainingSize = selectedBlock.size - currentProcess.size;
      if (remainingSize > 0) {
        freeBlocks[selectedBlockIndex] = {
          start: selectedBlock.start + currentProcess.size,
          size: remainingSize
        };
      } else {
        freeBlocks.splice(selectedBlockIndex, 1);
      }

      return {
        step: prev.step + 1,
        allocatedProcesses: newAllocated,
        freeBlocks,
        currentProcess,
        message: `✓ Allocated Process ${currentProcess.id} at ${selectedBlock.start}`
      };
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">Step-by-Step Allocation Animation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {processes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add processes to see allocation animation</p>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant={isPlaying ? "secondary" : "default"}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleStepForward} disabled={state.step >= processes.length}>
                <FastForward className="w-4 h-4 mr-2" />
                Step
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={strategy}
                onChange={(e) => {
                  setStrategy(e.target.value as AllocationStrategy);
                  handleReset();
                }}
              >
                <option value="first-fit">First Fit</option>
                <option value="best-fit">Best Fit</option>
                <option value="worst-fit">Worst Fit</option>
              </select>

              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={2000}>Slow</option>
                <option value={1000}>Normal</option>
                <option value={500}>Fast</option>
              </select>

              <div className="ml-auto text-sm text-muted-foreground">
                Step {state.step} / {processes.length}
              </div>
            </div>

            {/* Status Message */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-sm text-foreground font-medium">{state.message}</p>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-foreground">Zoom:</div>
              <Button size="sm" variant="outline" onClick={handleZoomIn} disabled={zoomLevel >= 5}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut} disabled={zoomLevel <= 1}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetZoom} disabled={zoomLevel === 1}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground ml-2">{zoomLevel}x</span>
            </div>

            {/* Memory Visualization */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Memory Layout</div>
              <div 
                ref={scrollContainerRef}
                className="h-64 rounded-lg border border-border bg-muted/20 overflow-auto relative"
                onScroll={(e) => setScrollPosition(e.currentTarget.scrollTop)}
              >
                <div 
                  className="relative w-full"
                  style={{ 
                    height: `${256 * zoomLevel}px`,
                    minHeight: '100%'
                  }}
                >
                  {/* Allocated Blocks */}
                  {state.allocatedProcesses.map(({ process, startAddress }, idx) => {
                    const topPercent = (startAddress / MAX_MEMORY) * 100;
                    const heightPercent = (process.size / MAX_MEMORY) * 100;
                    const actualHeight = (256 * zoomLevel * heightPercent) / 100;
                    const isLargeEnough = actualHeight > 24;
                    return (
                      <div
                        key={idx}
                        className="absolute left-0 right-0 transition-all duration-500 border border-background/20 flex items-center justify-center overflow-visible"
                        style={{
                          top: `${topPercent}%`,
                          height: `${heightPercent}%`,
                          backgroundColor: getProcessColors(process.id),
                          zIndex: 10
                        }}
                      >
                        {isLargeEnough ? (
                          <div className="text-xs font-mono text-white font-semibold drop-shadow-lg text-center px-2">
                            <div>P{process.id}: {formatBytes(process.size)}</div>
                            <div className="text-[10px] opacity-90">@ {startAddress}</div>
                          </div>
                        ) : (
                          <div className="text-[9px] font-mono text-white font-bold drop-shadow-md whitespace-nowrap">
                            P{process.id} @ {startAddress}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Free Blocks */}
                  {state.freeBlocks.map((block, idx) => {
                    const topPercent = (block.start / MAX_MEMORY) * 100;
                    const heightPercent = (block.size / MAX_MEMORY) * 100;
                    const actualHeight = (256 * zoomLevel * heightPercent) / 100;
                    const showText = actualHeight > 20;
                    return (
                      <div
                        key={`free-${idx}`}
                        className="absolute left-0 right-0 border-2 border-dashed border-border/50 flex items-center justify-center"
                        style={{
                          top: `${topPercent}%`,
                          height: `${heightPercent}%`,
                          backgroundColor: 'transparent',
                          zIndex: 1
                        }}
                      >
                        {showText && (
                          <span className="text-xs text-muted-foreground font-mono">
                            Free: {formatBytes(block.size)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};