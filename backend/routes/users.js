import { Router } from "express";
import { getDB } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }

    const db = getDB();
    const collection = db.collection("users");

    const existingUser = await collection.findOne({
      sessionId: req.session.id,
    });

    if (existingUser) {
      if (existingUser.username === username.trim()) {
        req.session.userId = existingUser._id.toString();
        return res.status(200).json(existingUser);
      }

      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => (err ? reject(err) : resolve()));
      });
    }

    const newUser = {
      username: username.trim(),
      sessionId: req.session.id,
      createdAt: new Date(),
      stats: {
        dijkstra: { total: 0, correct: 0 },
        bfs: { total: 0, correct: 0 },
        dfs: { total: 0, correct: 0 },
        mst: { total: 0, correct: 0 },
        tsp: { total: 0, correct: 0 },
      },
    };

    const result = await collection.insertOne(newUser);
    req.session.userId = result.insertedId.toString();

    res
      .status(201)
      .json({ message: "User created", userId: result.insertedId });
  } catch (error) {
    console.error("POST /api/users error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/:sessionId", async (req, res) => {
  try {
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ sessionId: req.params.sessionId });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("GET /api/users/:sessionId error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.delete("/:sessionId", async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection("users").updateOne(
      { sessionId: req.params.sessionId },
      {
        $set: {
          "stats.dijkstra": { total: 0, correct: 0 },
          "stats.bfs": { total: 0, correct: 0 },
          "stats.dfs": { total: 0, correct: 0 },
          "stats.mst": { total: 0, correct: 0 },
          "stats.tsp": { total: 0, correct: 0 },
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Progress reset successfully" });
  } catch (error) {
    console.error("DELETE /api/users/:sessionId error:", error);
    res.status(500).json({ error: "Failed to reset progress" });
  }
});

export default router;
