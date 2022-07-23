import mongoose, { Model, QuerySelector, Schema } from 'mongoose';

export interface ITeamInfo {
  _id: string;
  name: string;
  country_id: string;
}
export interface ITeamInfoModel extends Model<ITeamInfo> {
  filter: (search: {
    _id?: string;
    country_id?: string;
    name?: string | QuerySelector<string>;
  }) => Promise<ITeamInfo | null>;

  getAll: () => Promise<ITeamInfo[]>;
}

const TeamInfoSchema = new Schema({
  /**Team ID */
  _id: { type: Schema.Types.String },
  /**Team Name */
  name: { type: Schema.Types.String },
  /**Country ID */
  county_id: { type: Schema.Types.String },
});

const name = 'teams_informations';
const TeamInfo = mongoose.model<ITeamInfo, ITeamInfoModel>(
  name,
  TeamInfoSchema
);

TeamInfo.getAll = async function (): Promise<ITeamInfo[]> {
  return await this.find<ITeamInfo>();
};
TeamInfo.filter = async function (search: {
  _id?: string;
  country_id?: string;
  name?: string | QuerySelector<string>;
}): Promise<ITeamInfo | null> {
  if (
    search.name != null &&
    search.name != '' &&
    typeof search.name == 'string'
  ) {
    search.name = { $regex: '^' + search.name + '$', $options: 'i' };
  }

  return await this.findOne<ITeamInfo>(search);
};

export default TeamInfo;
