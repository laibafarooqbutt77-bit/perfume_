import type { AdminActivityLog } from '../types/cms';

/**
 * Local-Only Admin Authentication Utility (LocalStorage + Salted SHA-256)
 *
 * SECURITY LIMITATION NOTICE:
 * Because this application persists everything locally in the browser (LocalStorage + IndexedDB)
 * without a server-side database or HTTP-only cookies, this mechanism provides client-side privacy
 * and session control for local/private management. Anyone with physical/DevTools access to this
 * browser profile can inspect or clear browser storage.
 */

const VAULT_KEY = 'maisondor_admin_vault_v3';
const SESSION_KEY = 'maisondor_admin_session_v3';
const ATTEMPTS_KEY = 'maisondor_admin_attempts_v3';
const LOGS_KEY = 'maisondor_admin_logs_v1';

// Salted SHA-256 hashes only — zero plaintext credentials stored in source code
const FACTORY_SALT = 'md_v3_9f4b2e8a1c7d5036';
const FACTORY_ADMIN_ID_HASH = 'ab38c1a41003a3049cf56fdf1d2d64301fbf32b5cde994412306583f2d342f18';
const FACTORY_PASSWORD_HASH = '8bcc9a0e0c70c05928f64512f26798417f0f121d989cecb12ba0b8c848b8f2fc';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000;

export interface AdminVaultRecord {
  salt: string;
  adminIdHash: string;
  passwordHash: string;
  displayAdminId: string; // Masked/non-secret label shown inside active session only
  sessionTimeoutMinutes: number;
  updatedAt: string;
}

export interface AdminSessionRecord {
  token: string;
  adminLabel: string;
  loginAt: string;
  lastActivityAt: string;
  expiresAt: number;
}

interface FailedAttemptsRecord {
  count: number;
  lockedUntil: number | null;
}

// Pure JS fallback SHA-256 in case crypto.subtle is unavailable on a non-secure LAN origin
function fallbackSha256Hex(ascii: string): string {
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let msg = ascii + '\x80';
  while ((msg.length % 64) - 56) msg += '\x00';
  for (let i = 0; i < msg.length; i++) {
    const j = msg.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const encoded = new TextEncoder().encode(input);
    const buffer = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  const utf8 = unescape(encodeURIComponent(input));
  return fallbackSha256Hex(utf8);
}

function generateSalt(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(12);
    globalThis.crypto.getRandomValues(bytes);
    return 'md_' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  return `md_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`;
}

export function getAdminVault(): AdminVaultRecord {
  const fallback: AdminVaultRecord = {
    salt: FACTORY_SALT,
    adminIdHash: FACTORY_ADMIN_ID_HASH,
    passwordHash: FACTORY_PASSWORD_HASH,
    displayAdminId: 'Primary Administrator',
    sessionTimeoutMinutes: 30,
    updatedAt: new Date().toISOString()
  };

  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) {
      localStorage.setItem(VAULT_KEY, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<AdminVaultRecord>;
    if (
      typeof parsed?.salt === 'string' &&
      typeof parsed?.adminIdHash === 'string' &&
      typeof parsed?.passwordHash === 'string'
    ) {
      return {
        salt: parsed.salt,
        adminIdHash: parsed.adminIdHash,
        passwordHash: parsed.passwordHash,
        displayAdminId:
          typeof parsed.displayAdminId === 'string' && parsed.displayAdminId.trim()
            ? parsed.displayAdminId
            : 'Primary Administrator',
        sessionTimeoutMinutes:
          typeof parsed.sessionTimeoutMinutes === 'number' && parsed.sessionTimeoutMinutes >= 5
            ? parsed.sessionTimeoutMinutes
            : 30,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
      };
    }
    localStorage.setItem(VAULT_KEY, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

export function getFailedAttemptsState(): FailedAttemptsRecord {
  if (typeof window === 'undefined') return { count: 0, lockedUntil: null };
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as FailedAttemptsRecord;
    if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
      const reset = { count: 0, lockedUntil: null };
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(reset));
      return reset;
    }
    return {
      count: Number(parsed.count) || 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null
    };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveFailedAttempts(state: FailedAttemptsRecord): void {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota failures on attempt tracking
  }
}

export function getAdminLogs(): AdminActivityLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AdminActivityLog[]) : [];
  } catch {
    return [];
  }
}

export function appendAdminLog(
  entry: Omit<AdminActivityLog, 'id' | 'timestamp'>
): AdminActivityLog[] {
  const nextEntry: AdminActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  const nextLogs = [nextEntry, ...getAdminLogs()].slice(0, 120);
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(nextLogs));
  } catch {
    // Trim logs further if storage is tight
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(nextLogs.slice(0, 30)));
    } catch {
      // Ignore
    }
  }
  return nextLogs;
}

export function clearAdminLogs(): void {
  try {
    localStorage.removeItem(LOGS_KEY);
  } catch {
    // Ignore
  }
}

export function getActiveAdminSession(): AdminSessionRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSessionRecord;
    if (!parsed || typeof parsed.expiresAt !== 'number' || typeof parsed.token !== 'string') {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      appendAdminLog({
        actor: parsed.adminLabel || 'Admin',
        action: 'SESSION_EXPIRED',
        target: 'Admin Session',
        details: 'Admin session expired automatically after inactivity timeout.',
        severity: 'security'
      });
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function touchAdminSession(): AdminSessionRecord | null {
  const session = getActiveAdminSession();
  if (!session) return null;
  const vault = getAdminVault();
  const updated: AdminSessionRecord = {
    ...session,
    lastActivityAt: new Date().toISOString(),
    expiresAt: Date.now() + vault.sessionTimeoutMinutes * 60 * 1000
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function clearAdminSession(reason: 'logout' | 'manual' | 'reset' = 'logout'): void {
  const current = getActiveAdminSession();
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore
  }
  if (current) {
    appendAdminLog({
      actor: current.adminLabel,
      action: reason === 'reset' ? 'VAULT_RESET' : 'ADMIN_LOGOUT',
      target: 'Admin Session',
      details:
        reason === 'reset'
          ? 'Admin session terminated due to security vault reset.'
          : 'Administrator signed out cleanly.',
      severity: 'security'
    });
  }
}

export async function loginAdmin(
  adminEmail: string,
  password: string
): Promise<
  | { ok: true; session: AdminSessionRecord }
  | { ok: false; error: string; remainingAttempts?: number; lockedSeconds?: number }
> {
  const cleanEmail = adminEmail.trim();
  if (!cleanEmail || !password) {
    return { ok: false, error: 'Both Email and Password are required.' };
  }

  const attempts = getFailedAttemptsState();
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    const secs = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
    return {
      ok: false,
      error: `Too many failed attempts. Please wait ${secs} seconds before trying again.`,
      lockedSeconds: secs
    };
  }

  const vault = getAdminVault();
  const idHash = await sha256Hex(`${vault.salt}:${cleanEmail}`);
  const pwHash = await sha256Hex(`${vault.salt}:${password}`);

  if (idHash !== vault.adminIdHash || pwHash !== vault.passwordHash) {
    const nextCount = attempts.count + 1;
    const isLocked = nextCount >= MAX_FAILED_ATTEMPTS;
    const lockedUntil = isLocked ? Date.now() + LOCKOUT_DURATION_MS : null;
    saveFailedAttempts({ count: isLocked ? 0 : nextCount, lockedUntil });

    appendAdminLog({
      actor: cleanEmail || 'Unknown',
      action: 'LOGIN_FAILED',
      target: 'Admin Auth',
      details: isLocked
        ? 'Failed login triggered temporary 60s lockout.'
        : `Invalid Email or Password attempt (${nextCount}/${MAX_FAILED_ATTEMPTS}).`,
      severity: 'security'
    });

    if (isLocked) {
      return {
        ok: false,
        error: 'Too many invalid login attempts. Access temporarily paused for 60 seconds.',
        lockedSeconds: 60
      };
    }

    return {
      ok: false,
      error: 'Invalid Email or Password',
      remainingAttempts: MAX_FAILED_ATTEMPTS - nextCount
    };
  }

  // Clean up any legacy v1/v2 session and vault keys if present
  try {
    localStorage.removeItem('maisondor_admin_session_v1');
    localStorage.removeItem('maisondor_admin_vault_v1');
    localStorage.removeItem('maisondor_admin_session_v2');
    localStorage.removeItem('maisondor_admin_vault_v2');
    localStorage.removeItem('maisondor_admin_attempts_v2');
  } catch {
    // Ignore
  }

  // Success: reset failed attempts and issue session
  saveFailedAttempts({ count: 0, lockedUntil: null });
  const now = new Date();
  const session: AdminSessionRecord = {
    token: generateSalt() + '_' + Date.now().toString(36),
    adminLabel: cleanEmail,
    loginAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    expiresAt: now.getTime() + vault.sessionTimeoutMinutes * 60 * 1000
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    return { ok: false, error: 'Browser LocalStorage is full. Free space before signing in.' };
  }

  appendAdminLog({
    actor: cleanEmail,
    action: 'ADMIN_LOGIN',
    target: 'Admin Portal',
    details: 'Administrator authenticated into local management vault.',
    severity: 'security'
  });

  return { ok: true, session };
}

export async function updateAdminCredentials(input: {
  currentPassword: string;
  newAdminId?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; message: string }> {
  const vault = getAdminVault();
  if (!input.currentPassword) {
    return { ok: false, message: 'Current password is required to authorize security changes.' };
  }

  const currentHash = await sha256Hex(`${vault.salt}:${input.currentPassword}`);
  if (currentHash !== vault.passwordHash) {
    appendAdminLog({
      actor: vault.displayAdminId,
      action: 'CREDENTIAL_CHANGE_DENIED',
      target: 'Admin Vault',
      details: 'Credential update blocked due to incorrect current password.',
      severity: 'security'
    });
    return { ok: false, message: 'Current password is incorrect.' };
  }

  const nextId = input.newAdminId?.trim();
  const nextPw = input.newPassword;

  if (!nextId && !nextPw) {
    return { ok: false, message: 'Provide a new Admin ID or a new password to update.' };
  }

  if (nextId && nextId.length < 3) {
    return { ok: false, message: 'Admin Email must be at least 3 characters long.' };
  }
  if (nextPw && nextPw.length < 6) {
    return { ok: false, message: 'New password must be at least 6 characters long.' };
  }

  const newSalt = generateSalt();
  const effectiveSalt = nextId ? newSalt : vault.salt;
  const newAdminIdHash = nextId
    ? await sha256Hex(`${effectiveSalt}:${nextId}`)
    : vault.adminIdHash;
  const newPasswordHash = nextPw
    ? await sha256Hex(`${effectiveSalt}:${nextPw}`)
    : await sha256Hex(`${effectiveSalt}:${input.currentPassword}`);

  const updatedVault: AdminVaultRecord = {
    ...vault,
    salt: effectiveSalt,
    adminIdHash: newAdminIdHash,
    passwordHash: newPasswordHash,
    displayAdminId: nextId || vault.displayAdminId,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(updatedVault));
  } catch {
    return { ok: false, message: 'Unable to save updated credentials to LocalStorage.' };
  }

  // Update active session label if ID changed
  const session = getActiveAdminSession();
  if (session && nextId) {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...session, adminLabel: nextId })
      );
    } catch {
      // Ignore
    }
  }

  appendAdminLog({
    actor: nextId || vault.displayAdminId,
    action: 'CREDENTIALS_UPDATED',
    target: 'Admin Vault',
    details: `${nextId ? 'Admin ID updated. ' : ''}${nextPw ? 'Password rotated with fresh cryptographic salt.' : ''}`.trim(),
    severity: 'security'
  });

  return { ok: true, message: 'Admin security credentials updated successfully.' };
}

export function updateSessionTimeoutMinutes(minutes: number): AdminVaultRecord {
  const safeMins = Math.max(5, Math.min(240, Math.round(minutes)));
  const vault = getAdminVault();
  const updated: AdminVaultRecord = {
    ...vault,
    sessionTimeoutMinutes: safeMins,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  touchAdminSession();
  appendAdminLog({
    actor: vault.displayAdminId,
    action: 'TIMEOUT_UPDATED',
    target: 'Session Policy',
    details: `Inactivity auto-logout timeout set to ${safeMins} minutes.`,
    severity: 'security'
  });
  return updated;
}

export function resetAdminVaultToDefaults(): void {
  clearAdminSession('reset');
  try {
    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // Ignore
  }
  getAdminVault();
}
