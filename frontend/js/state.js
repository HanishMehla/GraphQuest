export const TIMER_DURATION = 180;

export const MODES = [
  {
    id: "dijkstra",
    name: "Dijkstra",
    desc: "Find the shortest path between two nodes",
  },
  { id: "bfs", name: "BFS", desc: "Breadth-first — explore level by level" },
  { id: "dfs", name: "DFS", desc: "Depth-first — go deep before backtracking" },
  { id: "mst", name: "MST", desc: "Minimum spanning tree via Kruskal" },
  { id: "tsp", name: "TSP", desc: "Visit every node and return to start" },
];

export const MODE_LABELS = {
  dijkstra: "Dijkstra",
  bfs: "BFS",
  dfs: "DFS",
  mst: "MST",
  tsp: "TSP",
};
export const SHOW_WEIGHTS = new Set(["dijkstra", "mst", "tsp"]);
export const NEEDS_END = new Set(["dijkstra"]);

export const state = {
  sessionId: null,
  userId: null,
  username: null,
  selectedMode: null,
  selectedDiff: null,
  puzzle: null,
  nodes: [],
  selected: [],
  selectedEdges: [],
  userStats: null,
  timerInterval: null,
  timeLeft: TIMER_DURATION,
  timeTaken: 0,
};
