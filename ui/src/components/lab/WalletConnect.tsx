"use client";

import React from "react";
import { WalletSelector } from "../WalletSelector";

const WalletConnect: React.FC = ({}) => {
  return (
    <div className="relative">
      <WalletSelector />
    </div>
  );
};

export default WalletConnect;
