const axios = require("axios");

const RIOT_API_KEY = "RGAPI-18f47670-ed23-454c-9359-245eeaf1875d";

const headers = {
  "X-Riot-Token": RIOT_API_KEY,
};

// Mapping user-friendly region codes to Riot's platform routing codes
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

async function getSummonerByRiotId(gameName, tagLine, region) {
  try {
    // Step 1: Get puuid from Riot ID (always uses AMERICAS routing)
    const accountRes = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers }
    );

    const { puuid } = accountRes.data;

    // Step 2: Use platform routing (e.g., na1, euw1) to get summoner details
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

async function getRankedStats(summonerId, region) {
  const platform = regionToPlatform[region.toUpperCase()];
  if (!platform) throw new Error(`Unknown region: ${region}`);

  const response = await axios.get(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
    { headers }
  );

  return response.data;
}

module.exports = {
  getSummonerByRiotId,
  getRankedStats,
};
