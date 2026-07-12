import "dotenv/config";
import express from "express";
import cors from "cors";
import { researchRouter } from "./routes/research";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/research", researchRouter);

app.listen(PORT, () => {
  console.log(`Investment Research Agent backend listening on http://localhost:${PORT}`);
});
