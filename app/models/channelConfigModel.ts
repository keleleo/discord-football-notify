import mongoose, { Document, Model, Schema } from 'mongoose';

import { ITeamNotify } from '../interface/team.notify';

const max_team = 4;

interface IChannelConfig {
  _id: string;
  guild_id: string;
  teams_id: string[];
}

interface IChannelConfigModel extends Model<IChannelConfig> {
  addTeamToChannel: (team: ITeamNotify) => Promise<boolean | string>;
  removeTeamFromChannel: (team: ITeamNotify) => Promise<boolean>;
  getAll: () => Promise<IChannelConfig[] | undefined>;
  /**
   * Delete channel config.
   * @param _id channel id
   */
  deleteChannelConfig: (_id: string) => Promise<boolean>;
}

const ChannelConfigSchema: Schema<IChannelConfig> = new Schema({
  _id: { type: String, required: true },
  guild_id: { type: String, required: true },
  teams_id: { type: [String], required: true },
});

const name = 'channels_configs';
const ChannelConfig = mongoose.model<IChannelConfig, IChannelConfigModel>(
  name,
  ChannelConfigSchema
);

//Methods
ChannelConfig.addTeamToChannel = async function (team: ITeamNotify) {
  try {
    let f: IChannelConfig | null = await ChannelConfig.findById<IChannelConfig>(
      team._id
    );
    if (f != null) {
      if (f.teams_id.includes(team.team_id))
        return 'team already added.'
      if(f.teams_id.length == max_team)
        return 'max team.';
      f.teams_id.push(team.team_id);

    } else {
      f = {
        _id: team._id,
        teams_id: [team.team_id],
        guild_id: team.guild_id,
      };
    }

    await ChannelConfig.findOneAndUpdate(
      {
        _id: team._id,
      },
      f,
      {
        upsert: true,
      }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
ChannelConfig.removeTeamFromChannel = async function (team: ITeamNotify) {
  try {
    let f: IChannelConfig | null = await this.findById<IChannelConfig>(
      team._id
    );
    if (f == null) {
      return false;
    }

    if (f.teams_id.length <= 1) {
      return this.deleteChannelConfig(team._id);
    }

    if (f.teams_id.indexOf(team.team_id) == -1) return false;

    f.teams_id.splice(f.teams_id.indexOf(team.team_id));


    await this.findOneAndUpdate(
      {
        _id: team._id,
      },
      f,
      {
        upsert: true,
      }
    );

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
ChannelConfig.deleteChannelConfig = async function (_id: string) {
  try {
    await this.findByIdAndDelete(_id);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
ChannelConfig.getAll = async function () {
  return this.find<IChannelConfig>();
};

export default ChannelConfig;
