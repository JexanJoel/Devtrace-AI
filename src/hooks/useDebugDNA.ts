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

      const { data, error: fnError } = await supabase.functions.invoke('debug-dna', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw new Error(fnError.message);
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