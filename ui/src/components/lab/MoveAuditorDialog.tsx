import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { highlightCode, copyToClipboard } from "@/utils/codeHighlight";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface MoveAuditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuditCost: (cost: number) => void;
}

type AuditResult = {
  details: string;
  cost: number;
};

const MoveAuditorDialog: React.FC<MoveAuditorDialogProps> = ({
  open,
  onOpenChange,
  onAuditCost,
}) => {
  const [moveCode, setMoveCode] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const { connected } = useWallet();

  const handleAuditCode = async () => {
    if (!connected) {
      alert("Please connect your Aptos wallet first!");
      return;
    }

    if (!moveCode.trim()) {
      alert("Please enter Move code to audit!");
      return;
    }

    try {
      setIsAuditing(true);
      setAuditResult(null);

      const response = await fetch("/api/auditor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moveCode }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("audited");
        console.log(data.output);
        const result: AuditResult = {
          details: data.output,
          cost: 0.3,
        };
        setAuditResult(result);
        onAuditCost(result.cost);
      } else {
        console.log("Error:", data.message);
        toast.error("An error occurred! Please check console for details.");
      }
    } catch (e) {
      console.log("Error:", e);
      toast.error("An error occurred! Please check console for details.");
    } finally {
      setIsAuditing(false);
    }
  };

  const resetAudit = () => {
    setAuditResult(null);
    setMoveCode("");
  };

  const handleCopyCode = () => {
    copyToClipboard(moveCode);
    toast.success("Copied!");
  };

  const handleCopyDetails = () => {
    if (auditResult) {
      const detailsText = auditResult.details;
      copyToClipboard(`Audit Details:\n\n${detailsText}`);
      toast.success("Copied!");
    }
  };

  const handleDownloadDetails = () => {
    if (auditResult) {
      const detailsText = auditResult.details;
      const fileContent = `Move Code Audit Report\n\nCost: ${auditResult.cost} APT\n\nAudit Details:\n${detailsText}`;
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-report.txt";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Audit report downloaded!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Move Code AI Auditor</DialogTitle>
          <DialogDescription>
            Audit your Move smart contract for vulnerabilities and best
            practices
          </DialogDescription>
        </DialogHeader>

        {!auditResult ? (
          <>
            <div className="space-y-4">
              <Textarea
                value={moveCode}
                onChange={(e) => setMoveCode(e.target.value)}
                placeholder="Paste your Move smart contract code here..."
                className="h-[300px] font-mono text-sm"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleAuditCode}
                disabled={isAuditing}
                className="gap-2"
              >
                {isAuditing ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>Audit Code (0.3 APT)</>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <div>
                  <p className="text-sm mt-1">Cost: {auditResult.cost} APT</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Audit Details:</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyDetails}
                      className="gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadDetails}
                      className="gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto  bg-gray-900 text-gray-100 p-3 rounded-md">
                  {auditResult.details}
                </pre>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Audited Code:</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-md border bg-[#2d2d2d] p-4 w-full max-w-full overflow-auto max-h-[300px] w-[620px]">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    <code
                      className="language-move"
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(moveCode, "move"),
                      }}
                    />
                  </pre>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={resetAudit} className="p-6">
                Audit Another Contract
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MoveAuditorDialog;
