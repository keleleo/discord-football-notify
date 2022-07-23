import { EventEmitter } from 'events';

import { IChannelConfig } from './../interface/channel.config';
import { ITeamNotify } from './../interface/team.notify';

interface EventTeste{
  ChannelConfigChange: [v: IChannelConfig],
  RemovedTeamFromChannel: [v: ITeamNotify],
  AddedTeamToChannel: [v: ITeamNotify],
  Debug: [],
  cleanC:[]
}
export class EventController extends EventEmitter {

  constructor() {
    super();
    this.init()
  }
  on<K extends keyof EventTeste>(eventName: K, listener: (...args: EventTeste[K]) => void): this {
    return super.on(eventName,(...args: any)=>listener(...args));
  }
  emit<K extends keyof EventTeste>(eventName: K, ...args: EventTeste[K]): boolean {
    return super.emit(eventName,...args);
  }

  init() {
    this.on('cleanC', () => {
      console.clear();
    })
  }
}
