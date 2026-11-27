import { config } from "./config.js";

const PI_API = "https://api.minepi.com/v2";

export class PiApiError extends Error {
  constructor(public status: number, public path: string, message: string) {
    super(message);
  }
}

// Journalise le code HTTP et le chemin, jamais les clés ni les tokens.
async function piFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${PI_API}${path}`, init);
  if (!res.ok) {
    console.error(`Pi API ${init.method ?? "GET"} ${path.replace(/\/[^/]*\/(approve|complete)/, "/:id/$1")} -> ${res.status}`);
    throw new PiApiError(res.status, path, `Erreur API Pi ${res.status}`);
  }
  return (await res.json()) as T;
}

export interface PiUser {
  uid: string;
  username: string;
}

// Vérifie l'accessToken côté serveur : on ne fait jamais confiance au navigateur.
export function verifyAccessToken(accessToken: string) {
  return piFetch<PiUser>("/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: { txid: string; verified: boolean } | null;
}

const keyHeaders = () => ({
  Authorization: `Key ${config.PI_API_KEY}`,
  "Content-Type": "application/json",
});

export const getPayment = (id: string) =>
  piFetch<PiPayment>(`/payments/${encodeURIComponent(id)}`, { headers: keyHeaders() });

export const approvePayment = (id: string) =>
  piFetch<PiPayment>(`/payments/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    headers: keyHeaders(),
  });

export const completePayment = (id: string, txid: string) =>
  piFetch<PiPayment>(`/payments/${encodeURIComponent(id)}/complete`, {
    method: "POST",
    headers: keyHeaders(),
    body: JSON.stringify({ txid }),
  });
