const express = require("express");
const bcrypt = require("bcrypt");
const { getDB } = require("../db/database");

const router = express.Router();

// GET all accounts
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const accounts = await db.all("SELECT * FROM accounts");

    console.log("Fetched accounts from DB:", accounts);

    res.json(accounts);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// POST new account
router.post("/", async (req, res) => {
  const {
    login,
    riotId,
    region,
    password,
    rank = "Unranked",
    lp = "0 LP",
    winRate = "0%",
    imageSrc = "Unranked.webp",
  } = req.body;

  // Validate required fields
  if (!login || !riotId || !region || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = await getDB();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO accounts (login, riotId, region, password, rank, lp, winRate, imageSrc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [login, riotId, region, hashedPassword, rank, lp, winRate, imageSrc]
    );

    // Send back the inserted account (except password)
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
    console.error("Error adding account:", err);
    res.status(500).json({ error: "Failed to add account" });
  }
});

// DELETE an account by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing account ID" });
  }

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
