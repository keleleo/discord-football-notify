import axios from 'axios';

import { Games } from '../interface/Games';

export async function requestLiveData(): Promise<Games | null> {
  try {
    const res = await axios.get<Games>(
      'https://api.sokkerpro.net/liveApi/web_evdjisyxypchkowi'
    );

    let r: Games = await res.data;

    return r;
  }catch(err){
    return null;
  }
}
