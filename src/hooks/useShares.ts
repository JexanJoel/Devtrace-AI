import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface Share {
  id: string;
  owner_id: string;
  invitee_id: string;
  resource_type: 'project' | 'session';
  resource_id: string;
  created_at: string;
  invitee_email?: string;
  invitee_name?: string;
  owner_email?: string;
  owner_name?: string;
  resource_name?: string;
}

const useShares = () => {
  const { user } = useAuthStore();
  const [myShares, setMyShares] = useState<Share[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyShares = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const enriched = await Promise.all(
        data.map(async (s: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', s.invitee_id)
            .limit(1);
          const p = profile?.[0];
          return {
            ...s,
            invitee_email: p?.email ?? '',
            invitee_name: p?.name ?? p?.email ?? '',
          };
        })
      );
      setMyShares(enriched);
    }
  };

  const fetchSharedWithMe = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('invitee_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const enriched = await Promise.all(
        data.map(async (s: any) => {
          let resource_name = '';
          let owner_name = '';

          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', s.owner_id)
            .limit(1);
          const op = ownerProfile?.[0];
          owner_name = op?.name ?? op?.email ?? 'Someone';

          if (s.resource_type === 'project') {
            const { data: proj } = await supabase
              .from('projects')
              .select('name')
              .eq('id', s.resource_id)
              .limit(1);
            resource_name = proj?.[0]?.name ?? 'Unnamed project';
          } else {
            const { data: sess } = await supabase
              .from('debug_sessions')
              .select('title')
              .eq('id', s.resource_id)
              .limit(1);
            resource_name = sess?.[0]?.title ?? 'Unnamed session';
          }

          return { ...s, resource_name, owner_name };
        })
      );
      setSharedWithMe(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyShares();
    fetchSharedWithMe();
  }, [user?.id]);

  // Find a DevTrace user by email
  const findUserByEmail = async (
    email: string
  ): Promise<{ id: string; name: string; email: string } | null> => {
    const cleaned = email.toLowerCase().trim();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .ilike('email', cleaned)
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0];
  };

  const createShare = async (
    resourceType: 'project' | 'session',
    resourceId: string,
    inviteeEmail: string
  ): Promise<boolean> => {
    if (!user) return false;

    const invitee = await findUserByEmail(inviteeEmail);
    if (!invitee) {
      toast.error('No DevTrace account found with that email');
      return false;
    }
    if (invitee.id === user.id) {
      toast.error("You can't share with yourself");
      return false;
    }

    const { error } = await supabase.from('shares').insert({
      owner_id: user.id,
      invitee_id: invitee.id,
      resource_type: resourceType,
      resource_id: resourceId,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('Already shared with this user');
      } else {
        toast.error('Failed to share');
      }
      return false;
    }

    toast.success(`Shared with ${invitee.name || invitee.email}`);
    await fetchMyShares();
    return true;
  };

  const revokeShare = async (shareId: string): Promise<boolean> => {
    const { error } = await supabase.from('shares').delete().eq('id', shareId);
    if (error) { toast.error('Failed to revoke access'); return false; }
    toast.success('Access revoked');
    await fetchMyShares();
    return true;
  };

  const getSharesForResource = async (
    resourceType: 'project' | 'session',
    resourceId: string
  ): Promise<Share[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('owner_id', user.id)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId);
    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (s: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', s.invitee_id)
          .limit(1);
        const p = profile?.[0];
        return {
          ...s,
          invitee_email: p?.email ?? '',
          invitee_name: p?.name ?? p?.email ?? '',
        };
      })
    );
    return enriched;
  };

  return {
    myShares,
    sharedWithMe,
    loading,
    findUserByEmail,
    createShare,
    revokeShare,
    getSharesForResource,
    refetchSharedWithMe: fetchSharedWithMe,
    refetchMyShares: fetchMyShares,
  };
};

export default useShares;