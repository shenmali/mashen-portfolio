// layers.jsx — MatrixRain (katakana) + NodeGraph (agentic data-flow) canvas layers.

/* ============================================================
   MATRIX RAIN — katakana columns, accent-tinted
   ============================================================ */
const MatrixRain = ({ accent = "#39ff88", intensity = 0.55, speed = 1, power = 0 }) => {
  const canvasRef = React.useRef(null);
  const st = React.useRef({ accent, intensity, speed, power });
  React.useEffect(() => { st.current = { accent, intensity, speed, power }; }, [accent, intensity, speed, power]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789<>{}[]()=+*/".split("");
    const fontSize = 16;
    let drops = [], cols = 0, dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(canvas.offsetWidth / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
    };
    resize();
    window.addEventListener("resize", resize);

    const hexA = (hex, a) => {
      const h = hex.replace("#", "");
      return `#${h}${Math.floor(a * 255).toString(16).padStart(2, "0")}`;
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const drawStep = () => {
      const s = st.current;
      ctx.fillStyle = "rgba(2,4,2,0.085)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = `${fontSize}px 'IBM Plex Mono', monospace`;
      const op = Math.max(0.12, s.intensity) * (0.55 + 0.45 * s.power);
      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = hexA(s.accent, Math.min(1, op + 0.35));
        ctx.fillText(chars[(Math.random() * chars.length) | 0], x, y);
        ctx.fillStyle = hexA(s.accent, op * 0.7);
        ctx.fillText(chars[(Math.random() * chars.length) | 0], x, y - fontSize);
        if (y > canvas.offsetHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
    };

    const drawStatic = () => {
      ctx.fillStyle = "#020402";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      drops = Array.from({ length: cols }, () => Math.random() * (canvas.offsetHeight / fontSize));
      for (let n = 0; n < 60; n++) drawStep();
    };

    let raf, pid, last = 0;
    if (reduced) {
      drawStatic();
      let lastState = JSON.stringify(st.current);
      pid = setInterval(() => {
        const cur = JSON.stringify(st.current);
        if (cur !== lastState) { lastState = cur; drawStatic(); }
      }, 240);
    } else {
      const tick = (t) => {
        const s = st.current;
        const stepMs = (52 + (1 - s.intensity) * 70) / (s.speed || 1);
        if (t - last > stepMs) { last = t; drawStep(); }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(raf); clearInterval(pid); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="layer layer-rain" aria-hidden="true" />;
};

/* ============================================================
   NODE GRAPH — agentic mesh with traveling data pulses
   ============================================================ */
const NODE_LABELS = [
  "AGENT", "LLM", "RAG", "PLANNER", "MCP", "FLUX", "VECTOR", "MEMORY",
  "TOOL", "EVAL", "DIFFUSE", "RERANK", "GRAPH", "EXECUTOR", "LoRA", "n8n",
];

const NodeGraph = ({ accent = "#39ff88", intensity = 0.6, speed = 1, power = 0 }) => {
  const canvasRef = React.useRef(null);
  const st = React.useRef({ accent, intensity, speed, power });
  const powAnim = React.useRef(power);
  const mouse = React.useRef({ x: -9999, y: -9999 });
  React.useEffect(() => { st.current = { accent, intensity, speed, power }; }, [accent, intensity, speed, power]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let nodes = [], edges = [], pulses = [], dpr = 1, W = 0, H = 0;

    const rand = (a, b) => a + Math.random() * (b - a);

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // node count scales with area
      const target = Math.round(Math.min(78, Math.max(40, (W * H) / 26000)));
      nodes = [];
      // a few big labeled hubs, rest small
      const hubCount = Math.min(NODE_LABELS.length, Math.round(target * 0.32));
      for (let i = 0; i < target; i++) {
        const hub = i < hubCount;
        nodes.push({
          x: rand(0.04, 0.96) * W,
          y: rand(0.06, 0.94) * H,
          vx: rand(-0.12, 0.12),
          vy: rand(-0.12, 0.12),
          r: hub ? rand(3.0, 4.6) : rand(1.1, 2.0),
          hub,
          label: hub ? NODE_LABELS[i % NODE_LABELS.length] : null,
          phase: Math.random() * Math.PI * 2,
        });
      }
      // edges: connect each node to nearest few
      edges = [];
      const maxD = Math.min(W, H) * 0.26;
      for (let i = 0; i < nodes.length; i++) {
        const dists = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < maxD) dists.push([d, j]);
        }
        dists.sort((a, b) => a[0] - b[0]);
        const k = nodes[i].hub ? 3 : 2;
        for (let n = 0; n < Math.min(k, dists.length); n++) {
          const j = dists[n][1];
          if (!edges.some(e => (e.a === j && e.b === i))) {
            edges.push({ a: i, b: j, len: dists[n][0], active: Math.random() < 0.5 });
          }
        }
      }
      pulses = [];
    };
    build();
    window.addEventListener("resize", build);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    window.addEventListener("pointermove", onMove);

    const hexA = (hex, a) => {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
      return `#${full}${Math.floor(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0")}`;
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, pid, lastT = performance.now();

    const seedStaticPulses = () => {
      pulses = [];
      const live = edges.filter(e => e.active);
      const pool = live.length ? live : edges;
      const count = Math.min(34, pool.length);
      for (let i = 0; i < count; i++) {
        pulses.push({ e: pool[(Math.random() * pool.length) | 0], t: rand(0.12, 0.92), sp: 0 });
      }
    };

    const frame = (now, isStatic) => {
      const s = st.current;
      if (isStatic) { powAnim.current = s.power; }
      else { powAnim.current += (s.power - powAnim.current) * 0.05; }
      const pw = powAnim.current;
      ctx.clearRect(0, 0, W, H);

      if (!isStatic) {
        const drift = (0.2 + 0.5 * s.intensity) * (s.speed || 1);
        for (const nd of nodes) {
          nd.x += nd.vx * drift; nd.y += nd.vy * drift;
          if (nd.x < 0 || nd.x > W) nd.vx *= -1;
          if (nd.y < 0 || nd.y > H) nd.vy *= -1;
          const mdx = nd.x - mouse.current.x, mdy = nd.y - mouse.current.y;
          const md = Math.hypot(mdx, mdy);
          if (md < 120 && md > 0.1) {
            const f = (120 - md) / 120 * 0.6;
            nd.x += (mdx / md) * f; nd.y += (mdy / md) * f;
          }
        }
      }

      // draw edges
      const baseEdge = 0.20 + 0.16 * s.intensity;
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const live = e.active || pw > 0.5;
        const alpha = (live ? baseEdge + 0.22 * pw : baseEdge * 0.5);
        ctx.strokeStyle = hexA(s.accent, alpha);
        ctx.lineWidth = live ? 1.3 : 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      if (!isStatic) {
        // spawn pulses along active edges (rate scales with power+intensity)
        const spawnRate = (0.04 + 0.10 * s.intensity + 0.5 * pw);
        if (Math.random() < spawnRate && edges.length) {
          const candidates = edges.filter(e => e.active || pw > 0.5);
          const e = candidates.length ? candidates[(Math.random() * candidates.length) | 0] : edges[(Math.random() * edges.length) | 0];
          pulses.push({ e, t: 0, sp: rand(0.012, 0.03) * (0.6 + s.speed) });
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
          pulses[i].t += pulses[i].sp * (0.6 + 0.8 * (s.speed || 1));
          if (pulses[i].t >= 1) pulses.splice(i, 1);
        }
        if (pulses.length > 220) pulses.splice(0, pulses.length - 220);
      }

      // draw pulses
      const accentSolid = hexA(s.accent, 1);
      for (const p of pulses) {
        if (p.t <= 0 || p.t >= 1) continue;
        const a = nodes[p.e.a], b = nodes[p.e.b];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const tx = a.x + (b.x - a.x) * Math.max(0, p.t - 0.12);
        const ty = a.y + (b.y - a.y) * Math.max(0, p.t - 0.12);
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, hexA(s.accent, 0));
        grad.addColorStop(1, hexA(s.accent, 0.8));
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = accentSolid;
        ctx.shadowColor = s.accent; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // draw nodes (on top)
      ctx.font = "10px 'IBM Plex Mono', monospace";
      for (const nd of nodes) {
        const tw = isStatic ? 0.7 : 0.5 + 0.5 * Math.sin(now * 0.002 + nd.phase);
        ctx.fillStyle = hexA(s.accent, (nd.hub ? 1.0 : 0.7) * (0.65 + 0.35 * tw));
        ctx.shadowColor = s.accent;
        ctx.shadowBlur = nd.hub ? (12 + 16 * pw) : 5;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (nd.hub) {
          ctx.strokeStyle = hexA(s.accent, 0.32 + 0.35 * pw);
          ctx.lineWidth = 1; ctx.beginPath();
          ctx.arc(nd.x, nd.y, nd.r + 4 + 2 * tw, 0, Math.PI * 2); ctx.stroke();
          const labelA = (0.34 + 0.5 * pw) * (0.72 + 0.28 * tw);
          ctx.fillStyle = hexA(s.accent, labelA);
          ctx.fillText(nd.label, nd.x + nd.r + 7, nd.y + 3);
        }
      }
    };

    if (reduced) {
      seedStaticPulses();
      frame(1000, true);
      let lastState = JSON.stringify(st.current);
      pid = setInterval(() => {
        const cur = JSON.stringify(st.current);
        if (cur !== lastState) { lastState = cur; seedStaticPulses(); frame(1000, true); }
      }, 220);
    } else {
      const loop = (now) => { frame(now, false); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(pid);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="layer layer-graph" aria-hidden="true" />;
};

window.MatrixRain = MatrixRain;
window.NodeGraph = NodeGraph;
