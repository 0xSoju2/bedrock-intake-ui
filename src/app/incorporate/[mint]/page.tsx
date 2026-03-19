'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useRouter, useParams } from 'next/navigation';
import {
  getTokenByMint,
  buildOwnershipMessage,
  getIncorporationFee,
  getUsdcBalance,
  buildUsdcTransferTx,
  connection,
} from '@/lib/solana';
import {
  TokenInfo,
  BedrockOnboardRequest,
  BedrockCategory,
  BEDROCK_CATEGORIES,
} from '@/lib/types';
import { onboardProject, getClientIp } from '@/lib/api';
import { Loader2, ExternalLink, ArrowLeft } from 'lucide-react';
import bs58 from 'bs58';
import Link from 'next/link';

type Step = 'verify' | 'form' | 'pay' | 'submitted';

export default function IncorporatePage() {
  const { mint } = useParams<{ mint: string }>();
  const { publicKey, connected, signMessage, sendTransaction } = useWallet();
  const router = useRouter();

  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [step, setStep] = useState<Step>('verify');
  const [signedMessage, setSignedMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentTxSig, setPaymentTxSig] = useState('');

  // USDC balance
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  const [noExistingTeam, setNoExistingTeam] = useState(false);
  const [noExistingAgreement, setNoExistingAgreement] = useState(false);
  const [ownsIP, setOwnsIP] = useState(false);

  const [form, setForm] = useState({
    projectName: '',
    firstName: '',
    lastName: '',
    email: '',
    telegram: '',
    description: '',
    website: '',
    twitter: '',
    nationalityCountry: '',
    taxResidencyCountry: '',
    residentialAddress: '',
    totalShareAmount: '1000000',
    bedrockShareAmount: '420000',
    category: '' as BedrockCategory | '',
  });

  const fee = token ? getIncorporationFee(token.creatorMethod) : 15_000;

  useEffect(() => { if (!connected) router.push('/'); }, [connected, router]);
  useEffect(() => { if (mint) loadToken(); }, [mint]);
  useEffect(() => {
    if (publicKey) {
      getUsdcBalance(publicKey).then(setUsdcBalance);
    }
  }, [publicKey]);

  async function loadToken() {
    setLoadingToken(true);
    const t = await getTokenByMint(mint, publicKey?.toBase58());
    if (t) setToken(t);
    setLoadingToken(false);
  }

  async function handleSign() {
    if (!signMessage || !publicKey || !token) return;
    setSigning(true);
    setSignError('');
    try {
      const msg = buildOwnershipMessage(mint, publicKey.toBase58());
      const encoded = new TextEncoder().encode(msg);
      const sig = await signMessage(encoded);
      setSignedMessage(msg);
      setSignature(bs58.encode(sig));
      setStep('form');
    } catch (err: any) {
      setSignError(err?.message || 'SIGNING REJECTED');
    } finally {
      setSigning(false);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep('pay');
    // Refresh USDC balance when entering pay step
    if (publicKey) {
      getUsdcBalance(publicKey).then(setUsdcBalance);
    }
  }

  async function handlePay() {
    if (!token || !publicKey || !sendTransaction) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      // 1. Build & send USDC transfer
      const tx = await buildUsdcTransferTx(publicKey, fee);
      const txSig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(txSig, 'confirmed');
      setPaymentTxSig(txSig);

      // 2. Call /bedrock/onboard API
      const clientIp = await getClientIp();
      const founderShareAmount =
        Number(form.totalShareAmount) - Number(form.bedrockShareAmount);

      const apiPayload: BedrockOnboardRequest = {
        projectName: form.projectName,
        totalShareAmount: Number(form.totalShareAmount),
        bedrockShareAmount: Number(form.bedrockShareAmount),
        tokenAddress: mint,
        founders: [
          {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            nationalityCountry: form.nationalityCountry.toUpperCase(),
            taxResidencyCountry: form.taxResidencyCountry.toUpperCase(),
            residentialAddress: form.residentialAddress,
            shareAmount: founderShareAmount,
          },
        ],
        requestOriginIpAddress: clientIp,
        ...(form.category ? { category: form.category as BedrockCategory } : {}),
        ...(form.twitter ? { twitterHandle: form.twitter.replace('@', '') } : {}),
      };

      await onboardProject(apiPayload);
      setStep('submitted');
    } catch (err: any) {
      setSubmitError(err?.message || 'PAYMENT OR SUBMISSION FAILED');
    } finally {
      setSubmitting(false);
    }
  }

  if (!connected || !publicKey) return null;

  if (loadingToken) return (
    <div className="max-w-5xl mx-auto px-6 py-16 flex items-center gap-3 text-[#444]">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-sm font-mono uppercase tracking-widest">Loading token...</span>
    </div>
  );

  if (!token) return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="text-sm font-mono text-[#666]">TOKEN NOT FOUND: {mint}</p>
      <Link href="/tokens" className="text-xs uppercase tracking-widest text-[#444] hover:text-white mt-4 block">&larr; Back</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-10">

      <Link href="/tokens" className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#444] hover:text-white transition-colors w-fit">
        <ArrowLeft size={12} /> Back
      </Link>

      {/* Token header */}
      <div className="border border-[#1e1e1e] flex items-center gap-4 p-5">
        <div className="w-10 h-10 border border-[#1e1e1e] flex items-center justify-center text-xs font-mono text-[#666]">
          {token.symbol.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{token.name}</p>
          <p className="text-xs font-mono text-[#444]">${token.symbol}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#444] border border-[#1e1e1e] px-1.5 py-0.5 uppercase">
            {token.creatorMethod.replace('_', ' ')}
          </span>
          <a href={`https://solscan.io/token/${token.mint}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} className="text-[#444] hover:text-white" />
          </a>
        </div>
      </div>

      {/* Not authority warning */}
      {!token.isAuthority && (
        <div className="border border-[#1e1e1e] p-4 font-mono text-xs text-[#666]">
          NOT VERIFIED — your wallet was not detected as the creator of this token.
          DETECTED CREATOR: {token.detectedCreator || 'NONE'}
        </div>
      )}

      {token.isAuthority && (
        <>
          {/* Disclaimer — always visible */}
          <div className="border border-[#1e1e1e] p-5 font-mono text-[11px] text-[#444] leading-relaxed">
            <p className="text-white mb-2 uppercase tracking-widest text-[10px]">Before you continue</p>
            Bedrock is a permissionless framework — anyone can apply, but incorporation is reviewed and may not succeed.
            Submitting this application does not guarantee a Bedrock entity will be formed.
            All benefits are only guaranteed after successful incorporation.
            A non-refundable deposit of{' '}
            <span className="text-white">
              {fee === 7_500 ? '$7,500 USDC (Meteora rate)' : '$15,000 USDC'}
            </span>{' '}
            is required to proceed.
          </div>

          {/* Step: Verify (sign) */}
          {step === 'verify' && (
            <div className="border border-[#1e1e1e] flex flex-col gap-0">
              <div className="border-b border-[#1e1e1e] px-5 py-4">
                <p className="text-[11px] uppercase tracking-widest text-[#666] mb-1">Step 02 — Prove ownership</p>
                <p className="text-sm text-[#999]">
                  Sign a message to prove you created this token. Off-chain — no gas, no transaction.
                </p>
              </div>
              <div className="px-5 py-4 border-b border-[#1e1e1e]">
                <pre className="text-[11px] font-mono text-[#444] leading-relaxed whitespace-pre-wrap">
                  {buildOwnershipMessage(mint, publicKey.toBase58())}
                </pre>
              </div>
              {signError && (
                <div className="px-5 py-3 border-b border-[#1e1e1e]">
                  <p className="text-[11px] font-mono text-[#666]">{signError}</p>
                </div>
              )}
              <button
                onClick={handleSign}
                disabled={signing}
                className="px-5 py-4 text-[11px] uppercase tracking-widest font-medium hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-left"
              >
                {signing && <Loader2 size={12} className="animate-spin" />}
                {signing ? 'Waiting for signature...' : 'Sign message \u2192'}
              </button>
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <div className="border border-[#1e1e1e]">
              <div className="border-b border-[#1e1e1e] px-5 py-4">
                <p className="text-[11px] uppercase tracking-widest text-[#666] mb-1">Step 03 — Incorporation details</p>
                <p className="text-[11px] font-mono text-[#444]">SIGNED: {signature.slice(0, 24)}...</p>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <Field label="PROJECT NAME" required className="border-b border-[#1e1e1e] md:border-r">
                    <input required type="text" value={form.projectName} onChange={e => setForm(p => ({...p, projectName: e.target.value}))} placeholder="e.g. Blitz Protocol" className={inputClass} />
                  </Field>
                  <Field label="CATEGORY" className="border-b border-[#1e1e1e]">
                    <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value as BedrockCategory | ''}))} className={`${inputClass} cursor-pointer`}>
                      <option value="">Select category...</option>
                      {BEDROCK_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="FIRST NAME" required className="border-b border-[#1e1e1e] md:border-r">
                    <input required type="text" value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} placeholder="First name" className={inputClass} />
                  </Field>
                  <Field label="LAST NAME" required className="border-b border-[#1e1e1e]">
                    <input required type="text" value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} placeholder="Last name" className={inputClass} />
                  </Field>
                  <Field label="EMAIL" required className="border-b border-[#1e1e1e] md:border-r">
                    <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="you@example.com" className={inputClass} />
                  </Field>
                  <Field label="TELEGRAM" required className="border-b border-[#1e1e1e]">
                    <input required type="text" value={form.telegram} onChange={e => setForm(p => ({...p, telegram: e.target.value}))} placeholder="@handle" className={inputClass} />
                  </Field>
                  <Field label="NATIONALITY (ISO 3)" required className="border-b border-[#1e1e1e] md:border-r">
                    <input required type="text" maxLength={3} value={form.nationalityCountry} onChange={e => setForm(p => ({...p, nationalityCountry: e.target.value.toUpperCase()}))} placeholder="e.g. USA, GBR, SGP" className={inputClass} />
                  </Field>
                  <Field label="TAX RESIDENCY (ISO 3)" required className="border-b border-[#1e1e1e]">
                    <input required type="text" maxLength={3} value={form.taxResidencyCountry} onChange={e => setForm(p => ({...p, taxResidencyCountry: e.target.value.toUpperCase()}))} placeholder="e.g. USA, GBR, SGP" className={inputClass} />
                  </Field>
                  <Field label="WEBSITE" className="border-b border-[#1e1e1e] md:border-r">
                    <input type="url" value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))} placeholder="https://yourproject.xyz" className={inputClass} />
                  </Field>
                  <Field label="TWITTER / X" className="border-b border-[#1e1e1e]">
                    <input type="text" value={form.twitter} onChange={e => setForm(p => ({...p, twitter: e.target.value}))} placeholder="handle (no @)" className={inputClass} />
                  </Field>
                </div>

                <Field label="RESIDENTIAL ADDRESS" required className="border-b border-[#1e1e1e]">
                  <input required type="text" value={form.residentialAddress} onChange={e => setForm(p => ({...p, residentialAddress: e.target.value}))} placeholder="Full residential address" className={inputClass} />
                </Field>

                <Field label="WHAT ARE YOU BUILDING?" required className="border-b border-[#1e1e1e]">
                  <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Describe your project — what it is, who it's for, and why real ownership matters for your tokenholders." className={`${inputClass} resize-none`} />
                </Field>

                {/* Share amounts */}
                <div className="border-b border-[#1e1e1e] px-5 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-3">Share Structure</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#444] mb-1">TOTAL SHARES</p>
                      <input required type="number" min={1} value={form.totalShareAmount} onChange={e => setForm(p => ({...p, totalShareAmount: e.target.value}))} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#444] mb-1">BEDROCK SHARES</p>
                      <input required type="number" min={0} value={form.bedrockShareAmount} onChange={e => setForm(p => ({...p, bedrockShareAmount: e.target.value}))} className={inputClass} />
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-[#333] mt-2">
                    FOUNDER SHARES: {(Number(form.totalShareAmount) - Number(form.bedrockShareAmount)).toLocaleString()}
                  </p>
                </div>

                {/* Declarations */}
                <div className="p-5 border-b border-[#1e1e1e] flex flex-col gap-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#444]">Required Declarations</p>
                  <Checkbox id="no-team" checked={noExistingTeam} onChange={setNoExistingTeam}
                    label="I confirm there is no existing incorporated team, company, or legal entity associated with this token or project." />
                  <Checkbox id="no-agreement" checked={noExistingAgreement} onChange={setNoExistingAgreement}
                    label="I confirm there are no existing equity agreements, SAFEs, convertible notes, or investor commitments that would conflict with a Bedrock Foundation structure." />
                  <Checkbox id="owns-ip" checked={ownsIP} onChange={setOwnsIP}
                    label="I confirm I am the rightful owner of all intellectual property related to this project and have the right to incorporate it under a Bedrock Foundation entity." />
                </div>

                <button
                  type="submit"
                  disabled={!noExistingTeam || !noExistingAgreement || !ownsIP}
                  className="px-5 py-4 text-[11px] uppercase tracking-widest font-medium hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-left"
                >
                  Continue to payment &mdash; ${fee.toLocaleString()} USDC &rarr;
                </button>
              </form>
            </div>
          )}

          {/* Step: Pay */}
          {step === 'pay' && (
            <div className="border border-[#1e1e1e] flex flex-col gap-0">
              <div className="border-b border-[#1e1e1e] px-5 py-4">
                <p className="text-[11px] uppercase tracking-widest text-[#666] mb-1">Step 04 — Pay incorporation fee</p>
                <p className="text-sm text-[#999]">
                  Send <span className="text-white font-semibold">${fee.toLocaleString()} USDC</span> to complete your application.
                  {token.creatorMethod === 'meteora_dbc' && (
                    <span className="text-[#666]"> (Meteora partner rate applied)</span>
                  )}
                </p>
              </div>

              <div className="px-5 py-5 border-b border-[#1e1e1e] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#444]">Incorporation Fee</span>
                  <span className="text-sm font-mono text-white">${fee.toLocaleString()} USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#444]">Your USDC Balance</span>
                  <span className={`text-sm font-mono ${usdcBalance !== null && usdcBalance < fee ? 'text-red-400' : 'text-white'}`}>
                    {usdcBalance !== null ? `$${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...'}
                  </span>
                </div>
                {token.creatorMethod === 'meteora_dbc' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#444]">Discount</span>
                    <span className="text-sm font-mono text-white">50% — METEORA DBC</span>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="px-5 py-3 border-b border-[#1e1e1e]">
                  <p className="text-[11px] font-mono text-red-400">{submitError}</p>
                </div>
              )}

              <div className="flex">
                <button
                  onClick={() => setStep('form')}
                  disabled={submitting}
                  className="px-5 py-4 text-[11px] uppercase tracking-widest text-[#444] hover:text-white disabled:opacity-30 transition-colors"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handlePay}
                  disabled={submitting || (usdcBalance !== null && usdcBalance < fee)}
                  className="flex-1 px-5 py-4 text-[11px] uppercase tracking-widest font-medium hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2 justify-end"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  {submitting ? 'Processing...' : `Pay $${fee.toLocaleString()} USDC \u2192`}
                </button>
              </div>
            </div>
          )}

          {/* Step: Submitted */}
          {step === 'submitted' && (
            <div className="border border-[#1e1e1e] flex flex-col gap-0">
              <div className="border-b border-[#1e1e1e] px-5 py-4">
                <p className="text-[11px] uppercase tracking-widest text-[#444]">Application submitted</p>
              </div>
              <div className="px-5 py-8 text-center">
                <p className="text-2xl font-bold mb-3">{'\u2713'}</p>
                <p className="text-sm text-[#999] max-w-sm mx-auto leading-relaxed">
                  Payment confirmed and application submitted. The Bedrock team will review within 5–7 days.
                  Expect a message from{' '}
                  <a href="https://t.me/Pranave" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">@Pranave on Telegram</a>.
                </p>
              </div>
              <div className="border-t border-[#1e1e1e] px-5 py-3 flex flex-col gap-1">
                <p className="text-[10px] font-mono text-[#444]">MINT: {mint.slice(0,20)}... | SIG: {signature.slice(0,20)}...</p>
                {paymentTxSig && (
                  <a
                    href={`https://solscan.io/tx/${paymentTxSig}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-[#444] hover:text-white flex items-center gap-1"
                  >
                    PAYMENT TX: {paymentTxSig.slice(0,20)}... <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const inputClass = 'w-full bg-transparent px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none font-mono';

function Field({ label, required, children, className = '' }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="px-4 pt-3 pb-0">
        <p className="text-[9px] uppercase tracking-widest text-[#444] mb-1">{label}{required && ' *'}</p>
      </div>
      {children}
    </div>
  );
}

function Checkbox({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div className={`mt-0.5 w-4 h-4 border shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-white border-white' : 'bg-transparent border-[#333] group-hover:border-white'}`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="text-xs text-[#666] leading-relaxed">{label}</span>
    </label>
  );
}
