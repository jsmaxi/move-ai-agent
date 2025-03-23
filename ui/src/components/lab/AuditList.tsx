import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copyToClipboard } from "@/utils/codeHighlight";
import { Audit } from "@/types/audit";

interface AuditListProps {
  audits: Audit[];
  className?: string;
}

const AuditList: React.FC<AuditListProps> = ({ audits, className }) => {
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  const handleCopyAudit = (audit: Audit) => {
    copyToClipboard(audit.details);
  };

  const handleDownloadAudit = (audit: Audit) => {
    const blob = new Blob([audit.details], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${audit.contractName}-${audit.id.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit report downloaded!");
  };

  return (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Recent Contract Audits</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-4 text-muted-foreground"
                >
                  No audits yet.
                </TableCell>
              </TableRow>
            ) : (
              audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>{audit.contractName}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(audit.date, { addSuffix: true })}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {audit.summary}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAudit(audit)}
                        className="gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedAudit}
        onOpenChange={(open) => !open && setSelectedAudit(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Audit Report: {selectedAudit?.contractName}
            </DialogTitle>
            <DialogDescription>
              {selectedAudit?.summary} •{" "}
              {selectedAudit &&
                formatDistanceToNow(selectedAudit.date, { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedAudit && handleCopyAudit(selectedAudit)}
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                selectedAudit && handleDownloadAudit(selectedAudit)
              }
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download
            </Button>
          </div>

          <ScrollArea className="flex-grow p-4 border rounded-md bg-muted/30 max-h-[50vh]">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm max-h-[300px] overflow-y-auto">
              {selectedAudit?.details}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditList;
