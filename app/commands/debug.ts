import { ICommand } from 'dbc';

import { EventController } from './../utils/eventController';

export default {
  name: 'debug',
  description: 'Debug',
  category: 'test',
  slash: 'both',
  ownerOnly: true,
  callback: ({ event }) => {
    let _event: EventController | null = event;
    if (!_event) return;

    _event.emit('Debug');
    return 'ok';
  },
} as ICommand;
