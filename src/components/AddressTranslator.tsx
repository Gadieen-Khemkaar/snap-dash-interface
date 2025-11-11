import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Process } from '@/types/memory';
import { calculatePaging, calculateSegmentation } from '@/utils/memoryAlgorithms';
import { Calculator, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddressTranslatorProps {
  processes: Process[];
}

const PAGE_SIZE = 4096;

export const AddressTranslator = ({ processes }: AddressTranslatorProps) => {
  const [virtualAddress, setVirtualAddress] = useState('');
  const [processId, setProcessId] = useState('');
  const [translationType, setTranslationType] = useState<'paging' | 'segmentation'>('paging');
  const [result, setResult] = useState<{
    physicalAddress: number;
    pageNumber?: number;
    offset?: number;
    frameNumber?: number;
    segmentBase?: number;
    segmentLimit?: number;
  } | null>(null);
  const [error, setError] = useState('');

  const pageTable = calculatePaging(processes);
  const segmentTable = calculateSegmentation(processes);

  const handleTranslate = () => {
    setError('');
    setResult(null);

    const vAddr = parseInt(virtualAddress);
    const pId = parseInt(processId);

    if (isNaN(vAddr) || isNaN(pId)) {
      setError('Please enter valid numbers');
      return;
    }

    const process = processes.find(p => p.id === pId);
    if (!process) {
      setError(`Process ${pId} not found`);
      return;
    }

    if (translationType === 'paging') {
      // Paging translation
      const pageNumber = Math.floor(vAddr / PAGE_SIZE);
      const offset = vAddr % PAGE_SIZE;

      const pageEntry = pageTable.find(
        entry => entry.processId === pId && entry.pageNumber === pageNumber
      );

      if (!pageEntry) {
        setError('Invalid virtual address for this process');
        return;
      }

      const physicalAddress = (pageEntry.frameNumber * PAGE_SIZE) + offset;

      setResult({
        physicalAddress,
        pageNumber,
        offset,
        frameNumber: pageEntry.frameNumber
      });
    } else {
      // Segmentation translation
      const segment = segmentTable.find(entry => entry.processId === pId);

      if (!segment) {
        setError(`Segment not found for process ${pId}`);
        return;
      }

      if (vAddr >= segment.limit) {
        setError('Segmentation fault: Address exceeds segment limit');
        return;
      }

      const physicalAddress = segment.base + vAddr;

      setResult({
        physicalAddress,
        segmentBase: segment.base,
        segmentLimit: segment.limit
      });
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Memory Address Translator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {processes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add processes to use the address translator</p>
        ) : (
          <>
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processId">Process ID</Label>
                <Input
                  id="processId"
                  type="number"
                  placeholder="e.g., 1"
                  value={processId}
                  onChange={(e) => setProcessId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="virtualAddress">Virtual Address</Label>
                <Input
                  id="virtualAddress"
                  type="number"
                  placeholder="e.g., 8192"
                  value={virtualAddress}
                  onChange={(e) => setVirtualAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Translation Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={translationType}
                  onChange={(e) => setTranslationType(e.target.value as 'paging' | 'segmentation')}
                >
                  <option value="paging">Paging</option>
                  <option value="segmentation">Segmentation</option>
                </select>
              </div>
            </div>

            <Button onClick={handleTranslate} className="w-full">
              <Calculator className="w-4 h-4 mr-2" />
              Translate Address
            </Button>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Result */}
            {result && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <h4 className="font-semibold text-foreground">Translation Result</h4>
                
                {translationType === 'paging' ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Virtual Address:</span>
                      <span className="font-mono font-semibold text-foreground">{virtualAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Page Number:</span>
                      <span className="font-mono text-foreground">{result.pageNumber}</span>
                      <span className="text-muted-foreground">Offset:</span>
                      <span className="font-mono text-foreground">{result.offset}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Frame Number:</span>
                      <span className="font-mono text-foreground">{result.frameNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Physical Address:</span>
                      <span className="font-mono font-bold text-primary text-lg">{result.physicalAddress}</span>
                    </div>
                    
                    {/* Calculation Steps */}
                    <div className="mt-4 p-3 rounded-md bg-secondary/30 text-xs space-y-1">
                      <div className="font-semibold text-foreground mb-2">Calculation Steps:</div>
                      <div>1. Page Number = Virtual Address ÷ Page Size = {virtualAddress} ÷ {PAGE_SIZE} = {result.pageNumber}</div>
                      <div>2. Offset = Virtual Address % Page Size = {virtualAddress} % {PAGE_SIZE} = {result.offset}</div>
                      <div>3. Physical Address = (Frame Number × Page Size) + Offset</div>
                      <div className="pl-4">= ({result.frameNumber} × {PAGE_SIZE}) + {result.offset} = {result.physicalAddress}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Virtual Address:</span>
                      <span className="font-mono font-semibold text-foreground">{virtualAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Segment Base:</span>
                      <span className="font-mono text-foreground">{result.segmentBase}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Segment Limit:</span>
                      <span className="font-mono text-foreground">{result.segmentLimit}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Physical Address:</span>
                      <span className="font-mono font-bold text-primary text-lg">{result.physicalAddress}</span>
                    </div>

                    {/* Calculation Steps */}
                    <div className="mt-4 p-3 rounded-md bg-secondary/30 text-xs space-y-1">
                      <div className="font-semibold text-foreground mb-2">Calculation Steps:</div>
                      <div>1. Check if Virtual Address &lt; Segment Limit</div>
                      <div className="pl-4">{virtualAddress} &lt; {result.segmentLimit} ✓</div>
                      <div>2. Physical Address = Segment Base + Virtual Address</div>
                      <div className="pl-4">= {result.segmentBase} + {virtualAddress} = {result.physicalAddress}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};