import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Process } from '@/types/memory';
import { calculateFragmentation } from '@/utils/memoryAlgorithms';
import { AlertCircle, PieChart } from 'lucide-react';

interface FragmentationAnalysisProps {
  processes: Process[];
  type: 'paging' | 'segmentation';
}

export const FragmentationAnalysis = ({ processes, type }: FragmentationAnalysisProps) => {
  if (processes.length === 0) {
    return (
      <Card className="border-border bg-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Fragmentation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <AlertCircle className="w-4 h-4" />
            Add processes to see fragmentation analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  const fragmentation = calculateFragmentation(processes);
  const data = type === 'paging' ? fragmentation.paging : fragmentation.segmentation;
  
  const totalMemory = processes.reduce((sum, p) => sum + p.size, 0);
  const internalPercent = (data.internal / totalMemory) * 100;
  const externalPercent = (data.external / totalMemory) * 100;
  const usedPercent = 100 - internalPercent - externalPercent;

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Fragmentation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Memory Utilization */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground font-medium">Memory Utilization</span>
              <span className="text-muted-foreground">{usedPercent.toFixed(1)}%</span>
            </div>
            <Progress value={usedPercent} className="h-2" />
          </div>

          {/* Internal Fragmentation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground font-medium">Internal Fragmentation</span>
              <span className="text-muted-foreground">
                {formatBytes(data.internal)} ({internalPercent.toFixed(1)}%)
              </span>
            </div>
            <Progress value={internalPercent} className="h-2 [&>div]:bg-yellow-500" />
            <p className="text-xs text-muted-foreground">
              Wasted space within allocated blocks
            </p>
          </div>

          {/* External Fragmentation */}
          {type === 'segmentation' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground font-medium">External Fragmentation</span>
                <span className="text-muted-foreground">
                  {formatBytes(data.external)} ({externalPercent.toFixed(1)}%)
                </span>
              </div>
              <Progress value={externalPercent} className="h-2 [&>div]:bg-red-500" />
              <p className="text-xs text-muted-foreground">
                Free space scattered between allocated blocks
              </p>
            </div>
          )}

          {type === 'paging' && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground">
                ✓ Paging eliminates external fragmentation by using fixed-size pages
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="text-xs text-muted-foreground">Total Allocated</div>
            <div className="text-lg font-bold text-foreground font-mono">
              {formatBytes(totalMemory)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="text-xs text-muted-foreground">Efficiency</div>
            <div className="text-lg font-bold text-foreground">
              {usedPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};