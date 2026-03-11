# Bedrock Intake UI

Connect your Solana wallet → see tokens where you hold mint authority → prove ownership via message signing → submit incorporation application.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** — dark theme, clean
- **@solana/wallet-adapter** — Phantom, Backpack, Solflare, Coinbase
- **@solana/spl-token** — mint authority checks
- **Jupiter token API** — token metadata (name, symbol, logo)

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — connect wallet |
| `/tokens` | Shows all tokens where connected wallet = mint authority |
| `/incorporate/[mint]` | Sign ownership proof + submit intake form |

## Flow

1. User connects wallet (Phantom, Backpack, etc.)
2. `/tokens` page scans on-chain for tokens where `mintAuthority === connectedWallet`
3. User selects a token → goes to `/incorporate/[mint]`
4. User signs a message: proves they control the mint (off-chain, no gas)
5. User fills intake form (project name, founder info, description)
6. Submission creates a signed `IncorporationPayload`

## Running locally

```bash
cp .env.example .env.local
# Add your Helius RPC URL for better performance
npm install
npm run dev
```

## TODO (backend)
- POST `/api/incorporate` endpoint to receive `IncorporationPayload`
- Store in DB + notify Bedrock team (email / Telegram)
- Admin dashboard to review applications
- Webhook to assign Meteora badge once approved

## Intake Payload Schema

```ts
{
  mint: string         // token mint address
  symbol: string
  name: string
  wallet: string       // founder's wallet
  signature: string    // bs58-encoded signature of ownership message
  message: string      // the exact message that was signed
  projectName: string
  founderName: string
  founderEmail: string
  founderTelegram: string
  description: string
  website?: string
  twitter?: string
  timestamp: number
}
```
