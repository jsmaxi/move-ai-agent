import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { copyToClipboard } from "@/utils/codeHighlight";
import { Transaction } from "@/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const handleCopyHash = (hash: string) => {
    copyToClipboard(hash);
    toast.success("Transaction hash copied to clipboard");
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Recent Deploy Transactions</h2>
      </div>
      <div className="max-h-[400px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction Hash</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-4 text-muted-foreground"
                >
                  No transactions yet.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      {formatHash(tx.hash)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyHash(tx.hash)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(tx.date, { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tx.status === "success"
                            ? "bg-green-500"
                            : tx.status === "failed"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        window.open(
                          `https://explorer.aptoslabs.com/txn/${tx.hash}?network=devnet`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionList;
