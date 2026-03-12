'use client';

import { useWallet } from '@jup-ag/wallet-adapter';
import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, Zap, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) router.push('/tokens');
  }, [connected, router]);

  return (
    <div className="flex flex-col items-center text-center py-16 gap-12">
      {/* Hero */}
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        <span className="text-5xl">🪨</span>
        <h1 className="text-4xl font-bold tracking-tight">
          Real ownership.
          <br />
          <span className="text-[#7C3AED]">On-chain, for real.</span>
        </h1>
        <p className="text-[#6b7280] text-lg leading-relaxed">
          Bedrock Foundation gives your token a legal entity and real equity structure for
          tokenholders. Connect your wallet to see your tokens, prove ownership, and start
          the incorporation process.
        </p>
        <UnifiedWalletButton />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
        <Step
          icon={<Zap size={20} className="text-[#7C3AED]" />}
          number="01"
          title="Connect & Scan"
          desc="Connect your wallet. We scan for tokens where you hold mint authority."
        />
        <Step
          icon={<Shield size={20} className="text-[#7C3AED]" />}
          number="02"
          title="Prove Ownership"
          desc="Sign a message to cryptographically prove you control the token's mint."
        />
        <Step
          icon={<Users size={20} className="text-[#7C3AED]" />}
          number="03"
          title="Incorporate"
          desc="Fill in your project details and submit. Bedrock team reviews within 5-7 days."
        />
      </div>

      {/* What you get */}
      <div className="border border-[#1f1f1f] rounded-xl p-6 w-full max-w-2xl text-left bg-[#111111]">
        <h2 className="font-semibold text-lg mb-4">What you get</h2>
        <ul className="space-y-3 text-[#9ca3af]">
          {[
            'Legal entity for your project ($7,500 deposit)',
            'Real equity structure for tokenholders — not governance theater',
            'Bedrock Founders Program access — technical support, co-marketing, LP access',
            'Dashboard badge on Meteora pools',
            'Path to Bedrock Institutional (institutional-grade LP access)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ArrowRight size={16} className="text-[#7C3AED] mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="border border-[#F59E0B]/30 bg-[#F59E0B]/5 rounded-xl p-5 w-full max-w-2xl text-left">
        <p className="text-xs text-[#F59E0B] font-medium uppercase tracking-wide mb-2">Important</p>
        <ul className="space-y-2 text-sm text-[#9ca3af]">
          <li>
            <span className="text-[#f5f5f5] font-medium">Bedrock is a permissionless framework.</span>{' '}
            Anyone can apply. Incorporation is reviewed and may not succeed.
          </li>
          <li>
            <span className="text-[#f5f5f5] font-medium">Incorporation can fail.</span>{' '}
            Submitting this application does not guarantee a Bedrock entity will be formed.
            Benefits only apply after successful incorporation.
          </li>
          <li>
            <span className="text-[#f5f5f5] font-medium">The $7,500 deposit is paid upfront.</span>{' '}
            Required before intake review begins. See terms for refund conditions.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Step({
  icon,
  number,
  title,
  desc,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="border border-[#1f1f1f] rounded-xl p-5 bg-[#111111] text-left">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs font-mono text-[#6b7280]">{number}</span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[#6b7280] leading-relaxed">{desc}</p>
    </div>
  );
}
