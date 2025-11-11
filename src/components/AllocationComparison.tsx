import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Process } from '@/types/memory';
import { allocateMemory, getProcessColors } from '@/utils/memoryAlgorithms';
import { GitCompare } from 'lucide-react';

interface AllocationComparisonProps {
  processes: Process[];
}

export const AllocationComparison = ({ processes }: AllocationComparisonProps) => {
  if (processes.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            Algorithm Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add processes to compare allocation strategies</p>
        </CardContent>
      </Card>
    );
  }

  const strategies = [
    { name: 'First Fit', key: 'first-fit' as const, description: 'Allocates to first available block' },
    { name: 'Best Fit', key: 'best-fit' as const, description: 'Allocates to smallest sufficient block' },
    { name: 'Worst Fit', key: 'worst-fit' as const, description: 'Allocates to largest available block' }
  ];

  const results = strategies.map(strategy => ({
    ...strategy,
    result: allocateMemory(processes, strategy.key)
  }));

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const getEfficiency = (result: ReturnType<typeof allocateMemory>) => {
    return ((result.totalAllocated - result.internalFragmentation) / result.totalAllocated * 100).toFixed(1);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          Algorithm Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map(({ name, key, description, result }) => (
            <div key={key} className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <h3 className="font-semibold text-foreground mb-1">{name}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>

              {/* Visual Memory Layout */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">Memory Layout</div>
                <div className="h-32 rounded-lg border border-border bg-secondary/10 overflow-hidden">
                  {result.blocks.map((block, idx) => {
                    const heightPercent = (block.size / 1048576) * 100;
                    return (
                      <div
                        key={idx}
                        className="relative"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: block.processId !== undefined 
                            ? getProcessColors(block.processId)
                            : 'hsl(var(--muted))',
                          opacity: 0.8
                        }}
                        title={`Process ${block.processId}: ${formatBytes(block.size)}`}
                      >
                        {heightPercent > 10 && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white mix-blend-difference">
                            P{block.processId}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2 p-3 rounded-lg bg-secondary/20">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Efficiency</span>
                  <span className="font-semibold text-foreground">{getEfficiency(result)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Internal Frag.</span>
                  <span className="font-mono text-foreground">{formatBytes(result.internalFragmentation)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">External Frag.</span>
                  <span className="font-mono text-foreground">{formatBytes(result.externalFragmentation)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Free</span>
                  <span className="font-mono text-foreground">{formatBytes(result.totalFree)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Summary */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="font-semibold text-sm text-foreground mb-2">Analysis</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• <strong>First Fit</strong>: Fastest allocation, moderate fragmentation</li>
            <li>• <strong>Best Fit</strong>: Minimizes wasted space, may increase external fragmentation</li>
            <li>• <strong>Worst Fit</strong>: Leaves larger free blocks, may reduce external fragmentation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};