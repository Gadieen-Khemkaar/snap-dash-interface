import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Process } from '@/types/memory';

interface ProcessFormProps {
  onAddProcess: (process: Process) => void;
  nextProcessId: number;
}

export const ProcessForm = ({ onAddProcess, nextProcessId }: ProcessFormProps) => {
  const [size, setSize] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sizeInBytes = parseInt(size);
    
    if (sizeInBytes > 0) {
      onAddProcess({
        id: nextProcessId,
        size: sizeInBytes,
      });
      setSize('');
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Add Process</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="process-size" className="text-sm text-muted-foreground">
              Memory Size (bytes)
            </Label>
            <Input
              id="process-size"
              type="number"
              min="1"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g., 8192"
              className="bg-secondary border-border text-foreground font-mono"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!size || parseInt(size) <= 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Process {nextProcessId}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
