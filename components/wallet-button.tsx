"use client";

import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Copy, ExternalLink, LogOut, Wallet, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress } from "@/lib/utils/format";
import { useToast } from "@/components/ui/use-toast";

export function WalletButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const walletAddress = useMemo(() => {
    if (isConnected && address) return address;
    return null;
  }, [address, isConnected]);

  const shortAddress = walletAddress ? formatAddress(walletAddress) : null;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleDisconnect = async () => {
    // CRITICAL: Logout from Privy first
    await logout();
    
    // Force reload to clear all state
    // This ensures wagmi also disconnects
    window.location.reload();
  };

  if (!ready) {
    return <Button disabled>Loading...</Button>;
  }

  if (!authenticated || !walletAddress) {
    return (
      <Button onClick={login} className="gap-2 px-3 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm mobile-tap">
        <Wallet className="h-4 w-4" />
        Connect wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="gap-2 px-3 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm mobile-tap">
          <Wallet className="h-4 w-4" />
          {shortAddress ?? "Wallet"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Connected Wallet</DropdownMenuLabel>
        
        {/* Wallet Address Display */}
        <div className="px-3 py-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-muted-foreground mb-1.5">
              Address
            </div>
            <code className="text-xs font-mono text-foreground break-all">
              {walletAddress}
            </code>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Copy Address */}
        <DropdownMenuItem onClick={copyAddress} className="gap-3 cursor-pointer">
          <Copy className="h-4 w-4" />
          <span>Copy address</span>
        </DropdownMenuItem>

        {/* View on BSCScan */}
        <DropdownMenuItem asChild>
          <a
            href={`https://bscscan.com/address/${walletAddress}`}
            target="_blank"
            rel="noreferrer"
            className="gap-3 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on BSCScan</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Disconnect */}
        <DropdownMenuItem 
          onClick={handleDisconnect} 
          className="gap-3 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
