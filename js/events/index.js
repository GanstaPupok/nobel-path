import { commonEvents } from './common.js';
import { backstoryEvents } from './backstory.js';
import { arcEvents } from './arcs.js';
import { rareEvents } from './rare.js';

export const ALL_EVENTS = [
  ...commonEvents,
  ...backstoryEvents,
  ...arcEvents,
  ...rareEvents
];