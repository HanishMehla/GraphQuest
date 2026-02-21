import "dotenv/config";
import express from "express";
import session from "express-session";
import { ObjectId } from "mongodb";
import { connectDB, getDB } from "./backend/db.js";

import userRoutes from "./backend/routes/users.js";
import dijkstraRoutes from "./backend/routes/dijkstra.js";
import bfsRoutes from "./backend/routes/bfs.js";
import dfsRoutes from "./backend/routes/dfs.js";
import mstRoutes from "./backend/routes/mst.js";
import tspRoutes from "./backend/routes/tsp.js";
import adminRoutes from "./backend/routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.static("frontend"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: false, sameSite: 'none' },
  })
);

app.use("/api/users", userRoutes);
app.use("/api/dijkstra", dijkstraRoutes);
app.use("/api/bfs", bfsRoutes);
app.use("/api/dfs", dfsRoutes);
app.use("/api/mst", mstRoutes);
app.use("/api/tsp", tspRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/puzzles/random", async (req, res) => {
  try {
    const { type, difficulty } = req.query;
    if (!type || !difficulty) {
      return res
        .status(400)
        .json({ error: "type and difficulty are required" });
    }

    const results = await getDB()
      .collection("puzzles")
      .aggregate([
        { $match: { algorithmType: type, difficulty } },
        { $sample: { size: 1 } },
      ])
      .toArray();

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No puzzles found for this type and difficulty" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("GET /api/puzzles/random error:", err);
    res.status(500).json({ error: "Failed to fetch puzzle" });
  }
});

app.delete("/api/puzzles/:id", async (req, res) => {
  try {
    await getDB()
      .collection("puzzles")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Puzzle deleted" });
  } catch (err) {
    console.error("DELETE /api/puzzles/:id error:", err);
    res.status(500).json({ error: "Failed to delete puzzle" });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
  