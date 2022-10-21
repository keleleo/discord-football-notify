import axios from 'axios';

import { Games } from '../interface/Games';

export async function requestLiveData(): Promise<Games | null> {
  try {
    // const res = await axios.get<Games>(
    //   'https://api.sokkerpro.net/liveApi/web_evdjisyxypchkowi'
    // );
    const res = await axios.get<Games>(
      'http://127.0.0.1:5501/game.json'
    );

    let r: Games = await res.data;

    return r;
  } catch (err) {
    console.log('RequestLiveData error',)
    return null;
  }
}
