/**
 * Persistent Database Storage Engine
 * Provides persistent database operations across page refreshes,
 * browser restarts, authentication sessions, and role switches.
 */

export const DB_KEYS = {
  USERS: 'celerko_db_users',
  CURRENT_USER: 'celerko_db_current_user',
  ADMIN_SESSION: 'celerko_admin_session',
  CLIENT_SESSION: 'celerko_db_auth_client',
  GPUS: 'celerko_db_gpus',
  SIP_PROVIDERS: 'celerko_db_sip_providers',
  DIDS: 'celerko_db_dids',
  CLIENTS: 'celerko_db_clients',
  PENDING_REQUESTS: 'celerko_db_pending_requests',
  PROVIDERS: 'celerko_db_providers',
  INVOICES: 'celerko_db_invoices',
  PAYMENTS: 'celerko_db_payments',
  ALERTS: 'celerko_db_alerts',
  AUDIT_LOGS: 'celerko_db_audit_logs',
  SUPPORT_TICKETS: 'celerko_db_support_tickets',
  API_KEYS: 'celerko_db_api_keys',
  SESSIONS: 'celerko_db_user_sessions',
  LOGIN_HISTORY: 'celerko_db_login_history',
} as const;

export class PersistentDb {
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  public loadTable<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        // Save initial fallback so it exists permanently in DB
        this.saveTable(key, fallback);
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[PersistentDB] Failed to load table ${key}, using fallback:`, err);
      return fallback;
    }
  }

  public saveTable<T>(key: string, data: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[PersistentDB] Failed to save table ${key}:`, err);
    }
  }

  public removeTable(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`[PersistentDB] Failed to remove table ${key}:`, err);
    }
  }

  public clearAll(): void {
    if (!this.isBrowser) return;
    Object.values(DB_KEYS).forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  }
}

export const dbStorage = new PersistentDb();
