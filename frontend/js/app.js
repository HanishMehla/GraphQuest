import {
  buildAdminHTML,
  wireAdminEvents,
  loadAdminData,
} from "./adminScreen.js";
import { showScreen } from "./screen.js";
import { loadStats } from "./ui/mode.js";
import { wireRegisterEvents } from "./ui/register.js";
import { wireModeEvents } from "./ui/mode.js";
import { wireDifficultyEvents } from "./ui/difficulty.js";
import { wireGameEvents, startGame, gameHTML } from "./ui/game.js";
import { wireResultEvents } from "./ui/result.js";

import { registerHTML } from "./ui/register.js";
import { modeHTML } from "./ui/mode.js";
import { difficultyHTML } from "./ui/difficulty.js";
import { resultHTML } from "./ui/result.js";

function buildHTML() {
  document.getElementById("app").innerHTML =
    registerHTML() +
    modeHTML() +
    difficultyHTML() +
    gameHTML() +
    resultHTML() +
    buildAdminHTML();
}

function wireEvents() {
  wireRegisterEvents();

  wireModeEvents(loadAdminData);

  wireAdminEvents(showScreen);

  wireDifficultyEvents(startGame);

  wireGameEvents();

  wireResultEvents(startGame, () => {
    loadStats();
    showScreen("mode");
  });
}

buildHTML();
wireEvents();
showScreen("register");
