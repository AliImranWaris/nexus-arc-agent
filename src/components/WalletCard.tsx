"use client";

import FaucetButton from "./FaucetButton";

interface Wallet {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  usdcBalance: string;
}

interface WalletCardProps {
  wallet: Wallet;
  selected: boolean;
  onSelect: (id: string) => void;
  onFunded?: () => void;
}

export default function WalletCard({ wallet, selected, onSelect, onFunded }: WalletCardProps) {
  const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

  return (
    <button
      onClick={() => onSelect(wallet.id)}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
        selected
          ? "border-indigo-500 bg-indigo-950/60 shadow-lg shadow-indigo-900/30"
          : "border-slate-700 bg-slate-800/60 hover:border-slate-500"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {wallet.blockchain}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                wallet.state === "LIVE"
                  ? "bg-emerald-900/60 text-emerald-400"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {wallet.state}
            </span>
          </div>
          <p className="font-mono text-sm text-slate-300 truncate">{shortAddress}</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">{wallet.id}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-white">{wallet.usdcBalance}</p>
          <p className="text-xs text-slate-400 mt-0.5">USDC</p>
        </div>
      </div>
      {selected && (
        <div className="mt-3 pt-3 border-t border-indigo-800/50">
          <p className="text-xs text-indigo-400">Selected as source wallet</p>
        </div>
      )}
      {onFunded && (
        <div className="mt-3 pt-3 border-t border-slate-700/60">
          <FaucetButton
            walletId={wallet.id}
            blockchain={wallet.blockchain}
            onFunded={onFunded}
          />
        </div>
      )}
    </button>
  );
}
