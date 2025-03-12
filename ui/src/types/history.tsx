export interface HistoryItem {
  id: string;
  timestamp: Date;
  prompt: string;
  type: "contract" | "agent";
}
