"use client";

import { useRef, useEffect } from "react";

interface MindNode {
  x: number;
  y: number;
  radius: number;
  children: number[];
  parent: number;
  hue: number;
  branchHue: number; // inherited color from the branch family
  pulsePhase: number;
  depth: number;
}

interface Agent {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  hue: number;
}

const BRANCH_HUES = [180, 30, 300, 140, 270, 50, 330, 200]; // cyan, orange, magenta, green, purple, gold, pink, teal

function buildMindMapTree(
  rootX: number,
  rootY: number,
  rootAngle: number, // general direction this tree grows toward
  branchHues: number[],
  nodes: MindNode[],
  isMobile: boolean
) {
  const rootIdx = nodes.length;

  nodes.push({
    x: rootX,
    y: rootY,
    radius: isMobile ? 7 : 10,
    children: [],
    parent: -1,
    hue: 0, // white-ish root
    branchHue: 0,
    pulsePhase: Math.random() * Math.PI * 2,
    depth: 0,
  });

  const primaryCount = isMobile ? 3 : 4 + Math.floor(Math.random() * 2);
  const angleSpread = Math.PI * 0.8; // how wide branches fan out
  const startAngle = rootAngle - angleSpread / 2;

  for (let i = 0; i < primaryCount; i++) {
    const angle = startAngle + (i / (primaryCount - 1 || 1)) * angleSpread;
    const dist = (isMobile ? 70 : 100) + Math.random() * 40;
    const hue = branchHues[i % branchHues.length];
    const primaryIdx = nodes.length;

    nodes.push({
      x: rootX + Math.cos(angle) * dist,
      y: rootY + Math.sin(angle) * dist,
      radius: isMobile ? 4.5 : 6,
      children: [],
      parent: rootIdx,
      hue,
      branchHue: hue,
      pulsePhase: Math.random() * Math.PI * 2,
      depth: 1,
    });
    nodes[rootIdx].children.push(primaryIdx);

    // Secondary branches
    const secCount = 2 + Math.floor(Math.random() * 2);
    const secSpread = Math.PI * 0.5;
    const secStart = angle - secSpread / 2;

    for (let j = 0; j < secCount; j++) {
      const secAngle = secStart + (j / (secCount - 1 || 1)) * secSpread;
      const secDist = (isMobile ? 45 : 65) + Math.random() * 30;
      const secIdx = nodes.length;

      nodes.push({
        x: nodes[primaryIdx].x + Math.cos(secAngle) * secDist,
        y: nodes[primaryIdx].y + Math.sin(secAngle) * secDist,
        radius: isMobile ? 3 : 4,
        children: [],
        parent: primaryIdx,
        hue: hue + (Math.random() - 0.5) * 20,
        branchHue: hue,
        pulsePhase: Math.random() * Math.PI * 2,
        depth: 2,
      });
      nodes[primaryIdx].children.push(secIdx);

      // Tertiary leaves
      const leafCount = 1 + Math.floor(Math.random() * 2);
      const leafSpread = Math.PI * 0.4;
      const leafStart = secAngle - leafSpread / 2;

      for (let k = 0; k < leafCount; k++) {
        const leafAngle = leafStart + (k / (leafCount - 1 || 1)) * leafSpread + (Math.random() - 0.5) * 0.2;
        const leafDist = (isMobile ? 30 : 45) + Math.random() * 20;
        const leafIdx = nodes.length;

        nodes.push({
          x: nodes[secIdx].x + Math.cos(leafAngle) * leafDist,
          y: nodes[secIdx].y + Math.sin(leafAngle) * leafDist,
          radius: 2 + Math.random() * 1.5,
          children: [],
          parent: secIdx,
          hue: hue + (Math.random() - 0.5) * 30,
          branchHue: hue,
          pulsePhase: Math.random() * Math.PI * 2,
          depth: 3,
        });
        nodes[secIdx].children.push(leafIdx);
      }
    }
  }
}

function buildFullMindMap(w: number, h: number, isMobile: boolean): MindNode[] {
  const nodes: MindNode[] = [];

  // Place several mind-map trees across the canvas
  const trees = isMobile
    ? [
        { x: w * 0.25, y: h * 0.3, angle: Math.PI * 0.8 },
        { x: w * 0.75, y: h * 0.5, angle: Math.PI * 1.2 },
        { x: w * 0.4, y: h * 0.75, angle: Math.PI * 0.3 },
      ]
    : [
        { x: w * 0.15, y: h * 0.25, angle: Math.PI * 0.3 },
        { x: w * 0.5, y: h * 0.15, angle: Math.PI * 0.55 },
        { x: w * 0.85, y: h * 0.3, angle: Math.PI * 0.75 },
        { x: w * 0.2, y: h * 0.7, angle: -Math.PI * 0.3 },
        { x: w * 0.55, y: h * 0.8, angle: -Math.PI * 0.2 },
        { x: w * 0.82, y: h * 0.72, angle: Math.PI * 1.1 },
      ];

  for (let i = 0; i < trees.length; i++) {
    const t = trees[i];
    // Each tree gets a rotated set of branch hues
    const hues = BRANCH_HUES.slice(i % BRANCH_HUES.length).concat(BRANCH_HUES.slice(0, i % BRANCH_HUES.length));
    buildMindMapTree(t.x, t.y, t.angle, hues, nodes, isMobile);
  }

  // Clamp to canvas
  for (const node of nodes) {
    node.x = Math.max(node.radius + 2, Math.min(w - node.radius - 2, node.x));
    node.y = Math.max(node.radius + 2, Math.min(h - node.radius - 2, node.y));
  }

  return nodes;
}

// Get all edges (parent→child) for traversal
function getAllEdges(nodes: MindNode[]): { from: number; to: number }[] {
  const edges: { from: number; to: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (const child of nodes[i].children) {
      edges.push({ from: i, to: child });
      edges.push({ from: child, to: i }); // agents can travel both ways
    }
  }
  return edges;
}

function getNeighbors(node: MindNode, idx: number, nodes: MindNode[]): number[] {
  const neighbors = [...node.children];
  if (node.parent >= 0) neighbors.push(node.parent);
  return neighbors;
}

function createAgents(count: number, nodes: MindNode[]): Agent[] {
  const agents: Agent[] = [];
  for (let i = 0; i < count; i++) {
    const fromNode = Math.floor(Math.random() * nodes.length);
    const neighbors = getNeighbors(nodes[fromNode], fromNode, nodes);
    const toNode = neighbors.length > 0
      ? neighbors[Math.floor(Math.random() * neighbors.length)]
      : (fromNode + 1) % nodes.length;
    agents.push({
      fromNode,
      toNode,
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.01,
      hue: nodes[fromNode].branchHue || BRANCH_HUES[Math.floor(Math.random() * BRANCH_HUES.length)],
    });
  }
  return agents;
}

// Smooth curved branch line from parent to child
function drawBranch(ctx: CanvasRenderingContext2D, parent: MindNode, child: MindNode, alpha: number, lineWidth: number) {
  // Control point: go straight out from parent, then curve to child
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;

  // The curve bows outward — control point is offset perpendicular to the midpoint
  const mx = parent.x + dx * 0.5;
  const my = parent.y + dy * 0.5;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const bow = len * 0.12; // gentle curve

  const cx = mx + perpX * bow;
  const cy = my + perpY * bow;

  ctx.strokeStyle = `hsla(${child.branchHue}, 70%, 45%, ${alpha})`;
  ctx.lineWidth = Math.min(lineWidth, 1);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(parent.x, parent.y);
  ctx.quadraticCurveTo(cx, cy, child.x, child.y);
  ctx.stroke();
}

function getCurvePos(parent: MindNode, child: MindNode, t: number): { x: number; y: number } {
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  const mx = parent.x + dx * 0.5;
  const my = parent.y + dy * 0.5;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const bow = len * 0.12;
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;

  const u = 1 - t;
  return {
    x: u * u * parent.x + 2 * u * t * cx + t * t * child.x,
    y: u * u * parent.y + 2 * u * t * cy + t * t * child.y,
  };
}

export function AgenticPathways() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationId: number;
    let frameCount = 0;

    const isMobile = window.innerWidth < 768;
    const agentCount = isMobile ? 60 : 150;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const nodes = buildFullMindMap(w, h, isMobile);
    const agents = createAgents(agentCount, nodes);

    let paused = false;
    function handleVisibility() {
      paused = document.hidden;
      if (!paused) animationId = requestAnimationFrame(loop);
    }
    document.addEventListener("visibilitychange", handleVisibility);

    function drawStaticFrame() {
      // Full opaque clear for static
      ctx!.fillStyle = "rgb(9, 9, 11)";
      ctx!.fillRect(0, 0, w, h);

      // Draw branches
      for (let i = 0; i < nodes.length; i++) {
        for (const childIdx of nodes[i].children) {
          const lineW = nodes[i].depth === 0 ? 1.8 : nodes[i].depth === 1 ? 1.2 : 0.7;
          drawBranch(ctx!, nodes[i], nodes[childIdx], 0.12, lineW);
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx!.strokeStyle = `hsla(${node.branchHue || 200}, 70%, 50%, 0.2)`;
        ctx!.lineWidth = node.depth === 0 ? 1 : 0.5;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx!.stroke();

        ctx!.fillStyle = `hsla(${node.branchHue || 200}, 80%, 55%, 0.1)`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop() {
      if (paused) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;

      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = "rgb(9, 9, 11)";
      ctx!.fillRect(0, 0, cw, ch);

      frameCount++;

      // --- Draw branches as thin colored curves ---
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        for (const childIdx of node.children) {
          const lineW = node.depth === 0 ? 1 : 0.5;
          const alpha = node.depth === 0 ? 0.1 : node.depth === 1 ? 0.08 : 0.06;
          drawBranch(ctx!, node, nodes[childIdx], alpha, lineW);
        }
      }

      // --- Draw mind-map nodes as clean circles ---
      for (const node of nodes) {
        const pulse = Math.sin(frameCount * 0.02 + node.pulsePhase) * 0.06 + 0.16;
        const hue = node.depth === 0 ? 200 : node.branchHue;

        // Circle outline
        ctx!.strokeStyle = `hsla(${hue}, 70%, 50%, ${pulse * 0.8})`;
        ctx!.lineWidth = node.depth === 0 ? 1 : 0.5;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx!.stroke();

        // Soft fill
        ctx!.fillStyle = `hsla(${hue}, 80%, 55%, ${pulse * 0.3})`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      // --- Draw agents as simple small dots traveling along branches ---
      ctx!.globalCompositeOperation = "lighter";

      for (const agent of agents) {
        agent.progress += agent.speed;

        const from = nodes[agent.fromNode];
        const to = nodes[agent.toNode];
        const pos = getCurvePos(from, to, agent.progress);

        if (agent.progress >= 1) {
          agent.fromNode = agent.toNode;
          const neighbors = getNeighbors(nodes[agent.fromNode], agent.fromNode, nodes);
          if (neighbors.length > 0) {
            agent.toNode = neighbors[Math.floor(Math.random() * neighbors.length)];
          } else {
            agent.fromNode = Math.floor(Math.random() * nodes.length);
            const n = getNeighbors(nodes[agent.fromNode], agent.fromNode, nodes);
            agent.toNode = n.length > 0
              ? n[Math.floor(Math.random() * n.length)]
              : (agent.fromNode + 1) % nodes.length;
          }
          agent.progress = 0;
          agent.hue = nodes[agent.fromNode].branchHue || agent.hue;
        }

        ctx!.fillStyle = `hsla(${agent.hue}, 100%, 65%, 0.55)`;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, 1.3, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(loop);
      }
    }

    if (prefersReducedMotion) {
      drawStaticFrame();
    } else {
      animationId = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: "none" }}
    />
  );
}
