import { state, SHOW_WEIGHTS, NEEDS_END, MODE_LABELS } from "../state.js";
import { fetchPuzzle, submitAnswer } from "../api.js";
import { normalizeNodes, drawGraph } from "../graph.js";
import { showScreen } from "../screen.js";
import { startTimer, stopTimer } from "../timer.js";
import { loadStats, renderStats } from "./mode.js";
import { showResult } from "./result.js";

export function gameHTML() {
  return `
  <div id="screen-game" class="screen">
    <div class="game-header">
      <div class="game-header-left">
        <span class="game-logo">Graph<span>Quest</span></span>
        <span id="game-badge-mode" class="badge badge-mode"></span>
        <span id="game-badge-diff" class="badge"></span>
      </div>
      <span id="game-timer" class="game-timer">3:00</span>
      <button id="game-quit-btn" class="btn-quit">Quit</button>
    </div>
    <div class="game-body">
      <div class="game-graph-area">
        <div id="game-instruction" class="game-instruction"></div>
        <svg id="game-svg" viewBox="0 0 520 380"></svg>
      </div>
      <div class="game-side">
        <div class="side-card">
          <div class="side-card-title">How to Play</div>
          <p id="side-howto"></p>
          <div class="legend" style="margin-top:0.8rem">
            <div class="legend-item"><div class="legend-dot start"></div> Start node</div>
            <div class="legend-item"><div class="legend-dot end"></div> End node</div>
            <div class="legend-item"><div class="legend-dot picked"></div> Selected</div>
            <div class="legend-item"><div class="legend-dot normal"></div> Unvisited</div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-title">Your Stats</div>
          <div id="side-stats"></div>
        </div>
      </div>
    </div>
    <div class="game-seq-bar">
      <span class="seq-label">Answer</span>
      <div class="seq-nodes" id="seq-nodes"></div>
      <div class="seq-actions">
        <button id="seq-undo-btn" class="btn-undo">↩ Undo</button>
        <button id="seq-submit-btn" class="btn-submit" disabled>Submit →</button>
      </div>
    </div>
  </div>`;
}

function setInstruction() {
  const mode = state.selectedMode;
  const instructions = {
    dijkstra:
      "Click nodes to build the <strong>shortest path</strong> from <strong>START</strong> to <strong>END</strong>.",
    bfs: "Click nodes in the order BFS would <strong>visit them</strong> starting from <strong>START</strong>.",
    dfs: "Click nodes in the order DFS would <strong>visit them</strong> starting from <strong>START</strong>.",
    mst: "Click <strong>edges</strong> to select/deselect them. Build the <strong>minimum spanning tree</strong> connecting all nodes.",
    tsp: "Click every node to build a <strong>tour</strong> — visit all nodes and return to <strong>START</strong>.",
  };
  const howto = {
    dijkstra:
      "Click the START node first, then click nodes building the cheapest path to END. Numbers show click order.",
    bfs: "Click nodes in BFS visit order (level by level). Start from START. Numbers show visit order. No End Node needed.",
    dfs: "Click nodes in DFS visit order (depth first). Start from START. Numbers show visit order. No End Node needed.",
    mst: "Click edges (lines between nodes) to select or deselect them. Select edges that connect all nodes with the lowest total weight. No start and End node needed.",
    tsp: "Click all nodes in tour order. Start at START, visit every node once, and return to START at the end.",
  };
  document.getElementById("game-instruction").innerHTML =
    instructions[mode] || "";
  document.getElementById("side-howto").textContent = howto[mode] || "";
}

export function renderGame() {
  if (!state.puzzle) return;

  const { startNode, endNode } = state.puzzle;
  const isMST = state.selectedMode === "mst";

  drawGraph(
    document.getElementById("game-svg"),
    state.nodes,
    state.puzzle.edges,
    state.selected,
    isMST ? null : startNode,
    NEEDS_END.has(state.selectedMode) ? endNode : null,
    SHOW_WEIGHTS.has(state.selectedMode),
    onNodeClick,
    state.selectedMode,
    state.selectedEdges,
    isMST ? onEdgeClick : null
  );

  renderSeqBar();
}

function onEdgeClick(edge) {
  if (!state.puzzle) return;

  const key = [edge.from, edge.to].sort().join("~");
  const idx = state.selectedEdges.findIndex(
    (e) => [e.from, e.to].sort().join("~") === key
  );

  if (idx !== -1) {
    state.selectedEdges.splice(idx, 1);
  } else {
    state.selectedEdges.push(edge);
  }

  renderGame();
}

function onNodeClick(nodeId) {
  if (!state.puzzle) return;
  if (state.selectedMode === "mst") return;

  const { startNode } = state.puzzle;
  const mode = state.selectedMode;
  const selected = state.selected;

  if (selected.length === 0 && nodeId !== startNode) return;

  if (["bfs", "dfs", "dijkstra"].includes(mode)) {
    if (selected.includes(nodeId)) return;
  }

  if (mode === "tsp") {
    const allNodesCount = state.nodes.length;
    if (
      selected.length > 0 &&
      selected.length < allNodesCount &&
      selected.includes(nodeId)
    )
      return;
    if (selected.length === allNodesCount && nodeId !== startNode) return;
  }

  state.selected.push(nodeId);
  renderGame();
}

function renderSeqBar() {
  const seqEl = document.getElementById("seq-nodes");
  const submitEl = document.getElementById("seq-submit-btn");
  const mode = state.selectedMode;

  if (mode === "mst") {
    const edges = state.selectedEdges;

    if (edges.length === 0) {
      seqEl.innerHTML =
        '<span class="seq-empty">Click edges to select them…</span>';
      submitEl.disabled = true;
      return;
    }

    seqEl.innerHTML = edges
      .map((e, i) => {
        const sep =
          i < edges.length - 1 ? '<span class="seq-arrow">·</span>' : "";
        return `<span class="seq-node">${e.from}–${e.to} <span style="opacity:0.6;font-weight:400">(${e.weight})</span></span>${sep}`;
      })
      .join("");

    submitEl.disabled = false;
    return;
  }

  const selected = state.selected;

  if (selected.length === 0) {
    seqEl.innerHTML =
      '<span class="seq-empty">Click the START node to begin…</span>';
    submitEl.disabled = true;
    return;
  }

  seqEl.innerHTML = selected
    .map((id, i) => {
      const arrow =
        i < selected.length - 1 ? '<span class="seq-arrow">→</span>' : "";
      return `<span class="seq-node">${id}</span>${arrow}`;
    })
    .join("");

  const total = state.nodes.length;
  let canSubmit = false;
  if (mode === "dijkstra") canSubmit = selected.includes(state.puzzle.endNode);
  if (mode === "bfs" || mode === "dfs") canSubmit = selected.length === total;
  if (mode === "tsp") {
    canSubmit =
      selected.length === total + 1 &&
      selected[selected.length - 1] === state.puzzle.startNode;
  }

  submitEl.disabled = !canSubmit;
}

function buildPlayerAnswer() {
  const mode = state.selectedMode;
  const selected = state.selected;
  const edges = state.puzzle.edges;

  if (mode === "dijkstra") {
    let totalCost = 0;
    for (let i = 0; i < selected.length - 1; i++) {
      const e = edges.find(
        (e) =>
          (e.from === selected[i] && e.to === selected[i + 1]) ||
          (e.from === selected[i + 1] && e.to === selected[i])
      );
      totalCost += e ? e.weight : Infinity;
    }
    return { path: [...selected], totalCost };
  }

  if (mode === "bfs" || mode === "dfs") return [...selected];
  if (mode === "mst")
    return state.selectedEdges.map((e) => ({
      from: e.from,
      to: e.to,
      weight: e.weight,
    }));
  if (mode === "tsp") return [...selected];

  return [...selected];
}

export async function handleSubmit() {
  if (!state.puzzle) return;

  const playerAnswer = buildPlayerAnswer();
  const submitBtn = document.getElementById("seq-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "…";

  try {
    stopTimer();
    const result = await submitAnswer(
      state.selectedMode,
      state.puzzle._id,
      playerAnswer
    );
    await loadStats();
    showResult(result, playerAnswer, false);
  } catch (err) {
    alert("Submit failed: " + err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit →";
  }
}

export async function handleTimeout() {
  if (!state.puzzle) return;
  const submitBtn = document.getElementById("seq-submit-btn");
  submitBtn.disabled = true;
  try {
    const result = await submitAnswer(
      state.selectedMode,
      state.puzzle._id,
      state.selectedMode === "mst" ? [] : []
    );
    await loadStats();
    showResult(result, [], true);
  } catch (_) {
    showResult(
      {
        isCorrect: false,
        feedback: "Time's up! You ran out of time.",
        correctSolution: null,
      },
      [],
      true
    );
  }
}

export async function startGame() {
  state.selected = [];
  state.selectedEdges = [];
  state.puzzle = null;

  document.getElementById("game-badge-mode").textContent =
    MODE_LABELS[state.selectedMode];
  const diffEl = document.getElementById("game-badge-diff");
  diffEl.textContent = state.selectedDiff;
  diffEl.className = `badge badge-${state.selectedDiff}`;

  setInstruction();
  renderStats();
  showScreen("game");

  document.getElementById("game-svg").innerHTML =
    '<text x="260" y="190" text-anchor="middle" fill="var(--muted)" font-family="DM Sans" font-size="14">Loading puzzle…</text>';
  document.getElementById("seq-nodes").innerHTML =
    '<span class="seq-empty">Loading…</span>';
  document.getElementById("seq-submit-btn").disabled = true;

  try {
    const puzzle = await fetchPuzzle(state.selectedMode, state.selectedDiff);
    state.puzzle = puzzle;
    state.nodes = normalizeNodes(puzzle.nodes);
    state.selected = [];
    state.selectedEdges = [];
    startTimer(handleTimeout);
    renderGame();
  } catch (err) {
    document.getElementById("game-svg").innerHTML =
      `<text x="260" y="190" text-anchor="middle" fill="var(--danger)" font-family="DM Sans" font-size="13">Failed to load puzzle: ${err.message}</text>`;
  }
}

export function wireGameEvents() {
  document.getElementById("game-quit-btn").addEventListener("click", () => {
    stopTimer();
    state.puzzle = null;
    state.selected = [];
    state.selectedEdges = [];
    loadStats();
    showScreen("mode");
  });

  document.getElementById("seq-undo-btn").addEventListener("click", () => {
    if (state.selectedMode === "mst") {
      state.selectedEdges.pop();
    } else {
      state.selected.pop();
    }
    renderGame();
  });

  document
    .getElementById("seq-submit-btn")
    .addEventListener("click", handleSubmit);
}
