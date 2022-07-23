import { Client, MessageEmbed, TextChannel } from 'discord.js';

import ChannelConfig from '../models/channelConfigModel';
import { EventController } from '../utils/eventController';
import { requestLiveData } from '../utils/request.live.data';
import { Datum, Games } from './../interface/Games';
import { ITeamNotify } from './../interface/team.notify';

const notifyData: { [key: string]: TextChannel[] } = {};
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

  for (let i = 0; i < 2; i++) {
    await notify();
    await sleep(40000);
    if (i == 1) i = -1;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getAllTeams(games: Games): Promise<string[]> {
  let res: string[] = [];

  for await (let game of games.data) {
    let localTeam = game.localTeam;
    let visitorTeam = game.visitorTeam;

    if (!res.includes(localTeam.id.toString()))
      res.push(localTeam.id.toString());

    if (!res.includes(visitorTeam.id.toString()))
      res.push(visitorTeam.id.toString());
  }

  return res;
}
async function notify() {
  let games: Games | null = await requestLiveData();

  if (!games || !games.data || games.data == []) return;

  let currentTeams: string[] = await getAllTeams(games);

  let currentLoaded: string[] = Object.keys(notifyData);
  currentLoaded.forEach((team) => {
    if (!currentTeams.includes(team)) delete notifyData[team];
  });

  for await (let team of currentTeams) {
    if (!currentLoaded.includes(team)) {
      let res: TextChannel[] | null = await getChannels(team);

      notifyData[team] = res || [];
    }
  }
  for await (let data of games.data) {
    const localTeam = data.localTeam.id.toString();
    for await (let channel of notifyData[localTeam]) {
      await sendNotify(channel, data, 0);
    }

    const visitorTeam = data.visitorTeam.id.toString();
    for await (let channel of notifyData[visitorTeam]) {
      await sendNotify(channel, data, 1);
    }
  }
}
async function createMessage(
  gameData: Datum,
  teamFocus: 1 | 0
): Promise<MessageEmbed> {
  let tL = gameData.visitorTeam.name;
  let tV = gameData.localTeam.name;
  let img = teamFocus
    ? gameData.visitorTeam.logo_path
    : gameData.localTeam.logo_path;
  let sL = gameData.scores.localteam_score;
  let sV = gameData.scores.visitorteam_score;
  let lague = gameData.league_name;
  let time = `${gameData.time.minute}:${gameData.time.second || 0}`;
  let score = teamFocus ? `${sV} : ${sL}` : `${sL} : ${sV}`;

  let r = `${lague} -- ${tL} VS ${tV} / ${score} - ${time}`;
  const embed: MessageEmbed = new MessageEmbed()
    .setTitle(teamFocus ? `${tV} VS ${tL}` : `${tL} VS ${tV}`)
    .setURL('https://discord.js.org/')
    .setColor('AQUA')
    .setThumbnail(img)
    .addFields(
      // { name: '404', value: '404' },
      // { name: '\u200B', value: '\u200B' },
      {name:'Lague', value:`${lague}`, inline:true},
      { name: 'Time', value: `${time}`, inline: true },
      { name: 'Score(s)', value: `${score}`, inline: true }
    )
    .setFooter({
      text: 'By keleleo - https://github.com/keleleo',
      iconURL: 'https://avatars.githubusercontent.com/u/78627112?v=4',
    });

  return embed;
}
async function sendNotify(
  channel: TextChannel,
  gameData: Datum,
  teamFocus: 1 | 0
) {
  let tV = gameData.localTeam.name;
  let tL = gameData.visitorTeam.name;
  let lague = gameData.league_name;
  let time = `${gameData.time.minute}:${gameData.time.second || 0}`;
  let score = `${gameData.scores.localteam_score} VS${gameData.scores.visitorteam_score}`;
  let r = `${lague} -- ${tL} VS ${tV} / ${score} - ${time}`;
  const embed = await createMessage(gameData, teamFocus);
  await channel.send({embeds:[embed]});
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
  if (notifyData[team]) {
    notifyData[team].push(channel);
  }
}
async function removeChannelFromList(team: string, channel: TextChannel) {
  if (notifyData[team]) {
    let index: number = notifyData[team].findIndex((o) => {
      return o.id == channel.id;
    });
    if (index != -1) {
      notifyData[team].splice(index, 1);
    }
  }
}
async function getChannel(_id: string): Promise<TextChannel | null> {
  const res = client.channels.cache.get(_id);
  if (!res || res.type != 'GUILD_TEXT') return null;
  return res;
}

interface ChanelConfig {
  channel: TextChannel;
  teamsID: number[];
  countrysID: number[];
}
