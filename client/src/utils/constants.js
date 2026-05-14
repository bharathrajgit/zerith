// client/src/utils/constants.js
export const DSA_TOPICS = [
  'arrays', 'strings', 'searching', 'sorting',
  'recursion', 'linked_lists', 'stack_queue',
  'trees', 'heaps_hashing', 'graphs', 'dp',
];

export const TOPIC_EMOJIS = {
  arrays: '📊',
  strings: '🔤',
  searching: '🔍',
  sorting: '↕️',
  recursion: '🔄',
  linked_lists: '🔗',
  stack_queue: '📚',
  trees: '🌳',
  heaps_hashing: '⛏️',
  graphs: '🕸️',
  dp: '💡',
};

export const LEVEL_COLORS = {
  Beginner: { bg: 'rgba(239,68,68,0.2)', text: '#f87171' },
  Intermediate: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
  'Placement-Ready': { bg: 'rgba(34,197,94,0.2)', text: '#4ade80' },
};

export const ROUND_TIME_LIMITS = {
  Basic: 60,
  Medium: 90,
  Hard: 120,
};

export const ROUND_PASS_THRESHOLD = {
  Basic: 4,
  Medium: 4,
  Hard: 3,
};