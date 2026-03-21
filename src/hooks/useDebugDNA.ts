import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface CategoryStat {
  category: string;
  total: number;
  resolved: number;
  resolutionRate: number;
}

export interface DebugDNAStats {
  total: number;
  resolved: number;
  open: number;
  inProgress: number;
  resolutionRate: number;
  severityMap: Record<string, number>;
  categoryStats: CategoryStat[];
  hardestCategories: CategoryStat[];
  bestCategories: CategoryStat[];
  avgResolutionHours: number;
  busiestDay: string;
  topFixType: string;
  avgConfidence: number;
  weeklyBuckets: number[];
}

export interface DebugDNAResult {
  stats: DebugDNAStats;
  narrative: string;
}

const useDebugDNA = () => {
  const [result, setResult] = useState<DebugDNAResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Use raw fetch instead of supabase.functions.invoke so we can
      // read the actual error body on non-2xx (invoke swallows it)
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debug-dna`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Picks up the real message e.g. "Free tier limit reached — ..."
        throw new Error(data?.error ?? 'Generation failed');
      }

      if (data?.error === 'no_sessions') throw new Error('no_sessions');
      if (data?.error) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return { result, loading, error, generate };
};

export default useDebugDNA;