// src/lib/SupabaseConnector.ts
import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  UpdateType,
} from '@powersync/web';
import type { PowerSyncBackendConnector } from '@powersync/web';
import { supabase } from './supabaseClient';

// These errors mean the op is invalid and should be discarded, not retried
const FATAL_CODES = [
  /^22...$/,  // Data Exception
  /^23...$/,  // Integrity Constraint Violation (e.g. duplicate key)
  /^42501$/,  // Insufficient privilege
];

const isFatal = (code: string) => FATAL_CODES.some(r => r.test(code));

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error('No Supabase session');
    return {
      endpoint: import.meta.env.VITE_POWERSYNC_URL as string,
      token: session.access_token,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    let lastOp: CrudEntry | null = null;
    try {
      for (const op of transaction.crud) {
        lastOp = op;
        await this.applyOperation(op);
      }
      await transaction.complete();
    } catch (error: any) {
      const code = error?.code ?? error?.message ?? '';
      if (isFatal(String(code))) {
        // Discard bad op so it doesn't block the queue forever
        console.warn('Discarding fatal PowerSync op:', lastOp, error);
        await transaction.complete();
      } else {
        // Transient error — PowerSync will retry automatically
        console.warn('PowerSync upload will retry:', error);
        throw error;
      }
    }
  }

  private async applyOperation(op: CrudEntry) {
    const table = op.table;
    const id = op.id;
    const data = op.opData ?? {};

    switch (op.op) {
      case UpdateType.PUT:
        // upsert handles both inserts and replaces
        await supabase.from(table).upsert({ id, ...data }).throwOnError();
        break;
      case UpdateType.PATCH:
        await supabase.from(table).update(data).eq('id', id).throwOnError();
        break;
      case UpdateType.DELETE:
        await supabase.from(table).delete().eq('id', id).throwOnError();
        break;
    }
  }
}