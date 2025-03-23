export interface Transaction {
  id: string;
  hash: string;
  date: Date;
  status: "success" | "failed";
}
