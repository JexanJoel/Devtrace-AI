// src/lib/SupabaseConnector.ts
import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/web';
import { supabase } from './supabaseClient';

export class SupabaseConnector implements PowerSyncBackendConnector {
  // Fetch a fresh JWT token from Supabase for PowerSync auth
  async fetchCredentials() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error('No Supabase session');
    return {
      endpoint: import.meta.env.VITE_POWERSYNC_URL,
      token: session.access_token,
    };
  }

  // Upload local SQLite changes back to Supabase
  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
        await this.applyOperation(op);
      }
      await transaction.complete();
    } catch (error) {
      console.error('PowerSync upload error:', error);
      throw error;
    }
  }

  private async applyOperation(op: CrudEntry) {
    const table = op.table;
    const id = op.id;
    const data = op.opData ?? {};

    switch (op.op) {
      case UpdateType.PUT:
        await supabase.from(table).upsert({ id, ...data });
        break;
      case UpdateType.PATCH:
        await supabase.from(table).update(data).eq('id', id);
        break;
      case UpdateType.DELETE:
        await supabase.from(table).delete().eq('id', id);
        break;
    }
  }
}