import { CreatorMethod } from './solana';

export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  logo?: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  isAuthority: boolean;           // wallet matches detected creator
  creatorMethod: CreatorMethod;   // how we detected the creator
  creatorLabel: string;           // human-readable label
  detectedCreator: string | null; // the creator address we found
}

export interface IncorporationPayload {
  mint: string;
  symbol: string;
  name: string;
  wallet: string;
  signature: string;
  message: string;
  projectName: string;
  founderName: string;
  founderEmail: string;
  founderTelegram: string;
  description: string;
  website?: string;
  twitter?: string;
  timestamp: number;
  creatorMethod: CreatorMethod;
  declaredNoExistingTeam: boolean;
  declaredNoExistingAgreement: boolean;
  declaredOwnsIP: boolean;
}

// /bedrock/onboard API types

export const BEDROCK_CATEGORIES = [
  'RWA', 'AI', 'DEFI', 'INFRA', 'DEPIN', 'LEGAL', 'GAMING', 'NFT', 'MEME',
] as const;

export type BedrockCategory = typeof BEDROCK_CATEGORIES[number];

export interface BedrockFounderDto {
  firstName: string;
  lastName: string;
  email: string;
  nationalityCountry: string;
  taxResidencyCountry: string;
  residentialAddress: string;
  shareAmount: number;
}

export interface BedrockOnboardRequest {
  projectName: string;
  totalShareAmount: number;
  bedrockShareAmount: number;
  tokenAddress: string;
  founders: BedrockFounderDto[];
  requestOriginIpAddress: string;
  category?: BedrockCategory;
  twitterHandle?: string;
}

export interface BedrockOnboardResponse {
  tokenAddress: string;
  incorporationStatus: string;
  founders: Array<BedrockFounderDto & { id?: string }>;
  totalShareAmount: number;
  bedrockShareAmount: number;
  category?: string;
  twitterHandle?: string;
  createdAt: string;
}
