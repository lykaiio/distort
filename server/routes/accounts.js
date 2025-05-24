const express = require("express");
const bcrypt = require("bcrypt");
const { getSummonerByRiotId, getRankedStats } = require("../utils/riotAPI");
const { getDB } = require("../db/database");

const router = express.Router();

// GET all accounts
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const accounts = await db.all("SELECT * FROM accounts");
    res.json(accounts);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// server/routes/accounts.js
router.get("/refresh", async (req, res) => {
  try {
    const accounts = await db.all("SELECT * FROM accounts");

    const updatedAccounts = await Promise.all(
      accounts.map(async (account) => {
        const stats = await getSummonerStats(account.riotId, account.region);
        if (stats) {
          await db.run(
            "UPDATE accounts SET rank = ?, lp = ?, winRate = ?, imageSrc = ? WHERE id = ?",
            stats.rank,
            stats.lp,
            stats.winRate,
            stats.imageSrc,
            account.id
          );
        }
        return { ...account, ...stats };
      })
    );

    res.json(updatedAccounts);
  } catch (err) {
    console.error("Failed to refresh accounts:", err);
    res.status(500).json({ error: "Failed to refresh accounts" });
  }
});

// POST new account
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const db = await getDB();
    const result = await db.run(
      `INSERT INTO accounts (login, riotId, region, password, rank, lp, winRate, imageSrc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [login, riotId, region, hashedPassword, rank, lp, winRate, imageSrc]
    );

    res.status(201).json({
      id: result.lastID,
      login,
      riotId,
      region,
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

// DELETE account by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDB();
    const result = await db.run("DELETE FROM accounts WHERE id = ?", [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
