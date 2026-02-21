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

export function dfs(nodes, edges, startNode) {
  const graph = buildGraph(nodes, edges);

  const visited = new Set();
  const order = [];
  const stack = [startNode];

  while (stack.length > 0) {
    const current = stack.pop();

    if (visited.has(current)) continue;
    visited.add(current);
    order.push(current);

    const neighbors = [...graph[current]].reverse();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return order;
}
