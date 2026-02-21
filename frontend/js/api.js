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

export const createUser = (username) => req("POST", "/api/users", { username });
export const getUser = (sessionId) => req("GET", `/api/users/${sessionId}`);
export const resetProgress = (sessionId) =>
  req("DELETE", `/api/users/${sessionId}`);

export const fetchPuzzle = (type, difficulty) =>
  req("GET", `/api/puzzles/random?type=${type}&difficulty=${difficulty}`);

export function submitAnswer(algorithmType, puzzleId, playerAnswer) {
  const isKS = algorithmType === "mst" || algorithmType === "tsp";
  const bodyKey = isKS ? "userAnswer" : "playerAnswer";

  return req("POST", `/api/${algorithmType}/submit`, {
    puzzleId,
    [bodyKey]: playerAnswer,
  });
}
