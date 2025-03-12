import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { Terminal as TerminalIcon, Trash } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

interface TerminalProps {
  logs: LogEntry[];
  onClear: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onClear }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry["type"]): string => {
    switch (type) {
      case "info":
        return "text-blue-500";
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-foreground";
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="glass-card animate-fade-in">
      <div className="flex items-center justify-between p-2 border-b border-lab-border">
        <div className="flex items-center">
          <TerminalIcon className="h-4 w-4 mr-2 text-lab-purple" />
          <h3 className="text-sm font-medium">Logs</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClear}
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className="font-mono text-xs">{isCollapsed ? "+" : "-"}</span>
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={20} minSize={10} maxSize={50}>
            <div
              ref={terminalRef}
              className="font-mono text-xs p-3 overflow-y-auto h-[200px] bg-black/95 text-white"
            >
              {logs.length === 0 ? (
                <div className="text-muted-foreground">
                  &gt; Terminal ready. Actions will be logged here.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="mb-1">
                    <span className="text-gray-500">
                      [{formatTimestamp(log.timestamp)}]
                    </span>{" "}
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default Terminal;
