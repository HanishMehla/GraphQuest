# GraphQuest

**Authors:** Hanish Mehla, Kartik Sharma
**Class:** [CS 5610 Web Development Spring 2026](https://johnguerra.co/classes/webDevelopment_online_spring_2026/)

---

## Project Objective

GraphQuest is a browser-based puzzle game where you solve graph algorithm challenges against a timer. Pick an algorithm — Dijkstra, BFS, DFS, MST, or TSP — click through the graph to build your answer and submit. The backend validates your solution and shows you the Results.

No hints. No hand-holding. Just you and the graph.

---

## Screenshot

![GraphQuest Screen](docs/registration.jpeg)
![GraphQuest Screen](docs/puzzlepage.jpeg)
![GraphQuest Screen](docs/DifficultyMode.jpeg)
![GraphQuest Screen](docs/game.jpeg)
![GraphQuest Screen](docs/result.jpeg)
![GraphQuest Screen](docs/admin.jpeg)

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/HanishMehla/GraphQuest.git
cd GraphQuest
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root:
```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=string
```

**4. Start the server**
```bash
node server.js
```

Open `http://localhost:3000` in your browser.

Code looks absolutely stunning and well organized without any mess, and the website looks minimal which is very comforting to the eyes. And adding more puzzles could be a hassle although it is a tradeoff, but your code is well maintained to adapt to future modifications. and additional comment mentioned in the validator.js file about the authentication page. And also admin page should be accessible by the mods not everyone. Thank you.
---

## Live Demo

[Demo](https://graphquest100.onrender.com/)
