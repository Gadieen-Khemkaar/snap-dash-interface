import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Process } from '@/types/memory';
import { getProcessColors } from '@/utils/memoryAlgorithms';

interface MemoryVisualizerProps {
  processes: Process[];
  type: 'paging' | 'segmentation';
}

export const MemoryVisualizer = ({ processes, type }: MemoryVisualizerProps) => {
  const totalSize = processes.reduce((sum, p) => sum + p.size, 0);
  const PAGE_SIZE = 4096;

  const renderPagingBlocks = () => {
    const blocks = [];
    let blockIndex = 0;

    processes.forEach((process) => {
      const pagesNeeded = Math.ceil(process.size / PAGE_SIZE);
      for (let i = 0; i < pagesNeeded; i++) {
        blocks.push(
          <div
            key={blockIndex++}
            className="h-12 rounded flex items-center justify-center text-xs font-mono font-semibold border border-border/50 hover:scale-105 transition-transform"
            style={{
              backgroundColor: getProcessColors(process.id),
              color: 'hsl(220 20% 8%)',
            }}
          >
            P{process.id}
          </div>
        );
      }
    });

    return blocks;
  };

  const renderSegmentationBlocks = () => {
    return processes.map((process, index) => {
      const widthPercent = (process.size / totalSize) * 100;
      return (
        <div
          key={index}
          className="h-16 rounded flex items-center justify-center text-sm font-mono font-semibold border border-border/50 hover:scale-105 transition-transform"
          style={{
            width: `${widthPercent}%`,
            backgroundColor: getProcessColors(process.id),
            color: 'hsl(220 20% 8%)',
            minWidth: '80px',
          }}
        >
          P{process.id}
        </div>
      );
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">
          Memory Visualization - {type === 'paging' ? 'Paging' : 'Segmentation'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Add processes to see memory visualization
          </p>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {type === 'paging' ? 'Pages (4KB each)' : 'Segments (variable size)'}
            </div>
            <div
              className={
                type === 'paging'
                  ? 'grid grid-cols-8 gap-2'
                  : 'flex gap-2'
              }
            >
              {type === 'paging' ? renderPagingBlocks() : renderSegmentationBlocks()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
