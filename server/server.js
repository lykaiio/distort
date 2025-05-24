import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { init } from "./db/database.js";
import accountsRouter from "./routes/accounts.js";

dotenv.config();
init();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/accounts", accountsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
