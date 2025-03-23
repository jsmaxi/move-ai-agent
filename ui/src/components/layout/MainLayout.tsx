import React, { useState } from "react";
import Navbar from "./Navbar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { HistoryItem } from "@/types/history";
import { ThemeType } from "@/types/theme";

interface MainLayoutProps {
  children: React.ReactNode;
  onHistoryItemClick?: (item: HistoryItem) => void;
  historyItems: HistoryItem[];
  balance: number;
}

// const DEMO_HISTORY: HistoryItem[] = [
//   {
//     id: "1",
//     timestamp: new Date(Date.now() - 1000 * 60 * 10),
//     prompt: "Create a token with transfer capabilities",
//     type: "contract",
//   },
//   {
//     id: "2",
//     timestamp: new Date(Date.now() - 1000 * 60 * 30),
//     prompt: "Create an agent that monitors token transfers",
//     type: "agent",
//   },
//   {
//     id: "3",
//     timestamp: new Date(Date.now() - 1000 * 60 * 60),
//     prompt: "Create a simple marketplace contract for NFTs",
//     type: "contract",
//   },
// ];

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onHistoryItemClick,
  historyItems,
  balance,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("default");

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onToggleHistory={toggleHistory}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        balance={balance}
      />

      <div className="flex flex-1 overflow-hidden">
        {isHistoryOpen && (
          <aside className="w-80 border-r border-lab-border bg-white/50 backdrop-blur-sm overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-lab-border bg-white/80 backdrop-blur-sm">
              <h2 className="font-medium">Prompt History</h2>
              <Button variant="ghost" size="icon" onClick={toggleHistory}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-2">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onHistoryItemClick?.(item)}
                  className="p-3 hover:bg-muted/50 rounded-lg cursor-pointer mb-1 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(item.timestamp)}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        item.type === "contract"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.type === "contract" ? "Contract" : "Agent"}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{item.prompt}</p>
                </div>
              ))}

              {historyItems.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No prompts in history yet</p>
                </div>
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
