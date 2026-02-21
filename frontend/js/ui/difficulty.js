import { state } from "../state.js";
import { showScreen } from "../screen.js";

export function difficultyHTML() {
  return `
  <div id="screen-difficulty" class="screen">
    <button id="diff-back-btn" class="diff-back">← Back</button>
    <div class="diff-title">Select Difficulty</div>
    <div id="diff-mode-badge" class="diff-mode-badge"></div>
    <div class="diff-cards">
      <div class="diff-card easy" data-diff="easy">
        <div class="diff-card-label">Easy</div>
        <div class="diff-card-hint">4 nodes · fewer edges · good for learning</div>
      </div>
      <div class="diff-card medium" data-diff="medium">
        <div class="diff-card-label">Medium</div>
        <div class="diff-card-hint">6 nodes · more choices · requires thought</div>
      </div>
      <div class="diff-card hard" data-diff="hard">
        <div class="diff-card-label">Hard</div>
        <div class="diff-card-hint">9 nodes · dense graph · expert challenge</div>
      </div>
    </div>
  </div>`;
}

export function wireDifficultyEvents(onDiffSelected) {
  document
    .getElementById("diff-back-btn")
    .addEventListener("click", () => showScreen("mode"));

  document.querySelectorAll(".diff-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedDiff = card.dataset.diff;
      onDiffSelected();
    });
  });
}
