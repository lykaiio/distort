import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const headers = {
  "X-Riot-Token": RIOT_API_KEY,
};

const regionToPlatform = {
  NA: "na1",
  EUW: "euw1",
  EUNE: "eun1",
  KR: "kr",
  OCE: "oc1",
  LAN: "la1",
  LAS: "la2",
  BR: "br1",
  TR: "tr1",
  RU: "ru",
  JP: "jp1",
};

export async function getSummonerByRiotId(gameName, tagLine, region) {
  try {
    const accountRes = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers }
    );

    const { puuid } = accountRes.data;

    const platform = regionToPlatform[region.toUpperCase()];
    if (!platform) throw new Error(`Unknown region: ${region}`);

    const summonerRes = await axios.get(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers }
    );

    return summonerRes.data;
  } catch (err) {
    console.error(
      "❌ Failed to get valid summoner data:",
      err.response?.data || err.message
    );
    throw new Error("Failed to get summoner data");
  }
}

export async function getRankedStats(summonerId, region) {
  const platform = regionToPlatform[region.toUpperCase()];
  if (!platform) throw new Error(`Unknown region: ${region}`);

  const response = await axios.get(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
    { headers }
  );

  return response.data;
}
