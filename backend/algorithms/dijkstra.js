function buildGraph(nodes, edges) {
  const graph = {};

  for (const node of nodes) {
    graph[node.id] = [];
  }

  for (const edge of edges) {
    graph[edge.from].push({ to: edge.to, weight: edge.weight });
    graph[edge.to].push({ to: edge.from, weight: edge.weight });
  }

  return graph;
}

export function dijkstra(nodes, edges, startNode, endNode) {
  const graph = buildGraph(nodes, edges);

  const dist = {};
  for (const node of nodes) {
    dist[node.id] = Infinity;
  }
  dist[startNode] = 0;

  const prev = {};

  const visited = new Set();

  while (visited.size < nodes.length) {
    let current = null;
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (current === null || dist[node.id] < dist[current]) {
          current = node.id;
        }
      }
    }

    if (dist[current] === Infinity) break;

    if (current === endNode) break;

    visited.add(current);

    for (const neighbor of graph[current]) {
      if (visited.has(neighbor.to)) continue;

      const newDist = dist[current] + neighbor.weight;
      if (newDist < dist[neighbor.to]) {
        dist[neighbor.to] = newDist;
        prev[neighbor.to] = current;
      }
    }
  }

  if (dist[endNode] === Infinity) return null;

  const path = [];
  let step = endNode;
  while (step !== undefined) {
    path.unshift(step);
    step = prev[step];
  }

  return {
    path,
    totalCost: dist[endNode],
  };
}
