import { BedrockOnboardRequest, BedrockOnboardResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BEDROCK_API || 'https://core-api-dev.gvrn.ai/bedrock';
const API_KEY = process.env.NEXT_PUBLIC_BEDROCK_API_KEY || '';

export async function onboardProject(
  payload: BedrockOnboardRequest,
): Promise<BedrockOnboardResponse> {
  const res = await fetch(`${BASE_URL}/onboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bedrock-api-key': API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Onboard failed (${res.status})`);
  }

  return res.json();
}

export async function getClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return '0.0.0.0';
  }
}
