const BASE = "";

async function req(method, url, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const adminGetUsers = () => req("GET", "/api/admin/users");
export const adminUpdateUser = (id, upd) =>
  req("PATCH", `/api/admin/users/${id}`, upd);
export const adminDeleteUser = (id) => req("DELETE", `/api/admin/users/${id}`);

export const adminGetPuzzles = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return req("GET", `/api/admin/puzzles${params ? "?" + params : ""}`);
};
export const adminCreatePuzzle = (puzzle) =>
  req("POST", "/api/admin/puzzles", puzzle);
export const adminUpdatePuzzle = (id, upd) =>
  req("PATCH", `/api/admin/puzzles/${id}`, upd);
export const adminDeletePuzzle = (id) =>
  req("DELETE", `/api/admin/puzzles/${id}`);
