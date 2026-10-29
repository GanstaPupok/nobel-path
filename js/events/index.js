import { commonEvents } from './common.js';
import { backstoryEvents } from './backstory.js';
import { arcEvents } from './arcs.js';
import { rareEvents } from './rare.js';
import { stageEvents } from './stage.js';
import { dilemmaEvents } from './dilemmas.js';

export const ALL_EVENTS = [
  ...commonEvents,
  ...backstoryEvents,
  ...arcEvents,
  ...rareEvents,
  ...stageEvents,
  ...dilemmaEvents
];
