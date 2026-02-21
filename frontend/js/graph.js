const SVG_NS = "http://www.w3.org/2000/svg";
const CX = 260;
const CY = 190;
const RADIUS = 140;

export function normalizeNodes(rawNodes) {
  return rawNodes.map((n, i) => {
    if (typeof n === "string") {
      const angle = (2 * Math.PI * i) / rawNodes.length;
      return {
        id: n,
        x: Math.round(CX + RADIUS * Math.cos(angle - Math.PI / 2)),
        y: Math.round(CY + RADIUS * Math.sin(angle - Math.PI / 2)),
      };
    }
    return n;
  });
}

function makeSVG(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function edgeKey(edge) {
  return [edge.from, edge.to].sort().join("~");
}

export function drawGraph(
  svgContainer,
  nodes,
  edges,
  selected,
  startNode,
  endNode,
  showWeights,
  onNodeClick,
  algorithmType = "",
  selectedEdges = [],
  onEdgeClick = null
) {
  svgContainer.innerHTML = "";

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const isMST = algorithmType === "mst";

  const adjacency = {};
  edges.forEach((e) => {
    if (!adjacency[e.from]) adjacency[e.from] = new Set();
    if (!adjacency[e.to]) adjacency[e.to] = new Set();
    adjacency[e.from].add(e.to);
    adjacency[e.to].add(e.from);
  });

  const traversalEdges = new Set();
  if (algorithmType === "bfs" || algorithmType === "dfs") {
    for (let i = 1; i < selected.length; i++) {
      const node = selected[i];
      const prevNodes = selected.slice(0, i);
      const neighbors = adjacency[node] || new Set();

      let parent = null;
      if (algorithmType === "bfs") {
        parent = prevNodes.find((p) => neighbors.has(p));
      } else {
        parent = [...prevNodes].reverse().find((p) => neighbors.has(p));
      }

      if (parent) {
        traversalEdges.add([parent, node].sort().join("~"));
      }
    }
  }

  edges.forEach((edge) => {
    const from = nodeMap[edge.from];
    const to = nodeMap[edge.to];
    if (!from || !to) return;

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    let isSelected;
    if (isMST) {
      isSelected = selectedEdges.some((e) => edgeKey(e) === edgeKey(edge));
    } else if (algorithmType === "bfs" || algorithmType === "dfs") {
      isSelected = traversalEdges.has(edgeKey(edge));
    } else if (algorithmType === "tsp") {
      isSelected = selected.some(
        (n, i) =>
          i < selected.length - 1 &&
          ((n === edge.from && selected[i + 1] === edge.to) ||
            (n === edge.to && selected[i + 1] === edge.from))
      );
    } else {
      const fi = selected.indexOf(edge.from);
      const ti = selected.indexOf(edge.to);
      isSelected = fi !== -1 && ti !== -1 && Math.abs(fi - ti) === 1;
    }

    if (isMST && onEdgeClick) {
      const edgeGroup = makeSVG("g", {
        class: isSelected ? "g-edge-group selected" : "g-edge-group",
      });

      const line = makeSVG("line", {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        class: isSelected ? "g-edge selected" : "g-edge",
      });
      edgeGroup.appendChild(line);

      const hit = makeSVG("line", {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        stroke: "transparent",
        "stroke-width": "18",
        class: "g-edge-hit",
      });
      hit.addEventListener("click", () => onEdgeClick(edge));
      edgeGroup.appendChild(hit);

      svgContainer.appendChild(edgeGroup);
    } else {
      const line = makeSVG("line", {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        class: isSelected ? "g-edge selected" : "g-edge",
      });
      svgContainer.appendChild(line);
    }

    if (showWeights && edge.weight !== undefined) {
      const label = String(edge.weight);
      const w = Math.max(20, label.length * 8 + 8);
      const bg = makeSVG("rect", {
        x: midX - w / 2,
        y: midY - 8,
        width: w,
        height: 14,
        rx: 3,
        class: "g-weight-bg",
      });
      svgContainer.appendChild(bg);
      const wt = makeSVG("text", {
        x: midX,
        y: midY,
        class: "g-weight",
        "dominant-baseline": "central",
      });
      wt.textContent = label;
      svgContainer.appendChild(wt);
    }
  });

  nodes.forEach((node) => {
    const isSelected = !isMST && selected.includes(node.id);
    const orderIdx = selected.indexOf(node.id);

    const g = makeSVG("g", { class: isMST ? "g-node g-node-mst" : "g-node" });
    if (node.id === startNode) g.classList.add("start");
    if (node.id === endNode) g.classList.add("end");
    if (isSelected) g.classList.add("picked");

    const circle = makeSVG("circle", { cx: node.x, cy: node.y, r: 22 });
    g.appendChild(circle);

    const lbl = makeSVG("text", { x: node.x, y: node.y, class: "label" });
    lbl.textContent = isSelected ? String(orderIdx + 1) : node.id;
    g.appendChild(lbl);

    if (node.id === startNode) {
      const m = makeSVG("text", {
        x: node.x,
        y: node.y + 36,
        class: "marker start",
      });
      m.textContent = "START";
      g.appendChild(m);
    }
    if (node.id === endNode) {
      const m = makeSVG("text", {
        x: node.x,
        y: node.y + 36,
        class: "marker end",
      });
      m.textContent = "END";
      g.appendChild(m);
    }

    if (!isMST) {
      g.addEventListener("click", () => onNodeClick(node.id));
    }

    svgContainer.appendChild(g);
  });
}
