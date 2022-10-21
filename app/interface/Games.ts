export interface Games {
  status: string;
  data: Datum[];
}

export interface Datum {
  country_id: string;
  favorite: string;
  country_name: string;
  league_id: string;
  league_name: string;
  id: string;
  season_id: string;
  starting_time: string;
  status: Status;
  updated_at: string;
  highlight_team: number;
  home_score: string;
  away_score: string;
  race_to_goal: string;
  scores: Scores;
  localTeam: Team;
  visitorTeam: Team;
  time: Time;
  localteam_id: string;
  visitorteam_id: string;
  stats: Stat[];
  winner_team_id: null;
  goals05ht: number;
  goals15ht: number;
  goals15ft: number;
  goals25ft: number;
  goals35ft: number;
  cornerprediction: number;
  winorlosemarket: string;
  winorlosevalue: number;
  bttsmarket: Bttsmarket;
  bttsvalue: number;
}

export interface Scores {
  localteam_score: number;
  visitorteam_score: number;
  localteam_pen_score: null;
  visitorteam_pen_score: null;
  ht_score: null | string;
  ft_score: null;
  et_score: null;
  ps_score: null;
}

export interface Team {
  id: number;
  legacy_id: number | null;
  name: string;
  short_code: null | string;
  twitter: null;
  country_id: number;
  national_team: boolean;
  founded: number | null;
  logo_path: string;
  venue_id: number | null;
  current_season_id: number;
  is_placeholder: boolean;
}

export interface Stat {
  team_id: number;
  fixture_id: number;
  shots: Shots;
  passes: Passes | null;
  attacks: Attacks;
  fouls: number | null;
  corners: number;
  offsides: number | null;
  possessiontime: number | null;
  yellowcards: number;
  redcards: number;
  yellowredcards: number | null;
  saves: number | null;
  substitutions: number;
  goal_kick: null;
  goal_attempts: number | null;
  free_kick: null;
  throw_in: null;
  ball_safe: number | null;
  goals: number;
  penalties: number;
  injuries: number | null;
  tackles: number | null;
}

export interface Time {
  status: Status;
  starting_at: StartingAt;
  minute: number;
  second: null | string;
  added_time: number | null;
  extra_minute: number | null;
  //90+1
  injury_time: number | null;
}

export interface StartingAt {
  date_time: string;
  date: string;
  time: string;
  timestamp: number;
  timezone: Timezone;
}

export interface Shots {
  total: number;
  ongoal: number | null;
  blocked: number | null;
  offgoal: number | null;
  insidebox: number | null;
  outsidebox: number | null;
}

export interface Attacks {
  attacks: number | null;
  dangerous_attacks: number | null;
  avg_attacks?: number;
  avg_dangerous_attacks?: number;
}

export interface Passes {
  total: number;
  accurate: number;
  percentage: number;
}

export enum Status {
  Live = 'LIVE',
  Ht = 'HT',
}

export enum Bttsmarket {
  No = 'No',
  Yes = 'Yes',
}

export enum Timezone {
  UTC = 'UTC',
}
