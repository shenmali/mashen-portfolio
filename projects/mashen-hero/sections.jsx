// sections.jsx — full portfolio sections rendered over the matrix backdrop.

const GhIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const SecHead = ({ label, count }) => (
  <div className="sec-head reveal">
    <span className="tag-label">{label}</span>
    <span className="rule" />
    {count != null && <span className="count">{count}</span>}
  </div>
);

const NowCard = ({ C, T, lang }) => (
  <section className="section" id="now">
    <div className="now-card reveal">
      <div className="now-head">
        <span className="now-badge"><span className="d" />NOW · {T.now}</span>
      </div>
      <p className="now-body">{C.now[lang]}</p>
      <div className="stack-row">
        {C.nowStack.map((s, i) => <span key={i} className={"chip" + (i === 0 ? " acc" : "")}>{s}</span>)}
      </div>
    </div>
  </section>
);

const FocusGrid = ({ C, T, lang }) => (
  <section className="section" id="focus">
    <SecHead label={T.focus} count={`${String(C.focus.length).padStart(2, "0")} ${T.entries}`} />
    <div className="focus-grid">
      {C.focus.map((f, i) => (
        <article className="focus-card reveal" key={f.id} style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
          <span className="idx">{String(i + 1).padStart(2, "0")}/{String(C.focus.length).padStart(2, "0")}</span>
          <div className="code">[{f.code}]</div>
          <h3>{f.title[lang]}</h3>
          <p>{f.body[lang]}</p>
          <div className="stack-row">
            {f.stack.map((s, j) => <span key={j} className="chip">{s}</span>)}
          </div>
          <div className="proof">{f.proof[lang]}</div>
        </article>
      ))}
    </div>
  </section>
);

const ExperienceSkills = ({ C, T, lang }) => (
  <section className="section" id="work">
    <div className="cols-2">
      <div>
        <SecHead label={T.work} count={`${String(C.experience.length).padStart(2, "0")} ${T.entries}`} />
        <div className="reveal">
          {C.experience.map((e, i) => (
            <div className="xp-row" key={i}>
              <div className="year">{e.year}</div>
              <div>
                <div className="co">
                  {e.company}
                  {e.current && <span className="badge-now"><span className="d" />NOW</span>}
                </div>
                <div className="role">{e.role[lang]}</div>
                <div className="note">{e.note[lang]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SecHead label={T.skills} count="0 — 6" />
        <div className="reveal">
          {C.skills.map((s, i) => (
            <div className="skillbar" key={i}>
              <span className="label">{s.name}</span>
              <span className="track">
                {Array.from({ length: 6 }).map((_, j) => <span key={j} className={"cell" + (j < s.level ? " on" : "")} />)}
              </span>
              <span className="num">{s.level}</span>
            </div>
          ))}
        </div>
        <div className="sub-label" style={{ marginTop: 26 }}>{T.langs}</div>
        <div className="langs reveal">
          {C.languages.map((l) => (
            <div className="lang" key={l.code}>
              <span className="code">{l.code}</span>
              <span className="bar"><span style={{ width: `${l.pct}%` }} /></span>
              <span className="lvl">{l.level[lang]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Repos = ({ C, T, lang }) => (
  <section className="section" id="repos">
    <SecHead label={T.repos} count={`github.com/${C.identity.github}`} />
    <div className="repos reveal">
      {C.github.map((r) => (
        <a className="repo" key={r.name} href={r.url} target="_blank" rel="noopener noreferrer">
          <div className="repo-head">
            <span className="gi"><GhIcon /></span>
            <span className="name">{r.name}</span>
            <span className="arr">↗</span>
          </div>
          <p>{r.desc[lang]}</p>
          <div className="stack-row">
            {r.tags.map((t, i) => <span key={i} className="chip">{t}</span>)}
          </div>
        </a>
      ))}
    </div>
  </section>
);

const EduCerts = ({ C, T, lang }) => (
  <section className="section" id="edu">
    <SecHead label={`${T.edu} / ${T.certs}`} />
    <div className="edu-grid reveal">
      <div>
        <div className="sub-label">{T.edu}</div>
        {C.education.map((e, i) => (
          <div className="edu-item" key={i}>
            <div className="y">{e.year}</div>
            <div className="deg">{e.degree[lang]}</div>
            <div className="sch">{e.school}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="sub-label">{T.certs}</div>
        {C.certs.map((c, i) => <div className="cert" key={i}>{c}</div>)}
      </div>
    </div>
  </section>
);

const Contact = ({ C, T, lang }) => (
  <section className="section last contact" id="contact">
    <SecHead label={T.contact} />
    <h2 className="reveal">Let's build the <em>thinking</em> layer.</h2>
    <p className="lede reveal">{T.contactLede}</p>
    <div className="contact-grid reveal">
      <a href={`mailto:${C.identity.email}`}><span className="k">email</span><span className="v">{C.identity.email}</span></a>
      <a href={`https://github.com/${C.identity.github}`} target="_blank" rel="noopener noreferrer"><span className="k">github</span><span className="v">/{C.identity.github}</span></a>
      <a href={`https://linkedin.com/in/${C.identity.linkedin}`} target="_blank" rel="noopener noreferrer"><span className="k">linkedin</span><span className="v">/in/{C.identity.linkedin}</span></a>
      <a href={`https://medium.com/${C.identity.medium}`} target="_blank" rel="noopener noreferrer"><span className="k">medium</span><span className="v">/{C.identity.medium}</span></a>
    </div>
  </section>
);

const SiteFoot = ({ C, T }) => (
  <footer className="site-foot">
    <span>© {new Date().getFullYear()} {C.identity.name} · {C.identity.handle}</span>
    <span>{T.footer}</span>
  </footer>
);

const PortfolioSections = ({ lang }) => {
  const C = window.CONTENT;
  const T = C.ui[lang] || C.ui.en;
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = root.querySelectorAll(".reveal");
    if (reduced) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, [lang]);

  return (
    <div className="content" ref={rootRef}>
      <NowCard C={C} T={T} lang={lang} />
      <FocusGrid C={C} T={T} lang={lang} />
      <ExperienceSkills C={C} T={T} lang={lang} />
      <Repos C={C} T={T} lang={lang} />
      <EduCerts C={C} T={T} lang={lang} />
      <Contact C={C} T={T} lang={lang} />
      <SiteFoot C={C} T={T} />
    </div>
  );
};

window.PortfolioSections = PortfolioSections;
