import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await getDB().collection("users").find({}).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const allowed = ["username"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await getDB()
      .collection("users")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User updated" });
  } catch (err) {
    console.error("PATCH /api/admin/users/:id error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection("users")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/users/:id error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/puzzles", async (req, res) => {
  try {
    const filter = {};
    if (req.query.algorithmType) filter.algorithmType = req.query.algorithmType;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const puzzles = await getDB()
      .collection("puzzles")
      .find(filter)
      .limit(100)
      .toArray();
    res.status(200).json(puzzles);
  } catch (err) {
    console.error("GET /api/admin/puzzles error:", err);
    res.status(500).json({ error: "Failed to fetch puzzles" });
  }
});

router.post("/puzzles", async (req, res) => {
  try {
    const {
      algorithmType,
      difficulty,
      nodes,
      edges,
      startNode,
      endNode,
      correctSolution,
    } = req.body;
    if (!algorithmType || !difficulty || !nodes || !edges) {
      return res
        .status(400)
        .json({
          error: "algorithmType, difficulty, nodes, and edges are required",
        });
    }

    const puzzle = {
      algorithmType,
      difficulty,
      nodes,
      edges,
      startNode: startNode || null,
      endNode: endNode || null,
      correctSolution: correctSolution || null,
      attemptCount: 0,
      correctCount: 0,
      createdAt: new Date(),
    };

    const result = await getDB().collection("puzzles").insertOne(puzzle);
    res
      .status(201)
      .json({ message: "Puzzle created", puzzleId: result.insertedId });
  } catch (err) {
    console.error("POST /api/admin/puzzles error:", err);
    res.status(500).json({ error: "Failed to create puzzle" });
  }
});

router.patch("/puzzles/:id", async (req, res) => {
  try {
    const allowed = [
      "algorithmType",
      "difficulty",
      "nodes",
      "edges",
      "startNode",
      "endNode",
      "correctSolution",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await getDB()
      .collection("puzzles")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Puzzle not found" });
    res.status(200).json({ message: "Puzzle updated" });
  } catch (err) {
    console.error("PATCH /api/admin/puzzles/:id error:", err);
    res.status(500).json({ error: "Failed to update puzzle" });
  }
});

router.delete("/puzzles/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection("puzzles")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Puzzle not found" });
    res.status(200).json({ message: "Puzzle deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/puzzles/:id error:", err);
    res.status(500).json({ error: "Failed to delete puzzle" });
  }
});

export default router;
