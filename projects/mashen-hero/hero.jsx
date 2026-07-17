// hero.jsx — boot sequence, live agentic console log, access toggle, + multilang copy.

const HERO_COPY = {
  en: {
    eyebrow: "M. ALİ ŞEN — AI / ML ENGINEER · GENERATIVE · AGENTIC",
    line1: "In the AI world,",
    q_npc: "NPC",
    q_or: "are you an",
    q_dash: "— or the",
    q_su: "SuperUser",
    q_end: "?",
    kicker_a: "Most people are players inside someone else's AI.",
    kicker_b: "I build the layer they only get to use",
    kicker_c: "agentic frameworks, generative pipelines, automation that thinks.",
    npcHint: "// running in user-space · read-only access",
    suHint: "root@matrix:~# access granted · you have admin",
    npcLabel: "NPC",
    suLabel: "SUPERUSER",
    accessLabel: "SELECT ACCESS LEVEL",
    cta1: "→ Get in touch",
    cta2: "~/open dossier",
    metaRole: "Freelance AI/ML Engineer // Data Scientist",
    metaBase: "Flanders, BE",
    metaNow: "Freelance · 2023 →",
    privNpc: "user-space",
    privSu: "root",
    statusOnline: "system // online",
    avail: "freelance · remote EU",
    boot: [
      "$ ./connect --target=matrix --user=visitor",
      "[ <ok>OK</ok> ] handshake established · node <a>mashen.dev</a>",
      "[ <ok>OK</ok> ] consciousness detected · classifying entity\u2026",
      "[ <warn>!!</warn> ] entity is <warn>NOT</warn> an NPC",
      "[ <ok>OK</ok> ] elevating privileges \u2192 candidate <a>root</a>",
      "> <a>wake up.</a>",
    ],
  },
  tr: {
    eyebrow: "M. ALİ ŞEN — AI / ML MÜHENDİSİ · GENERATIVE · AGENTIC",
    line1: "Yapay zeka dünyasında,",
    q_npc: "NPC",
    q_or: "sen bir",
    q_dash: "misin — yoksa",
    q_su: "SuperUser",
    q_end: "mı?",
    kicker_a: "Çoğu insan başkasının AI'ında bir oyuncu.",
    kicker_b: "Ben onların yalnızca kullandığı katmanı kuruyorum",
    kicker_c: "agentic framework'ler, generative pipeline'lar, düşünen otomasyon.",
    npcHint: "// user-space'te çalışıyorsun · salt-okunur erişim",
    suHint: "root@matrix:~# erişim verildi · artık admin'sin",
    npcLabel: "NPC",
    suLabel: "SUPERUSER",
    accessLabel: "ERİŞİM SEVİYESİ SEÇ",
    cta1: "→ İletişime geç",
    cta2: "~/dosyayı aç",
    metaRole: "Freelance AI/ML Mühendisi // Data Scientist",
    metaBase: "Flanders, BE",
    metaNow: "Freelance · 2023 →",
    privNpc: "user-space",
    privSu: "root",
    statusOnline: "sistem // çevrimiçi",
    avail: "freelance · remote EU",
    boot: [
      "$ ./connect --target=matrix --user=ziyaretci",
      "[ <ok>OK</ok> ] el sıkışma kuruldu · düğüm <a>mashen.dev</a>",
      "[ <ok>OK</ok> ] bilinç algılandı · varlık sınıflandırılıyor\u2026",
      "[ <warn>!!</warn> ] varlık bir NPC <warn>DEĞİL</warn>",
      "[ <ok>OK</ok> ] yetkiler yükseltiliyor \u2192 aday <a>root</a>",
      "> <a>uyan.</a>",
    ],
  },
  nl: {
    eyebrow: "M. ALİ ŞEN — AI / ML ENGINEER · GENERATIVE · AGENTIC",
    line1: "In de AI-wereld,",
    q_npc: "NPC",
    q_or: "ben jij een",
    q_dash: "— of de",
    q_su: "SuperUser",
    q_end: "?",
    kicker_a: "De meeste mensen zijn spelers in andermans AI.",
    kicker_b: "Ik bouw de laag die zij alleen mogen gebruiken",
    kicker_c: "agentic frameworks, generatieve pijplijnen, automatisering die denkt.",
    npcHint: "// draait in user-space · alleen-lezen toegang",
    suHint: "root@matrix:~# toegang verleend · je hebt admin",
    npcLabel: "NPC",
    suLabel: "SUPERUSER",
    accessLabel: "KIES TOEGANGSNIVEAU",
    cta1: "→ Neem contact op",
    cta2: "~/dossier openen",
    metaRole: "Freelance AI/ML Engineer // Data Scientist",
    metaBase: "Vlaanderen, BE",
    metaNow: "Freelance · 2023 →",
    privNpc: "user-space",
    privSu: "root",
    statusOnline: "systeem // online",
    avail: "freelance · remote EU",
    boot: [
      "$ ./connect --target=matrix --user=bezoeker",
      "[ <ok>OK</ok> ] handshake tot stand gebracht · node <a>mashen.dev</a>",
      "[ <ok>OK</ok> ] bewustzijn gedetecteerd · entiteit classificeren\u2026",
      "[ <warn>!!</warn> ] entiteit is <warn>GEEN</warn> NPC",
      "[ <ok>OK</ok> ] rechten verhogen \u2192 kandidaat <a>root</a>",
      "> <a>word wakker.</a>",
    ],
  },
};

// render a boot line with <ok>/<warn>/<a> mini-markup
function bootMarkup(s) {
  return s
    .replace(/<ok>(.*?)<\/ok>/g, '<span class="ok">$1</span>')
    .replace(/<warn>(.*?)<\/warn>/g, '<span class="warn">$1</span>')
    .replace(/<a>(.*?)<\/a>/g, '<span style="color:var(--accent)">$1</span>');
}

/* ---------- Boot sequence (typewriter) ---------- */
const BootSequence = ({ copy, onDone, reduced }) => {
  const lines = copy.boot;
  const [shown, setShown] = React.useState(reduced ? lines.length : 0);
  const [chars, setChars] = React.useState(0);

  React.useEffect(() => {
    if (reduced) { const t = setTimeout(onDone, 500); return () => clearTimeout(t); }
    let raf, alive = true;
    let li = 0, ci = 0, acc = 0, last = performance.now();
    const speed = 17; // ms/char
    const step = (now) => {
      if (!alive) return;
      acc += now - last; last = now;
      while (acc > speed && li < lines.length) {
        acc -= speed;
        ci++;
        const plain = lines[li].replace(/<\/?(ok|warn|a)>/g, "");
        if (ci > plain.length) { li++; ci = 0; acc -= 220; }
        setShown(li + 1); setChars(ci);
      }
      if (li < lines.length) raf = requestAnimationFrame(step);
      else setTimeout(onDone, 650);
    };
    raf = requestAnimationFrame(step);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, []);

  const truncateMarkup = (full, n) => {
    // walk the plain text up to n chars, preserving the markup spans already passed
    if (n >= full.replace(/<\/?(ok|warn|a)>/g, "").length) return bootMarkup(full);
    let out = "", plain = 0, i = 0;
    while (i < full.length && plain < n) {
      if (full[i] === "<") { const close = full.indexOf(">", i); out += full.slice(i, close + 1); i = close + 1; }
      else { out += full[i]; plain++; i++; }
    }
    return bootMarkup(out);
  };

  return (
    <div className="boot-inner">
      {lines.slice(0, shown).map((ln, i) => {
        const isLast = i === shown - 1 && !reduced;
        const html = isLast ? truncateMarkup(ln, chars) : bootMarkup(ln);
        return (
          <div className="boot-line" key={i}>
            <span dangerouslySetInnerHTML={{ __html: html }} />
            {isLast && <span className="boot-caret" />}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Live agentic console log ---------- */
const LOG_POOL = [
  { ag: "planner",  lvl: "ok",   msg: "decomposed task ▸ 6 sub-goals" },
  { ag: "rag",      lvl: "info", msg: "hybrid search ▸ 24 chunks · rerank ↑" },
  { ag: "tool",     lvl: "sys",  msg: "comfyui.generate(flux, lora=brand)" },
  { ag: "graph",    lvl: "info", msg: "edge ▸ planner → executor → critic" },
  { ag: "eval",     lvl: "ok",   msg: "ragas ▸ groundedness 0.91 · faith 0.94" },
  { ag: "mcp",      lvl: "ok",   msg: "exposed 12 tools to claude-code" },
  { ag: "n8n",      lvl: "info", msg: "flow ▸ trigger → enrich → decide → ship" },
  { ag: "diffuse",  lvl: "sys",  msg: "step 28/28 · cfg 3.5 · ✓ asset" },
  { ag: "memory",   lvl: "info", msg: "write ▸ episodic + semantic" },
  { ag: "forecast", lvl: "ok",   msg: "ltv ▸ MAPE 11.4% · 90d horizon" },
  { ag: "vector",   lvl: "sys",  msg: "qdrant upsert ▸ 1.2k embeddings" },
  { ag: "critic",   lvl: "warn", msg: "reject draft ▸ retry with constraints" },
  { ag: "nmt",      lvl: "info", msg: "12 locales ▸ term-consistent ✓" },
  { ag: "agent",    lvl: "ok",   msg: "decision latency 1.7s · under budget" },
  { ag: "router",   lvl: "sys",  msg: "model ▸ claude-opus → fallback haiku" },
];
const SU_LOG = [
  { ag: "root",     lvl: "ok",   msg: "privilege escalation ▸ uid=0 granted" },
  { ag: "root",     lvl: "ok",   msg: "mounted /world --rw · you can edit reality" },
  { ag: "agent",    lvl: "ok",   msg: "spawned 7 sub-agents ▸ full autonomy" },
  { ag: "graph",    lvl: "ok",   msg: "all edges live ▸ mesh saturated" },
];

const LiveConsole = ({ copy, power, intensity, speed }) => {
  const [lines, setLines] = React.useState([]);
  const stRef = React.useRef({ power, intensity, speed });
  React.useEffect(() => { stRef.current = { power, intensity, speed }; }, [power, intensity, speed]);
  const clock = React.useRef(11 * 3600 + 4 * 60 + 12);

  React.useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const st = stRef.current;
      clock.current += 1 + Math.floor(Math.random() * 4);
      const pool = st.power > 0.5 && Math.random() < 0.45 ? SU_LOG : LOG_POOL;
      const pick = pool[(Math.random() * pool.length) | 0];
      const h = Math.floor(clock.current / 3600) % 24;
      const m = Math.floor((clock.current % 3600) / 60);
      const s = clock.current % 60;
      const ts = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
      setLines(prev => {
        const next = [...prev, { ...pick, ts, id: clock.current + "-" + Math.random() }];
        return next.slice(-13);
      });
      const base = st.power > 0.5 ? 420 : 900;
      const delay = base / (0.6 + (st.speed || 1)) * (1.4 - 0.7 * st.intensity);
      timer = setTimeout(tick, delay + Math.random() * 240);
    };
    let timer = setTimeout(tick, 300);
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  return (
    <div className="console">
      <div className="console-chrome">
        <span className="console-dots"><i></i><i></i><i></i></span>
        <span className="console-title">mashen@matrix : ~/pipeline</span>
        <span className="console-tmux">live · tail -f</span>
      </div>
      <div className="console-body">
        {lines.map((l) => (
          <div className="log-line" key={l.id}>
            <span className="ts">{l.ts}</span>{" "}
            <span className="agent">{l.ag}</span>
            <span className="arrow"> ▸ </span>
            <span className={`lvl-${l.lvl}`}>{l.msg}</span>
          </div>
        ))}
        <span className="boot-caret" />
      </div>
      <div className="console-foot">
        <span>{power > 0.5 ? "uid=0 · root" : "uid=1000 · user"}</span>
        <span>{copy.statusOnline}</span>
      </div>
    </div>
  );
};

window.HERO_COPY = HERO_COPY;
window.BootSequence = BootSequence;
window.LiveConsole = LiveConsole;
