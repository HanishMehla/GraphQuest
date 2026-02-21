export function solveTSP(nodes, edges, startNode) {
  const getWeight = (from, to) => {
    const edge = edges.find(
      (e) =>
        (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    return edge ? edge.weight : Infinity;
  };

  const visited = new Set();
  const tour = [startNode];
  visited.add(startNode);
  let current = startNode;

  while (visited.size < nodes.length) {
    let nearest = null;
    let minWeight = Infinity;

    for (const node of nodes) {
      if (!visited.has(node)) {
        const w = getWeight(current, node);
        if (w < minWeight) {
          minWeight = w;
          nearest = node;
        }
      }
    }

    if (nearest === null) break;
    visited.add(nearest);
    tour.push(nearest);
    current = nearest;
  }

  tour.push(startNode);
  return tour;
}

export function generateCompleteEdges(nodes, minWeight, maxWeight) {
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      edges.push({
        from: nodes[i],
        to: nodes[j],
        weight:
          Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
      });
    }
  }
  return edges;
}
