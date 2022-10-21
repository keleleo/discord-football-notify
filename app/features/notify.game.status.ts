import { Utils } from './../utils/Utils';
('use strickt');
import discordJS, { Client, MessageEmbed, TextChannel } from 'discord.js';

import ChannelConfig from '../models/channelConfigModel';
import { EventController } from '../utils/eventController';
import { requestLiveData } from '../utils/request.live.data';
import { Datum, Games } from './../interface/Games';
import { ITeamNotify } from './../interface/team.notify';

interface GameData {
  datum: Datum;
  gameChange: GameChange;
}
enum GameChange {
  NO = 'No change',
  NC = 'No change',
  NEW = 'New',
  STATUS = 'Status change',
  TIME = 'Time change',
  LOCAL_SCORE = 'Local team score',
  VISITOR_SCORE = 'Visitor team score',
  ENDED = 'Game Ended',
}
const notifyChannelData: { [key: string]: TextChannel[] } = {};
var oldGameData: { [key: string]: GameData } = {};
var currentGameData: { [key: string]: GameData } = {};

var client: Client;

export default (_client: Client, event: EventController) => {
  start(_client, event);
};

async function start(_client: Client, _event: EventController) {
  _event.on('AddedTeamToChannel', async (team: ITeamNotify) => {
    let channel = await getChannel(team._id);

    if (!channel) return;
    await addChannelToList(team.team_id, channel);
  });
  _event.on('RemovedTeamFromChannel', async (team: ITeamNotify) => {
    let channel = await getChannel(team._id);
    if (!channel) return;

    await removeChannelFromList(team.team_id, channel);
  });

  client = _client;
  await sleep(5000);
  for (let i = 0; i < 2; i++) {
    await notify();
    await sleep(3000);
    if (i == 1) i = -1;
  }
}

async function getAllTeams(toNotifyData: {
  [key: string]: GameData;
}): Promise<string[]> {
  let res: string[] = [];
  const keys = Object.keys(toNotifyData);

  for await (let key of keys) {
    let localTeam = toNotifyData[key].datum.localTeam;
    let visitorTeam = toNotifyData[key].datum.visitorTeam;

    if (!res.includes(localTeam.id.toString()))
      res.push(localTeam.id.toString());

    if (!res.includes(visitorTeam.id.toString()))
      res.push(visitorTeam.id.toString());
  }

  return res;
}

async function requestData() {
  let game: Games | null = await requestLiveData();
  currentGameData = {};
  if (!game) return;

  for await (let datum of game.data) {
    currentGameData[datum.id] = { datum: datum, gameChange: GameChange.NO };
  }
}

function verifyChange(_current: GameData): GameChange {
  let result = GameChange.NC;
  let current = Utils.copy(_current.datum);
  const old: Datum | null = oldGameData[current.id]?.datum;
  if (!old) {
    result = GameChange.NEW;
  } else if (old.status != current.status) {
    result = GameChange.STATUS;
  } else if (old.scores.localteam_score != current.scores.localteam_score) {
    result = GameChange.LOCAL_SCORE;
  } else if (old.scores.visitorteam_score != current.scores.visitorteam_score) {
    result = GameChange.VISITOR_SCORE;
  } else if (
    old.time.minute != current.time.minute ||
    old.time.injury_time != current.time.injury_time
  )
    result = GameChange.TIME;

  oldGameData[current.id] = { datum: current, gameChange: result };

  return result;
}

function getEndedGame(): { [key: string]: GameData } {
  let result: { [key: string]: GameData } = {};
  Object.keys(oldGameData).forEach((id) => {
    if (!(id in currentGameData)) {
      result[id] = {
        datum: Utils.copy(oldGameData[id].datum),
        gameChange: GameChange.ENDED,
      };

      delete oldGameData[id];
    }
  });

  return result;
}

function getToNotify(): { [key: string]: GameData } {
  let result: { [key: string]: GameData } = {};
  Object.keys(currentGameData).forEach((id) => {
    let t1 = oldGameData[id];
    let t2 = currentGameData[id];
    let c: GameChange = verifyChange(currentGameData[id]);
    if (c == GameChange.NC) return;
    result[id] = { datum: currentGameData[id].datum, gameChange: c };
  });
  return result;
}
async function notify() {
  await requestData();

  let ended: { [key: string]: GameData } = getEndedGame();
  let toNotify: { [key: string]: GameData } = getToNotify();
  toNotify = { ...toNotify, ...ended };
  ended = {};

  //oldGameData = Utils.copy(currentGameData);

  let currentTeams: string[] = await getAllTeams(toNotify);

  let currentLoaded: string[] = Object.keys(notifyChannelData);

  currentLoaded.forEach((team) => {
    if (!currentTeams.includes(team)) delete notifyChannelData[team];
  });

  for await (let team of currentTeams) {
    if (!currentLoaded.includes(team)) {
      let res: TextChannel[] | null = await getChannels(team);

      notifyChannelData[team] = res || [];
    }
  }

  for await (let key of Object.keys(toNotify)) {
    const data = toNotify[key];
    const localTeam = data.datum.localTeam.id.toString();

    for await (let channel of notifyChannelData[localTeam]) {
      await sendNotify(channel, data, 0);
    }

    const visitorTeam = data.datum.visitorTeam.id.toString();
    for await (let channel of notifyChannelData[visitorTeam]) {
      await sendNotify(channel, data, 1);
    }
  }
}

async function createMessage(
  gameData: GameData,
  teamFocus: 1 | 0
): Promise<MessageEmbed> {
  let { scores, time, visitorTeam, localTeam, league_name } = gameData.datum;
  let gc = gameData.gameChange;

  let tL = visitorTeam.name;
  let tV = localTeam.name;
  let sL = scores.localteam_score;
  let sV = scores.visitorteam_score;
  let img = teamFocus ? visitorTeam.logo_path : localTeam.logo_path;
  let lague = league_name;
  let _time = `${time.minute} ${
    time.injury_time ? ' +' + time.injury_time : ''
  }`;
  let score = teamFocus ? `${sV} : ${sL}` : `${sL} : ${sV}`;
  let color: discordJS.ColorResolvable = 'AQUA';
  let status: string = gameData.datum.status;
  if (gc == GameChange.ENDED) status = 'End Game';
  if (gc == GameChange.LOCAL_SCORE || gc == GameChange.VISITOR_SCORE) {
    color = teamFocus
      ? gc == GameChange.VISITOR_SCORE
        ? 'AQUA'
        : 'RED'
      : gc == GameChange.LOCAL_SCORE
      ? 'AQUA'
      : 'RED';
  }
  if (gc == GameChange.NEW) status = 'Starting game';
  if (gc == GameChange.ENDED) {
    color = teamFocus ? (sV >= sL ? 'AQUA' : 'RED') : sV <= sL ? 'AQUA' : 'RED';
  }

  const embed: MessageEmbed = new MessageEmbed()
    .setTitle(teamFocus ? `${tL} VS ${tV}` : `${tV} VS ${tL}`)
    .setURL('https://sokkerpro.com/matchdetail/' + gameData.datum.id)
    .setColor(color)
    .setThumbnail(img)
    .addFields(
      // { name: '404', value: '404' },
      // { name: '\u200B', value: '\u200B' },
      { name: 'Lague', value: `${lague}`, inline: true },
      { name: 'Time', value: `${_time}`, inline: true },
      { name: 'Score(s)', value: `${score}`, inline: true },
      { name: 'Status', value: status, inline: true }
    )
    .setFooter({
      text: 'By keleleo - https://github.com/keleleo',
      iconURL: 'https://avatars.githubusercontent.com/u/78627112?v=4',
    });
  return embed;
}

async function sendNotify(
  channel: TextChannel,
  gameData: GameData,
  teamFocus: 1 | 0
) {
  const embed = await createMessage(gameData, teamFocus);

  await channel.send({ embeds: [embed] });
  await sleep(10);
}

async function getChannels(team: string): Promise<TextChannel[] | null> {
  let res: any[] = [];

  let channels = await ChannelConfig.find({ teams_id: team });

  for await (let channel of channels) {
    let temp = client.channels.cache.get(channel._id);
    if (temp && temp.type == 'GUILD_TEXT') res.push(temp);
  }

  return res;
}

async function addChannelToList(team: string, channel: TextChannel) {
  if (notifyChannelData[team]) {
    notifyChannelData[team].push(channel);
  }
}

async function removeChannelFromList(team: string, channel: TextChannel) {
  if (notifyChannelData[team]) {
    let index: number = notifyChannelData[team].findIndex((o) => {
      return o.id == channel.id;
    });
    if (index != -1) {
      notifyChannelData[team].splice(index, 1);
    }
  }
}

async function getChannel(_id: string): Promise<TextChannel | null> {
  const res = client.channels.cache.get(_id);
  if (!res || res.type != 'GUILD_TEXT') return null;
  return res;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
