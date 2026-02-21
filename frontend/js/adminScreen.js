import {
  adminGetUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminGetPuzzles,
  adminCreatePuzzle,
  adminUpdatePuzzle,
  adminDeletePuzzle,
} from "./adminApi.js";

const adminState = {
  users: [],
  puzzles: [],
  editingUser: null,
  editingPuzzle: null,
  showForm: false,
  puzzleFilter: { algorithmType: "", difficulty: "" },
};

export function buildAdminHTML() {
  return `
  <div id="screen-admin" class="screen">

    <div class="admin-header">
      <div class="admin-header-left">
        <span class="admin-logo">Graph<span>Quest</span></span>
        <span class="admin-badge">Admin</span>
      </div>
      <button id="admin-back-btn" class="btn-ghost">← Back to Game</button>
    </div>

    <div class="admin-body">

      <div class="admin-panel" id="admin-users-panel">
        <div class="admin-panel-header">
          <div class="admin-panel-title">Users <span id="admin-users-count"></span></div>
          <div class="admin-panel-actions">
            <button class="btn-admin-refresh" id="admin-users-refresh">↻ Refresh</button>
          </div>
        </div>

        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Session ID</th>
                <th>Attempts</th>
                <th>Correct</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="admin-users-body">
              <tr><td colspan="5" class="admin-empty">Loading…</td></tr>
            </tbody>
          </table>
        </div>

        <div class="admin-form" id="admin-user-form" style="display:none">
          <div class="admin-form-title">Edit User</div>
          <div class="admin-form-row">
            <input class="admin-input" id="user-form-username" placeholder="Username" />
          </div>
          <div class="admin-form-error" id="admin-user-form-error"></div>
          <div class="admin-form-actions">
            <button class="btn-admin-cancel" id="admin-user-form-cancel">Cancel</button>
            <button class="btn-admin-save"   id="admin-user-form-save">Save</button>
          </div>
        </div>
      </div>

      <div class="admin-panel" id="admin-puzzles-panel">
        <div class="admin-panel-header">
          <div class="admin-panel-title">Puzzles <span id="admin-puzzles-count"></span></div>
          <div class="admin-panel-actions">
            <button class="btn-admin-refresh" id="admin-puzzles-refresh">↻ Refresh</button>
            <button class="btn-admin-add"     id="admin-puzzle-add-btn">+ New</button>
          </div>
        </div>

        <div class="admin-filter-row">
          <select class="admin-select" id="admin-filter-type">
            <option value="">All types</option>
            <option value="dijkstra">Dijkstra</option>
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="mst">MST</option>
            <option value="tsp">TSP</option>
          </select>
          <select class="admin-select" id="admin-filter-diff">
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Nodes</th>
                <th>Attempts</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="admin-puzzles-body">
              <tr><td colspan="5" class="admin-empty">Loading…</td></tr>
            </tbody>
          </table>
        </div>

        <div class="admin-form" id="admin-puzzle-form" style="display:none">
          <div class="admin-form-title" id="admin-form-title">New Puzzle</div>
          <div class="admin-form-row">
            <select class="admin-select admin-input" id="form-type">
              <option value="">Algorithm type…</option>
              <option value="dijkstra">Dijkstra</option>
              <option value="bfs">BFS</option>
              <option value="dfs">DFS</option>
              <option value="mst">MST</option>
              <option value="tsp">TSP</option>
            </select>
            <select class="admin-select admin-input" id="form-diff">
              <option value="">Difficulty…</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div class="admin-form-row">
            <input  class="admin-input" id="form-start" placeholder='startNode e.g. "A"' />
            <input  class="admin-input" id="form-end"   placeholder='endNode e.g. "F" (Dijkstra only)' />
          </div>
          <textarea class="admin-textarea" id="form-nodes" placeholder='nodes — JSON array e.g. ["A","B","C","D"]'></textarea>
          <textarea class="admin-textarea" id="form-edges" placeholder='edges — JSON array e.g. [{"from":"A","to":"B","weight":4}]'></textarea>
          <div class="admin-form-error" id="admin-form-error"></div>
          <div class="admin-form-actions">
            <button class="btn-admin-cancel" id="admin-form-cancel">Cancel</button>
            <button class="btn-admin-save"   id="admin-form-save">Save</button>
          </div>
        </div>

      </div>
    </div>
  </div>
  `;
}

export function wireAdminEvents(showScreen) {
  document
    .getElementById("admin-back-btn")
    .addEventListener("click", () => showScreen("mode"));

  document
    .getElementById("admin-users-refresh")
    .addEventListener("click", loadUsers);
  document
    .getElementById("admin-user-form-cancel")
    .addEventListener("click", closeUserForm);
  document
    .getElementById("admin-user-form-save")
    .addEventListener("click", saveUserForm);

  document
    .getElementById("admin-puzzles-refresh")
    .addEventListener("click", loadPuzzles);
  document
    .getElementById("admin-puzzle-add-btn")
    .addEventListener("click", openCreateForm);
  document
    .getElementById("admin-form-cancel")
    .addEventListener("click", closeForm);
  document
    .getElementById("admin-form-save")
    .addEventListener("click", saveForm);

  document
    .getElementById("admin-filter-type")
    .addEventListener("change", (e) => {
      adminState.puzzleFilter.algorithmType = e.target.value;
      loadPuzzles();
    });
  document
    .getElementById("admin-filter-diff")
    .addEventListener("change", (e) => {
      adminState.puzzleFilter.difficulty = e.target.value;
      loadPuzzles();
    });
}

export async function loadAdminData() {
  await Promise.all([loadUsers(), loadPuzzles()]);
}

async function loadUsers() {
  const tbody = document.getElementById("admin-users-body");
  tbody.innerHTML =
    '<tr><td colspan="5" class="admin-empty">Loading…</td></tr>';

  try {
    adminState.users = await adminGetUsers();
    renderUsersTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="admin-empty">${err.message}</td></tr>`;
  }
}

function renderUsersTable() {
  const tbody = document.getElementById("admin-users-body");
  const users = adminState.users;

  document.getElementById("admin-users-count").textContent =
    `(${users.length})`;

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="admin-empty">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map((u) => {
      const stats = u.stats || {};
      const total = Object.values(stats).reduce(
        (s, v) => s + (v.total || 0),
        0
      );
      const correct = Object.values(stats).reduce(
        (s, v) => s + (v.correct || 0),
        0
      );
      const shortId = u.sessionId ? u.sessionId.slice(0, 10) + "…" : "—";

      return `
      <tr>
        <td>${u.username || "—"}</td>
        <td class="muted" title="${u.sessionId}">${shortId}</td>
        <td>${total}</td>
        <td>${correct}</td>
        <td style="display:flex;gap:0.4rem">
          <button class="btn-row-edit"   data-user-id="${u._id}">Edit</button>
          <button class="btn-row-delete" data-user-id="${u._id}">Delete</button>
        </td>
      </tr>
    `;
    })
    .join("");

  tbody.querySelectorAll(".btn-row-edit").forEach((btn) => {
    btn.addEventListener("click", () => openUserEditForm(btn.dataset.userId));
  });
  tbody.querySelectorAll(".btn-row-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteUser(btn.dataset.userId));
  });
}

async function deleteUser(id) {
  if (!confirm("Delete this user and all their stats?")) return;
  try {
    await adminDeleteUser(id);
    adminState.users = adminState.users.filter((u) => u._id !== id);
    await loadUsers();
  } catch (err) {
    alert("Failed to delete user: " + err.message);
  }
}

function openUserEditForm(id) {
  const user = adminState.users.find(
    (u) => u._id === id || String(u._id) === id
  );
  if (!user) return;
  adminState.editingUser = user;
  document.getElementById("user-form-username").value = user.username || "";
  const errEl = document.getElementById("admin-user-form-error");
  errEl.textContent = "";
  errEl.classList.remove("show");
  document.getElementById("admin-user-form").style.display = "flex";
}

function closeUserForm() {
  adminState.editingUser = null;
  document.getElementById("admin-user-form").style.display = "none";
  const errEl = document.getElementById("admin-user-form-error");
  errEl.textContent = "";
  errEl.classList.remove("show");
}

async function saveUserForm() {
  const username = document.getElementById("user-form-username").value.trim();
  const errEl = document.getElementById("admin-user-form-error");
  errEl.textContent = "";
  errEl.classList.remove("show");

  if (!username) {
    errEl.textContent = "Username is required.";
    errEl.classList.add("show");
    return;
  }

  const saveBtn = document.getElementById("admin-user-form-save");
  saveBtn.textContent = "…";
  saveBtn.disabled = true;

  try {
    await adminUpdateUser(adminState.editingUser._id, { username });
    closeUserForm();
    await loadUsers();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add("show");
  } finally {
    saveBtn.textContent = "Save";
    saveBtn.disabled = false;
  }
}

async function loadPuzzles() {
  const tbody = document.getElementById("admin-puzzles-body");
  tbody.innerHTML =
    '<tr><td colspan="5" class="admin-empty">Loading…</td></tr>';

  try {
    const filters = {};
    if (adminState.puzzleFilter.algorithmType)
      filters.algorithmType = adminState.puzzleFilter.algorithmType;
    if (adminState.puzzleFilter.difficulty)
      filters.difficulty = adminState.puzzleFilter.difficulty;

    adminState.puzzles = await adminGetPuzzles(filters);
    renderPuzzlesTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="admin-empty">${err.message}</td></tr>`;
  }
}

function renderPuzzlesTable() {
  const tbody = document.getElementById("admin-puzzles-body");
  const puzzles = adminState.puzzles;

  document.getElementById("admin-puzzles-count").textContent =
    `(${puzzles.length})`;

  if (puzzles.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="admin-empty">No puzzles found.</td></tr>';
    return;
  }

  tbody.innerHTML = puzzles
    .map(
      (p) => `
    <tr>
      <td>${p.algorithmType}</td>
      <td>${p.difficulty}</td>
      <td>${Array.isArray(p.nodes) ? p.nodes.length : "—"}</td>
      <td>${p.attemptCount || 0}</td>
      <td style="display:flex;gap:0.4rem">
        <button class="btn-row-edit"   data-puzzle-id="${p._id}">Edit</button>
        <button class="btn-row-delete" data-puzzle-id="${p._id}">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");

  tbody.querySelectorAll(".btn-row-edit").forEach((btn) => {
    btn.addEventListener("click", () => openEditForm(btn.dataset.puzzleId));
  });
  tbody.querySelectorAll(".btn-row-delete").forEach((btn) => {
    btn.addEventListener("click", () => deletePuzzle(btn.dataset.puzzleId));
  });
}

async function deletePuzzle(id) {
  if (!confirm("Delete this puzzle?")) return;
  try {
    await adminDeletePuzzle(id);
    await loadPuzzles();
  } catch (err) {
    alert("Failed to delete puzzle: " + err.message);
  }
}

function openCreateForm() {
  adminState.editingPuzzle = null;
  document.getElementById("admin-form-title").textContent = "New Puzzle";
  document.getElementById("form-type").value = "";
  document.getElementById("form-diff").value = "";
  document.getElementById("form-start").value = "";
  document.getElementById("form-end").value = "";
  document.getElementById("form-nodes").value = "";
  document.getElementById("form-edges").value = "";
  clearFormError();
  document.getElementById("admin-puzzle-form").style.display = "flex";
}

function openEditForm(id) {
  const puzzle = adminState.puzzles.find(
    (p) => p._id === id || String(p._id) === id
  );
  if (!puzzle) return;

  adminState.editingPuzzle = puzzle;
  document.getElementById("admin-form-title").textContent = "Edit Puzzle";
  document.getElementById("form-type").value = puzzle.algorithmType || "";
  document.getElementById("form-diff").value = puzzle.difficulty || "";
  document.getElementById("form-start").value = puzzle.startNode || "";
  document.getElementById("form-end").value = puzzle.endNode || "";
  document.getElementById("form-nodes").value = JSON.stringify(
    puzzle.nodes || []
  );
  document.getElementById("form-edges").value = JSON.stringify(
    puzzle.edges || []
  );
  clearFormError();
  document.getElementById("admin-puzzle-form").style.display = "flex";
}

function closeForm() {
  adminState.editingPuzzle = null;
  document.getElementById("admin-puzzle-form").style.display = "none";
  clearFormError();
}

function clearFormError() {
  const el = document.getElementById("admin-form-error");
  el.textContent = "";
  el.classList.remove("show");
}

function showFormError(msg) {
  const el = document.getElementById("admin-form-error");
  el.textContent = msg;
  el.classList.add("show");
}

async function saveForm() {
  clearFormError();

  const type = document.getElementById("form-type").value.trim();
  const diff = document.getElementById("form-diff").value.trim();
  const start = document.getElementById("form-start").value.trim();
  const end = document.getElementById("form-end").value.trim();

  if (!type) return showFormError("Algorithm type is required.");
  if (!diff) return showFormError("Difficulty is required.");

  let nodes, edges;
  try {
    nodes = JSON.parse(document.getElementById("form-nodes").value);
  } catch {
    return showFormError('Nodes must be valid JSON e.g. ["A","B","C"]');
  }
  try {
    edges = JSON.parse(document.getElementById("form-edges").value);
  } catch {
    return showFormError(
      'Edges must be valid JSON e.g. [{"from":"A","to":"B","weight":4}]'
    );
  }

  const payload = {
    algorithmType: type,
    difficulty: diff,
    nodes,
    edges,
    startNode: start || null,
    endNode: end || null,
  };

  const saveBtn = document.getElementById("admin-form-save");
  saveBtn.textContent = "…";
  saveBtn.disabled = true;

  try {
    if (adminState.editingPuzzle) {
      await adminUpdatePuzzle(adminState.editingPuzzle._id, payload);
    } else {
      await adminCreatePuzzle(payload);
    }
    closeForm();
    await loadPuzzles();
  } catch (err) {
    showFormError(err.message);
  } finally {
    saveBtn.textContent = "Save";
    saveBtn.disabled = false;
  }
}
