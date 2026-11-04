import { Beaker, FileText, Globe, LayoutDashboard, Lightbulb, UserRound } from 'lucide-react';

import { createPageUrl } from '@/utils';

/**
 * Navigation is grouped by the job being done, not by alphabet: you plan, you
 * write, you publish, you configure. Labels are nouns; the old one-line
 * descriptions are gone — they doubled the sidebar's height and said nothing.
 */
export const navGroups = [
  {
    label: 'Workspace',
    items: [{ title: 'Dashboard', url: createPageUrl('Dashboard'), icon: LayoutDashboard }],
  },
  {
    label: 'Content',
    items: [
      { title: 'Ideas', url: createPageUrl('Ideas'), icon: Lightbulb },
      { title: 'Posts', url: createPageUrl('Posts'), icon: FileText },
    ],
  },
  {
    label: 'Publishing',
    items: [{ title: 'WordPress', url: createPageUrl('WordPress'), icon: Globe }],
  },
  {
    label: 'Settings',
    items: [
      { title: 'Profile', url: createPageUrl('Profile'), icon: UserRound },
      { title: 'LLM Test', url: createPageUrl('LLMTest'), icon: Beaker, devOnly: true },
    ],
  },
];

/** Drops dev-only entries (e.g. LLM Test) outside development builds. */
export function visibleNavGroups(isDev) {
  return navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.devOnly || isDev) }))
    .filter((group) => group.items.length > 0);
}
