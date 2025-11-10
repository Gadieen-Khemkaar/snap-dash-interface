import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Process, MemoryAccess } from '@/types/memory';
import { getProcessColors } from '@/utils/memoryAlgorithms';
import { Flame, Play, Pause, RotateCcw } from 'lucide-react';

interface HeatMapVisualizationProps {
  processes: Process[];
}

const GRID_SIZE = 64; // 8x8 grid for visualization
const MEMORY_SIZE = 1048576; // 1MB

export const HeatMapVisualization = ({ processes }: HeatMapVisualizationProps) => {
  const [accesses, setAccesses] = useState<MemoryAccess[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [heatMap, setHeatMap] = useState<number[]>(new Array(GRID_SIZE).fill(0));

  useEffect(() => {
    if (isSimulating && processes.length > 0) {
      const interval = setInterval(() => {
        // Simulate random memory access
        const randomProcess = processes[Math.floor(Math.random() * processes.length)];
        const randomAddress = Math.floor(Math.random() * MEMORY_SIZE);
        
        const newAccess: MemoryAccess = {
          processId: randomProcess.id,
          address: randomAddress,
          timestamp: Date.now()
        };

        setAccesses(prev => [...prev.slice(-99), newAccess]);

        // Update heat map
        const gridIndex = Math.floor((randomAddress / MEMORY_SIZE) * GRID_SIZE);
        setHeatMap(prev => {
          const updated = [...prev];
          updated[gridIndex] = Math.min(updated[gridIndex] + 1, 100);
          return updated;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isSimulating, processes]);

  useEffect(() => {
    // Decay heat map over time
    const decay = setInterval(() => {
      setHeatMap(prev => prev.map(val => Math.max(0, val - 1)));
    }, 500);

    return () => clearInterval(decay);
  }, []);

  const handleToggleSimulation = () => {
    if (processes.length === 0) return;
    setIsSimulating(!isSimulating);
  };

  const handleReset = () => {
    setAccesses([]);
    setHeatMap(new Array(GRID_SIZE).fill(0));
    setIsSimulating(false);
  };

  const getHeatColor = (value: number) => {
    if (value === 0) return 'hsl(var(--secondary))';
    
    // Create gradient from blue (cold) to red (hot)
    const intensity = Math.min(value / 50, 1);
    if (intensity < 0.33) {
      return `hsl(240 100% ${50 + intensity * 50}%)`; // Blue
    } else if (intensity < 0.66) {
      return `hsl(${240 - (intensity - 0.33) * 360} 100% 50%)`; // Blue to Yellow
    } else {
      return `hsl(0 100% ${50 + (1 - intensity) * 20}%)`; // Red
    }
  };

  const gridColumns = 8;
  const gridRows = GRID_SIZE / gridColumns;

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Memory Access Heat Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleToggleSimulation}
            disabled={processes.length === 0}
            className="flex-1"
          >
            {isSimulating ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Simulation
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={processes.length === 0}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {processes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Add processes to start memory access simulation
          </div>
        ) : (
          <>
            {/* Heat Map Grid */}
            <div className="space-y-2">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
                {heatMap.map((value, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded transition-all duration-300"
                    style={{
                      backgroundColor: getHeatColor(value),
                      transform: value > 0 ? 'scale(1.1)' : 'scale(1)',
                    }}
                    title={`Address block ${index}: ${value} accesses`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(240 100% 70%)' }} />
                  <span>Cold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(60 100% 50%)' }} />
                  <span>Warm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0 100% 50%)' }} />
                  <span>Hot</span>
                </div>
              </div>
            </div>

            {/* Recent Accesses */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Recent Accesses ({accesses.length})
              </label>
              <div className="h-32 overflow-y-auto space-y-1 p-3 rounded-lg bg-secondary/30 border border-border">
                {accesses.slice(-10).reverse().map((access, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs font-mono animate-fade-in"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getProcessColors(access.processId) }}
                      />
                      <span className="text-foreground">P{access.processId}</span>
                    </div>
                    <span className="text-muted-foreground">
                      0x{access.address.toString(16).toUpperCase().padStart(6, '0')}
                    </span>
                  </div>
                ))}
                {accesses.length === 0 && (
                  <div className="text-muted-foreground text-center py-4">
                    No accesses yet
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-bold text-foreground">{accesses.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-xs text-muted-foreground">Hot Spots</div>
                <div className="text-lg font-bold text-foreground">
                  {heatMap.filter(v => v > 30).length}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-xs text-muted-foreground">Peak</div>
                <div className="text-lg font-bold text-foreground">
                  {Math.max(...heatMap, 0)}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};