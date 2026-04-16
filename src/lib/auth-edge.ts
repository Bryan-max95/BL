export interface EdgeJWTPayload {
  id: number;
  username: string;
  exp?: number;
  iat?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'family-finance-secret-key-2026';

function base64UrlToUint8Array(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

function parsePayload(token: string): EdgeJWTPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const json = new TextDecoder().decode(base64UrlToUint8Array(payload));
    return JSON.parse(json) as EdgeJWTPayload;
  } catch {
    return null;
  }
}

async function verifySignature(token: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  const signingInput = new TextEncoder().encode(`${header}.${payload}`);
  const secret = new TextEncoder().encode(JWT_SECRET);

  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  return crypto.subtle.verify(
    'HMAC',
    key,
    toArrayBuffer(base64UrlToUint8Array(signature)),
    signingInput
  );
}

export async function verifyEdgeToken(token: string): Promise<EdgeJWTPayload | null> {
  try {
    const payload = parsePayload(token);
    if (!payload) return null;

    const isValid = await verifySignature(token);
    if (!isValid) return null;

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
