'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useRouter, useParams } from 'next/navigation';
import { getTokenByMint, buildOwnershipMessage } from '@/lib/solana';
import { TokenInfo, IncorporationPayload } from '@/lib/types';
import { Shield, CheckCircle, Loader2, ExternalLink, ArrowLeft } from 'lucide-react';
import bs58 from 'bs58';
import Link from 'next/link';

type Step = 'verify' | 'sign' | 'form' | 'submitted';

export default function IncorporatePage() {
  const { mint } = useParams<{ mint: string }>();
  const { publicKey, connected, signMessage } = useWallet();
  const router = useRouter();

  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [step, setStep] = useState<Step>('verify');
  const [signedMessage, setSignedMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Disclaimer checkboxes
  const [noExistingTeam, setNoExistingTeam] = useState(false);
  const [noExistingAgreement, setNoExistingAgreement] = useState(false);
  const [ownsIP, setOwnsIP] = useState(false);

  // Form state
  const [form, setForm] = useState({
    projectName: '',
    founderName: '',
    founderEmail: '',
    founderTelegram: '',
    description: '',
    website: '',
    twitter: '',
  });

  useEffect(() => {
    if (!connected) router.push('/');
  }, [connected, router]);

  useEffect(() => {
    if (mint) loadToken();
  }, [mint]);

  async function loadToken() {
    setLoadingToken(true);
    const t = await getTokenByMint(mint);
    if (t) {
      const isAuth = t.mintAuthority === publicKey?.toBase58();
      setToken({ ...t, isAuthority: isAuth });
    }
    setLoadingToken(false);
    setStep('verify');
  }

  async function handleSign() {
    if (!signMessage || !publicKey || !token) return;
    setSigning(true);
    setSignError('');
    try {
      const msg = buildOwnershipMessage(mint, publicKey.toBase58());
      const encoded = new TextEncoder().encode(msg);
      const sig = await signMessage(encoded);
      const sigB58 = bs58.encode(sig);
      setSignedMessage(msg);
      setSignature(sigB58);
      setStep('form');
    } catch (err: any) {
      setSignError(err?.message || 'Signing rejected');
    } finally {
      setSigning(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !publicKey) return;
    setSubmitting(true);
    try {
      const payload: IncorporationPayload = {
        mint,
        symbol: token.symbol,
        name: token.name,
        wallet: publicKey.toBase58(),
        signature,
        message: signedMessage,
        timestamp: Date.now(),
        declaredNoExistingTeam: noExistingTeam,
        declaredNoExistingAgreement: noExistingAgreement,
        declaredOwnsIP: ownsIP,
        ...form,
      };

      // For now — log + show success. Replace with API call when backend ready.
      console.log('Incorporation payload:', payload);

      // TODO: POST to /api/incorporate or send to Bedrock backend
      // await fetch('/api/incorporate', { method: 'POST', body: JSON.stringify(payload) });

      setStep('submitted');
    } finally {
      setSubmitting(false);
    }
  }

  function updateForm(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (!connected || !publicKey) return null;

  if (loadingToken) {
    return (
      <div className="flex items-center gap-3 text-[#6b7280] mt-10">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading token info...</span>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center mt-10">
        <p className="text-[#EF4444]">Token not found: {mint}</p>
        <Link href="/tokens" className="text-[#7C3AED] text-sm mt-2 block">
          ← Back to tokens
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      {/* Back */}
      <Link
        href="/tokens"
        className="flex items-center gap-1 text-[#6b7280] text-sm hover:text-[#f5f5f5] transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to tokens
      </Link>

      {/* Token header */}
      <div className="border border-[#1f1f1f] rounded-xl p-5 bg-[#111111] flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center text-sm font-bold text-[#7C3AED]">
          {token.symbol.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{token.name}</p>
          <p className="text-sm text-[#6b7280]">${token.symbol}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-[#6b7280] font-mono truncate">{mint}</span>
            <a href={`https://solscan.io/token/${mint}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={11} className="text-[#6b7280] hover:text-[#7C3AED]" />
            </a>
          </div>
        </div>
        {token.isAuthority && (
          <CheckCircle size={20} className="text-[#10B981] shrink-0" />
        )}
      </div>

      {/* Authority check */}
      {!token.isAuthority && (
        <div className="border border-[#EF4444]/30 bg-[#EF4444]/10 rounded-xl p-4 text-sm text-[#EF4444]">
          ⚠️ Your connected wallet is not the mint authority for this token. You cannot incorporate it.
          <br />
          <span className="text-[#6b7280] text-xs mt-1 block">
            Mint authority: {token.mintAuthority || 'revoked'}
          </span>
        </div>
      )}

      {token.isAuthority && (
        <>
          {/* Permissionless disclaimer — always visible */}
          <div className="border border-[#F59E0B]/30 bg-[#F59E0B]/5 rounded-xl p-4 text-sm">
            <p className="text-[#F59E0B] font-medium mb-1">Before you continue</p>
            <ul className="space-y-1 text-[#9ca3af]">
              <li>
                Bedrock is a <span className="text-[#f5f5f5]">permissionless framework</span> — anyone can apply, but incorporation is reviewed and may not succeed.
              </li>
              <li>
                Submitting this application <span className="text-[#f5f5f5]">does not guarantee</span> a Bedrock entity will be formed.
              </li>
              <li>
                All benefits are only guaranteed <span className="text-[#f5f5f5]">after successful incorporation</span>.
              </li>
            </ul>
          </div>

          {/* Step: Verify */}
          {step === 'verify' && (
            <StepCard
              icon={<Shield size={22} className="text-[#7C3AED]" />}
              title="Prove ownership"
              desc="Sign a message to cryptographically prove you control this token's mint. This doesn't send any transaction — it's a free off-chain signature."
            >
              <div className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-xs text-[#6b7280] whitespace-pre leading-relaxed">
                {buildOwnershipMessage(mint, publicKey.toBase58())}
              </div>
              {signError && <p className="text-[#EF4444] text-sm">{signError}</p>}
              <button
                onClick={handleSign}
                disabled={signing}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
              >
                {signing ? (
                  <><Loader2 size={15} className="animate-spin" /> Waiting for signature...</>
                ) : (
                  <><Shield size={15} /> Sign & Continue</>
                )}
              </button>
            </StepCard>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <StepCard
              icon={<CheckCircle size={22} className="text-[#10B981]" />}
              title="Ownership verified ✓"
              desc="Now fill in your project details to complete the Bedrock intake application."
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="bg-[#0a0a0a] rounded-lg px-4 py-2 flex items-center gap-2">
                  <CheckCircle size={13} className="text-[#10B981]" />
                  <span className="text-xs text-[#6b7280] font-mono truncate">
                    Signed: {signature.slice(0, 20)}...
                  </span>
                </div>

                <Field label="Project Name *" required>
                  <input
                    required
                    type="text"
                    value={form.projectName}
                    onChange={(e) => updateForm('projectName', e.target.value)}
                    placeholder="e.g. Blitz Protocol"
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Your Name *" required>
                    <input
                      required
                      type="text"
                      value={form.founderName}
                      onChange={(e) => updateForm('founderName', e.target.value)}
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email *" required>
                    <input
                      required
                      type="email"
                      value={form.founderEmail}
                      onChange={(e) => updateForm('founderEmail', e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Telegram handle *" required>
                    <input
                      required
                      type="text"
                      value={form.founderTelegram}
                      onChange={(e) => updateForm('founderTelegram', e.target.value)}
                      placeholder="@yourhandle"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Twitter / X">
                    <input
                      type="text"
                      value={form.twitter}
                      onChange={(e) => updateForm('twitter', e.target.value)}
                      placeholder="@yourhandle"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Website">
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateForm('website', e.target.value)}
                    placeholder="https://yourproject.xyz"
                    className={inputClass}
                  />
                </Field>

                <Field label="What are you building? *" required>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe your project — what it is, who it's for, and why real ownership matters for your tokenholders."
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                {/* Disclaimers */}
                <div className="border border-[#F59E0B]/30 bg-[#F59E0B]/5 rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs text-[#F59E0B] font-medium uppercase tracking-wide">
                    Required declarations
                  </p>
                  <Checkbox
                    id="no-team"
                    checked={noExistingTeam}
                    onChange={setNoExistingTeam}
                    label="I confirm there is no existing incorporated team, company, or legal entity associated with this token or project."
                  />
                  <Checkbox
                    id="no-agreement"
                    checked={noExistingAgreement}
                    onChange={setNoExistingAgreement}
                    label="I confirm there are no existing equity agreements, SAFEs, convertible notes, or investor commitments that would conflict with a Bedrock Foundation structure."
                  />
                  <Checkbox
                    id="owns-ip"
                    checked={ownsIP}
                    onChange={setOwnsIP}
                    label="I confirm that I am the rightful owner of all intellectual property related to this project and have the right to incorporate it under a Bedrock Foundation entity."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !noExistingTeam || !noExistingAgreement || !ownsIP}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Bedrock Intake Application'
                  )}
                </button>
              </form>
            </StepCard>
          )}

          {/* Step: Submitted */}
          {step === 'submitted' && (
            <div className="border border-[#10B981]/30 bg-[#10B981]/10 rounded-xl p-8 text-center flex flex-col items-center gap-4">
              <CheckCircle size={48} className="text-[#10B981]" />
              <h2 className="text-xl font-bold">Application submitted</h2>
              <p className="text-[#6b7280] text-sm max-w-sm">
                The Bedrock team will review your application within 5-7 days. Expect a
                message from{' '}
                <a
                  href="https://t.me/Pranave"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7C3AED] hover:underline"
                >
                  @Pranave on Telegram
                </a>
                .
              </p>
              <div className="bg-[#0a0a0a] rounded-lg px-4 py-2 w-full">
                <p className="text-xs text-[#6b7280] font-mono text-left">
                  Token: {mint.slice(0, 16)}...
                </p>
                <p className="text-xs text-[#6b7280] font-mono text-left">
                  Wallet: {publicKey?.toBase58().slice(0, 16)}...
                </p>
                <p className="text-xs text-[#6b7280] font-mono text-left">
                  Sig: {signature.slice(0, 20)}...
                </p>
              </div>
              <Link
                href="/tokens"
                className="text-[#7C3AED] text-sm hover:underline"
              >
                ← Back to tokens
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const inputClass =
  'w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f5] placeholder-[#6b7280] focus:outline-none focus:border-[#7C3AED] transition-colors';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-[#6b7280] mb-1.5 block">
        {label}
        {required && <span className="text-[#7C3AED] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[#7C3AED] border-[#7C3AED]'
            : 'bg-transparent border-[#4b5563] group-hover:border-[#7C3AED]'
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-[#9ca3af] leading-relaxed">{label}</span>
    </label>
  );
}

function StepCard({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#1f1f1f] rounded-xl p-6 bg-[#111111] flex flex-col gap-5">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-[#6b7280] mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
