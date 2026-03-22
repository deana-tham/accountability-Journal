import { useState, useRef, useCallback } from "react";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  cream:      "#f9f1eb",
  parchment:  "#f2e8dc",
  sand:       "#e8ddd0",
  stone:      "#d4c9bc",
  mist:       "#c9b9aa",
  driftwood:  "#9b8e82",
  bark:       "#6b5d52",
  ink:        "#3d3028",
  coral:      "#e8847a",
  coralBg:    "#fef0ee",
  white:      "#ffffff",
  dimOverlay: "rgba(45,34,26,0.45)",
};

// ── Stickers (Figma URLs — replace with /assets/... once downloaded) ──────────
const STICKERS = {
  emoji: [
    { id: "e1", src: "https://www.figma.com/api/mcp/asset/b1329063-4db7-4d95-ae03-ebca79b74029", label: "😊", w: 53, h: 43 },
    { id: "e2", src: "https://www.figma.com/api/mcp/asset/55f4a5a5-fae2-4fc5-becd-033f905206db", label: "😄", w: 52, h: 34 },
    { id: "e3", src: "https://www.figma.com/api/mcp/asset/f38470e4-dd59-4b33-a62a-f78ea190b9ed", label: "😮", w: 52, h: 46 },
    { id: "e4", src: "https://www.figma.com/api/mcp/asset/ea97d435-42b2-45fa-b4ee-5f63879059ca", label: "😱", w: 44, h: 41 },
    { id: "e5", src: "https://www.figma.com/api/mcp/asset/a61af9ed-9dd4-43c4-9619-f4e2e9389f2a", label: "❤️", w: 44, h: 41 },
  ],
  washi: [
    { id: "w1", src: "https://www.figma.com/api/mcp/asset/841a55d8-586b-4182-9cde-5d43b4e4ceba", label: "〰", w: 80, h: 22 },
    { id: "w2", src: "https://www.figma.com/api/mcp/asset/d168a8a7-880a-4b0d-8a7f-da0d24ccc053", label: "〰", w: 80, h: 22 },
    { id: "w3", src: "https://www.figma.com/api/mcp/asset/1bee5a62-f859-4ae5-a47b-43d8782833a0", label: "〰", w: 80, h: 22 },
    { id: "w4", src: "https://www.figma.com/api/mcp/asset/6f5b4e46-979b-48af-923e-1f7d6458361f", label: "〰", w: 80, h: 22 },
  ],
};

const todayKey = () => new Date().toISOString().slice(0, 10);

// ── Shared Layout Components (CSS-only, no image dependency) ──────────────────
const JournalSpread = ({ children, style }) => (
  <div style={{
    position: "relative", width: 735, height: 588, flexShrink: 0,
    borderRadius: 12,
    boxShadow: "0 8px 40px rgba(61,48,40,0.18), 0 2px 8px rgba(61,48,40,0.10)",
    background: T.cream,
    ...style,
  }}>
    {/* Spine */}
    <div style={{
      position: "absolute", left: "calc(50% - 3px)", top: 0, bottom: 0, width: 6, zIndex: 5,
      background: `linear-gradient(to right, ${T.mist}, ${T.stone}, ${T.mist})`,
      boxShadow: "0 0 8px rgba(61,48,40,0.12)",
    }} />
    {children}
  </div>
);

const RuledLines = () => (
  <>
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} style={{
        position: "absolute", left: 20, right: 20, top: 58 + i * 22,
        height: 1, background: T.stone, opacity: 0.25,
      }} />
    ))}
  </>
);

const LeftPage = ({ children }) => (
  <div style={{
    position: "absolute", left: 0, top: 0, width: "49.5%", height: "100%",
    background: `linear-gradient(140deg, ${T.parchment} 0%, ${T.cream} 100%)`,
    borderRadius: "12px 0 0 12px", overflow: "hidden",
  }}>
    <RuledLines />
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>
);

const RightPage = ({ children }) => (
  <div style={{
    position: "absolute", right: 0, top: 0, width: "49.5%", height: "100%",
    background: `linear-gradient(220deg, ${T.parchment} 0%, ${T.cream} 100%)`,
    borderRadius: "0 12px 12px 0", overflow: "hidden",
  }}>
    <RuledLines />
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>
);

const Divider = ({ my = 10 }) => (
  <div style={{ height: 1, background: T.stone, margin: `${my}px 0`, opacity: 0.6 }} />
);

const PillBtn = ({ children, onClick, variant = "coral", small, style }) => {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: 40, border: "none", cursor: "pointer", fontFamily: "Georgia, serif",
    fontSize: small ? 11 : 13, padding: small ? "5px 14px" : "8px 20px",
    transition: "opacity 0.15s, transform 0.1s", ...style,
  };
  const variants = {
    coral: { background: T.coral, color: T.white },
    grey:  { background: T.stone, color: T.bark },
    ghost: { background: "transparent", color: T.driftwood, border: `0.5px solid ${T.stone}` },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >{children}</button>
  );
};

const MenuIcon = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <rect y="0" width="18" height="2" rx="1" fill={T.driftwood} />
      <rect y="6" width="18" height="2" rx="1" fill={T.driftwood} />
      <rect y="12" width="18" height="2" rx="1" fill={T.driftwood} />
    </svg>
  </button>
);

const Modal = ({ children, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, background: T.dimOverlay,
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{
      background: T.cream, borderRadius: 24, border: `0.5px solid ${T.sand}`,
      padding: "24px 28px", width: 420, maxWidth: "90%",
      boxShadow: "0 8px 32px rgba(61,48,40,0.18)",
    }}>{children}</div>
  </div>
);

// ── Draggable Sticker ─────────────────────────────────────────────────────────
const PlacedSticker = ({ sticker, onRemove }) => {
  const [pos, setPos]         = useState(sticker.initialPos);
  const [peeling, setPeeling] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    setPeeling(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    const onMove = (me) => {
      setDragging(true);
      setPos({ x: me.clientX - dragOffset.current.x, y: me.clientY - dragOffset.current.y });
    };
    const onUp = () => {
      setPeeling(false); setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos]);

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={onRemove}
      style={{
        position: "absolute", left: pos.x, top: pos.y,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none", zIndex: peeling ? 200 : 10,
        transition: peeling ? "none" : "transform 0.2s",
        transform: peeling
          ? `rotate(${sticker.rotation + 4}deg) scale(1.12) translateY(-6px)`
          : `rotate(${sticker.rotation}deg) scale(1)`,
        filter: peeling
          ? "drop-shadow(2px 4px 6px rgba(0,0,0,0.18))"
          : "drop-shadow(1px 2px 3px rgba(0,0,0,0.08))",
        transformOrigin: "bottom center",
      }}
    >
      {imgFailed ? (
        <span style={{ fontSize: sticker.w * 0.5, lineHeight: 1, display: "block" }}>{sticker.label}</span>
      ) : (
        <img
          src={sticker.src} alt={sticker.label} draggable={false}
          onError={() => setImgFailed(true)}
          style={{ width: sticker.w, height: sticker.h, objectFit: "contain", display: "block" }}
        />
      )}
    </div>
  );
};

// ── SCREEN 1: Onboarding ──────────────────────────────────────────────────────
const OnboardingScreen = ({ onDone, goals, setGoals }) => {
  const [goalText, setGoalText] = useState("");
  const [type, setType]         = useState("daily");
  const [showBox, setShowBox]   = useState(false);

  const addGoal = () => {
    if (!goalText.trim()) return;
    setGoals(g => [...g, { id: Date.now(), text: goalText.trim(), type }]);
    setGoalText(""); setShowBox(false);
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <button onClick={() => setShowBox(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: T.coral, lineHeight: 1, padding: 0 }}>+</button>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.driftwood, borderBottom: `1px solid ${T.mist}`, paddingBottom: 2 }}>
              Add your goals
            </span>
          </div>
          <Divider />
          {goals.length === 0 && (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic", marginTop: 8 }}>
              No goals yet — press + to begin
            </p>
          )}
          {goals.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: T.coral }}>●</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.ink }}>{g.text}</span>
              <span style={{ fontSize: 9, color: T.mist, marginLeft: "auto" }}>{g.type}</span>
            </div>
          ))}
          {goals.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <PillBtn onClick={onDone} small>Let's go →</PillBtn>
            </div>
          )}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 20px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.driftwood, fontStyle: "italic", textAlign: "center", lineHeight: 1.8 }}>
            "Small steps, taken consistently,<br />become the story of your life."
          </p>
          <div style={{ width: 30, height: 1, background: T.stone, margin: "16px 0" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, textAlign: "center" }}>
            Start by adding at least one goal.
          </p>
        </div>
      </RightPage>

      {showBox && (
        <Modal onClose={() => setShowBox(false)}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 12 }}>What's your new goal?</p>
          <input
            value={goalText} onChange={e => setGoalText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addGoal()}
            placeholder="start typing..." autoFocus
            style={{
              width: "100%", boxSizing: "border-box", padding: "8px 12px",
              borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white,
              fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, outline: "none", marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {["daily", "weekly", "monthly"].map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                fontFamily: "Georgia, serif", fontSize: 11, padding: "4px 10px", borderRadius: 20,
                border: `0.5px solid ${T.stone}`, cursor: "pointer",
                background: type === t ? T.coral : T.white, color: type === t ? T.white : T.driftwood,
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <PillBtn variant="grey" onClick={() => setShowBox(false)} small>cancel</PillBtn>
            <PillBtn onClick={addGoal} small>save goal</PillBtn>
          </div>
        </Modal>
      )}
    </JournalSpread>
  );
};

// ── SCREEN 2: Menu ────────────────────────────────────────────────────────────
const MenuScreen = ({ onNav, checkins }) => {
  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      const ci = checkins[key];
      if (!ci || !ci.habits || ci.habits.length === 0) break;
      if (!ci.habits.every(h => h.done)) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const links = [
    { label: "Dashboard", icon: "⊞", screen: "dashboard" },
    { label: "Journal",   icon: "▤", screen: "journal"   },
    { label: "Goal List", icon: "↗", screen: "goals"     },
    { label: "Tracker",   icon: "◉", screen: "tracker"   },
    { label: "Reports",   icon: "▨", screen: "reports"   },
    { label: "Settings",  icon: "✧", screen: "settings"  },
  ];

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "10px 16px" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 15, color: T.ink, fontWeight: 500 }}>Menu</span>
          <Divider />
          {links.map((l, i) => (
            <button key={i} onClick={() => onNav(l.screen)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 0", borderBottom: `0.5px solid ${T.sand}`,
              background: "none", border: "none", borderBottom: `0.5px solid ${T.sand}`,
              cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 13, color: T.mist, width: 16 }}>{l.icon}</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink }}>{l.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: T.mist }}>→</span>
            </button>
          ))}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 16px" }}>
          <div style={{ width: 40, height: 1, background: T.stone, marginBottom: 24 }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.7, textAlign: "center", margin: "0 0 16px" }}>
            "Small steps, taken consistently,<br />become the story of your life."
          </p>
          <div style={{ width: 24, height: 1, background: T.stone, marginBottom: 16 }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, marginBottom: 24, letterSpacing: "0.04em" }}>
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
          <div style={{ background: T.cream, borderRadius: 40, padding: "8px 18px", border: `0.5px solid ${T.sand}`, textAlign: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "0 0 2px" }}>current streak</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 22, color: T.coral, margin: 0, lineHeight: 1.2 }}>
              {streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "—"}
            </p>
          </div>
          <div style={{ width: 40, height: 1, background: T.stone, marginTop: 24 }} />
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3: Dashboard ───────────────────────────────────────────────────────
const DashboardScreen = ({ onNav, goals, checkins, setCheckins }) => {
  const today  = new Date();
  const key    = todayKey();

  // Derive habits from goals, hydrating done-state from saved checkin
  const savedDone = (checkins[key]?.habits || []).reduce((acc, h) => ({ ...acc, [h.id]: h.done }), {});
  const habits = goals.map(g => ({ id: g.id, label: g.text, done: savedDone[g.id] || false }));

  const savedMood = checkins[key]?.mood || null;

  const toggleHabit = (id) => {
    const newHabits = habits.map(h => h.id === id ? { ...h, done: !h.done } : h);
    setCheckins(c => ({ ...c, [key]: { ...(c[key] || {}), habits: newHabits } }));
  };

  const setMood = (mood) => {
    setCheckins(c => ({ ...c, [key]: { ...(c[key] || { habits }), mood } }));
  };

  const handleSaveAndReflect = () => {
    setCheckins(c => ({ ...c, [key]: { ...(c[key] || {}), habits } }));
    const missed = habits.filter(h => !h.done);
    onNav(missed.length > 0 ? "reflect" : "response");
  };

  const dayName  = today.toLocaleString("default", { weekday: "long" });
  const dateLong = today.toLocaleString("default", { month: "long", day: "numeric" });

  // Mini calendar
  const year = today.getFullYear(), month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);
  while (calDays.length % 7 !== 0) calDays.push(null);
  const weeks = [];
  for (let i = 0; i < calDays.length; i += 7) weeks.push(calDays.slice(i, i + 7));

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <MenuIcon onClick={() => onNav("menu")} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood }}>{dateLong}</span>
          </div>
          <Divider my={6} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, margin: "0 0 10px", fontWeight: 500 }}>Today's Habits</p>

          {habits.length === 0 ? (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>
              No goals yet —{" "}
              <button onClick={() => onNav("goals")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 11, color: T.coral, textDecoration: "underline", padding: 0 }}>
                add one
              </button>
            </p>
          ) : (
            habits.map(h => (
              <button key={h.id} onClick={() => toggleHabit(h.id)} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                background: "none", border: "none", cursor: "pointer", padding: "5px 0",
                borderBottom: `0.5px solid ${T.sand}`, textAlign: "left",
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${h.done ? T.coral : T.mist}`,
                  background: h.done ? T.coral : "transparent", transition: "all 0.2s",
                }} />
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 12,
                  color: h.done ? T.mist : T.ink,
                  textDecoration: h.done ? "line-through" : "none", transition: "all 0.2s",
                }}>{h.label}</span>
              </button>
            ))
          )}

          {habits.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <PillBtn small onClick={handleSaveAndReflect}>Save & Reflect →</PillBtn>
            </div>
          )}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ padding: "8px 10px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, margin: "0 0 1px" }}>Good to see you,</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, margin: "0 0 8px" }}>{dayName}, {dateLong} ✦</p>
          <Divider my={6} />

          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "0 0 6px" }}>How are you feeling today?</p>
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {["😞","😐","🙂","😊","😄"].map((emoji, i) => (
              <button key={i} onClick={() => setMood(i + 1)} style={{
                background: savedMood === i + 1 ? T.coralBg : "transparent",
                border: `0.5px solid ${savedMood === i + 1 ? T.coral : T.stone}`,
                borderRadius: 8, cursor: "pointer", padding: "4px 5px", fontSize: 14,
                transition: "all 0.15s",
              }}>{emoji}</button>
            ))}
          </div>
          <Divider my={6} />

          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, textAlign: "center", margin: "0 0 4px", letterSpacing: "0.04em" }}>
            {today.toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>{["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <td key={d} style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.mist, textAlign: "center", padding: "2px 0" }}>{d}</td>
              ))}</tr>
            </thead>
            <tbody>
              {weeks.map((w, i) => (
                <tr key={i}>{w.map((d, j) => {
                  const dateKey = d
                    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
                    : null;
                  const isToday = d === today.getDate();
                  const hasData = dateKey && checkins[dateKey];
                  return (
                    <td key={j} style={{ textAlign: "center", padding: "2px 0" }}>
                      {d && (
                        <span
                          onClick={() => dateKey && onNav("dayreport", { dateKey })}
                          onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = T.sand; }}
                          onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = hasData ? T.coralBg : "transparent"; }}
                          style={{
                            fontFamily: "Georgia, serif", fontSize: 10,
                            color: isToday ? T.white : T.ink,
                            background: isToday ? T.coral : hasData ? T.coralBg : "transparent",
                            borderRadius: "50%", width: 18, height: 18,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            border: hasData && !isToday ? `0.5px solid ${T.coral}` : "none",
                            transition: "background 0.15s",
                          }}
                        >{d}</span>
                      )}
                    </td>
                  );
                })}</tr>
              ))}
            </tbody>
          </table>
          <Divider my={6} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PillBtn small variant="ghost" onClick={() => onNav("journal")}>+ photo / sticker</PillBtn>
          </div>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3b: Reflect ────────────────────────────────────────────────────────
const ReflectScreen = ({ onNav, checkins, setCheckins }) => {
  const key          = todayKey();
  const todayCheckin = checkins[key] || { habits: [], reflections: {} };
  const missedHabits = (todayCheckin.habits || []).filter(h => !h.done);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [text, setText]             = useState("");
  const [reflections, setReflections] = useState(todayCheckin.reflections || {});

  if (missedHabits.length === 0) {
    onNav("response");
    return null;
  }

  const current = missedHabits[currentIdx];
  const isLast  = currentIdx === missedHabits.length - 1;

  const saveAndAdvance = (skipText) => {
    const entry = skipText ? text : text;
    const updated = text.trim() ? { ...reflections, [current.id]: text.trim() } : reflections;
    setReflections(updated);
    setCheckins(c => ({ ...c, [key]: { ...todayCheckin, reflections: updated } }));
    setText("");
    if (isLast) onNav("response");
    else setCurrentIdx(i => i + 1);
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "16px 18px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, letterSpacing: "0.06em", margin: "0 0 6px" }}>
            {currentIdx + 1} of {missedHabits.length}
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, fontWeight: 500, margin: "0 0 14px", lineHeight: 1.5 }}>
            What stopped you from doing<br />
            <em style={{ color: T.coral }}>"{current.label}"</em> today?
          </p>
          <Divider my={8} />
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Take a moment to reflect..."
            autoFocus rows={6}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px",
              borderRadius: 10, border: `1px solid ${T.stone}`,
              background: "rgba(255,255,255,0.6)",
              fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, outline: "none",
              resize: "none", lineHeight: 1.7,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <PillBtn variant="ghost" small onClick={() => saveAndAdvance(true)}>skip</PillBtn>
            <PillBtn small onClick={() => saveAndAdvance(false)}>{isLast ? "done →" : "next →"}</PillBtn>
          </div>
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 20px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.8, textAlign: "center" }}>
            "Awareness is the first step<br />toward change."
          </p>
          <div style={{ width: 30, height: 1, background: T.stone, margin: "16px auto" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, textAlign: "center" }}>
            {missedHabits.length} habit{missedHabits.length !== 1 ? "s" : ""} to reflect on
          </p>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3c: Response / Summary ─────────────────────────────────────────────
const ResponseScreen = ({ onNav, checkins }) => {
  const key          = todayKey();
  const todayCheckin = checkins[key] || { habits: [], reflections: {} };
  const doneHabits   = (todayCheckin.habits || []).filter(h => h.done);
  const missedHabits = (todayCheckin.habits || []).filter(h => !h.done);
  const reflections  = todayCheckin.reflections || {};
  const allDone      = doneHabits.length > 0 && missedHabits.length === 0;

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "12px 16px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500, margin: "0 0 2px" }}>Today's Summary</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, margin: "0 0 10px" }}>
            {new Date().toLocaleString("default", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <Divider my={6} />

          {doneHabits.length > 0 && (
            <>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.coral, letterSpacing: "0.04em", margin: "0 0 6px" }}>completed</p>
              {doneHabits.map(h => (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ color: T.coral, fontSize: 10 }}>✓</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink }}>{h.label}</span>
                </div>
              ))}
            </>
          )}

          {missedHabits.length > 0 && (
            <>
              <Divider my={8} />
              <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.04em", margin: "0 0 6px" }}>reflections</p>
              {missedHabits.map(h => (
                <div key={h.id} style={{ marginBottom: 8 }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: "0 0 2px", fontStyle: "italic" }}>{h.label}</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: 0, lineHeight: 1.5 }}>
                    {reflections[h.id] || <span style={{ color: T.mist }}>—</span>}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 20px", gap: 12 }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.8, textAlign: "center", margin: 0 }}>
            {allDone ? '"You did it — every single one. ✦"' : '"Every reflection is a step forward."'}
          </p>
          <div style={{ width: 30, height: 1, background: T.stone }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", alignItems: "center" }}>
            <PillBtn small onClick={() => onNav("journal")}>+ add photo or sticker</PillBtn>
            <PillBtn small variant="ghost" onClick={() => onNav("dashboard")}>back to today</PillBtn>
          </div>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3d: Day Report (clicked from calendar) ─────────────────────────────
const DayReportScreen = ({ onNav, checkins, journalEntries, setJournalEntries, dateKey }) => {
  const ci      = checkins[dateKey] || { habits: [], reflections: {}, mood: null };
  const entry   = journalEntries[dateKey] || { text: "" };
  const [editing, setEditing] = useState(false);
  const [text, setText]       = useState(entry.text);

  const doneHabits   = ci.habits.filter(h => h.done);
  const missedHabits = ci.habits.filter(h => !h.done);
  const dateLabel    = new Date(dateKey + "T00:00:00").toLocaleString("default", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const saveEntry = () => {
    setJournalEntries(j => ({ ...j, [dateKey]: { ...entry, text } }));
    setEditing(false);
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "10px 16px" }}>
          <button onClick={() => onNav("dashboard")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, padding: 0, marginBottom: 6,
          }}>← back</button>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, fontWeight: 500, margin: "0 0 2px" }}>{dateLabel}</p>
          <Divider my={6} />

          {ci.habits.length === 0 ? (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>No check-in recorded for this day.</p>
          ) : (
            <>
              {doneHabits.length > 0 && (
                <>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.coral, letterSpacing: "0.05em", margin: "0 0 5px" }}>completed</p>
                  {doneHabits.map(h => (
                    <div key={h.id} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
                      <span style={{ color: T.coral, fontSize: 10 }}>✓</span>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink }}>{h.label}</span>
                    </div>
                  ))}
                </>
              )}
              {missedHabits.length > 0 && (
                <>
                  <Divider my={6} />
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.05em", margin: "0 0 5px" }}>missed</p>
                  {missedHabits.map(h => (
                    <div key={h.id} style={{ marginBottom: 6 }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, fontStyle: "italic" }}>{h.label}</span>
                      {ci.reflections?.[h.id] && (
                        <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, margin: "2px 0 0", lineHeight: 1.5 }}>
                          "{ci.reflections[h.id]}"
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {ci.mood && (
            <>
              <Divider my={8} />
              <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.mist, margin: "0 0 4px" }}>mood</p>
              <span style={{ fontSize: 18 }}>{["😞","😐","🙂","😊","😄"][ci.mood - 1]}</span>
            </>
          )}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: 0, fontWeight: 500 }}>Journal Entry</p>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "Georgia, serif", fontSize: 10, color: T.coral,
              }}>
                {entry.text ? "edit ✎" : "+ add entry"}
              </button>
            )}
          </div>
          <Divider my={4} />
          {editing ? (
            <>
              <textarea
                value={text} onChange={e => setText(e.target.value)}
                placeholder="Write something about this day..."
                autoFocus rows={8}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${T.stone}`,
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: "Georgia, serif", fontSize: 11, color: T.ink,
                  outline: "none", resize: "none", lineHeight: 1.7,
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <PillBtn variant="grey" small onClick={() => { setEditing(false); setText(entry.text); }}>cancel</PillBtn>
                <PillBtn small onClick={saveEntry}>save</PillBtn>
              </div>
            </>
          ) : (
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 11, lineHeight: 1.7,
              color: entry.text ? T.ink : T.mist, fontStyle: entry.text ? "normal" : "italic",
            }}>
              {entry.text || "No entry yet."}
            </p>
          )}
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 4: Goals ───────────────────────────────────────────────────────────
const GoalsScreen = ({ onNav, goals, setGoals }) => {
  const [showAdd, setShowAdd]       = useState(false);
  const [newText, setNewText]       = useState("");
  const [newType, setNewType]       = useState("daily");
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [editing, setEditing]       = useState(null);
  const [editText, setEditText]     = useState("");

  const addGoal = () => {
    if (!newText.trim()) return;
    setGoals(g => [...g, { id: Date.now(), text: newText.trim(), type: newType }]);
    setNewText(""); setShowAdd(false);
  };

  const confirmDelete = () => {
    const deletedGoal = deletingGoal;
    const reason      = deleteReason;
    setGoals(g => g.filter(x => x.id !== deletedGoal.id));
    setDeletingGoal(null);
    setDeleteReason("");
    onNav("deleteresponse", { habit: deletedGoal.text, reason });
  };

  const saveEdit = () => {
    setGoals(g => g.map(x => x.id === editing.id ? { ...x, text: editText } : x));
    setEditing(null);
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <MenuIcon onClick={() => onNav("menu")} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Current Goals</span>
            <button onClick={() => setShowAdd(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.coral, lineHeight: 1 }}>+</button>
          </div>
          <Divider my={6} />
          {goals.length === 0 ? (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic", marginTop: 8 }}>
              No goals yet — press + to add one
            </p>
          ) : (
            goals.map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: `0.5px solid ${T.sand}` }}>
                <span style={{ fontSize: 8, color: T.coral }}>●</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, flex: 1 }}>{g.text}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.mist }}>{g.type}</span>
                <button onClick={() => { setEditing(g); setEditText(g.text); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.driftwood }}>✎</button>
                <button onClick={() => setDeletingGoal(g)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.coral }}>✕</button>
              </div>
            ))
          )}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ padding: "16px 12px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.driftwood, marginBottom: 8, fontStyle: "italic" }}>
            "Goals are dreams with deadlines."
          </p>
          <Divider />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, margin: "8px 0 4px" }}>by type</p>
          {["daily", "weekly", "monthly"].map(t => {
            const count = goals.filter(g => g.type === t).length;
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, width: 52 }}>{t}</span>
                <div style={{ flex: 1, height: 6, background: T.sand, borderRadius: 3 }}>
                  <div style={{ width: `${(count / Math.max(goals.length, 1)) * 100}%`, height: "100%", background: T.coral, borderRadius: 3, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist }}>{count}</span>
              </div>
            );
          })}
        </div>
      </RightPage>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 12 }}>Add a new goal</p>
          <input
            value={newText} onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addGoal()}
            placeholder="start typing..." autoFocus
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white, fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, outline: "none", marginBottom: 12 }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["daily","weekly","monthly"].map(t => (
              <button key={t} onClick={() => setNewType(t)} style={{
                fontFamily: "Georgia, serif", fontSize: 11, padding: "4px 10px", borderRadius: 20,
                border: `0.5px solid ${T.stone}`, cursor: "pointer",
                background: newType === t ? T.coral : T.white, color: newType === t ? T.white : T.driftwood,
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <PillBtn variant="grey" small onClick={() => setShowAdd(false)}>cancel</PillBtn>
            <PillBtn small onClick={addGoal}>save goal</PillBtn>
          </div>
        </Modal>
      )}

      {deletingGoal && (
        <Modal onClose={() => { setDeletingGoal(null); setDeleteReason(""); }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 4 }}>
            Why are you letting go of <em style={{ color: T.coral }}>"{deletingGoal.text}"</em>?
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, marginBottom: 12 }}>
            Take a moment to reflect before moving on.
          </p>
          <textarea
            value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
            placeholder="I'm letting this go because..."
            autoFocus rows={4}
            style={{
              width: "100%", boxSizing: "border-box", padding: "8px 10px",
              borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white,
              fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, outline: "none",
              resize: "none", marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <PillBtn variant="grey" small onClick={() => { setDeletingGoal(null); setDeleteReason(""); }}>cancel</PillBtn>
            <PillBtn small onClick={confirmDelete}>let it go →</PillBtn>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 12 }}>Edit goal</p>
          <input
            value={editText} onChange={e => setEditText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveEdit()} autoFocus
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white, fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, outline: "none", marginBottom: 14 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <PillBtn variant="grey" small onClick={() => setEditing(null)}>cancel</PillBtn>
            <PillBtn small onClick={saveEdit}>save</PillBtn>
          </div>
        </Modal>
      )}
    </JournalSpread>
  );
};

// ── SCREEN 4b: Delete Response ────────────────────────────────────────────────
const DeleteResponseScreen = ({ onNav, habit, reason }) => (
  <JournalSpread>
    <LeftPage>
      <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, letterSpacing: "0.05em", margin: "0 0 6px" }}>letting go of</p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 15, color: T.coral, fontStyle: "italic", margin: "0 0 16px" }}>"{habit}"</p>
        <Divider my={8} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, margin: "0 0 6px" }}>your reflection:</p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, lineHeight: 1.7, fontStyle: "italic", flex: 1 }}>
          {reason || <span style={{ color: T.mist }}>—</span>}
        </p>
        <PillBtn small onClick={() => onNav("goals")} style={{ alignSelf: "flex-start", marginTop: 16 }}>← back to goals</PillBtn>
      </div>
    </LeftPage>
    <RightPage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 20px" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.8, textAlign: "center" }}>
          "Not every goal is meant to last forever.<br />What matters is that you showed up."
        </p>
        <div style={{ width: 30, height: 1, background: T.stone, margin: "16px 0" }} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, textAlign: "center" }}>
          Goal removed. Your reflection has been noted.
        </p>
      </div>
    </RightPage>
  </JournalSpread>
);

// ── SCREEN 5: Journal / Stickers / Photos ─────────────────────────────────────
const JournalScreen = ({ onNav, journalEntries, setJournalEntries }) => {
  const key   = todayKey();
  const entry = journalEntries[key] || { placedItems: [] };

  const [stickerPanel, setStickerPanel] = useState(false);
  const [photoModal, setPhotoModal]     = useState(false);
  const [placedItems, setPlacedItems]   = useState(entry.placedItems || []);
  const [preview, setPreview]           = useState(null);
  const fileRef = useRef();

  const save = (items) => {
    setJournalEntries(j => ({ ...j, [key]: { ...entry, placedItems: items } }));
  };

  const placeSticker = (sticker) => {
    const updated = [...placedItems, {
      ...sticker, uid: Date.now(),
      initialPos: { x: 80 + Math.random() * 100, y: 80 + Math.random() * 120 },
      rotation: -8 + Math.random() * 16,
    }];
    setPlacedItems(updated); save(updated); setStickerPanel(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const placePhoto = () => {
    if (!preview) return;
    const updated = [...placedItems, {
      id: `photo-${Date.now()}`, uid: Date.now(),
      src: preview, label: "photo", w: 110, h: 80, isPhoto: true,
      initialPos: { x: 60 + Math.random() * 80, y: 80 + Math.random() * 100 },
      rotation: -5 + Math.random() * 10,
    }];
    setPlacedItems(updated); save(updated);
    setPreview(null); setPhotoModal(false);
  };

  const removeItem = (uid) => {
    const updated = placedItems.filter(x => x.uid !== uid);
    setPlacedItems(updated); save(updated);
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ position: "absolute", top: 8, left: 8, zIndex: 20 }}>
          <MenuIcon onClick={() => onNav("menu")} />
        </div>
        {placedItems.map(item => (
          <PlacedSticker key={item.uid} sticker={item} onRemove={() => removeItem(item.uid)} />
        ))}
      </LeftPage>

      <RightPage>
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6, zIndex: 20 }}>
          <PillBtn small variant="ghost" onClick={() => { setStickerPanel(s => !s); setPhotoModal(false); }}>+ sticker</PillBtn>
          <PillBtn small variant="ghost" onClick={() => { setPhotoModal(true); setStickerPanel(false); }}>+ photo</PillBtn>
        </div>
      </RightPage>

      {stickerPanel && (
        <div style={{
          position: "absolute", right: 12, top: 44, width: 200, height: 300,
          background: "rgba(249,241,235,0.97)", borderRadius: 18, border: `0.5px solid ${T.sand}`,
          display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 50,
          boxShadow: "0 4px 20px rgba(61,48,40,0.12)",
        }}>
          <div style={{ padding: "8px 12px 6px", borderBottom: `0.5px solid ${T.sand}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood }}>sticker menu</span>
            <button onClick={() => setStickerPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.mist }}>✕</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "8px 10px", scrollbarWidth: "thin", scrollbarColor: `${T.stone} transparent` }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.mist, margin: "0 0 6px", letterSpacing: "0.04em" }}>expressions</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
              {STICKERS.emoji.map(s => (
                <button key={s.id} onClick={() => placeSticker(s)} style={{
                  aspectRatio: "1", background: T.white, borderRadius: 8, border: `0.5px solid ${T.sand}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 4, transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.coral}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.sand}>
                  <img src={s.src} alt={s.label} style={{ maxWidth: 36, maxHeight: 36, objectFit: "contain" }}
                    onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }} />
                  <span style={{ display: "none", fontSize: 22 }}>{s.label}</span>
                </button>
              ))}
            </div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.mist, margin: "0 0 6px", letterSpacing: "0.04em" }}>washi tape</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {STICKERS.washi.map(s => (
                <button key={s.id} onClick={() => placeSticker(s)} style={{
                  height: 32, background: T.white, borderRadius: 6, border: `0.5px solid ${T.sand}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 4, transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.coral}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.sand}>
                  <img src={s.src} alt={s.label} style={{ maxWidth: "90%", maxHeight: 20, objectFit: "contain" }}
                    onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }} />
                  <span style={{ display: "none", fontSize: 12, color: T.driftwood }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {photoModal && (
        <Modal onClose={() => { setPhotoModal(false); setPreview(null); }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 4 }}>Add a photo to today's entry</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, marginBottom: 14 }}>Choose a photo from your device.</p>
          {!preview ? (
            <div onClick={() => fileRef.current.click()} style={{
              height: 130, border: `1.5px dashed ${T.stone}`, borderRadius: 12,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8, cursor: "pointer", background: T.white, marginBottom: 14,
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.coral}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.stone}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="6" width="28" height="20" rx="3" stroke={T.stone} strokeWidth="1.5" />
                <circle cx="12" cy="14" r="3" stroke={T.stone} strokeWidth="1.5" />
                <path d="M2 22l7-5.5 4.5 3.5 5-5 11 8" stroke={T.stone} strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood }}>
                <span style={{ color: T.coral, textDecoration: "underline" }}>browse files</span>
              </span>
            </div>
          ) : (
            <img src={preview} alt="preview" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 12, marginBottom: 14 }} />
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <PillBtn variant="grey" onClick={() => { setPhotoModal(false); setPreview(null); }}>cancel</PillBtn>
            <PillBtn onClick={placePhoto} style={{ opacity: preview ? 1 : 0.4, cursor: preview ? "pointer" : "not-allowed" }}>
              add to page →
            </PillBtn>
          </div>
        </Modal>
      )}
    </JournalSpread>
  );
};

// ── SCREEN 6: Tracker ─────────────────────────────────────────────────────────
const TrackerScreen = ({ onNav, goals, checkins }) => {
  const [view, setView] = useState("weekly");

  const getDays = (count) => {
    const days = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  const days = view === "weekly" ? getDays(7) : getDays(30);

  const totalDone = days.reduce((acc, dateKey) => {
    const ci = checkins[dateKey];
    return acc + (ci?.habits?.filter(h => h.done).length || 0);
  }, 0);
  const total = goals.length * days.length;
  const pct   = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <MenuIcon onClick={() => onNav("menu")} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Habit Streaks</span>
          </div>
          <Divider my={6} />
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {["weekly", "monthly"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                fontFamily: "Georgia, serif", fontSize: 10, padding: "3px 10px", borderRadius: 20,
                border: `0.5px solid ${T.stone}`, cursor: "pointer",
                background: view === v ? T.coral : "transparent", color: view === v ? T.white : T.driftwood,
              }}>{v}</button>
            ))}
          </div>

          {goals.length === 0 ? (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>No goals yet.</p>
          ) : (
            goals.map(g => (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: "0 0 4px" }}>{g.text}</p>
                <div style={{ display: "flex", gap: view === "weekly" ? 6 : 2, flexWrap: "wrap" }}>
                  {days.map((dateKey, j) => {
                    const ci   = checkins[dateKey];
                    const done = ci?.habits?.find(h => h.id === g.id)?.done || false;
                    const had  = !!ci;
                    return (
                      <div key={j} style={{
                        width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                        background: done ? T.coral : "transparent",
                        border: `1.5px solid ${done ? T.coral : had ? T.stone : T.sand}`,
                      }} />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, margin: "0 0 6px" }}>
            {view === "weekly" ? "This Week" : "This Month"}
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 30, color: T.coral, margin: "0 0 2px", lineHeight: 1 }}>
            {total > 0 ? `${totalDone}/${total}` : "—"}
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, marginBottom: 12 }}>habits completed</p>
          <Divider my={4} />
          <div style={{ width: "100%" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "6px 0" }}>completion rate</p>
            <div style={{ height: 8, background: T.sand, borderRadius: 4 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: T.coral, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.coral, margin: "4px 0 0", textAlign: "right" }}>{pct}%</p>
          </div>
          <Divider my={8} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, fontStyle: "italic", textAlign: "center" }}>
            {goals.length === 0 ? "Add some goals to start tracking." : "Keep going — you're building momentum! ✦"}
          </p>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 7: Reports ─────────────────────────────────────────────────────────
const ReportsScreen = ({ onNav, goals, checkins }) => {
  const [tab, setTab] = useState("weekly");

  const getDays = () => {
    const count = tab === "weekly" ? 7 : 30;
    const days  = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  const days = getDays();

  const getGoalPct = (goalId) => {
    const relevant = days.filter(d => checkins[d]?.habits?.some(h => h.id === goalId));
    if (relevant.length === 0) return 0;
    const done = relevant.filter(d => checkins[d].habits.find(h => h.id === goalId)?.done).length;
    return Math.round((done / relevant.length) * 100);
  };

  const avgMood = (() => {
    const moods = days.map(d => checkins[d]?.mood).filter(Boolean);
    if (moods.length === 0) return null;
    return (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1);
  })();

  const recentReflections = days.slice(-5).flatMap(d => {
    const ci = checkins[d];
    if (!ci?.reflections) return [];
    return Object.entries(ci.reflections).map(([id, text]) => ({
      date: d,
      habit: ci.habits?.find(h => String(h.id) === String(id))?.label || "",
      text,
    }));
  }).slice(0, 4);

  const rangeLabel = tab === "weekly"
    ? `${new Date(days[0] + "T00:00:00").toLocaleString("default", { month: "short", day: "numeric" })} – ${new Date(days[days.length - 1] + "T00:00:00").toLocaleString("default", { month: "short", day: "numeric" })}`
    : new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <MenuIcon onClick={() => onNav("menu")} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Reports</span>
          </div>
          <div style={{ display: "flex", gap: 8, margin: "4px 0 6px" }}>
            {["weekly", "monthly"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily: "Georgia, serif", fontSize: 10, padding: "3px 10px", borderRadius: 20,
                border: `0.5px solid ${T.stone}`, cursor: "pointer",
                background: tab === t ? T.coral : "transparent", color: tab === t ? T.white : T.driftwood,
              }}>{t}</button>
            ))}
          </div>
          <Divider my={4} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, margin: "0 0 8px" }}>{rangeLabel}</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: "0 0 8px" }}>Habit Completion</p>
          {goals.length === 0 ? (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>No goals to report on yet.</p>
          ) : (
            goals.map(g => {
              const pct = getGoalPct(g.id);
              return (
                <div key={g.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.ink }}>{g.text}</span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: T.sand, borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: T.coral, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })
          )}
          {avgMood && (
            <>
              <Divider my={4} />
              <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist }}>Avg mood: {avgMood} / 5</p>
            </>
          )}
        </div>
      </LeftPage>

      <RightPage>
        <div style={{ padding: "12px 12px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: "0 0 10px" }}>Recent Reflections</p>
          {recentReflections.length === 0 ? (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>No reflections yet.</p>
          ) : (
            recentReflections.map((r, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.coral, margin: "0 0 2px", letterSpacing: "0.04em" }}>
                  {r.habit} · {new Date(r.date + "T00:00:00").toLocaleString("default", { month: "short", day: "numeric" })}
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.ink, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
                  "{r.text}"
                </p>
              </div>
            ))
          )}
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 8: Settings ────────────────────────────────────────────────────────
const SettingsScreen = ({ onNav, theme, setTheme }) => (
  <JournalSpread>
    <LeftPage>
      <div style={{ padding: "8px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <MenuIcon onClick={() => onNav("menu")} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Settings</span>
        </div>
        <Divider />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, margin: "8px 0 6px" }}>Theme</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["light", "dark"].map(t => (
            <button key={t} onClick={() => setTheme(t)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${T.mist}`, background: theme === t ? T.coral : "transparent", transition: "background 0.2s" }} />
              <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.ink }}>{t}</span>
            </button>
          ))}
        </div>
        <Divider my={12} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist }}>Version 1.0</p>
      </div>
    </LeftPage>
    <RightPage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 16px" }}>
        <div style={{ width: 40, height: 1, background: T.stone, marginBottom: 20 }} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.7, textAlign: "center", margin: "0 0 16px" }}>
          "A journal is a mirror<br />that never lies."
        </p>
        <div style={{ width: 40, height: 1, background: T.stone }} />
      </div>
    </RightPage>
  </JournalSpread>
);

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,         setScreen]         = useState("onboarding");
  const [theme,          setTheme]           = useState("light");
  const [goals,          setGoals]           = useState([]);
  const [checkins,       setCheckins]        = useState({});
  const [journalEntries, setJournalEntries]  = useState({});
  const [navData,        setNavData]         = useState({});

  const onNav = (s, data = {}) => { setNavData(data); setScreen(s); };

  const dark = theme === "dark";
  const bg   = dark ? "#1e1a17" : "#f0e9e0";

  const shared = { onNav, goals, setGoals, checkins, setCheckins, journalEntries, setJournalEntries, theme, setTheme };

  const screenMap = {
    onboarding:     <OnboardingScreen {...shared} onDone={() => setScreen("menu")} />,
    menu:           <MenuScreen {...shared} />,
    dashboard:      <DashboardScreen {...shared} />,
    reflect:        <ReflectScreen {...shared} />,
    response:       <ResponseScreen {...shared} />,
    goals:          <GoalsScreen {...shared} />,
    deleteresponse: <DeleteResponseScreen onNav={onNav} habit={navData.habit || ""} reason={navData.reason || ""} />,
    journal:        <JournalScreen {...shared} />,
    tracker:        <TrackerScreen {...shared} />,
    reports:        <ReportsScreen {...shared} />,
    settings:       <SettingsScreen {...shared} />,
    dayreport:      <DayReportScreen {...shared} dateKey={navData.dateKey || todayKey()} />,
  };

  return (
    <div style={{
      minHeight: "100vh", background: bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 16px", transition: "background 0.4s", fontFamily: "Georgia, serif",
    }}>
      <h1 style={{ fontSize: 13, color: dark ? T.mist : T.driftwood, letterSpacing: "0.12em", margin: "0 0 20px", fontWeight: 400 }}>
        MY JOURNAL
      </h1>
      <div>{screenMap[screen] || screenMap.menu}</div>
      <p style={{ marginTop: 14, fontFamily: "Georgia, serif", fontSize: 10, color: dark ? T.bark : T.mist, fontStyle: "italic" }}>
        double-click a placed sticker or photo to remove it
      </p>
    </div>
  );
}
