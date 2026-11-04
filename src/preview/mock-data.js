// Fixture data for the dev-only design preview. Shapes match what
// src/pages/Dashboard.jsx hands to DashboardView.
export const populatedDashboard = {
  businessName: 'Northwind Coffee',
  stats: { totalIdeas: 24, totalPosts: 18, publishedPosts: 7, connectedSites: 2 },
  pipeline: { draft: 5, generating: 1, ready: 4, scheduled: 1, published: 7 },
  recentIdeas: [
    {
      id: 'i1',
      title: 'Single-origin vs blends: what actually changes in the cup',
      description: 'Compare body, acidity and roast tolerance for a home-brewing audience.',
      status: 'ready',
      timestamp: '2 hours ago',
    },
    {
      id: 'i2',
      title: 'A plain-English guide to grind size',
      description: 'Espresso to French press, with a photo scale and a troubleshooting table.',
      status: 'generating',
      timestamp: '6 hours ago',
    },
    {
      id: 'i3',
      title: 'Why your cold brew tastes flat after day three',
      description: 'Oxidation, dilution ratios and storage; include a 24-hour schedule.',
      status: 'draft',
      timestamp: '1 day ago',
    },
    {
      id: 'i4',
      title: 'Buying a grinder under $200',
      description: 'Burr geometry, retention and the three models worth the money.',
      status: 'published',
      timestamp: '3 days ago',
    },
  ],
  recentPosts: [
    {
      id: 'p1',
      title: 'Single-origin vs blends: what actually changes in the cup',
      meta: '1,480 words · variation 2',
      status: 'ready',
      timestamp: '2 hours ago',
    },
    {
      id: 'p2',
      title: 'A plain-English guide to grind size',
      meta: 'drafting · variation 1',
      status: 'generating',
      timestamp: '6 hours ago',
    },
    {
      id: 'p3',
      title: 'Espresso dialling-in, start to finish',
      meta: '2,110 words · variation 1',
      status: 'scheduled',
      timestamp: '2 days ago',
    },
    {
      id: 'p4',
      title: 'Buying a grinder under $200',
      meta: '1,260 words · variation 3',
      status: 'published',
      timestamp: '3 days ago',
    },
  ],
};

export const emptyDashboard = {
  businessName: '',
  stats: { totalIdeas: 0, totalPosts: 0, publishedPosts: 0, connectedSites: 0 },
  pipeline: {},
  recentIdeas: [],
  recentPosts: [],
};

export const mockUser = { email: 'ryan@northwindcoffee.com', business_name: 'Northwind Coffee' };

// Records shaped like the Supabase rows the list components receive.
export const mockIdeas = [
  {
    id: 'i1',
    title: 'Single-origin vs blends: what actually changes in the cup',
    description:
      'Compare body, acidity and roast tolerance for a home-brewing audience, with a simple tasting exercise.',
    status: 'ready',
    keywords: ['single origin', 'coffee blends', 'tasting notes'],
    target_audience: 'Home brewers buying their second bag',
    variations_requested: 2,
    created_date: '2026-11-03T08:15:00Z',
  },
  {
    id: 'i2',
    title: 'A plain-English guide to grind size',
    description: 'Espresso to French press, with a photo scale and a troubleshooting table.',
    status: 'generating',
    keywords: ['grind size', 'burr grinder'],
    target_audience: 'Beginners with a new grinder',
    variations_requested: 1,
    created_date: '2026-11-02T19:40:00Z',
  },
  {
    id: 'i3',
    title: 'Why your cold brew tastes flat after day three',
    description: 'Oxidation, dilution ratios and storage; include a 24-hour schedule.',
    status: 'draft',
    keywords: ['cold brew', 'storage'],
    target_audience: 'Batch brewers',
    variations_requested: 1,
    created_date: '2026-11-01T11:05:00Z',
  },
];

export const mockPosts = [
  {
    id: 'p1',
    title: 'Single-origin vs blends: what actually changes in the cup',
    excerpt:
      'Roasters talk about origin like it settles the argument. In the cup, the difference is narrower and more interesting than that.',
    status: 'ready',
    word_count: 1480,
    variation_number: 2,
    tags: ['coffee', 'buying guide'],
    created_date: '2026-11-03T08:40:00Z',
  },
  {
    id: 'p2',
    title: 'A plain-English guide to grind size',
    excerpt: 'Grind size is the one variable that changes everything downstream.',
    status: 'generating',
    word_count: 0,
    variation_number: 1,
    tags: ['coffee', 'how-to'],
    created_date: '2026-11-02T19:55:00Z',
  },
  {
    id: 'p3',
    title: 'Buying a grinder under $200',
    excerpt: 'Burr geometry, retention, and the three models that are worth the money.',
    status: 'published',
    word_count: 1260,
    variation_number: 3,
    tags: ['gear'],
    created_date: '2026-10-31T09:20:00Z',
    published_at: '2026-10-31T15:00:00Z',
  },
];
