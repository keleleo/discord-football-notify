import { ICommand } from 'dbc';

export default {
  name: 'ping',
  category: 'teste',
  description: 'Response with pong',

  callback: () => {
    return 'pong';
  },
} as ICommand;
