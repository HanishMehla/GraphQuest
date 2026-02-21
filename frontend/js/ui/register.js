import { state } from "../state.js";
import { createUser } from "../api.js";
import { showScreen } from "../screen.js";
import { loadStats } from "./mode.js";

export function registerHTML() {
  return `
  <!-- ── REGISTER ── -->
  <div id="screen-register" class="screen">
    <div class="register-card">
      <div class="register-logo">Graph<span>Quest</span></div>
      <div class="register-tagline">Master graph algorithms, one puzzle at a time</div>
      <label class="register-label" for="register-input">User Name</label>
      <input id="register-input" class="register-input" type="text" placeholder="Enter username..." autocomplete="off" maxlength="30" />
      <div id="register-error" class="register-error"></div>
      <button id="register-btn" class="btn-primary">Start Playing</button>
    </div>
  </div>`;
}

export async function handleRegister() {
  const input = document.getElementById("register-input");
  const errEl = document.getElementById("register-error");
  const username = input.value.trim();

  errEl.classList.remove("show");

  if (!username) {
    errEl.textContent = "Please enter a username.";
    errEl.classList.add("show");
    return;
  }

  try {
    document.getElementById("register-btn").textContent = "Connecting…";
    await createUser(username);

    const raw = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("connect.sid="));
    const full = raw ? decodeURIComponent(raw.split("=")[1]) : null;
    state.sessionId = full ? full.replace(/^s:/, "").split(".")[0] : null;
    state.username = username;

    document.getElementById("mode-username").textContent = `@${username}`;
    state.userStats = {};
    await loadStats();
    showScreen("mode");
  } catch (err) {
    errEl.textContent = err.message || "Could not connect. Try again.";
    errEl.classList.add("show");
  } finally {
    document.getElementById("register-btn").textContent = "Start Playing";
  }
}

export function wireRegisterEvents() {
  document
    .getElementById("register-btn")
    .addEventListener("click", handleRegister);
  document.getElementById("register-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleRegister();
  });
}
