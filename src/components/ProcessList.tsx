import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Process } from '@/types/memory';
import { getProcessColors } from '@/utils/memoryAlgorithms';

interface ProcessListProps {
  processes: Process[];
  onRemoveProcess: (id: number) => void;
}

export const ProcessList = ({ processes, onRemoveProcess }: ProcessListProps) => {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} bytes`;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Process List</CardTitle>
      </CardHeader>
      <CardContent>
        {processes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No processes added yet. Add a process to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {processes.map((process) => (
              <div
                key={process.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getProcessColors(process.id) }}
                  />
                  <div>
                    <p className="font-semibold text-foreground font-mono">
                      Process {process.id}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {formatBytes(process.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveProcess(process.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
