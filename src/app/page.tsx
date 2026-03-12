'use client';

import { useWallet } from '@jup-ag/wallet-adapter';
import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const TICKER = 'MAKE TOKENS GREAT AGAIN / REAL OWNERSHIP / INTERNET CAPITAL MARKETS / BUILD WITH BEDROCK / THE ONLY WAY IS UP / ';

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) router.push('/tokens');
  }, [connected, router]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">

      {/* Ticker tape */}
      <div className="border-b border-[#1e1e1e] py-2 overflow-hidden bg-black">
        <div className="marquee-track">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[11px] font-mono font-medium tracking-widest text-white/60 whitespace-nowrap px-4">
              {TICKER}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-[#1e1e1e] px-6 py-20 max-w-5xl mx-auto w-full">
        <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-8">
          The Bedrock of<br />Internet Capital<br />Markets
        </h1>
        <p className="text-[#999] text-base max-w-lg mb-10 leading-relaxed">
          Real-world legal frameworks that keep founders accountable. Incorporate your token,
          give holders real equity, and access capital from anywhere in the world — permissionlessly.
        </p>
        <div className="flex items-center gap-4">
          <UnifiedWalletButton />
          <a
            href="https://bedrockfndn.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest text-[#666] hover:text-white transition-colors flex items-center gap-1"
          >
            Learn more <ArrowRight size={12} />
          </a>
        </div>
      </div>

      {/* Ticker band */}
      <div className="border-b border-[#1e1e1e] py-3 overflow-hidden">
        <p className="text-[11px] font-mono tracking-widest text-white/40 uppercase px-6">
          ● BUILD WITH BEDROCK: THE ONLY WAY IS UP
        </p>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 border-b border-[#1e1e1e]">
        <FeatureCard
          title="Permissionless"
          desc="Access capital from anywhere in the world. No geography. No gatekeepers. No VC filter."
          icon="⊕"
        />
        <FeatureCard
          title="Ownership"
          desc="Real-world legal frameworks that give tokenholders actual equity in what they back."
          icon="⊞"
          border
        />
        <FeatureCard
          title="Build"
          desc="Focus on your business. Bedrock handles the legal structure, compliance, and cap table."
          icon="✳"
          border
        />
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto w-full px-6 py-16 border-b border-[#1e1e1e]">
        <p className="text-[11px] uppercase tracking-widest text-[#666] mb-10">How it works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step number="01" title="Connect" desc="Connect your wallet. We scan for tokens where you hold mint authority." />
          <Step number="02" title="Prove" desc="Sign a message to cryptographically prove you created the token." />
          <Step number="03" title="Incorporate" desc="Submit your details. Bedrock reviews and sets up your legal entity in 5–7 days." />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto w-full px-6 py-6">
        <div className="border border-[#1e1e1e] p-4 text-[11px] text-[#666] leading-relaxed font-mono">
          <span className="text-white">IMPORTANT:</span> Bedrock is a permissionless framework — anyone can apply, but incorporation is reviewed and may not succeed.
          Submitting an application does not guarantee a Bedrock entity will be formed. Benefits only apply after successful incorporation.
          The $7,500 deposit is required before review begins.
        </div>
      </div>

    </div>
  );
}

function FeatureCard({ title, desc, icon, border }: { title: string; desc: string; icon: string; border?: boolean }) {
  return (
    <div className={`p-8 border-[#1e1e1e] ${border ? 'border-l' : ''}`}>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-[#666] text-sm leading-relaxed mb-8">{desc}</p>
      <span className="text-2xl text-[#333]">{icon}</span>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div>
      <p className="text-[11px] font-mono text-[#444] mb-3">{number}</p>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
