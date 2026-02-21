function buildGraph(nodes, edges) {
  const graph = {};

  for (const node of nodes) {
    graph[node.id] = [];
  }

  for (const edge of edges) {
    graph[edge.from].push(edge.to);
    graph[edge.to].push(edge.from);
  }

  for (const node of nodes) {
    graph[node.id].sort();
  }

  return graph;
}

export function bfs(nodes, edges, startNode) {
  const graph = buildGraph(nodes, edges);

  const visited = new Set();
  const order = [];
  const queue = [startNode];

  visited.add(startNode);

  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);

    for (const neighbor of graph[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return order;
}
