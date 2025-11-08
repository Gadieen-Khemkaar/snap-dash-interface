import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SegmentTableEntry } from '@/types/memory';
import { getProcessColors } from '@/utils/memoryAlgorithms';

interface SegmentationVisualizationProps {
  segmentTable: SegmentTableEntry[];
}

export const SegmentationVisualization = ({ segmentTable }: SegmentationVisualizationProps) => {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} B`;
  };

  const formatAddress = (address: number) => {
    return `0x${address.toString(16).toUpperCase().padStart(6, '0')}`;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Segmentation Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        {segmentTable.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Add processes to see segmentation allocation
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-semibold">Process</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Segment #</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Base Address</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Limit</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Size</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {segmentTable.map((entry, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getProcessColors(entry.processId) }}
                        />
                        <span className="font-mono text-foreground">P{entry.processId}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-foreground">{entry.segmentNumber}</td>
                    <td className="p-3 font-mono text-primary">{formatAddress(entry.base)}</td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {formatBytes(entry.limit)}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {formatBytes(entry.size)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-success/20 text-success font-semibold">
                        Allocated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
