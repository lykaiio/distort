import express from "express";
import { getSummonerByRiotId, getRankedStats } from "../utils/riotAPI.js";
import { encrypt } from "../utils/crypto.js";
import { getDB } from "../db/database.js";

const router = express.Router();

// Get all accounts - THIS WAS MISSING!
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const accounts = await db.all("SELECT * FROM accounts");

    console.log("📤 Sending accounts to frontend:", accounts);
    res.json(accounts);
  } catch (err) {
    console.error("❌ Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// Refresh accounts with updated rank info
router.get("/refresh", async (req, res) => {
  try {
    const db = getDB();
    const accounts = await db.all("SELECT * FROM accounts");

    const updatedAccounts = await Promise.all(
      accounts.map(async (account) => {
        try {
          const [name, tag] = account.riotId.split("#");
          const summonerInfo = await getSummonerByRiotId(
            name,
            tag,
            account.region
          );
          const rankedStats = await getRankedStats(
            summonerInfo.id,
            account.region
          );

          const soloQueue = rankedStats.find(
            (queue) => queue.queueType === "RANKED_SOLO_5x5"
          );

          const rank = soloQueue
            ? `${soloQueue.tier} ${soloQueue.rank}`
            : "Unranked";
          const lp = soloQueue ? `${soloQueue.leaguePoints} LP` : "0 LP";
          const winRate = soloQueue
            ? `${Math.round(
                (soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100
              )}%`
            : "0%";

          const tier = soloQueue
            ? soloQueue.tier.charAt(0).toUpperCase() +
              soloQueue.tier.slice(1).toLowerCase()
            : "Unranked";

          const imageSrc = `/assets/ranks/${tier}.webp`;

          // Update database
          await db.run(
            "UPDATE accounts SET rank = ?, lp = ?, winRate = ?, imageSrc = ? WHERE id = ?",
            [rank, lp, winRate, imageSrc, account.id]
          );

          return {
            ...account,
            rank,
            lp,
            winRate,
            imageSrc,
          };
        } catch (err) {
          console.error(`Failed to refresh account ${account.id}:`, err);
          return account; // Return original data if refresh fails
        }
      })
    );

    res.json(updatedAccounts);
  } catch (err) {
    console.error("❌ Error refreshing accounts:", err);
    res.status(500).json({ error: "Failed to refresh accounts" });
  }
});

// Add new account
router.post("/", async (req, res) => {
  const { login, riotId, region, password } = req.body;
  console.log("📥 Received request to add account:", req.body);

  if (!login || !riotId || !region || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [name, tag] = riotId.split("#");
    const summonerInfo = await getSummonerByRiotId(name, tag, region);
    const puuid = summonerInfo.puuid;
    const rankedStats = await getRankedStats(summonerInfo.id, region);

    const soloQueue = rankedStats.find(
      (queue) => queue.queueType === "RANKED_SOLO_5x5"
    );

    const rank = soloQueue ? `${soloQueue.tier} ${soloQueue.rank}` : "Unranked";
    const lp = soloQueue ? `${soloQueue.leaguePoints} LP` : "0 LP";
    const winRate = soloQueue
      ? `${Math.round(
          (soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100
        )}%`
      : "0%";

    const tier = soloQueue
      ? soloQueue.tier.charAt(0).toUpperCase() +
        soloQueue.tier.slice(1).toLowerCase()
      : "Unranked";

    const imageSrc = `/assets/ranks/${tier}.webp`;
    const encryptedPassword = encrypt(password);

    const db = getDB();
    const result = await db.run(
      `INSERT INTO accounts (login, riotId, region, password, rank, lp, winRate, imageSrc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [login, riotId, region, encryptedPassword, rank, lp, winRate, imageSrc]
    );

    // FIXED: Include encrypted password in response
    res.status(201).json({
      id: result.lastID,
      login,
      riotId,
      region,
      password: encryptedPassword, // <-- ADD THIS LINE
      rank,
      lp,
      winRate,
      imageSrc,
    });
  } catch (err) {
    console.error("❌ Error adding account:", err);
    res.status(500).json({ error: "Failed to add account" });
  }
});

// Delete an account
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    await db.run("DELETE FROM accounts WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("Failed to delete account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
