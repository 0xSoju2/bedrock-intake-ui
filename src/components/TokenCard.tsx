'use client';

import { TokenInfo } from '@/lib/types';
import { CreatorMethod } from '@/lib/solana';
import { useRouter } from 'next/navigation';
import { ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const METHOD_TAG: Record<CreatorMethod, string> = {
  pump_fun:       'PUMP.FUN',
  meteora_dbc:    'METEORA DBC',
  mint_authority: 'MINT AUTHORITY',
  genesis_tx:     'GENESIS TX',
  none:           'UNKNOWN',
};

export function TokenCard({ token }: { token: TokenInfo }) {
  const router = useRouter();
  const tag = METHOD_TAG[token.creatorMethod] ?? 'UNKNOWN';

  return (
    <div className="border border-[#1e1e1e] bg-[#0a0a0a] flex flex-col gap-0">

      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-[#1e1e1e]">
        {token.logo ? (
          <Image src={token.logo} alt={token.symbol} width={36} height={36} className="rounded-full" unoptimized />
        ) : (
          <div className="w-9 h-9 border border-[#1e1e1e] flex items-center justify-center text-xs font-bold font-mono text-[#666]">
            {token.symbol.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{token.name}</p>
          <p className="text-xs text-[#666] font-mono">${token.symbol}</p>
        </div>
        <span className="text-[10px] font-mono text-[#444] border border-[#1e1e1e] px-1.5 py-0.5 uppercase tracking-wider shrink-0">
          {tag}
        </span>
      </div>

      {/* Mint address */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1e1e1e]">
        <span className="text-[11px] font-mono text-[#444] truncate flex-1">{token.mint}</span>
        <a href={`https://solscan.io/token/${token.mint}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={12} className="text-[#444] hover:text-white transition-colors" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 border-b border-[#1e1e1e]">
        {[
          { label: 'SUPPLY', value: token.supply },
          { label: 'DECIMALS', value: String(token.decimals) },
          { label: 'MINT AUTH', value: token.mintAuthority ? 'ACTIVE' : 'REVOKED' },
          { label: 'FREEZE', value: token.freezeAuthority ? 'ACTIVE' : 'NONE' },
        ].map(({ label, value }, i) => (
          <div key={label} className={`px-4 py-3 ${i > 0 ? 'border-l border-[#1e1e1e]' : ''}`}>
            <p className="text-[9px] font-mono tracking-widest text-[#444] mb-1">{label}</p>
            <p className="text-xs font-mono text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Action */}
      <button
        onClick={() => router.push(`/incorporate/${token.mint}`)}
        className="flex items-center justify-between px-5 py-4 text-xs uppercase tracking-widest font-medium hover:bg-white hover:text-black transition-colors group"
      >
        <span>Incorporate this token</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
