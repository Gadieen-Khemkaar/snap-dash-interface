import { useState } from 'react';
import { ProcessForm } from '@/components/ProcessForm';
import { ProcessList } from '@/components/ProcessList';
import { PagingVisualization } from '@/components/PagingVisualization';
import { SegmentationVisualization } from '@/components/SegmentationVisualization';
import { MemoryVisualizer } from '@/components/MemoryVisualizer';
import { FragmentationAnalysis } from '@/components/FragmentationAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Process } from '@/types/memory';
import { calculatePaging, calculateSegmentation } from '@/utils/memoryAlgorithms';
import { Cpu, Database } from 'lucide-react';

const Index = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activeTab, setActiveTab] = useState('paging');

  const handleAddProcess = (process: Process) => {
    setProcesses((prev) => [...prev, process]);
  };

  const handleRemoveProcess = (id: number) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
  };

  const pageTable = calculatePaging(processes);
  const segmentTable = calculateSegmentation(processes);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Memory Management Simulator
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualize Paging and Segmentation algorithms
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <ProcessForm
              onAddProcess={handleAddProcess}
              nextProcessId={processes.length + 1}
            />
            <ProcessList processes={processes} onRemoveProcess={handleRemoveProcess} />
          </div>

          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
                <TabsTrigger
                  value="paging"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Paging
                </TabsTrigger>
                <TabsTrigger
                  value="segmentation"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Segmentation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paging" className="space-y-6 mt-6">
                <MemoryVisualizer processes={processes} type="paging" />
                <FragmentationAnalysis processes={processes} type="paging" />
                <PagingVisualization pageTable={pageTable} />
              </TabsContent>

              <TabsContent value="segmentation" className="space-y-6 mt-6">
                <MemoryVisualizer processes={processes} type="segmentation" />
                <FragmentationAnalysis processes={processes} type="segmentation" />
                <SegmentationVisualization segmentTable={segmentTable} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Memory Management Visualization • Paging & Segmentation Algorithms</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
