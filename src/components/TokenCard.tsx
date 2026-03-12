'use client';

import { TokenInfo } from '@/lib/types';
import { CreatorMethod } from '@/lib/solana';
import { useRouter } from 'next/navigation';
import { CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const METHOD_BADGE: Record<CreatorMethod, { label: string; color: string }> = {
  pump_fun:       { label: '🎯 pump.fun creator',     color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  meteora_dbc:    { label: '🌊 Meteora DBC creator',  color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  mint_authority: { label: '🔑 Mint authority',        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  genesis_tx:     { label: '🧬 Token deployer',        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  none:           { label: '❓ Unknown',               color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export function TokenCard({ token }: { token: TokenInfo }) {
  const router = useRouter();
  const badge = METHOD_BADGE[token.creatorMethod] ?? METHOD_BADGE.none;

  return (
    <div className="border border-[#1f1f1f] rounded-xl p-5 bg-[#111111] flex flex-col gap-4 hover:border-[#7C3AED]/50 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3">
        {token.logo ? (
          <Image
            src={token.logo}
            alt={token.symbol}
            width={40}
            height={40}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-sm font-bold text-[#7C3AED]">
            {token.symbol.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{token.name}</p>
          <p className="text-sm text-[#6b7280]">${token.symbol}</p>
        </div>
        <CheckCircle size={16} className="text-[#10B981] shrink-0" />
      </div>

      {/* Creator method badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit ${badge.color}`}>
        {badge.label}
      </div>

      {/* Mint address */}
      <div className="bg-[#0a0a0a] rounded-lg p-3 flex items-center gap-2">
        <span className="text-xs text-[#6b7280] font-mono truncate flex-1">
          {token.mint}
        </span>
        <a
          href={`https://solscan.io/token/${token.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#7C3AED] hover:text-[#9D6FFF] transition-colors shrink-0"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Stat label="Supply" value={token.supply} />
        <Stat label="Decimals" value={String(token.decimals)} />
        <Stat
          label="Mint Authority"
          value={token.mintAuthority ? 'Active' : 'Revoked'}
          highlight={!!token.mintAuthority}
        />
        <Stat
          label="Freeze Authority"
          value={token.freezeAuthority ? 'Active' : 'None'}
        />
      </div>

      {/* Action */}
      <button
        onClick={() => router.push(`/incorporate/${token.mint}`)}
        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        Incorporate this token
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-[#0a0a0a] rounded-lg px-3 py-2">
      <p className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-[#10B981]' : 'text-[#f5f5f5]'}`}>
        {value}
      </p>
    </div>
  );
}
