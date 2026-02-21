import { state, TIMER_DURATION } from "./state.js";

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.timeTaken = TIMER_DURATION - state.timeLeft;
}

export function startTimer(onTimeout) {
  stopTimer();
  state.timeLeft = TIMER_DURATION;
  state.timeTaken = 0;

  const timerEl = document.getElementById("game-timer");
  timerEl.textContent = formatTime(state.timeLeft);
  timerEl.className = "game-timer";

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    state.timeTaken = TIMER_DURATION - state.timeLeft;

    const el = document.getElementById("game-timer");
    el.textContent = formatTime(state.timeLeft);

    if (state.timeLeft <= 30) el.className = "game-timer warning";
    if (state.timeLeft <= 10) el.className = "game-timer danger";

    if (state.timeLeft <= 0) {
      stopTimer();
      onTimeout();
    }
  }, 1000);
}
