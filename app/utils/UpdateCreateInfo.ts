import { ITeamInfo } from './../models/TeamInfo';
import CountryInfo from '../models/CountryInfo';
import { Games } from '../interface/Games';
import TeamInfo from '../models/TeamInfo';
import { ICountryInfo } from './../interface/country.info';
import { requestLiveData } from './request.live.data';

export default async function startUpdateCreateLoop() {
  let games: Games | null = await requestLiveData();
  if (games != null) await updateOrCreateInfo(games);

  setInterval(async () => {
    let games: Games | null = await requestLiveData();
    if (games != null) await updateOrCreateInfo(games);
  }, 1000 * 60 * 4);
  /*
    1000 => 1second
    *
    60   => 1 minute
    *
    2    => 2 minute
  */
}

async function updateOrCreateInfo(game: Games) {
  for await (let datum of game.data) {
    if (datum.country_id && datum.country_name)
      await countryUpdateCreateInfo({
        _id: datum.country_id,
        name: datum.country_name,
      });

    if (
      datum.localTeam.id &&
      datum.localTeam.name &&
      datum.localTeam.country_id
    )
      await teamUpdateCreateInfo({
        _id: datum.localTeam.id.toString(),
        name: datum.localTeam.name,
        country_id: datum.localTeam.country_id.toString(),
      });
    if (
      datum.visitorTeam.id &&
      datum.visitorTeam.name &&
      datum.visitorTeam.country_id
    )
      await teamUpdateCreateInfo({
        _id: datum.visitorTeam.id.toString(),
        name: datum.visitorTeam.name,
        country_id: datum.visitorTeam.country_id.toString(),
      });
  }
}
async function teamUpdateCreateInfo(teamI: ITeamInfo) {
  await TeamInfo.findOneAndUpdate(
    {
      _id: teamI._id,
    },
    teamI,
    {
      upsert: true,
    }
  );
}

async function countryUpdateCreateInfo(countryI: ICountryInfo) {
  await CountryInfo.findOneAndUpdate(
    {
      _id: countryI._id,
    },
    countryI,
    {
      upsert: true,
    }
  );
}
