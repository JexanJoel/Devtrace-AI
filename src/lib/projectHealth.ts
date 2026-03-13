// src/lib/projectHealth.ts
// Computes project health score entirely from local PowerSync SQLite data
// Zero API calls — works offline

import type { DebugSession } from '../hooks/useSessions';

export interface HealthScore {
  score: number;           // 0-100
  label: 'Healthy' | 'Needs Attention' | 'At Risk' | 'Critical';
  color: string;           // tailwind text color
  bg: string;              // tailwind bg color
  ring: string;            // tailwind ring color
  bar: string;             // tailwind bg for progress bar
  deductions: { reason: string; points: number }[];
  bonus: number;
}

export const computeHealthScore = (sessions: DebugSession[]): HealthScore => {
  let score = 100;
  const deductions: { reason: string; points: number }[] = [];
  let bonus = 0;

  const openSessions    = sessions.filter(s => s.status !== 'resolved');
  const resolvedCount   = sessions.filter(s => s.status === 'resolved').length;
  const resolutionRate  = sessions.length > 0 ? resolvedCount / sessions.length : 1;

  // Resolution rate penalty
  if (sessions.length > 0 && resolutionRate === 0) {
    score -= 25;
    deductions.push({ reason: 'No sessions resolved yet', points: 25 });
  }

  // Critical open sessions
  const criticalOpen = openSessions.filter(s => s.severity === 'critical').length;
  if (criticalOpen > 0) {
    const pts = Math.min(criticalOpen * 15, 30);
    score -= pts;
    deductions.push({ reason: `${criticalOpen} critical open session${criticalOpen > 1 ? 's' : ''}`, points: pts });
  }

  // High open sessions
  const highOpen = openSessions.filter(s => s.severity === 'high').length;
  if (highOpen > 0) {
    const pts = Math.min(highOpen * 8, 24);
    score -= pts;
    deductions.push({ reason: `${highOpen} high severity open session${highOpen > 1 ? 's' : ''}`, points: pts });
  }

  // Medium open sessions
  const medOpen = openSessions.filter(s => s.severity === 'medium').length;
  if (medOpen > 0) {
    const pts = Math.min(medOpen * 5, 15);
    score -= pts;
    deductions.push({ reason: `${medOpen} medium severity open session${medOpen > 1 ? 's' : ''}`, points: pts });
  }

  // Low open sessions
  const lowOpen = openSessions.filter(s => s.severity === 'low').length;
  if (lowOpen > 0) {
    const pts = Math.min(lowOpen * 3, 9);
    score -= pts;
    deductions.push({ reason: `${lowOpen} low severity open session${lowOpen > 1 ? 's' : ''}`, points: pts });
  }

  // Inactivity penalty
  if (sessions.length > 0) {
    const lastActivity = Math.max(...sessions.map(s => new Date(s.updated_at).getTime()));
    const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) {
      score -= 10;
      deductions.push({ reason: `No activity for ${Math.floor(daysSince)} days`, points: 10 });
    } else if (daysSince > 3) {
      score -= 5;
      deductions.push({ reason: `No activity for ${Math.floor(daysSince)} days`, points: 5 });
    }
  }

  // Bonus for high resolution rate
  if (sessions.length >= 3 && resolutionRate >= 0.8) {
    bonus = 5;
    score += bonus;
  }

  score = Math.max(0, Math.min(100, score));

  const label =
    score >= 80 ? 'Healthy' :
    score >= 60 ? 'Needs Attention' :
    score >= 40 ? 'At Risk' :
    'Critical';

  const color =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-yellow-600' :
    score >= 40 ? 'text-orange-600' :
    'text-red-600';

  const bg =
    score >= 80 ? 'bg-green-50 dark:bg-green-950' :
    score >= 60 ? 'bg-yellow-50 dark:bg-yellow-950' :
    score >= 40 ? 'bg-orange-50 dark:bg-orange-950' :
    'bg-red-50 dark:bg-red-950';

  const ring =
    score >= 80 ? 'ring-green-200 dark:ring-green-800' :
    score >= 60 ? 'ring-yellow-200 dark:ring-yellow-800' :
    score >= 40 ? 'ring-orange-200 dark:ring-orange-800' :
    'ring-red-200 dark:ring-red-800';

  const bar =
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-yellow-400' :
    score >= 40 ? 'bg-orange-400' :
    'bg-red-500';

  return { score, label, color, bg, ring, bar, deductions, bonus };
};