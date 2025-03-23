import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import WalletConnect from "../lab/WalletConnect";
import {
  BrainCircuit,
  History,
  Menu,
  AtomIcon,
  ShieldCheck,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import RAGBotDialog from "../lab/RAGBotDialog";
import ThemeSelector from "../lab/ThemeSelector";
import { ThemeType } from "@/types/theme";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
import MoveAuditorDialog from "../lab/MoveAuditorDialog";

interface NavbarProps {
  onToggleHistory: () => void;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  balance: number;
  onCost: (cost: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onToggleHistory,
  currentTheme,
  onThemeChange,
  balance,
  onCost,
}) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRAGBotOpen, setIsRAGBotOpen] = useState(false);
  const [isAuditorOpen, setIsAuditorOpen] = useState(false);

  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-lab-border bg-white/70 header-lab">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-lab-dark hover:bg-lab-blue/5"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link href="#">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lab-gradient shadow-sm">
                <AtomIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-extrabold text-xl tracking-tight">
                  Aptos <span className="gradient-text">PlayLab</span>
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                  Experiment, create, and innovate with AI assistance.
                </span>
              </div>
            </div>
          </Link>
        </div>

        {!isMobile && (
          <div className="hidden md:flex items-center gap-4">
            {connected && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-lab-border rounded-lg bg-white/50 backdrop-blur-sm">
                <span className="text-sm font-medium text-lab-dark">
                  {balance.toFixed(1)} APT
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              className="gap-2 text-lab-dark hover:bg-lab-blue/5"
              onClick={onToggleHistory}
            >
              <History className="h-4 w-4" />
              <span className="font-medium">History</span>
            </Button>

            <Button
              variant="ghost"
              className="gap-2 text-lab-dark hover:bg-lab-blue/5"
              onClick={() => setIsAuditorOpen(true)}
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="font-medium">Auditor</span>
            </Button>

            <Button
              variant="ghost"
              className="gap-2 text-lab-dark hover:bg-lab-blue/5"
              onClick={() => setIsRAGBotOpen(true)}
            >
              <BrainCircuit className="h-4 w-4" />
              <span className="font-medium">RAG Bot</span>
            </Button>

            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />

            <WalletConnect />
          </div>
        )}

        {isMobile && (
          <div className="flex items-center gap-2">
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
            <WalletConnect />
          </div>
        )}

        {isMobile && isMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 animate-fade-in">
            <nav className="container flex flex-col gap-3 p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-lab-dark bg-gray-300 hover:bg-gray-500 h-12"
                onClick={() => {
                  onToggleHistory();
                  setIsMenuOpen(false);
                }}
              >
                <History className="h-5 w-5" />
                <span className="font-medium">History</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-lab-dark bg-gray-300 hover:bg-gray-500 h-12"
                onClick={() => {
                  setIsAuditorOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="font-medium">Auditor</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-lab-dark bg-gray-300 hover:bg-gray-500 h-12"
                onClick={() => {
                  setIsRAGBotOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <BrainCircuit className="h-5 w-5" />
                <span className="font-medium">RAG Bot</span>
              </Button>
            </nav>
          </div>
        )}

        <RAGBotDialog open={isRAGBotOpen} onOpenChange={setIsRAGBotOpen} />
        <MoveAuditorDialog
          open={isAuditorOpen}
          onOpenChange={setIsAuditorOpen}
          onAuditCost={onCost}
        />
      </div>
    </header>
  );
};

export default Navbar;
