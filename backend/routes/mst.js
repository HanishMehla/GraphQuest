import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db.js";
import { solveMST } from "../algorithms/mst.js";
import { validate } from "../validator.js";

const router = Router();

router.get("/puzzle", async (req, res) => {
  try {
    const { difficulty = "easy" } = req.query;
    const db = getDB();
    const collection = db.collection("puzzles");

    const puzzles = await collection
      .aggregate([
        { $match: { algorithmType: "mst", difficulty } },
        { $sample: { size: 1 } },
      ])
      .toArray();

    if (puzzles.length === 0) {
      return res.status(404).json({ error: "No puzzle found" });
    }

    res.status(200).json(puzzles[0]);
  } catch (error) {
    console.error("GET /api/mst/puzzle error:", error);
    res.status(500).json({ error: "Failed to fetch puzzle" });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const { puzzleId, userAnswer } = req.body;
    if (!puzzleId || !userAnswer) {
      return res
        .status(400)
        .json({ error: "puzzleId and userAnswer are required" });
    }

    const db = getDB();
    const puzzleCollection = db.collection("puzzles");
    const userCollection = db.collection("users");

    const puzzle = await puzzleCollection.findOne({
      _id: new ObjectId(puzzleId),
    });
    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle not found" });
    }

    const correctSolution = solveMST(puzzle.nodes, puzzle.edges);
    const result = validate("mst", userAnswer, correctSolution);

    await puzzleCollection.updateOne(
      { _id: new ObjectId(puzzleId) },
      {
        $inc: {
          attemptCount: 1,
          correctCount: result.isCorrect ? 1 : 0,
        },
      }
    );

    if (req.session.userId) {
      await userCollection.updateOne(
        { _id: new ObjectId(req.session.userId) },
        {
          $inc: {
            "stats.mst.total": 1,
            "stats.mst.correct": result.isCorrect ? 1 : 0,
          },
        }
      );
    }

    res.status(200).json({
      isCorrect: result.isCorrect,
      feedback: result.feedback,
      correctSolution,
    });
  } catch (error) {
    console.error("POST /api/mst/submit error:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

export default router;
