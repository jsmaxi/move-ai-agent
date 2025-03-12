import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface WalletConnectProps {
  onConnect: () => void;
  onDisconnect: () => void;
  isConnected: boolean;
  walletAddress?: string;
  balance?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  isConnected,
  walletAddress,
  balance,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      {!isConnected ? (
        <Button
          onClick={onConnect}
          className="bg-lab-blue hover:bg-lab-blue/90 text-white"
        >
          Connect Wallet
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 border-lab-border"
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse-subtle"></div>
            <span>{formatAddress(walletAddress || "")}</span>
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-card p-3 shadow-xl z-10 animate-fade-in-up">
              <div className="mb-3">
                <p className="text-xs text-muted-foreground">Connected to</p>
                <p className="text-sm font-medium">Aptos Testnet</p>
              </div>

              <div className="mb-3">
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-sm font-medium">{balance || "0.0"} APT</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  onDisconnect();
                  setIsDropdownOpen(false);
                }}
              >
                Disconnect
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletConnect;
