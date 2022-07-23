import { ICommand } from 'dbc';
import { Constants, TextChannel } from 'discord.js';

import ChannelConfig from '../models/channelConfigModel';
import TeamInfo, { ITeamInfo } from '../models/TeamInfo';
import { ITeamNotify } from './../interface/team.notify';
import { EventController } from './../utils/eventController';

export default {
  name: 'removeteam',
  description: 'Remove a team',
  category: 'Condiguration',

  options: [
    {
      name: 'channel',
      description: 'Channel',
      type: Constants.ApplicationCommandOptionTypes.CHANNEL,
      required: true,
    },
    {
      name: 'team',
      description: 'Team',
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  dm: false,
  slash: true,
  callback: async ({ options, event }) => {
    const _event: EventController | null = event;
    if (!_event) {
      console.log('@@@@ RemoveTeam event notfound');
      return `internal error`;
    }
    const c = options.getChannel('channel');
    const team: string = options.getString('team') || '';

    if (c == null || c.type != 'GUILD_TEXT') {
      return `Please select a text channel.`;
    }
    if (team == '') {
      return `invalid team`;
    }

    let find: ITeamInfo | null = await TeamInfo.filter({
      name: team,
    });
    if (!find) {
      return 'team not found';
    }
    const channel: TextChannel = c;
    let teamNotify: ITeamNotify = {
      _id: channel.id,
      guild_id: channel.guildId,
      team_id: find._id,
    };
    let res = await ChannelConfig.removeTeamFromChannel(teamNotify);
    if (res) {
      _event.emit('RemovedTeamFromChannel', teamNotify);
      return 'Successfully removed';
    } else {
      return 'Fail.';
    }
  },
} as ICommand;
