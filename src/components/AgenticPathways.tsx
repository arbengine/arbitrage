"use client";

import { useRef, useEffect } from "react";

interface MindNode {
  x: number;
  y: number;
  radius: number;       // visible circle size — hubs are bigger
  connections: number[];
  hue: number;
  pulsePhase: number;
  depth: number;
  isHub: boolean;
}

interface Agent {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  hue: number;
  matched: boolean;
  matchTimer: number;
}

const TRON_HUES = [180, 300, 270, 140, 30];

function randomHue(): number {
  return TRON_HUES[Math.floor(Math.random() * TRON_HUES.length)] + (Math.random() - 0.5) * 20;
}

function buildMindMap(w: number, h: number, isMobile: boolean): MindNode[] {
  const nodes: MindNode[] = [];
  const hubCount = isMobile ? 5 : 8;
  const branchCount = isMobile ? 3 : 5; // branches per hub
  const leafCount = isMobile ? 2 : 3;   // leaves per branch

  // Spread hubs across the canvas
  for (let i = 0; i < hubCount; i++) {
    const angle = (i / hubCount) * Math.PI * 2 + Math.random() * 0.4;
    const radiusFromCenter = Math.min(w, h) * (0.2 + Math.random() * 0.25);
    nodes.push({
      x: w / 2 + Math.cos(angle) * radiusFromCenter + (Math.random() - 0.5) * 80,
      y: h / 2 + Math.sin(angle) * radiusFromCenter + (Math.random() - 0.5) * 80,
      radius: isMobile ? 6 : 8,
      connections: [],
      hue: randomHue(),
      pulsePhase: Math.random() * Math.PI * 2,
      depth: 0,
      isHub: true,
    });
  }

  // For each hub, create branches radiating outward
  for (let hi = 0; hi < hubCount; hi++) {
    const hub = nodes[hi];
    const branchAngleBase = Math.random() * Math.PI * 2;

    for (let bi = 0; bi < branchCount; bi++) {
      const angle = branchAngleBase + (bi / branchCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 60 + Math.random() * 80;
      const branchIdx = nodes.length;

      nodes.push({
        x: hub.x + Math.cos(angle) * dist,
        y: hub.y + Math.sin(angle) * dist,
        radius: isMobile ? 3.5 : 4.5,
        connections: [],
        hue: hub.hue + (Math.random() - 0.5) * 40,
        pulsePhase: Math.random() * Math.PI * 2,
        depth: 1,
        isHub: false,
      });

      // Connect branch to hub
      nodes[hi].connections.push(branchIdx);
      nodes[branchIdx].connections.push(hi);

      // Add leaves off each branch
      for (let li = 0; li < leafCount; li++) {
        const leafAngle = angle + (Math.random() - 0.5) * 1.2;
        const leafDist = 35 + Math.random() * 50;
        const leafIdx = nodes.length;

        nodes.push({
          x: nodes[branchIdx].x + Math.cos(leafAngle) * leafDist,
          y: nodes[branchIdx].y + Math.sin(leafAngle) * leafDist,
          radius: 2 + Math.random() * 1.5,
          connections: [],
          hue: nodes[branchIdx].hue + (Math.random() - 0.5) * 30,
          pulsePhase: Math.random() * Math.PI * 2,
          depth: 2,
          isHub: false,
        });

        nodes[branchIdx].connections.push(leafIdx);
        nodes[leafIdx].connections.push(branchIdx);
      }
    }
  }

  // Cross-connect some hubs to each other
  for (let i = 0; i < hubCount; i++) {
    for (let j = i + 1; j < hubCount; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (isMobile ? 300 : 400) && Math.random() < 0.5) {
        nodes[i].connections.push(j);
        nodes[j].connections.push(i);
      }
    }
  }

  // Cross-connect some branches between different hubs
  const branches = nodes.map((n, i) => ({ n, i })).filter(({ n }) => n.depth === 1);
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const dx = branches[i].n.x - branches[j].n.x;
      const dy = branches[i].n.y - branches[j].n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && Math.random() < 0.25) {
        nodes[branches[i].i].connections.push(branches[j].i);
        nodes[branches[j].i].connections.push(branches[i].i);
      }
    }
  }

  // Clamp nodes to canvas bounds
  for (const node of nodes) {
    node.x = Math.max(node.radius + 5, Math.min(w - node.radius - 5, node.x));
    node.y = Math.max(node.radius + 5, Math.min(h - node.radius - 5, node.y));
  }

  return nodes;
}

function createAgents(count: number, nodes: MindNode[]): Agent[] {
  const agents: Agent[] = [];
  for (let i = 0; i < count; i++) {
    const fromNode = Math.floor(Math.random() * nodes.length);
    const conns = nodes[fromNode].connections;
    const toNode = conns.length > 0
      ? conns[Math.floor(Math.random() * conns.length)]
      : (fromNode + 1) % nodes.length;
    agents.push({
      fromNode,
      toNode,
      progress: Math.random(),
      speed: 0.006 + Math.random() * 0.01,
      hue: randomHue(),
      matched: false,
      matchTimer: 0,
    });
  }
  return agents;
}

// Draw a curved connection between two nodes (bezier curve)
function drawConnection(ctx: CanvasRenderingContext2D, a: MindNode, b: MindNode, alpha: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Perpendicular offset for curve
  const offset = Math.sqrt(dx * dx + dy * dy) * 0.15;
  const cx = mx + (-dy / Math.sqrt(dx * dx + dy * dy + 1)) * offset;
  const cy = my + (dx / Math.sqrt(dx * dx + dy * dy + 1)) * offset;

  const avgHue = (a.hue + b.hue) / 2;
  ctx.strokeStyle = `hsla(${avgHue}, 70%, 45%, ${alpha})`;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(cx, cy, b.x, b.y);
  ctx.stroke();
}

// Get position along the curved path at progress t
function getCurvePoint(a: MindNode, b: MindNode, t: number): { x: number; y: number } {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy + 1);
  const offset = dist * 0.15;
  const cx = mx + (-dy / dist) * offset;
  const cy = my + (dx / dist) * offset;

  // Quadratic bezier: (1-t)^2*P0 + 2(1-t)t*C + t^2*P1
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
    y: u * u * a.y + 2 * u * t * cy + t * t * b.y,
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
    const agentCount = isMobile ? 80 : 180;

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
    const nodes = buildMindMap(w, h, isMobile);
    const agents = createAgents(agentCount, nodes);

    let paused = false;
    function handleVisibility() {
      paused = document.hidden;
      if (!paused) animationId = requestAnimationFrame(loop);
    }
    document.addEventListener("visibilitychange", handleVisibility);

    function loop() {
      if (paused) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;

      // Clear with slight persistence for subtle glow trails
      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = "rgba(9, 9, 11, 0.25)";
      ctx!.fillRect(0, 0, cw, ch);

      frameCount++;

      // --- Draw curved connections ---
      ctx!.globalCompositeOperation = "source-over";
      for (let i = 0; i < nodes.length; i++) {
        for (const j of nodes[i].connections) {
          if (j <= i) continue;
          drawConnection(ctx!, nodes[i], nodes[j], 0.07);
        }
      }

      // --- Draw mind-map nodes as circles with rings ---
      for (const node of nodes) {
        const pulse = Math.sin(frameCount * 0.025 + node.pulsePhase) * 0.08 + 0.18;

        // Outer ring (stroke)
        ctx!.strokeStyle = `hsla(${node.hue}, 80%, 50%, ${pulse * 0.7})`;
        ctx!.lineWidth = node.isHub ? 1.2 : 0.6;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx!.stroke();

        // Inner fill
        ctx!.fillStyle = `hsla(${node.hue}, 100%, 55%, ${pulse * 0.4})`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2);
        ctx!.fill();

        // Center dot
        ctx!.fillStyle = `hsla(${node.hue}, 100%, 70%, ${pulse + 0.1})`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.isHub ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx!.fill();
      }

      // --- Check for agent matches at nodes ---
      const arrivals: Map<number, number[]> = new Map();
      for (let ai = 0; ai < agents.length; ai++) {
        if (agents[ai].progress >= 0.9) {
          const dest = agents[ai].toNode;
          if (!arrivals.has(dest)) arrivals.set(dest, []);
          arrivals.get(dest)!.push(ai);
        }
      }
      for (const [nodeIdx, arr] of arrivals) {
        if (arr.length >= 2) {
          for (const ai of arr) {
            agents[ai].matched = true;
            agents[ai].matchTimer = 25;
          }
          // Flash the matching node
          const node = nodes[nodeIdx];
          ctx!.globalCompositeOperation = "lighter";
          ctx!.fillStyle = `hsla(${node.hue}, 100%, 80%, 0.5)`;
          ctx!.shadowColor = `hsla(${node.hue}, 100%, 80%, 1)`;
          ctx!.shadowBlur = 20;
          ctx!.beginPath();
          ctx!.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.shadowBlur = 0;
          ctx!.globalCompositeOperation = "source-over";
        }
      }

      // --- Draw agents traveling along curved paths ---
      ctx!.globalCompositeOperation = "lighter";

      for (const agent of agents) {
        agent.progress += agent.speed;

        const from = nodes[agent.fromNode];
        const to = nodes[agent.toNode];
        const pos = getCurvePoint(from, to, agent.progress);

        if (agent.matchTimer > 0) agent.matchTimer--;
        if (agent.matchTimer === 0) agent.matched = false;

        // Reached destination — pick next edge
        if (agent.progress >= 1) {
          agent.fromNode = agent.toNode;
          const conns = nodes[agent.fromNode].connections;
          if (conns.length > 0) {
            agent.toNode = conns[Math.floor(Math.random() * conns.length)];
          } else {
            agent.fromNode = Math.floor(Math.random() * nodes.length);
            const c = nodes[agent.fromNode].connections;
            agent.toNode = c.length > 0
              ? c[Math.floor(Math.random() * c.length)]
              : (agent.fromNode + 1) % nodes.length;
          }
          agent.progress = 0;
          if (Math.random() < 0.3) agent.hue = randomHue();
        }

        const brightness = agent.matched ? 85 : 65;
        const alpha = agent.matched ? 0.9 : 0.6;
        const r = agent.matched ? 2.5 : 1.5;

        // Agent as a small glowing circle
        ctx!.fillStyle = `hsla(${agent.hue}, 100%, ${brightness}%, ${alpha})`;
        ctx!.shadowColor = `hsla(${agent.hue}, 100%, ${brightness}%, 0.8)`;
        ctx!.shadowBlur = agent.matched ? 10 : 4;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(loop);
      }
    }

    if (prefersReducedMotion) {
      ctx.fillStyle = "rgb(9, 9, 11)";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        for (const j of nodes[i].connections) {
          if (j <= i) continue;
          drawConnection(ctx, nodes[i], nodes[j], 0.08);
        }
      }
      for (const node of nodes) {
        ctx.strokeStyle = `hsla(${node.hue}, 80%, 50%, 0.2)`;
        ctx.lineWidth = node.isHub ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `hsla(${node.hue}, 100%, 60%, 0.15)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
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
