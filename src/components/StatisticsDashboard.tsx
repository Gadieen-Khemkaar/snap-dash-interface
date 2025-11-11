import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Process } from '@/types/memory';
import { calculateFragmentation, allocateMemory } from '@/utils/memoryAlgorithms';
import { BarChart3, Clock, Gauge, TrendingUp } from 'lucide-react';

interface StatisticsDashboardProps {
  processes: Process[];
}

export const StatisticsDashboard = ({ processes }: StatisticsDashboardProps) => {
  if (processes.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Statistics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add processes to see statistics</p>
        </CardContent>
      </Card>
    );
  }

  const totalMemory = processes.reduce((sum, p) => sum + p.size, 0);
  const fragmentation = calculateFragmentation(processes);
  
  // Calculate metrics for different strategies
  const firstFitResult = allocateMemory(processes, 'first-fit');
  const bestFitResult = allocateMemory(processes, 'best-fit');
  const worstFitResult = allocateMemory(processes, 'worst-fit');

  // Memory utilization percentage
  const utilizationPaging = ((totalMemory - fragmentation.paging.internal) / totalMemory) * 100;
  const utilizationSegmentation = ((totalMemory - fragmentation.segmentation.internal - fragmentation.segmentation.external) / totalMemory) * 100;

  // Allocation efficiency (inverse of fragmentation)
  const efficiencyFirstFit = ((firstFitResult.totalAllocated - firstFitResult.internalFragmentation) / firstFitResult.totalAllocated) * 100;
  const efficiencyBestFit = ((bestFitResult.totalAllocated - bestFitResult.internalFragmentation) / bestFitResult.totalAllocated) * 100;
  const efficiencyWorstFit = ((worstFitResult.totalAllocated - worstFitResult.internalFragmentation) / worstFitResult.totalAllocated) * 100;

  // Average access time (simulated - in nanoseconds)
  const avgAccessTimePaging = 100 + (processes.length * 2); // Base + overhead per process
  const avgAccessTimeSegmentation = 80 + (processes.length * 3); // Different base + overhead

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Memory Utilization */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            Memory Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">Paging</span>
            <span className="text-2xl font-bold text-primary">{utilizationPaging.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">Segmentation</span>
            <span className="text-2xl font-bold text-primary">{utilizationSegmentation.toFixed(1)}%</span>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">Total Memory Allocated</div>
            <div className="text-lg font-mono font-semibold text-foreground">{formatBytes(totalMemory)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Efficiency */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Allocation Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">First Fit</span>
            <span className="text-lg font-bold text-foreground">{efficiencyFirstFit.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">Best Fit</span>
            <span className="text-lg font-bold text-foreground">{efficiencyBestFit.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">Worst Fit</span>
            <span className="text-lg font-bold text-foreground">{efficiencyWorstFit.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Access Time */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Average Access Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">Paging</span>
            <span className="text-2xl font-bold text-primary">{avgAccessTimePaging} ns</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground">Segmentation</span>
            <span className="text-2xl font-bold text-primary">{avgAccessTimeSegmentation} ns</span>
          </div>
          <div className="pt-2 border-t border-border text-xs text-muted-foreground">
            Lower values indicate faster memory access
          </div>
        </CardContent>
      </Card>

      {/* Fragmentation Summary */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Fragmentation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Paging Internal</div>
            <div className="text-lg font-mono font-semibold text-foreground">
              {formatBytes(fragmentation.paging.internal)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Segmentation Internal</div>
            <div className="text-lg font-mono font-semibold text-foreground">
              {formatBytes(fragmentation.segmentation.internal)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Segmentation External</div>
            <div className="text-lg font-mono font-semibold text-foreground">
              {formatBytes(fragmentation.segmentation.external)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};