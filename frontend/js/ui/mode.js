import { state, MODES, MODE_LABELS } from "../state.js";
import { getUser, resetProgress } from "../api.js";
import { showScreen } from "../screen.js";

export function modeHTML() {
  return `
  <!-- ── MODE SELECT ── -->
  <div id="screen-mode" class="screen">
    <div class="mode-header">
      <div class="mode-logo">Graph<span>Quest</span></div>
      <div class="mode-user">
        <span id="mode-username" class="mode-username"></span>
        <button id="mode-reset-btn" class="btn-ghost">Reset Stats</button>
        <button id="mode-admin-btn" class="btn-ghost">Admin ⚙</button>
      </div>
    </div>
    <div class="mode-title">Choose an algorithm</div>
    <div class="mode-grid">
      ${MODES.map(
        (m) => `
        <div class="mode-card" data-mode="${m.id}">
          <div class="mode-card-name">${m.name}</div>
          <div class="mode-card-desc">${m.desc}</div>
        </div>
      `
      ).join("")}
    </div>
    <div class="mode-stats">
      <div class="mode-stats-label">Overall Progress</div>
      <div class="mode-stats-item">
        <span class="mode-stats-value" id="stats-total">—</span>
        <span class="mode-stats-sub">Attempts</span>
      </div>
      <div class="mode-stats-item">
        <span class="mode-stats-value" id="stats-correct">—</span>
        <span class="mode-stats-sub">Correct</span>
      </div>
      <div class="mode-stats-item">
        <span class="mode-stats-value" id="stats-accuracy">—</span>
        <span class="mode-stats-sub">Accuracy</span>
      </div>
    </div>
  </div>`;
}

export async function loadStats() {
  if (!state.sessionId) return;
  try {
    const user = await getUser(state.sessionId);
    state.userStats = user.stats || {};
    renderStats();
  } catch (_) {}
}

export function renderStats() {
  const stats = state.userStats || {};
  let total = 0,
    correct = 0;
  for (const v of Object.values(stats)) {
    total += v.total || 0;
    correct += v.correct || 0;
  }
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  document.getElementById("stats-total").textContent = total;
  document.getElementById("stats-correct").textContent = correct;
  document.getElementById("stats-accuracy").textContent =
    total > 0 ? `${pct}%` : "—";

  const s = stats[state.selectedMode] || { total: 0, correct: 0 };
  const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;

  const sideStats = document.getElementById("side-stats");
  if (sideStats) {
    sideStats.innerHTML = `
      <div class="stat-line"><span class="stat-line-label">Attempts</span><span class="stat-line-value">${s.total}</span></div>
      <div class="stat-line"><span class="stat-line-label">Correct</span><span class="stat-line-value">${s.correct}</span></div>
      <div class="stat-line"><span class="stat-line-label">Accuracy</span><span class="stat-line-value">${s.total > 0 ? acc + "%" : "—"}</span></div>
    `;
  }
}

export function wireModeEvents(onModeSelected, onAdminClick) {
  document.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedMode = card.dataset.mode;
      document.getElementById("diff-mode-badge").textContent =
        MODE_LABELS[state.selectedMode];
      showScreen("difficulty");
      if (onModeSelected) onModeSelected(state.selectedMode);
    });
  });

  document
    .getElementById("mode-reset-btn")
    .addEventListener("click", async () => {
      if (!confirm("Reset all your progress?")) return;
      await resetProgress(state.sessionId);
      await loadStats();
    });

  document
    .getElementById("mode-admin-btn")
    .addEventListener("click", async () => {
      showScreen("admin");
      if (onAdminClick) await onAdminClick();
    });
}
