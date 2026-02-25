function buildUndirectedGraph(nodes, edges) {
  const graph = {};
  const nodeIds = nodes.map((n) => (typeof n === "string" ? n : n.id));
  for (const id of nodeIds) graph[id] = [];
  for (const edge of edges) {
    graph[edge.from].push(edge.to);
    graph[edge.to].push(edge.from);
  }
  return graph;
}

function getNodeIds(nodes) {
  return nodes.map((n) => (typeof n === "string" ? n : n.id));
}

function computeBFSLevels(graph, startNode) {
  const levels = { [startNode]: 0 };
  const queue = [startNode];
  const visited = new Set([startNode]);
  while (queue.length > 0) {
    const current = queue.shift();
    for (const nb of graph[current]) {
      if (!visited.has(nb)) {
        visited.add(nb);
        levels[nb] = levels[current] + 1;
        queue.push(nb);
      }
    }
  }
  return levels;
}

function validateBFS(playerAnswer, correctSolution, edges, startNode, nodes) {
  const nodeIds = getNodeIds(nodes);
  const graph = buildUndirectedGraph(nodes, edges);
  const answer = playerAnswer ?? [];

  if (answer.length === 0)
    return { isCorrect: false, feedback: "No answer submitted." };
  if (answer[0] !== startNode)
    return {
      isCorrect: false,
      feedback: `Your traversal must start at ${startNode}.`,
    };
  if (answer.length !== nodeIds.length)
    return {
      isCorrect: false,
      feedback: `You visited ${answer.length} nodes but the graph has ${nodeIds.length}.`,
    };
  if (new Set(answer).size !== nodeIds.length)
    return {
      isCorrect: false,
      feedback: "You visited some nodes more than once.",
    };
  for (const n of answer) {
    if (!nodeIds.includes(n))
      return {
        isCorrect: false,
        feedback: `"${n}" is not a node in this graph.`,
      };
  }

  const levels = computeBFSLevels(graph, startNode);
  for (let i = 1; i < answer.length; i++) {
    if (levels[answer[i]] < levels[answer[i - 1]]) {
      return {
        isCorrect: false,
        feedback: `Invalid BFS order at step ${i + 1}: "${answer[i]}" is at depth ${levels[answer[i]]} but "${answer[i - 1]}" is at depth ${levels[answer[i - 1]]}. BFS must finish all nodes at one level before going deeper.`,
      };
    }
  }

  const visited = new Set([startNode]);
  for (let i = 1; i < answer.length; i++) {
    const next = answer[i];
    const hasVisitedParent = graph[next].some((nb) => visited.has(nb));
    if (!hasVisitedParent) {
      return {
        isCorrect: false,
        feedback: `"${next}" cannot be visited at step ${i + 1}. In BFS, you can only visit a node adjacent to an already-visited node.`,
      };
    }
    visited.add(next);
  }

  return {
    isCorrect: true,
    feedback: `Correct! "${answer.join(" → ")}" is a valid BFS traversal.`,
  };
}

function validateDFS(playerAnswer, correctSolution, edges, startNode, nodes) {
  const nodeIds = getNodeIds(nodes);
  const graph = buildUndirectedGraph(nodes, edges);
  const answer = playerAnswer ?? [];

  if (answer.length === 0)
    return { isCorrect: false, feedback: "No answer submitted." };
  if (answer[0] !== startNode)
    return {
      isCorrect: false,
      feedback: `Your traversal must start at ${startNode}.`,
    };
  if (answer.length !== nodeIds.length)
    return {
      isCorrect: false,
      feedback: `You visited ${answer.length} nodes but the graph has ${nodeIds.length}.`,
    };
  if (new Set(answer).size !== nodeIds.length)
    return {
      isCorrect: false,
      feedback: "You visited some nodes more than once.",
    };
  for (const n of answer) {
    if (!nodeIds.includes(n))
      return {
        isCorrect: false,
        feedback: `"${n}" is not a node in this graph.`,
      };
  }

  const visited = new Set([startNode]);
  const stack = [startNode];

  for (let i = 1; i < answer.length; i++) {
    const next = answer[i];

    if (visited.has(next))
      return {
        isCorrect: false,
        feedback: `"${next}" was already visited. DFS does not revisit nodes.`,
      };

    while (stack.length > 0 && !graph[stack[stack.length - 1]].includes(next)) {
      stack.pop();
    }

    if (stack.length === 0) {
      return {
        isCorrect: false,
        feedback: `"${next}" is not a valid DFS move at step ${i + 1}. It is not adjacent to any node on the current DFS path.`,
      };
    }

    visited.add(next);
    stack.push(next);
  }

  return {
    isCorrect: true,
    feedback: `Correct! "${answer.join(" → ")}" is a valid DFS traversal.`,
  };
}

function validateDijkstra(
  playerAnswer,
  correctSolution,
  edges,
  startNode,
  nodes
) {
  const playerPath = playerAnswer?.path ?? [];
  const endNode = correctSolution?.path?.[correctSolution.path.length - 1];
  const optimalCost = correctSolution?.totalCost;

  if (playerPath.length === 0)
    return { isCorrect: false, feedback: "No path submitted." };
  if (playerPath[0] !== startNode)
    return { isCorrect: false, feedback: `Path must start at ${startNode}.` };
  if (playerPath[playerPath.length - 1] !== endNode)
    return { isCorrect: false, feedback: `Path must end at ${endNode}.` };

  const edgeMap = {};
  for (const e of edges) {
    edgeMap[`${e.from}-${e.to}`] = e.weight;
    edgeMap[`${e.to}-${e.from}`] = e.weight;
  }

  let totalCost = 0;
  for (let i = 0; i < playerPath.length - 1; i++) {
    const key = `${playerPath[i]}-${playerPath[i + 1]}`;
    if (edgeMap[key] === undefined) {
      return {
        isCorrect: false,
        feedback: `There is no direct edge between "${playerPath[i]}" and "${playerPath[i + 1]}".`,
      };
    }
    totalCost += edgeMap[key];
  }

  if (totalCost !== optimalCost) {
    return {
      isCorrect: false,
      feedback: `Your path "${playerPath.join(" → ")}" costs ${totalCost} but the shortest possible cost is ${optimalCost}. Try a cheaper route.`,
    };
  }

  return {
    isCorrect: true,
    feedback: `Correct! "${playerPath.join(" → ")}" is a valid shortest path with cost ${totalCost}.`,
  };
}

function validateMST(playerAnswer, correctSolution) {
  if (!Array.isArray(playerAnswer) || playerAnswer.length === 0)
    return { isCorrect: false, feedback: "No edges submitted." };
  if (playerAnswer.length !== correctSolution.length) {
    return {
      isCorrect: false,
      feedback: `Your MST has ${playerAnswer.length} edges but the correct MST has ${correctSolution.length} edges.`,
    };
  }

  const normalize = (edge) =>
    [edge.from, edge.to].sort().join("-") + "-" + edge.weight;
  const correctSet = new Set(correctSolution.map(normalize));
  const isCorrect = playerAnswer.every((edge) =>
    correctSet.has(normalize(edge))
  );

  return {
    isCorrect,
    feedback: isCorrect
      ? "Correct! Your MST matches the optimal solution."
      : `Incorrect. The correct MST edges were: ${correctSolution.map((e) => `${e.from}-${e.to}(${e.weight})`).join(", ")}`,
  };
}

function validateTSP(playerAnswer, correctSolution, edges, startNode, nodes) {
  const nodeIds = getNodeIds(nodes);

  if (!playerAnswer || playerAnswer.length === 0)
    return { isCorrect: false, feedback: "No answer submitted." };
  if (playerAnswer[0] !== startNode)
    return { isCorrect: false, feedback: `Tour must start at ${startNode}.` };
  if (playerAnswer[playerAnswer.length - 1] !== startNode)
    return { isCorrect: false, feedback: `Tour must end at ${startNode}.` };
  if (playerAnswer.length !== nodeIds.length + 1)
    return {
      isCorrect: false,
      feedback: `Tour must visit all ${nodeIds.length} nodes exactly once and return to start.`,
    };

  const visited = new Set(playerAnswer.slice(0, -1));
  if (visited.size !== nodeIds.length)
    return {
      isCorrect: false,
      feedback: "Some nodes were visited more than once.",
    };
  for (const id of nodeIds) {
    if (!visited.has(id))
      return { isCorrect: false, feedback: `Node "${id}" was not visited.` };
  }

  const getWeight = (from, to) => {
    const e = edges.find(
      (e) =>
        (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    return e ? e.weight : Infinity;
  };
  const tourWeight = (tour) => {
    let total = 0;
    for (let i = 0; i < tour.length - 1; i++)
      total += getWeight(tour[i], tour[i + 1]);
    return total;
  };

  const playerWeight = tourWeight(playerAnswer);
  const correctWeight = tourWeight(correctSolution);
  const isCorrect = playerWeight <= correctWeight;

  return {
    isCorrect,
    feedback: isCorrect
      ? `Correct! Your tour has total weight ${playerWeight}.`
      : `Incorrect. Your tour has weight ${playerWeight} but the optimal is ${correctWeight}. Optimal tour: ${correctSolution.join(" → ")}.`,
  };
}

const validators = {
  dijkstra: validateDijkstra,
  bfs: validateBFS,
  dfs: validateDFS,
  mst: validateMST,
  tsp: validateTSP,
};

export function validate(
  algorithmType,
  playerAnswer,
  correctSolution,
  extra = {}
) {
  const validateFn = validators[algorithmType];
  if (!validateFn)
    throw new Error(`Unknown algorithm type: "${algorithmType}"`);
  return validateFn(
    playerAnswer,
    correctSolution,
    extra.edges,
    extra.startNode,
    extra.nodes
  );
}
// Validator can also be used to validate the login too, maybe the login page could have been better.
