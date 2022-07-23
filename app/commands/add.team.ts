import { ICommand } from 'dbc';
import { Constants } from 'discord.js';

import ChannelConfig from '../models/channelConfigModel';
import TeamInfo, { ITeamInfo } from '../models/TeamInfo';
import { ITeamNotify } from './../interface/team.notify';
import { EventController } from './../utils/eventController';

export default {
  name: 'addteam',
  description: 'Add team to notify in channel',
  category: 'Condiguration',

  slash: true,

  options: [
    {
      name: 'channel',
      description: 'Channel to notify',
      type: Constants.ApplicationCommandOptionTypes.CHANNEL,
      required: true,
    },
    {
      name: 'team',
      description: 'Team to notify',
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  dm: false,

  callback: async ({ options, event }) => {
    const _event: EventController | null = event;
    if (!_event) {
      console.log('@@@@ AddTeam event notfound');
      return `internal error`;
    }
    let team: string | null = options.getString('team');
    let channel = options.getChannel('channel');
    if (!team) {
      return 'please inform a team';
    }
    if (!channel) {
      return 'please select a channel';
    }
    if (channel.type != 'GUILD_TEXT') {
      return 'please select a text channel';
    }

    let find: ITeamInfo | null = await TeamInfo.filter({
      name: team,
    });
    if (!find) {
      return `team **${team}** notfound`;
    }

    const t: ITeamNotify = {
      _id: channel.id,
      guild_id: channel.guildId,
      team_id: find._id,
    };

    let res = await ChannelConfig.addTeamToChannel(t);
    if (res == true) {
      _event.emit('AddedTeamToChannel', t);
      return `${find.name} add to ${channel.name}`;
    } else {
      return `error sorry`;
    }
  },
} as ICommand;
