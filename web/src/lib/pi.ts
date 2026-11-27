// Intégration Pi côté navigateur. Le SDK n'existe que dans Pi Browser.
// Doc : Pi.init avant tout, puis Pi.authenticate(scopes, onIncompletePaymentFound).

interface PiAuthResult {
  accessToken: string;
  user: { uid: string; username?: string };
}
interface PiSdk {
  init(opts: { version: string; sandbox?: boolean }): void;
  authenticate(
    scopes: string[],
    onIncompletePaymentFound: (payment: { identifier: string }) => void,
  ): Promise<PiAuthResult>;
}
declare global {
  interface Window {
    Pi?: PiSdk;
  }
}

export const API_URL = import.meta.env.VITE_API_URL as string;
const SANDBOX = import.meta.env.VITE_PI_SANDBOX === "true";

export const isPiBrowser = () => typeof window !== "undefined" && !!window.Pi;

export function initPi() {
  if (!window.Pi) return false;
  window.Pi.init({ version: "2.0", sandbox: SANDBOX });
  return true;
}

// Envoie UNIQUEMENT l'accessToken au serveur, qui le vérifie auprès de Pi.
export async function loginWithPi() {
  if (!window.Pi) throw new Error("Ouvrez l'application dans Pi Browser.");
  const auth = await window.Pi.authenticate(["username", "payments"], (payment) => {
    // TODO étape paiements : envoyer payment.identifier au serveur pour finalisation.
    console.warn("Paiement incomplet détecté", payment.identifier);
  });
  const res = await fetch(`${API_URL}/api/auth/pi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: auth.accessToken }),
  });
  if (!res.ok) throw new Error("Connexion impossible");
  return (await res.json()) as { token: string; user: { id: string; username: string } };
}
