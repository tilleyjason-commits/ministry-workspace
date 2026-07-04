export const appConfig = {
  churchName: 'Abundant Life Family Worship Center',
  shortName: 'ALFWC',
  locationLabel: 'Cedar Grove, TN',
  address: 'Cedar Grove, TN — official street address needed',
  serviceTimes: ['Sunday worship at 10:30 AM', 'Wednesday groups and ministry nights vary'],
  phone: 'Office phone not configured',
  email: 'office@example.com',
  givingUrl: undefined as string | undefined,
  youtubeChannelUrl: undefined as string | undefined,
  facebookUrl: undefined as string | undefined,
  instagramUrl: undefined as string | undefined,
  planningCenterUrl: undefined as string | undefined,
  ccbLoginUrl: undefined as string | undefined,
  prayerUrl: undefined as string | undefined,
};

export const sermons = [
  {
    id: 'latest-message',
    title: 'The Hope We Have in Christ',
    speaker: 'Pastor Jason Tilley',
    series: 'Latest message',
    scriptureReference: 'Romans 5:1–11',
    description:
      'A gospel-centered message for the church family. Replace this static seed with ALFWC YouTube metadata before launch.',
    publishedAt: '2026-06-14T10:30:00-05:00',
    watchUrl: '',
    discussionQuestions: [
      'Where do you need to remember the hope of Christ this week?',
      'How can your group pray this passage together?',
    ],
    prayerPrompt: 'Lord, help us rest in the peace and hope we have through Jesus.',
  },
  {
    id: 'faithful-witness',
    title: 'A Faithful Witness',
    speaker: 'Pastor Jason Tilley',
    series: 'Stand firm',
    scriptureReference: 'Acts 4:1–22',
    description: 'A seeded sermon card showing the archive pattern.',
    publishedAt: '2026-06-07T10:30:00-05:00',
    watchUrl: '',
  },
];

export const events = [
  {
    id: 'sunday-worship',
    title: 'Sunday worship gathering',
    category: 'Sunday services',
    startsAt: '2026-06-21T10:30:00-05:00',
    locationName: 'ALFWC campus',
    address: appConfig.address,
    description: 'Join us for worship, Scripture, prayer, and time with the church family.',
    visibility: 'public' as const,
  },
  {
    id: 'family-night',
    title: 'Family ministry night',
    category: 'Kids and youth',
    startsAt: '2026-06-24T18:30:00-05:00',
    locationName: 'ALFWC campus',
    description:
      'A midweek evening for kids, youth, and families. Details are placeholders until ALFWC confirms the schedule.',
    visibility: 'public' as const,
  },
  {
    id: 'outreach-saturday',
    title: 'Community outreach Saturday',
    category: 'Outreach',
    startsAt: '2026-06-28T09:00:00-05:00',
    locationName: 'Meet at ALFWC',
    description: 'Serve neighbors in Cedar Grove together. Registration link can be connected later.',
    visibility: 'public' as const,
  },
];

export const quickActions = [
  { id: 'give', label: 'Give', icon: 'hand-holding-heart', destination: 'Give' },
  { id: 'prayer', label: 'Prayer', icon: 'hands-helping', destination: 'PrayerRequest' },
  { id: 'visit', label: 'Plan Visit', icon: 'door-open', destination: 'PlanVisit' },
  { id: 'connect', label: 'Connect', icon: 'envelope', destination: 'ConnectCard' },
];

export const ministryHighlight = {
  title: 'Family ministry night',
  body: 'Join us midweek for kids, youth, and families. Replace this with the latest ministry highlight before launch.',
  cta: 'Learn more',
};

export const interests = [
  'Sunday services',
  'Kids',
  'Youth',
  'Small groups',
  'Prayer',
  'Serving',
  'Outreach',
  'Special events',
];