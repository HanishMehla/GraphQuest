import { state } from "../state.js";
import { showScreen } from "../screen.js";
import { formatTime } from "../timer.js";

export function resultHTML() {
  return `
  <div id="screen-result" class="screen">
    <div class="result-card">
      <span id="result-emoji" class="result-emoji"></span>
      <h2 id="result-title" class="result-title"></h2>
      <p id="result-feedback" class="result-feedback"></p>
      <div class="result-score-box">
        <span id="result-score" class="result-score-num"></span>
        <span id="result-score-label" class="result-score-label"></span>
      </div>
      <div class="result-comparison">
        <div class="result-comparison-title">Answer Comparison</div>
        <div id="result-comparison-rows"></div>
      </div>
      <div class="result-btns">
        <button id="result-again-btn" class="btn-accent">Play Again</button>
        <button id="result-home-btn"  class="btn-outline">← Home</button>
      </div>
    </div>
  </div>`;
}

export function showResult(result, playerAnswer, timedOut = false) {
  const isCorrect = result.isCorrect;
  const mode = state.selectedMode;

  document.getElementById("result-emoji").textContent = timedOut
    ? "⏰"
    : isCorrect
      ? "🎉"
      : "📚";
  document.getElementById("result-title").textContent = timedOut
    ? "Time's Up!"
    : isCorrect
      ? "Correct!"
      : "Not Quite!";
  document.getElementById("result-title").className =
    `result-title ${isCorrect && !timedOut ? "correct" : "wrong"}`;
  document.getElementById("result-feedback").textContent = timedOut
    ? "You ran out of time."
    : result.feedback || "";

  const stats = state.userStats || {};
  let sessionTotal = 0,
    sessionCorrect = 0;
  for (const v of Object.values(stats)) {
    sessionTotal += v.total || 0;
    sessionCorrect += v.correct || 0;
  }

  const timeTakenStr = timedOut
    ? "time's up"
    : `solved in ${formatTime(state.timeTaken)}`;
  document.getElementById("result-score").textContent =
    `${sessionCorrect} / ${sessionTotal}`;
  document.getElementById("result-score-label").textContent =
    `correct this session · ${timeTakenStr}`;

  renderComparison(playerAnswer, result.correctSolution, isCorrect, mode);
  showScreen("result");
}

function edgeNorm(e) {
  return [e.from, e.to].sort().join("~") + "~" + e.weight;
}

function flattenAnswer(answer) {
  if (!answer) return [];
  if (Array.isArray(answer)) {
    if (answer.length > 0 && typeof answer[0] === "object" && answer[0].from) {
      return answer.flatMap((e) => [e.from, e.to]);
    }
    return answer;
  }
  if (answer.path) return answer.path;
  return [];
}

function renderComparison(playerAnswer, correctSolution, isCorrect, mode) {
  const container = document.getElementById("result-comparison-rows");
  const isMST =
    Array.isArray(playerAnswer) &&
    playerAnswer.length > 0 &&
    typeof playerAnswer[0] === "object" &&
    playerAnswer[0].from;

  if (isMST) {
    const correctSet = new Set((correctSolution || []).map(edgeNorm));

    const renderEdgeRow = (edges, isPlayer) => {
      const tags = (edges || [])
        .map((e) => {
          const cls = isPlayer
            ? correctSet.has(edgeNorm(e))
              ? "match"
              : "no-match"
            : "answer";
          return `<span class="node-tag ${cls}">${e.from}–${e.to} (${e.weight})</span>`;
        })
        .join(" ");
      return `
        <div class="result-row ${isPlayer ? "player" : "correct"}">
          <span class="result-row-tag">${isPlayer ? "Yours" : "Correct"}</span>
          ${tags}
        </div>`;
    };

    container.innerHTML =
      renderEdgeRow(playerAnswer, true) + renderEdgeRow(correctSolution, false);
    return;
  }

  const pArr = flattenAnswer(playerAnswer);
  const cArr = flattenAnswer(correctSolution);
  const multipleValidAnswers =
    mode === "bfs" || mode === "dfs" || mode === "tsp";

  const renderRow = (arr, isPlayer) => {
    const tags = arr
      .map((id, i) => {
        let cls;
        if (isPlayer) {
          if (isCorrect) {
            cls = "match";
          } else if (multipleValidAnswers) {
            cls = new Set(cArr).has(id) ? "match" : "no-match";
          } else {
            cls = id === cArr[i] ? "match" : "no-match";
          }
        } else {
          cls = "answer";
        }
        const arrow =
          i < arr.length - 1 ? '<span class="node-arrow">→</span>' : "";
        return `<span class="node-tag ${cls}">${id}</span>${arrow}`;
      })
      .join("");

    const label = isPlayer
      ? "Yours"
      : isCorrect && multipleValidAnswers
        ? "One of the valid answer is"
        : "Correct";

    return `
      <div class="result-row ${isPlayer ? "player" : "correct"}">
        <span class="result-row-tag">${label}</span>
        ${tags}
      </div>`;
  };

  const note =
    isCorrect && multipleValidAnswers
      ? `<div style="font-size:0.75rem;color:var(--muted);margin-bottom:0.5rem;">
        ✓ Multiple valid orderings exist. One example is shown below.
       </div>`
      : "";

  container.innerHTML = note + renderRow(pArr, true) + renderRow(cArr, false);
}

export function wireResultEvents(onPlayAgain, onGoHome) {
  document
    .getElementById("result-again-btn")
    .addEventListener("click", onPlayAgain);
  document
    .getElementById("result-home-btn")
    .addEventListener("click", onGoHome);
}
