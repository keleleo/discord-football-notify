import { ICommand } from 'dbc';

import { EventController } from './../utils/eventController';

export default {
  name: 'cc',
  description: 'teste',

  slash: 'both',
  ownerOnly: true,
  callback: ({ event }) => {
    let _event: EventController | null = event;

    if (!_event) return;

    _event.emit('cleanC');
    return 'clean';
  },
} as ICommand;
