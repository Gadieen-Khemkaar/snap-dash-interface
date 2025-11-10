import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Process, AllocationStrategy, MemoryBlock } from '@/types/memory';
import { allocateMemory, getProcessColors } from '@/utils/memoryAlgorithms';
import { Play, Pause, RotateCcw, Settings2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AllocationSimulatorProps {
  processes: Process[];
}

export const AllocationSimulator = ({ processes }: AllocationSimulatorProps) => {
  const [strategy, setStrategy] = useState<AllocationStrategy>('first-fit');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [allocationResult, setAllocationResult] = useState<MemoryBlock[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (processes.length > 0) {
      const result = allocateMemory(processes.slice(0, currentStep + 1), strategy);
      setAllocationResult(result.blocks);
    } else {
      setAllocationResult([]);
      setCurrentStep(0);
    }
  }, [currentStep, strategy, processes]);

  useEffect(() => {
    if (isPlaying && currentStep < processes.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentStep >= processes.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, speed, processes.length]);

  const handlePlay = () => {
    if (processes.length === 0) {
      toast({
        title: "No processes",
        description: "Add processes to start simulation",
        variant: "destructive"
      });
      return;
    }
    if (currentStep >= processes.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentStep < processes.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const maxAddress = Math.max(
    ...allocationResult.map(block => block.start + block.size),
    1048576
  );

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Allocation Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strategy Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Allocation Strategy
          </label>
          <Select value={strategy} onValueChange={(v) => setStrategy(v as AllocationStrategy)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first-fit">First Fit</SelectItem>
              <SelectItem value="best-fit">Best Fit</SelectItem>
              <SelectItem value="worst-fit">Worst Fit</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {strategy === 'first-fit' && 'Allocates to the first available block'}
            {strategy === 'best-fit' && 'Allocates to the smallest sufficient block'}
            {strategy === 'worst-fit' && 'Allocates to the largest available block'}
          </p>
        </div>

        {/* Animation Controls */}
        <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={processes.length === 0}
              className="hover-scale"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStepBack}
              disabled={currentStep === 0 || processes.length === 0}
            >
              ←
            </Button>
            <Button
              size="sm"
              onClick={handlePlay}
              disabled={processes.length === 0}
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStepForward}
              disabled={currentStep >= processes.length - 1 || processes.length === 0}
            >
              →
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {processes.length}</span>
              <span>{processes.length > 0 ? Math.round(((currentStep + 1) / processes.length) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${processes.length > 0 ? ((currentStep + 1) / processes.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Animation Speed: {(2000 - speed) / 200}x
            </label>
            <Slider
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              min={200}
              max={2000}
              step={200}
              className="w-full"
            />
          </div>
        </div>

        {/* Visual Representation */}
        {allocationResult.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Memory Layout</label>
            <div className="relative h-20 bg-secondary/50 rounded-lg border border-border overflow-hidden">
              {allocationResult.map((block, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 border-r border-background transition-all duration-500 animate-scale-in flex items-center justify-center"
                  style={{
                    left: `${(block.start / maxAddress) * 100}%`,
                    width: `${(block.size / maxAddress) * 100}%`,
                    backgroundColor: block.processId !== undefined
                      ? getProcessColors(block.processId)
                      : 'hsl(var(--muted))',
                    opacity: 0.8
                  }}
                >
                  <span className="text-xs font-bold text-background">
                    P{block.processId}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-muted-foreground">Blocks allocated: {allocationResult.length}</div>
              <div className="text-muted-foreground text-right">
                Total: {formatBytes(allocationResult.reduce((sum, b) => sum + b.size, 0))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};