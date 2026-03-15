import { useEffect, useCallback } from 'react';
import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { useAuthStore } from '../store/authStore';
import { v4 as uuidv4 } from 'uuid';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Collaborator {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  last_seen_at: string;
  joined_at: string;
}

export interface ChecklistItem {
  id: string;
  session_id: string;
  item_index: number;
  checked: number;        // 0 or 1
  checked_by: string;
  checked_by_name: string;
  checked_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  message: string;
  created_at: string;
}

// ── Helper: get display name + avatar from Supabase user object ───────────────
// user_metadata lives on the raw Supabase User type as `any` — we cast safely
const getUserMeta = (user: any) => {
  const meta = user?.user_metadata ?? {};
  const displayName: string =
    meta?.full_name ?? meta?.name ?? user?.email ?? 'Anonymous';
  const avatarUrl: string = meta?.avatar_url ?? '';
  return { displayName, avatarUrl };
};

// ── Hook ──────────────────────────────────────────────────────────────────────

const useCollaboration = (sessionId: string) => {
  const { user } = useAuthStore();

  // ── Live queries from local SQLite (all zero-network) ──────────────────────

  const { data: rawCollaborators = [] } = useQuery<Collaborator>(
    `SELECT * FROM session_presence
     WHERE session_id = ?
     ORDER BY joined_at ASC`,
    [sessionId]
  );

  const { data: checklistState = [] } = useQuery<ChecklistItem>(
    `SELECT * FROM session_checklist
     WHERE session_id = ?
     ORDER BY item_index ASC`,
    [sessionId]
  );

  const { data: chatMessages = [] } = useQuery<ChatMessage>(
    `SELECT * FROM session_chat
     WHERE session_id = ?
     ORDER BY created_at ASC`,
    [sessionId]
  );

  // Filter to active collaborators — seen in last 2 minutes
  const activeCollaborators = rawCollaborators.filter(c => {
    const lastSeen = new Date(c.last_seen_at).getTime();
    return Date.now() - lastSeen < 2 * 60 * 1000;
  });

  const otherCollaborators = activeCollaborators.filter(c => c.user_id !== user?.id);
  const isCollaborative = otherCollaborators.length > 0;

  // ── Presence heartbeat — upsert every 30s ─────────────────────────────────

  const upsertPresence = useCallback(async () => {
    if (!user || !sessionId) return;

    const { displayName, avatarUrl } = getUserMeta(user);
    const now = new Date().toISOString();

    // Check if row already exists in local SQLite
    const existing = await powerSync.getAll<{ id: string }>(
      `SELECT id FROM session_presence WHERE session_id = ? AND user_id = ? LIMIT 1`,
      [sessionId, user.id]
    );

    if (existing.length > 0) {
      // Update last_seen_at via PowerSync mutation
      await powerSync.execute(
        `UPDATE session_presence SET last_seen_at = ?, display_name = ?, avatar_url = ? WHERE session_id = ? AND user_id = ?`,
        [now, displayName, avatarUrl, sessionId, user.id]
      );
    } else {
      // Insert new presence row
      await powerSync.execute(
        `INSERT INTO session_presence (id, session_id, user_id, display_name, avatar_url, last_seen_at, joined_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sessionId, user.id, displayName, avatarUrl, now, now]
      );
    }
  }, [user, sessionId]);

  // Remove presence on unmount
  const removePresence = useCallback(async () => {
    if (!user || !sessionId) return;
    await powerSync.execute(
      `DELETE FROM session_presence WHERE session_id = ? AND user_id = ?`,
      [sessionId, user.id]
    );
  }, [user, sessionId]);

  useEffect(() => {
    if (!user || !sessionId) return;

    // Join immediately
    upsertPresence();

    // Heartbeat every 30s
    const interval = setInterval(upsertPresence, 30_000);

    // Leave on unmount
    return () => {
      clearInterval(interval);
      removePresence();
    };
  }, [user?.id, sessionId]);

  // ── Checklist sync ────────────────────────────────────────────────────────

  const toggleChecklistItem = async (itemIndex: number, currentChecked: boolean) => {
    if (!user) return;

    const { displayName } = getUserMeta(user);
    const newChecked = !currentChecked;
    const now = new Date().toISOString();

    // Check if row exists
    const existing = await powerSync.getAll<{ id: string }>(
      `SELECT id FROM session_checklist WHERE session_id = ? AND item_index = ? LIMIT 1`,
      [sessionId, itemIndex]
    );

    if (existing.length > 0) {
      await powerSync.execute(
        `UPDATE session_checklist
         SET checked = ?, checked_by = ?, checked_by_name = ?, checked_at = ?
         WHERE session_id = ? AND item_index = ?`,
        [newChecked ? 1 : 0, newChecked ? user.id : null, newChecked ? displayName : null, newChecked ? now : null, sessionId, itemIndex]
      );
    } else {
      await powerSync.execute(
        `INSERT INTO session_checklist (id, session_id, item_index, checked, checked_by, checked_by_name, checked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sessionId, itemIndex, newChecked ? 1 : 0, newChecked ? user.id : null, newChecked ? displayName : null, newChecked ? now : null]
      );
    }
  };

  // Helper: is a specific item checked?
  const isChecked = (itemIndex: number): boolean => {
    const row = checklistState.find(c => c.item_index === itemIndex);
    return row ? row.checked === 1 : false;
  };

  // Helper: who checked an item?
  const checkedBy = (itemIndex: number): string | null => {
    const row = checklistState.find(c => c.item_index === itemIndex);
    return row?.checked ? (row.checked_by_name ?? null) : null;
  };

  const completedCount = checklistState.filter(c => c.checked === 1).length;

  // ── Chat ──────────────────────────────────────────────────────────────────

  const sendMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    const { displayName, avatarUrl } = getUserMeta(user);

    await powerSync.execute(
      `INSERT INTO session_chat (id, session_id, user_id, display_name, avatar_url, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), sessionId, user.id, displayName, avatarUrl, message.trim(), new Date().toISOString()]
    );
  };

  return {
    // Presence
    activeCollaborators,
    otherCollaborators,
    isCollaborative,

    // Checklist
    checklistState,
    toggleChecklistItem,
    isChecked,
    checkedBy,
    completedCount,

    // Chat
    chatMessages,
    sendMessage,

    // Current user display name
    currentUserName: getUserMeta(user).displayName || 'You',
  };
};

export default useCollaboration;