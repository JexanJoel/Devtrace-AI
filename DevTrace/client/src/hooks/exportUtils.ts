// exportUtils.ts — export sessions as markdown files

import type { DebugSession } from './useSessions';

export const exportSessionAsMarkdown = (session: DebugSession): void => {
  const lines: string[] = [];

  lines.push(`# Debug Session: ${session.title}`);
  lines.push('');
  lines.push(`**Status:** ${session.status.replace('_', ' ')}`);
  lines.push(`**Severity:** ${session.severity}`);
  if (session.project) lines.push(`**Project:** ${session.project.name}`);
  lines.push(`**Created:** ${new Date(session.created_at).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  if (session.error_message) {
    lines.push('## Error Message');
    lines.push('');
    lines.push('```');
    lines.push(session.error_message);
    lines.push('```');
    lines.push('');
  }

  if (session.stack_trace) {
    lines.push('## Stack Trace');
    lines.push('');
    lines.push('```');
    lines.push(session.stack_trace);
    lines.push('```');
    lines.push('');
  }

  if (session.ai_fix) {
    lines.push('## AI Fix (Groq / Llama 3)');
    lines.push('');
    // Strip bold markdown from storage format
    lines.push(session.ai_fix.replace(/\*\*(.*?)\*\*/g, '**$1**'));
    lines.push('');
  }

  if (session.notes) {
    lines.push('## Notes');
    lines.push('');
    lines.push(session.notes);
    lines.push('');
  }

  lines.push('---');
  lines.push('*Exported from DevTrace AI*');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devtrace-session-${session.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportAllSessionsAsMarkdown = (sessions: DebugSession[]): void => {
  const lines: string[] = [];

  lines.push('# DevTrace AI — All Debug Sessions');
  lines.push('');
  lines.push(`*Exported on ${new Date().toLocaleString()}*`);
  lines.push(`*Total: ${sessions.length} sessions*`);
  lines.push('');
  lines.push('---');
  lines.push('');

  sessions.forEach((session, index) => {
    lines.push(`## ${index + 1}. ${session.title}`);
    lines.push('');
    lines.push(`- **Status:** ${session.status.replace('_', ' ')}`);
    lines.push(`- **Severity:** ${session.severity}`);
    if (session.project) lines.push(`- **Project:** ${session.project.name}`);
    lines.push(`- **Created:** ${new Date(session.created_at).toLocaleString()}`);
    lines.push('');

    if (session.error_message) {
      lines.push('**Error:**');
      lines.push('```');
      lines.push(session.error_message);
      lines.push('```');
      lines.push('');
    }

    if (session.ai_fix) {
      lines.push('**AI Fix:**');
      lines.push(session.ai_fix);
      lines.push('');
    }

    if (session.notes) {
      lines.push('**Notes:**');
      lines.push(session.notes);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  lines.push('*Exported from DevTrace AI*');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devtrace-all-sessions-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};