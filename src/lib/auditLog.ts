import { supabase, isSupabaseConfigured } from './supabase';

export interface AdminAuditEntry {
  action: 'create' | 'update' | 'delete' | 'notify';
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
  actorName?: string;
  actorEmail?: string;
}

/**
 * Records an administrative action to the Supabase `audit_logs` table.
 * Non-blocking and fail-safe: never throws or blocks primary database operations.
 */
export async function logAdminAction(entry: AdminAuditEntry): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('audit_logs').insert({
      actor_name: entry.actorName || 'BADE SIR',
      actor_email: entry.actorEmail || 'icckeguruji@gmail.com',
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId || null,
      details: entry.details || {},
    });
  } catch {
    // Non-blocking audit log: ignore if table is not yet migrated or network fails
  }
}
