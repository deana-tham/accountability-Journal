import { useState, useRef, useCallback, useEffect } from "react";

// ── Asset Paths ───────────────────────────────────────────────────────────────
const A = { journalBook: "/assets/Journal book.svg", journalPage: "/assets/Journal Page.svg" };

const STICKERS = {
  expressions: [
    { id: "e7",  src: "/assets/emoji7.svg",           label: "emoji",   w: 52, h: 52 },
    { id: "e8",  src: "/assets/emoji8.svg",           label: "emoji",   w: 52, h: 52 },
    { id: "e9",  src: "/assets/emoji9.svg",           label: "emoji",   w: 52, h: 52 },
    { id: "e10", src: "/assets/emoji10.svg",          label: "emoji",   w: 91, h: 43 },
    { id: "e11", src: "/assets/emoji11.svg",          label: "emoji",   w: 92, h: 34 },
    { id: "e12", src: "/assets/emoji12.svg",          label: "emoji",   w: 52, h: 52 },
    { id: "bh",  src: "/assets/bubble heart.svg",     label: "heart",   w: 60, h: 75 },
    { id: "sb",  src: "/assets/shocked bubble.svg",   label: "shocked", w: 60, h: 77 },
  ],
  decorative: [
    { id: "g10", src: "/assets/Group 10.svg",         label: "sparkle", w: 60, h: 70 },
    { id: "g14", src: "/assets/Group 14.svg",         label: "swish",   w: 67, h: 40 },
    { id: "g15", src: "/assets/Group 15.svg",         label: "deco",    w: 60, h: 60 },
    { id: "g17", src: "/assets/Group 17.svg",         label: "deco",    w: 60, h: 60 },
    { id: "g19", src: "/assets/Group 19.svg",         label: "deco",    w: 60, h: 60 },
    { id: "g22", src: "/assets/Group 22.svg",         label: "deco",    w: 60, h: 60 },
    { id: "g23", src: "/assets/Group 23.svg",         label: "deco",    w: 60, h: 60 },
    { id: "vt",  src: "/assets/Vector.svg",           label: "burst",   w: 50, h: 62 },
    { id: "st",  src: "/assets/star.svg",             label: "star",    w: 60, h: 60 },
    { id: "ds",  src: "/assets/double star.svg",      label: "stars",   w: 70, h: 60 },
    { id: "ex",  src: "/assets/exclamation mark.svg", label: "!",       w: 40, h: 70 },
  ],
  washi: [
    { id: "w1", src: "/assets/washi1.svg",  label: "washi", w: 130, h: 36 },
    { id: "w2", src: "/assets/washi2.svg",  label: "washi", w: 130, h: 36 },
    { id: "w3", src: "/assets/washi 3.svg", label: "washi", w: 130, h: 36 },
    { id: "w4", src: "/assets/washi4.svg",  label: "washi", w: 130, h: 36 },
    { id: "w5", src: "/assets/washi5.svg",  label: "washi", w: 130, h: 36 },
    { id: "w6", src: "/assets/washi6.svg",  label: "washi", w: 130, h: 36 },
    { id: "w7", src: "/assets/washi7.svg",  label: "washi", w: 130, h: 36 },
    { id: "w8", src: "/assets/washi8.svg",  label: "washi", w: 130, h: 36 },
    { id: "w9", src: "/assets/washi9.svg",  label: "washi", w: 130, h: 36 },
  ],
};

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  cream: "#f9f1eb", parchment: "#f2e8dc", sand: "#e8ddd0", stone: "#d4c9bc",
  mist: "#c9b9aa", driftwood: "#9b8e82", bark: "#6b5d52", ink: "#3d3028",
  coral: "#e8847a", coralBg: "#fef0ee", white: "#ffffff",
  dimOverlay: "rgba(45,34,26,0.45)",
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const dateToKey = (d) => d.toISOString().slice(0, 10);
const shiftDate = (d, days) => { const n = new Date(d); n.setDate(n.getDate() + days); return n; };

// ── Layout ────────────────────────────────────────────────────────────────────
const JournalSpread = ({ children, style }) => (
  <div style={{ position: "relative", width: 735, height: 588, flexShrink: 0, ...style }}>
    <img src={A.journalBook} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
    {children}
  </div>
);

// Page areas calibrated to Journal book.svg
const LeftPage  = ({ children, style }) => <div style={{ position: "absolute", left: 82,  top: 77, width: 272, height: 434, overflow: "hidden", ...style }}>{children}</div>;
const RightPage = ({ children, style }) => <div style={{ position: "absolute", left: 389, top: 77, width: 264, height: 434, overflow: "hidden", ...style }}>{children}</div>;

const Divider = ({ my = 10 }) => <div style={{ height: 1, background: T.stone, margin: `${my}px 0`, opacity: 0.5 }} />;

const PillBtn = ({ children, onClick, variant = "coral", small, style }) => {
  const variants = { coral: { background: T.coral, color: T.white }, grey: { background: T.stone, color: T.bark }, ghost: { background: "transparent", color: T.driftwood, border: `0.5px solid ${T.stone}` } };
  return (
    <button style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 40, border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: small ? 11 : 13, padding: small ? "5px 14px" : "8px 20px", transition: "transform 0.1s", ...variants[variant], ...style }}
      onClick={onClick}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >{children}</button>
  );
};

const MenuIcon = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <rect y="0"  width="18" height="2" rx="1" fill={T.driftwood} />
      <rect y="6"  width="18" height="2" rx="1" fill={T.driftwood} />
      <rect y="12" width="18" height="2" rx="1" fill={T.driftwood} />
    </svg>
  </button>
);

const Modal = ({ children, onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: T.dimOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: T.cream, borderRadius: 24, border: `0.5px solid ${T.sand}`, padding: "24px 28px", width: 420, maxWidth: "90%", boxShadow: "0 8px 32px rgba(61,48,40,0.18)" }}>{children}</div>
  </div>
);

// ── Shared Sticker Panel ──────────────────────────────────────────────────────
const StickerPanel = ({ onClose, onPlace }) => {
  const [tab, setTab] = useState("expressions");
  return (
    <div style={{ position: "absolute", right: 12, top: 44, width: 220, height: 320, background: "rgba(249,241,235,0.97)", borderRadius: 18, border: `0.5px solid ${T.sand}`, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 50, boxShadow: "0 4px 20px rgba(61,48,40,0.14)" }}>
      <div style={{ padding: "8px 12px 0", borderBottom: `0.5px solid ${T.sand}`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood }}>sticker menu</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.mist }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 4, paddingBottom: 8 }}>
          {["expressions","decorative","washi"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: "Georgia, serif", fontSize: 9, padding: "3px 8px", borderRadius: 20, border: `0.5px solid ${T.stone}`, cursor: "pointer", background: tab === t ? T.coral : "transparent", color: tab === t ? T.white : T.driftwood }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: "8px 10px", scrollbarWidth: "thin", scrollbarColor: `${T.stone} transparent` }}>
        {tab === "washi" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STICKERS.washi.map(s => (
              <button key={s.id} onClick={() => onPlace(s)} style={{ width: "100%", height: 44, background: T.white, borderRadius: 8, border: `0.5px solid ${T.sand}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 4 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.coral} onMouseLeave={e => e.currentTarget.style.borderColor = T.sand}>
                <img src={s.src} alt={s.label} style={{ maxWidth: "90%", maxHeight: 36, objectFit: "contain" }} />
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {STICKERS[tab].map(s => (
              <button key={s.id} onClick={() => onPlace(s)} style={{ aspectRatio: "1", background: T.white, borderRadius: 8, border: `0.5px solid ${T.sand}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 6 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.coral} onMouseLeave={e => e.currentTarget.style.borderColor = T.sand}>
                <img src={s.src} alt={s.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Draggable Photo (journal page) ────────────────────────────────────────────
const DraggablePhoto = ({ photo, onChange, onRemove }) => {
  const [pos,      setPos]      = useState({ x: photo.x, y: photo.y });
  const [size,     setSize]     = useState({ w: photo.w, h: photo.h });
  const [rot,      setRot]      = useState(photo.rot || 0);
  const [selected, setSelected] = useState(false);
  const dragOff    = useRef({ x: 0, y: 0 });
  const resizeRef  = useRef(null);
  const rotRef     = useRef(null);

  const onDragDown = (e) => {
    if (e.target.dataset.handle) return;
    e.preventDefault(); e.stopPropagation(); setSelected(true);
    dragOff.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    const onMove = (me) => setPos({ x: me.clientX - dragOff.current.x, y: me.clientY - dragOff.current.y });
    const onUp   = (me) => { onChange({ ...photo, x: me.clientX - dragOff.current.x, y: me.clientY - dragOff.current.y, rot }); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  const onResizeDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    resizeRef.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h };
    const onMove = (me) => { const dw = me.clientX - resizeRef.current.mx, dh = me.clientY - resizeRef.current.my; setSize({ w: Math.max(40, resizeRef.current.w + dw), h: Math.max(30, resizeRef.current.h + dh) }); };
    const onUp   = (me) => { const dw = me.clientX - resizeRef.current.mx, dh = me.clientY - resizeRef.current.my; onChange({ ...photo, x: pos.x, y: pos.y, w: Math.max(40, resizeRef.current.w + dw), h: Math.max(30, resizeRef.current.h + dh), rot }); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  const onRotDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    rotRef.current = { mx: e.clientX, rot };
    const onMove = (me) => setRot(rotRef.current.rot + (me.clientX - rotRef.current.mx) * 0.8);
    const onUp   = (me) => { const nr = rotRef.current.rot + (me.clientX - rotRef.current.mx) * 0.8; onChange({ ...photo, x: pos.x, y: pos.y, rot: nr }); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      onMouseDown={onDragDown}
      onClick={() => setSelected(true)}
      onBlur={() => setSelected(false)}
      tabIndex={0}
      style={{
        position: "absolute", left: pos.x, top: pos.y,
        width: size.w, height: size.h,
        transform: `rotate(${rot}deg)`, transformOrigin: "center center",
        cursor: "grab", userSelect: "none",
        zIndex: selected ? 30 : 5,   // always below stickers (stickers start at 10+)
        outline: "none", boxSizing: "border-box",
      }}
    >
      <img src={photo.src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2, display: "block", pointerEvents: "none", border: selected ? `1.5px solid ${T.coral}` : "1px solid rgba(0,0,0,0.08)" }} />
      {selected && (
        <div style={{ position: "absolute", inset: -14, pointerEvents: "none" }}>
          {/* Rotate handle — top center */}
          <div data-handle="rot" onMouseDown={onRotDown}
            style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 18, height: 18, borderRadius: "50%", background: T.coral, cursor: "ew-resize", pointerEvents: "all", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.white }}>↺</div>
          {/* Resize handle — bottom right */}
          <div data-handle="resize" onMouseDown={onResizeDown}
            style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, background: T.white, border: `1.5px solid ${T.coral}`, borderRadius: 2, cursor: "se-resize", pointerEvents: "all" }} />
          {/* Remove button — top right */}
          <button onMouseDown={e => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: "50%", background: T.coral, border: "none", cursor: "pointer", color: T.white, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "all" }}>✕</button>
        </div>
      )}
    </div>
  );
};

// ── Draggable Sticker ─────────────────────────────────────────────────────────
const PlacedSticker = ({ sticker, onRemove }) => {
  const [pos, setPos]       = useState(sticker.initialPos);
  const [rot, setRot]       = useState(sticker.rotation || 0);
  const [scale, setScale]   = useState(1);
  const [selected, setSelected] = useState(false);
  const [peeling, setPeeling]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const rotStart   = useRef(null);
  const scaleStart = useRef(null);

  const onMouseDown = useCallback((e) => {
    if (e.target.dataset.handle) return;
    e.preventDefault(); setPeeling(true); setSelected(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    const onMove = (me) => { setDragging(true); setPos({ x: me.clientX - dragOffset.current.x, y: me.clientY - dragOffset.current.y }); };
    const onUp   = () => { setPeeling(false); setDragging(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }, [pos]);

  const onRotDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    rotStart.current = { mx: e.clientX, rot };
    const onMove = (me) => setRot(rotStart.current.rot + (me.clientX - rotStart.current.mx) * 1.5);
    const onUp   = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  const onScaleDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    scaleStart.current = { mx: e.clientX, scale };
    const onMove = (me) => setScale(Math.max(0.3, Math.min(4, scaleStart.current.scale + (me.clientX - scaleStart.current.mx) * 0.01)));
    const onUp   = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  return (
    <div onMouseDown={onMouseDown} onDoubleClick={onRemove}
      style={{ position: "absolute", left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "grab", userSelect: "none", zIndex: peeling ? 200 : selected ? 50 : 10, transition: peeling ? "none" : "transform 0.2s", transform: `rotate(${rot}deg) scale(${scale * (peeling ? 1.08 : 1)}) ${peeling ? "translateY(-4px)" : ""}`, filter: peeling ? "drop-shadow(2px 4px 6px rgba(0,0,0,0.22))" : "drop-shadow(1px 2px 3px rgba(0,0,0,0.08))", transformOrigin: "center center" }}>
      <img src={sticker.src} alt={sticker.label} draggable={false} style={{ width: sticker.w, height: sticker.h, objectFit: "contain", display: "block" }} />
      {selected && !dragging && (
        <div style={{ position: "absolute", inset: -14, pointerEvents: "none" }}>
          {/* Rotate handle — top center */}
          <div data-handle="rot" onMouseDown={onRotDown} style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: T.coral, cursor: "ew-resize", pointerEvents: "all", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: T.white }}>↺</div>
          {/* Scale handle — bottom right */}
          <div data-handle="sc" onMouseDown={onScaleDown} style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: 2, background: T.white, border: `1.5px solid ${T.coral}`, cursor: "se-resize", pointerEvents: "all" }} />
        </div>
      )}
    </div>
  );
};

// ── SCREEN 1: Onboarding ──────────────────────────────────────────────────────
const OnboardingScreen = ({ onDone, goals, setGoals }) => {
  const [goalText, setGoalText] = useState("");
  const [showBox,  setShowBox]  = useState(false);

  const addGoal = () => {
    if (!goalText.trim()) return;
    setGoals(g => [...g, { id: Date.now(), text: goalText.trim() }]);
    setGoalText(""); setShowBox(false);
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <button onClick={() => setShowBox(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: T.coral, lineHeight: 1, padding: 0 }}>+</button>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.driftwood, borderBottom: `1px solid ${T.mist}`, paddingBottom: 2 }}>Who do you want to become?</span>
          </div>
          <Divider />
          {goals.length === 0 && <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic", marginTop: 8 }}>No identity goals yet — press + to begin</p>}
          {goals.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: T.coral, marginTop: 3 }}>●</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, lineHeight: 1.5 }}>{g.text}</span>
            </div>
          ))}
          {goals.length > 0 && <div style={{ marginTop: 16 }}><PillBtn onClick={onDone} small>Let's begin →</PillBtn></div>}
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 20px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.driftwood, fontStyle: "italic", textAlign: "center", lineHeight: 1.9 }}>"The gap between who you want<br />to be and who you are is closed<br />only through action."</p>
          <div style={{ width: 30, height: 1, background: T.stone, margin: "16px 0" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, textAlign: "center" }}>Start with one identity statement.</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, textAlign: "center", marginTop: 8, fontStyle: "italic" }}>e.g. "I am someone who moves<br />their body every day."</p>
        </div>
      </RightPage>
      {showBox && (
        <Modal onClose={() => setShowBox(false)}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 4 }}>Add an identity goal</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, marginBottom: 12, fontStyle: "italic" }}>Who do you want to become?</p>
          <input value={goalText} onChange={e => setGoalText(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="I am someone who..." autoFocus
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white, fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, outline: "none", marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <PillBtn variant="grey" onClick={() => setShowBox(false)} small>cancel</PillBtn>
            <PillBtn onClick={addGoal} small>save</PillBtn>
          </div>
        </Modal>
      )}
    </JournalSpread>
  );
};

// ── SCREEN 2: Menu ────────────────────────────────────────────────────────────
const MenuScreen = ({ onNav, checkins }) => {
  const streak = (() => {
    let count = 0, d = new Date();
    while (true) {
      const ci = checkins[d.toISOString().slice(0,10)];
      if (!ci?.entries || Object.keys(ci.entries).length === 0) break;
      count++; d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const links = [
    { label: "Dashboard",      icon: "⊞", screen: "dashboard" },
    { label: "Journal",        icon: "▤", screen: "journal"   },
    { label: "Calendar",       icon: "▦", screen: "calendar"  },
    { label: "Identity Goals", icon: "↗", screen: "goals"     },
    { label: "Tracker",        icon: "◉", screen: "tracker"   },
    { label: "Reports",        icon: "▨", screen: "reports"   },
    { label: "Settings",       icon: "✧", screen: "settings"  },
  ];

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "10px 16px" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 15, color: T.ink, fontWeight: 500 }}>Menu</span>
          <Divider />
          {links.map((l, i) => (
            <button key={i} onClick={() => onNav(l.screen)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 0", background: "none", border: "none", borderBottom: `0.5px solid ${T.sand}`, cursor: "pointer", textAlign: "left" }}>
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
          <p style={{ fontFamily: "Georgia, serif", fontSize: 18, color: T.driftwood, textAlign: "center", margin: "0 0 16px", letterSpacing: "0.06em" }}>49/51</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, fontStyle: "italic", color: T.bark, textAlign: "center", margin: "-10px 0 16px" }}>iykyk :p</p>
          <div style={{ width: 24, height: 1, background: T.stone, marginBottom: 16 }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.bark, marginBottom: 24, letterSpacing: "0.04em" }}>{new Date().toLocaleString("default", { month: "long", year: "numeric" })}</p>
          <div style={{ background: T.cream, borderRadius: 40, padding: "8px 18px", border: `0.5px solid ${T.sand}`, textAlign: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "0 0 2px" }}>current streak</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 22, color: T.coral, margin: 0, lineHeight: 1.2 }}>{streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "—"}</p>
          </div>
          <div style={{ width: 40, height: 1, background: T.stone, marginTop: 24 }} />
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3: Dashboard ───────────────────────────────────────────────────────
const DashboardScreen = ({ onNav, goals, checkins, calendarPhotos }) => {
  const today   = new Date();
  const key     = todayKey();
  const entries = checkins[key]?.entries || {};
  const allCheckedIn = goals.length > 0 && goals.every(g => entries[g.id]?.checkIn);

  const dayName  = today.toLocaleString("default", { weekday: "long" });
  const dateLong = today.toLocaleString("default", { month: "long", day: "numeric" });
  const year = today.getFullYear(), month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month+1, 0).getDate();
  const calDays = []; for (let i = 0; i < firstDay; i++) calDays.push(null); for (let d = 1; d <= daysInMonth; d++) calDays.push(d); while (calDays.length % 7 !== 0) calDays.push(null);
  const weeks = []; for (let i = 0; i < calDays.length; i += 7) weeks.push(calDays.slice(i, i+7));

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <MenuIcon onClick={() => onNav("menu")} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.bark }}>{dateLong}</span>
          </div>
          <Divider my={6} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, margin: "0 0 10px", fontWeight: 500 }}>Identity Goals</p>
          {goals.length === 0 ? (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>No goals yet — <button onClick={() => onNav("goals")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 11, color: T.coral, textDecoration: "underline", padding: 0 }}>add one</button></p>
          ) : (
            goals.map(g => {
              const checked = !!entries[g.id]?.checkIn;
              return (
                <div key={g.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: `0.5px solid ${T.sand}` }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 2, border: `1.5px solid ${checked ? T.coral : T.mist}`, background: checked ? T.coral : "transparent", transition: "all 0.2s" }} />
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: checked ? T.mist : T.ink, textDecoration: checked ? "line-through" : "none", lineHeight: 1.5, transition: "all 0.2s" }}>{g.text}</span>
                </div>
              );
            })
          )}
          {goals.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              {allCheckedIn
                ? <PillBtn small variant="ghost" onClick={() => onNav("mirror")}>View Mirror →</PillBtn>
                : <PillBtn small onClick={() => onNav("checkin")}>Begin Check-In →</PillBtn>
              }
            </div>
          )}
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ padding: "8px 10px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, margin: "0 0 1px" }}>Good to see you,</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.bark, margin: "0 0 6px" }}>{dayName}, {dateLong} ✦</p>
          <Divider my={4} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.bark, margin: 0, letterSpacing: "0.04em" }}>{today.toLocaleString("default", { month: "long", year: "numeric" })}</p>
            <button onClick={() => onNav("calendar")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 9, color: T.coral, padding: 0 }}>open →</button>
          </div>
          <div style={{ display: "flex", borderBottom: `0.5px solid ${T.stone}`, marginBottom: 0 }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} style={{ flex: 1, textAlign: "center", fontFamily: "Georgia, serif", fontSize: 8, color: T.driftwood, padding: "2px 0" }}>{d}</div>
            ))}
          </div>
          {(() => {
            const mKey = `${year}-${String(month+1).padStart(2,"0")}`;
            const mPhotos = calendarPhotos[mKey] || {};
            const cellH = Math.floor((calDays.length / 7) <= 5 ? 42 : 36);
            return weeks.map((w, wi) => (
              <div key={wi} style={{ display: "flex" }}>
                {w.map((d, di) => {
                  const dk = d ? `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : null;
                  const isToday = d === today.getDate();
                  const photo = d ? mPhotos[d] : null;
                  return (
                    <div key={di} onClick={() => dk && onNav("dayreport", { dateKey: dk })} style={{ flex: 1, height: cellH, border: `0.5px solid ${T.stone}`, boxSizing: "border-box", cursor: d ? "pointer" : "default", position: "relative", overflow: "hidden", background: "transparent" }}>
                      {photo && <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />}
                      {d && <span style={{ position: "absolute", top: 1, left: 2, fontFamily: "Georgia, serif", fontSize: 8, color: isToday ? T.white : photo ? T.white : T.ink, background: isToday ? T.coral : "transparent", borderRadius: "50%", width: 13, height: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", zIndex: 2, textShadow: photo && !isToday ? "0 0 3px rgba(0,0,0,0.7)" : "none" }}>{d}</span>}
                    </div>
                  );
                })}
              </div>
            ));
          })()}
          <Divider my={4} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PillBtn small variant="ghost" onClick={() => onNav("journal")}>open journal</PillBtn>
          </div>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3b: Check-In ───────────────────────────────────────────────────────
const CheckInScreen = ({ onNav, goals, checkins, setCheckins }) => {
  const key     = todayKey();
  const entries = checkins[key]?.entries || {};
  const [idx, setIdx]   = useState(0);
  const [text, setText] = useState(() => entries[goals[0]?.id]?.checkIn || "");

  if (goals.length === 0) { onNav("dashboard"); return null; }
  const current = goals[idx], isLast = idx === goals.length - 1;

  const saveAndAdvance = () => {
    setCheckins(c => ({
      ...c,
      [key]: {
        ...(c[key] || {}),
        entries: {
          ...(c[key]?.entries || {}),
          [current.id]: { ...(c[key]?.entries?.[current.id] || {}), checkIn: text.trim() }
        }
      }
    }));
    if (isLast) {
      onNav("mirror");
    } else {
      const nextId = goals[idx + 1]?.id;
      setText(entries[nextId]?.checkIn || "");
      setIdx(i => i + 1);
    }
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.mist, letterSpacing: "0.06em", margin: "0 0 8px" }}>CHECK-IN — {idx + 1} of {goals.length}</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.04em", margin: "0 0 4px" }}>who I want to be</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 10px" }}>"{current.text}"</p>
          <Divider my={8} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.04em", margin: "0 0 8px" }}>who I was today</p>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write honestly about what you actually did..." autoFocus rows={5}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.stone}`, background: "rgba(255,255,255,0.5)", fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, outline: "none", resize: "none", lineHeight: 1.7, flex: 1 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <PillBtn variant="ghost" small onClick={saveAndAdvance}>skip</PillBtn>
            <PillBtn small onClick={saveAndAdvance}>{isLast ? "done →" : "next →"}</PillBtn>
          </div>
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 20px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.9, textAlign: "center" }}>"Honesty is not<br />a punishment.<br />It's the beginning<br />of change."</p>
          <div style={{ width: 30, height: 1, background: T.stone, margin: "16px auto" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, textAlign: "center" }}>Goal {idx + 1} of {goals.length}</p>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3c: The Mirror ─────────────────────────────────────────────────────
const MirrorScreen = ({ onNav, goals, checkins }) => {
  const key     = todayKey();
  const entries = checkins[key]?.entries || {};
  const [idx, setIdx] = useState(0);

  if (goals.length === 0) { onNav("dashboard"); return null; }
  const current = goals[idx], isLast = idx === goals.length - 1;
  const checkIn = entries[current.id]?.checkIn || "";

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <MenuIcon onClick={() => onNav("menu")} />
            <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.coral, letterSpacing: "0.1em", margin: 0 }}>THE MIRROR</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.mist, margin: 0 }}>{idx + 1} / {goals.length}</p>
          </div>
          <Divider my={6} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.04em", margin: "0 0 5px" }}>who I want to be</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 12px" }}>"{current.text}"</p>
          <Divider my={6} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.04em", margin: "0 0 5px" }}>who I was today</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: checkIn ? T.ink : T.mist, lineHeight: 1.6, fontStyle: checkIn ? "normal" : "italic", flex: 1 }}>{checkIn || "no entry recorded"}</p>
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 20px", gap: 10 }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, fontStyle: "italic", lineHeight: 1.9, textAlign: "center", margin: 0 }}>"The gap is visible.<br />No judgment —<br />just truth."</p>
          <div style={{ width: 30, height: 1, background: T.stone, alignSelf: "center" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            {!isLast && <PillBtn small variant="ghost" onClick={() => setIdx(i => i + 1)}>next goal →</PillBtn>}
            <PillBtn small onClick={() => onNav("actionplan")}>Write Action Plan →</PillBtn>
            {idx > 0 && <button onClick={() => setIdx(i => i - 1)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 10, color: T.mist }}>← prev</button>}
          </div>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3d: Action Plan ────────────────────────────────────────────────────
const ActionPlanScreen = ({ onNav, goals, checkins, setCheckins }) => {
  const key     = todayKey();
  const entries = checkins[key]?.entries || {};
  const [idx, setIdx]   = useState(0);
  const [text, setText] = useState(() => entries[goals[0]?.id]?.actionPlan || "");

  if (goals.length === 0) { onNav("dashboard"); return null; }
  const current = goals[idx], isLast = idx === goals.length - 1;
  const checkIn = entries[current.id]?.checkIn || "";

  const saveAndAdvance = () => {
    setCheckins(c => ({
      ...c,
      [key]: {
        ...(c[key] || {}),
        entries: {
          ...(c[key]?.entries || {}),
          [current.id]: { ...(c[key]?.entries?.[current.id] || {}), actionPlan: text.trim() }
        }
      }
    }));
    if (isLast) {
      onNav("summary");
    } else {
      const nextId = goals[idx + 1]?.id;
      setText(entries[nextId]?.actionPlan || "");
      setIdx(i => i + 1);
    }
  };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.coral, letterSpacing: "0.08em", margin: "0 0 8px" }}>ACTION PLAN — {idx + 1} of {goals.length}</p>
          <div style={{ background: "rgba(255,255,255,0.4)", borderRadius: 10, padding: "8px 10px", marginBottom: 8, border: `0.5px solid ${T.sand}` }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.03em", margin: "0 0 3px" }}>identity</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 6px" }}>{current.text}</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.03em", margin: "0 0 3px" }}>today</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: checkIn ? T.driftwood : T.mist, lineHeight: 1.5, margin: 0, fontStyle: checkIn ? "normal" : "italic" }}>{checkIn || "no entry"}</p>
          </div>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 8px" }}>"What is one specific thing you will do next time to get closer to who you want to be?"</p>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Next time I will..." autoFocus rows={4}
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.stone}`, background: "rgba(255,255,255,0.5)", fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, outline: "none", resize: "none", lineHeight: 1.7, flex: 1 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <PillBtn variant="ghost" small onClick={saveAndAdvance}>skip</PillBtn>
            <PillBtn small onClick={saveAndAdvance}>{isLast ? "done →" : "next →"}</PillBtn>
          </div>
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 20px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.9, textAlign: "center" }}>"The gap is closed<br />only through action."</p>
          <div style={{ width: 30, height: 1, background: T.stone, margin: "16px auto" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, textAlign: "center" }}>One concrete step forward.</p>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3e: Summary ────────────────────────────────────────────────────────
const SummaryScreen = ({ onNav, goals, checkins }) => {
  const key     = todayKey();
  const entries = checkins[key]?.entries || {};
  const allDone = goals.length > 0 && goals.every(g => entries[g.id]?.checkIn);
  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "12px 16px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500, margin: "0 0 2px" }}>Today's Check-In</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, margin: "0 0 10px" }}>{new Date().toLocaleString("default", { month: "long", day: "numeric", year: "numeric" })}</p>
          <Divider my={6} />
          <div style={{ overflowY: "auto", maxHeight: 340 }}>
            {goals.map(g => {
              const e = entries[g.id] || {};
              return (
                <div key={g.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ color: e.checkIn ? T.coral : T.mist, fontSize: 10, marginTop: 2, flexShrink: 0 }}>{e.checkIn ? "✓" : "—"}</span>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>{g.text}</p>
                  </div>
                  {e.actionPlan && <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "3px 0 0 16px", lineHeight: 1.5 }}>→ {e.actionPlan}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 20px", gap: 12 }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.8, textAlign: "center", margin: 0 }}>{allDone ? '"You showed up for every part of yourself today. ✦"' : '"Every step toward the gap is growth."'}</p>
          <div style={{ width: 30, height: 1, background: T.stone }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", alignItems: "center" }}>
            <PillBtn small onClick={() => onNav("journal")}>+ open journal</PillBtn>
            <PillBtn small variant="ghost" onClick={() => onNav("dashboard")}>back to today</PillBtn>
          </div>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 3f: Day Report ─────────────────────────────────────────────────────
const DayReportScreen = ({ onNav, goals, checkins, journalEntries, setJournalEntries, dateKey }) => {
  const ci      = checkins[dateKey] || {};
  const entries = ci.entries || {};
  const entry   = journalEntries[dateKey] || { text: "" };
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);
  const dateLabel = new Date(dateKey + "T00:00:00").toLocaleString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const saveEntry = () => { setJournalEntries(j => ({ ...j, [dateKey]: { ...entry, text } })); setEditing(false); };
  const hasData = Object.keys(entries).length > 0;

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "10px 16px" }}>
          <button onClick={() => onNav("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, padding: 0, marginBottom: 6 }}>← back</button>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, fontWeight: 500, margin: "0 0 2px" }}>{dateLabel}</p>
          <Divider my={6} />
          {!hasData ? <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>No check-in recorded for this day.</p> : (
            <div style={{ overflowY: "auto", maxHeight: 360 }}>
              {goals.map(g => {
                const e = entries[g.id];
                if (!e) return null;
                return (
                  <div key={g.id} style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, fontStyle: "italic", margin: "0 0 2px", lineHeight: 1.4 }}>{g.text}</p>
                    {e.checkIn && <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "0 0 2px", lineHeight: 1.5 }}>{e.checkIn}</p>}
                    {e.actionPlan && <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.coral, margin: 0, lineHeight: 1.5 }}>→ {e.actionPlan}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: 0, fontWeight: 500 }}>Journal Entry</p>
            {!editing && <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 10, color: T.coral }}>{entry.text ? "edit ✎" : "+ add entry"}</button>}
          </div>
          <Divider my={4} />
          {editing ? (
            <><textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write something about this day..." autoFocus rows={8}
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.stone}`, background: "rgba(255,255,255,0.5)", fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, outline: "none", resize: "none", lineHeight: 1.7 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}><PillBtn variant="grey" small onClick={() => { setEditing(false); setText(entry.text); }}>cancel</PillBtn><PillBtn small onClick={saveEntry}>save</PillBtn></div></>
          ) : <p style={{ fontFamily: "Georgia, serif", fontSize: 11, lineHeight: 1.7, color: entry.text ? T.ink : T.mist, fontStyle: entry.text ? "normal" : "italic" }}>{entry.text || "No entry yet."}</p>}
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 4: Identity Goals ──────────────────────────────────────────────────
const GoalsScreen = ({ onNav, goals, setGoals }) => {
  const [showAdd, setShowAdd]     = useState(false);
  const [newText, setNewText]     = useState("");
  const [deleting, setDeleting]   = useState(null);
  const [delReason, setDelReason] = useState("");
  const [editing, setEditing]     = useState(null);
  const [editText, setEditText]   = useState("");

  const addGoal = () => { if (!newText.trim()) return; setGoals(g => [...g, { id: Date.now(), text: newText.trim() }]); setNewText(""); setShowAdd(false); };
  const confirmDelete = () => { const g = deleting, r = delReason; setGoals(gs => gs.filter(x => x.id !== g.id)); setDeleting(null); setDelReason(""); onNav("deleteresponse", { habit: g.text, reason: r }); };
  const saveEdit = () => { setGoals(gs => gs.map(x => x.id === editing.id ? { ...x, text: editText } : x)); setEditing(null); };

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <MenuIcon onClick={() => onNav("menu")} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Identity Goals</span>
            <button onClick={() => setShowAdd(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.coral, lineHeight: 1 }}>+</button>
          </div>
          <Divider my={6} />
          {goals.length === 0 ? <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic", marginTop: 8 }}>No goals yet — press + to add one</p> : (
            goals.map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "6px 0", borderBottom: `0.5px solid ${T.sand}` }}>
                <span style={{ fontSize: 8, color: T.coral, marginTop: 4, flexShrink: 0 }}>●</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, flex: 1, lineHeight: 1.5 }}>{g.text}</span>
                <button onClick={() => { setEditing(g); setEditText(g.text); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.driftwood, flexShrink: 0 }}>✎</button>
                <button onClick={() => setDeleting(g)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.coral, flexShrink: 0 }}>✕</button>
              </div>
            ))
          )}
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 20px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.driftwood, fontStyle: "italic", textAlign: "center", lineHeight: 1.9 }}>"Identity is not who you have been.<br />It's who you are<br />deciding to become."</p>
          <div style={{ width: 30, height: 1, background: T.stone, margin: "16px 0" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, textAlign: "center" }}>{goals.length} identity goal{goals.length !== 1 ? "s" : ""}</p>
        </div>
      </RightPage>
      {showAdd && <Modal onClose={() => setShowAdd(false)}><p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 4 }}>Add an identity goal</p><p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, marginBottom: 12, fontStyle: "italic" }}>Who do you want to become?</p><input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="I am someone who..." autoFocus style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white, fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, outline: "none", marginBottom: 14 }} /><div style={{ display: "flex", gap: 8 }}><PillBtn variant="grey" small onClick={() => setShowAdd(false)}>cancel</PillBtn><PillBtn small onClick={addGoal}>save</PillBtn></div></Modal>}
      {deleting && <Modal onClose={() => { setDeleting(null); setDelReason(""); }}><p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 4 }}>Why are you letting go of <em style={{ color: T.coral }}>"{deleting.text}"</em>?</p><p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, marginBottom: 12 }}>Take a moment to reflect before moving on.</p><textarea value={delReason} onChange={e => setDelReason(e.target.value)} placeholder="I'm letting this go because..." autoFocus rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white, fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, outline: "none", resize: "none", marginBottom: 14 }} /><div style={{ display: "flex", gap: 10 }}><PillBtn variant="grey" small onClick={() => { setDeleting(null); setDelReason(""); }}>cancel</PillBtn><PillBtn small onClick={confirmDelete}>let it go →</PillBtn></div></Modal>}
      {editing && <Modal onClose={() => setEditing(null)}><p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, marginBottom: 12 }}>Edit identity goal</p><input value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()} autoFocus style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.stone}`, background: T.white, fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, outline: "none", marginBottom: 14 }} /><div style={{ display: "flex", gap: 8 }}><PillBtn variant="grey" small onClick={() => setEditing(null)}>cancel</PillBtn><PillBtn small onClick={saveEdit}>save</PillBtn></div></Modal>}
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
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, lineHeight: 1.7, fontStyle: "italic", flex: 1 }}>{reason || <span style={{ color: T.mist }}>—</span>}</p>
        <PillBtn small onClick={() => onNav("goals")} style={{ alignSelf: "flex-start", marginTop: 16 }}>← back to goals</PillBtn>
      </div>
    </LeftPage>
    <RightPage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 20px" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.8, textAlign: "center" }}>"Not every goal is meant to last forever.<br />What matters is that you showed up."</p>
        <div style={{ width: 30, height: 1, background: T.stone, margin: "16px 0" }} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, textAlign: "center" }}>Goal removed. Your reflection has been noted.</p>
      </div>
    </RightPage>
  </JournalSpread>
);

// ── Journal page constants ─────────────────────────────────────────────────────
const JP = {
  headerH:     46,
  gridSize:    10,
  gridColor:   "rgba(155, 128, 100, 0.12)",
  bg:          "rgba(242, 233, 221, 0.72)",
  borderColor: "rgba(155, 128, 100, 0.16)",
  titleBoxH:   30,
};

// Pure visual layer — grid paper with optional title box
const JournalPageBg = ({ noHeader = false, flip = false }) => (
  <div style={{
    position: "absolute", inset: 0,
    background: JP.bg,
    backgroundImage: [
      `repeating-linear-gradient(0deg,   ${JP.gridColor} 0, ${JP.gridColor} 0.5px, transparent 0.5px, transparent ${JP.gridSize}px)`,
      `repeating-linear-gradient(90deg,  ${JP.gridColor} 0, ${JP.gridColor} 0.5px, transparent 0.5px, transparent ${JP.gridSize}px)`,
    ].join(", "),
    transform: flip ? "scaleX(-1)" : "none",
    pointerEvents: "none",
    overflow: "hidden",
  }}>
    {!noHeader && (
      <div style={{
        position: "absolute", top: 8, left: 8, right: 8,
        height: JP.titleBoxH,
        border: `0.75px solid ${JP.borderColor}`,
        background: "rgba(255,250,244,0.35)",
        borderRadius: 2,
      }} />
    )}
  </div>
);

// ── SCREEN 5: Journal ─────────────────────────────────────────────────────────
const JournalScreen = ({ onNav, journalEntries, setJournalEntries }) => {
  const [journalDate, setJournalDate] = useState(new Date());
  const [stickerPanel, setStickerPanel] = useState(false);
  const photoRef = useRef();

  const key    = dateToKey(journalDate);
  const entry  = journalEntries[key] || { text: "", placedItems: [], photos: [] };
  const items  = entry.placedItems || [];
  const photos = entry.photos || [];

  const saveText   = (text)      => setJournalEntries(j => ({ ...j, [key]: { ...entry, text } }));
  const saveItems  = (newItems)  => setJournalEntries(j => ({ ...j, [key]: { ...entry, placedItems: newItems } }));
  const savePhotos = (newPhotos) => setJournalEntries(j => ({ ...j, [key]: { ...entry, photos: newPhotos } }));

  const prevDay = () => setJournalDate(d => shiftDate(d, -1));
  const nextDay = () => setJournalDate(d => shiftDate(d, 1));

  const isToday   = key === todayKey();
  const dateLabel = journalDate.toLocaleString("default", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const placeSticker = (sticker) => {
    saveItems([...items, { ...sticker, uid: Date.now(), initialPos: { x: 30 + Math.random() * 500, y: 30 + Math.random() * 380 }, rotation: -8 + Math.random() * 16 }]);
    setStickerPanel(false);
  };

  const handlePhotoFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => savePhotos([...photos, { id: Date.now(), src: ev.target.result, x: 20, y: 20, w: 120, h: 90 }]);
    reader.readAsDataURL(file); e.target.value = "";
  };

  return (
    <JournalSpread>
      {/* ── Left page: writing surface ── */}
      <LeftPage>
        <JournalPageBg />


        {/* Header: title box with date + nav */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: JP.headerH, zIndex: 20 }}>
          {/* Weekday tracker — top-left corner of paper */}
          {(() => {
            const dow = journalDate.getDay(); // 0=Sun
            const days = ["S","M","T","W","T","F","S"];
            return (
              <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 2, zIndex: 21 }}>
                {days.map((d, i) => {
                  const isActive = i === dow;
                  return (
                    <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? T.coral : "transparent", border: isActive ? "none" : `0.5px solid ${JP.borderColor}` }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 6, color: isActive ? T.white : T.driftwood }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          {/* Title box contents: arrows + date (shifted right to clear tracker) */}
          <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: JP.titleBoxH, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
            <button onClick={prevDay} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13, color: T.driftwood, lineHeight: 1, padding: 0 }}>←</button>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, fontStyle: "italic" }}>
              {isToday ? "today" : dateLabel}
            </span>
            <button onClick={nextDay} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13, color: T.driftwood, lineHeight: 1, padding: 0 }}>→</button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={entry.text || ""}
          onChange={e => saveText(e.target.value)}
          placeholder="Write your thoughts here..."
          style={{
            position: "absolute",
            top: JP.headerH + 6,
            left: 10, right: 6, bottom: 6,
            background: "transparent",
            border: "none", outline: "none", resize: "none",
            fontFamily: "Georgia, serif", fontSize: 11.5, color: T.ink,
            lineHeight: "1.7",
            padding: 0, letterSpacing: "0.01em",
            zIndex: 10,
          }}
        />
      </LeftPage>

      {/* ── Right page: decoration + photos ── */}
      <RightPage>
        <JournalPageBg noHeader flip />

        {/* Controls */}
        <div style={{ position: "absolute", top: 6, left: 6, zIndex: 20 }}>
          <MenuIcon onClick={() => onNav("menu")} />
        </div>
        <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4, zIndex: 20 }}>
          <PillBtn small variant="ghost" onClick={() => photoRef.current?.click()}>+ photo</PillBtn>
          <PillBtn small variant="ghost" onClick={() => setStickerPanel(s => !s)}>+ sticker</PillBtn>
        </div>

        {photos.map(ph => (
          <DraggablePhoto key={ph.id} photo={ph}
            onChange={updated => savePhotos(photos.map(p => p.id === ph.id ? updated : p))}
            onRemove={() => savePhotos(photos.filter(p => p.id !== ph.id))}
          />
        ))}
        <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoFile} style={{ display: "none" }} />
      </RightPage>

      {/* Placed stickers — span entire spread */}
      {items.map(s => <PlacedSticker key={s.uid} sticker={s} onRemove={() => saveItems(items.filter(x => x.uid !== s.uid))} />)}

      {stickerPanel && <StickerPanel onClose={() => setStickerPanel(false)} onPlace={placeSticker} />}
    </JournalSpread>
  );
};

// ── SCREEN 6: Calendar — full spread photo calendar ───────────────────────────
const CalendarScreen = ({ onNav, calendarPhotos, setCalendarPhotos, calendarStickers, setCalendarStickers, calendarPhotoConfig, setCalendarPhotoConfig }) => {
  const [viewDate,       setViewDate]     = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }));
  const [hoveredCell,    setHoveredCell]  = useState(null);
  const [stickerPanel,   setStickerPanel] = useState(false);
  const [uploadingDay,   setUploadingDay] = useState(null);
  const [adjustingCell,  setAdjustingCell] = useState(null); // {day, pos: {x,y}, zoom}
  const fileRef = useRef();

  const { year, month } = viewDate;
  const monthKey  = `${year}-${String(month + 1).padStart(2, "0")}`;
  const photos    = calendarPhotos[monthKey]  || {};
  const stickers  = calendarStickers[monthKey] || [];
  const configs   = calendarPhotoConfig[monthKey] || {};
  const today     = new Date();
  const isNow     = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => setViewDate(v => v.month === 0  ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () => setViewDate(v => v.month === 11 ? { year: v.year + 1, month: 0  } : { ...v, month: v.month + 1 });

  // Calendar grid
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = []; for (let i = 0; i < firstDay; i++) cells.push(null); for (let d = 1; d <= daysInMonth; d++) cells.push(d); while (cells.length % 7 !== 0) cells.push(null);
  const rows = []; for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  // Full-spread layout constants
  const GL = 82, GT = 77, GW = 571, GH = 434;
  const HEADER_H = 30, LABEL_H = 20;
  const CELL_W = GW / 7;
  const CELL_H = (GH - HEADER_H - LABEL_H) / rows.length;
  const GRID_Y = GT + HEADER_H + LABEL_H;

  const handleCellClick = (day) => {
    if (!day) return;
    setUploadingDay(day);
    setTimeout(() => fileRef.current?.click(), 0);
  };

  const removePhoto = (day, e) => {
    e.stopPropagation();
    setCalendarPhotos(p => { const m = { ...(p[monthKey] || {}) }; delete m[day]; return { ...p, [monthKey]: m }; });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingDay) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCalendarPhotos(p => ({ ...p, [monthKey]: { ...(p[monthKey] || {}), [uploadingDay]: ev.target.result } }));
    reader.readAsDataURL(file);
    e.target.value = ""; setUploadingDay(null);
  };

  const placeSticker = (sticker) => {
    const s = { ...sticker, uid: Date.now(), initialPos: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 }, rotation: -8 + Math.random() * 16 };
    setCalendarStickers(cs => ({ ...cs, [monthKey]: [...stickers, s] }));
    setStickerPanel(false);
  };

  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <JournalSpread>
      {/* Month header row — spans full spread */}
      <div style={{ position: "absolute", left: GL, top: GT, width: GW, height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 20, paddingRight: 4 }}>
        <MenuIcon onClick={() => onNav("menu")} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 18, color: T.driftwood, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 14, color: T.ink, letterSpacing: "0.05em", fontWeight: 500 }}>{monthName}</span>
          <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 18, color: T.driftwood, lineHeight: 1 }}>→</button>
        </div>
        <PillBtn small variant="ghost" onClick={() => setStickerPanel(s => !s)}>+ sticker</PillBtn>
      </div>

      {/* Day-of-week labels — spans full spread */}
      <div style={{ position: "absolute", left: GL, top: GT + HEADER_H, width: GW, height: LABEL_H, display: "flex", zIndex: 15, borderBottom: `0.5px solid ${T.stone}` }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} style={{ width: CELL_W, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 9, color: T.driftwood, letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      {rows.map((row, ri) => row.map((day, ci) => {
        const x = GL + ci * CELL_W, y = GRID_Y + ri * CELL_H;
        const isToday = isNow && day === today.getDate();
        const photo   = day ? photos[day] : null;
        const cfg     = day ? (configs[day] || { ox: 50, oy: 50, zoom: 1 }) : null;
        const cellKey = `${ri}-${ci}`;
        const hovered = hoveredCell === cellKey;
        const adjusting = adjustingCell?.day === day;

        return (
          <div key={cellKey}
            onMouseEnter={() => day && setHoveredCell(cellKey)}
            onMouseLeave={() => !adjusting && setHoveredCell(null)}
            style={{ position: "absolute", left: x, top: y, width: CELL_W, height: CELL_H, border: `0.5px solid ${T.stone}`, boxSizing: "border-box", cursor: day ? "pointer" : "default", overflow: "hidden", zIndex: 8, background: hovered && !photo ? "rgba(232,221,208,0.3)" : "transparent", transition: "background 0.15s" }}>

            {/* Photo fill with configurable fit */}
            {photo && <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${cfg?.ox ?? 50}% ${cfg?.oy ?? 50}%`, transform: `scale(${cfg?.zoom || 1})`, transformOrigin: `${cfg?.ox ?? 50}% ${cfg?.oy ?? 50}%` }} />}

            {/* Day number */}
            {day && <span style={{ position: "absolute", top: 3, left: 4, zIndex: 2, fontFamily: "Georgia, serif", fontSize: 9, color: isToday ? T.white : photo ? T.white : T.ink, background: isToday ? T.coral : "transparent", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", textShadow: photo && !isToday ? "0 0 4px rgba(0,0,0,0.6)" : "none" }}>{day}</span>}

            {/* Hover controls */}
            {day && hovered && !photo && <div onClick={() => handleCellClick(day)} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "Georgia, serif", fontSize: 20, color: T.mist }}>+</span></div>}
            {photo && hovered && (
              <div style={{ position: "absolute", bottom: 2, right: 2, display: "flex", gap: 2, zIndex: 5 }}>
                <button onClick={e => { e.stopPropagation(); setAdjustingCell({ day, ox: cfg.ox ?? 50, oy: cfg.oy ?? 50, zoom: cfg.zoom ?? 1 }); }} style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 3, color: T.white, fontSize: 8, cursor: "pointer", padding: "2px 4px", fontFamily: "Georgia, serif" }}>adjust</button>
                <button onClick={e => { e.stopPropagation(); handleCellClick(day); }} style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 3, color: T.white, fontSize: 8, cursor: "pointer", padding: "2px 4px", fontFamily: "Georgia, serif" }}>replace</button>
                <button onClick={e => removePhoto(day, e)} style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 16, height: 16, cursor: "pointer", color: T.white, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>✕</button>
              </div>
            )}
          </div>
        );
      }))}

      {/* Photo adjust modal */}
      {adjustingCell && (() => {
        const cfg = adjustingCell;
        const saveConfig = (c) => { setCalendarPhotoConfig(pc => ({ ...pc, [monthKey]: { ...(pc[monthKey] || {}), [cfg.day]: c } })); };
        const previewPhoto = photos[cfg.day];
        return (
          <div style={{ position: "absolute", left: GL + GW/2 - 150, top: GT + GH/2 - 130, width: 300, background: T.cream, borderRadius: 14, border: `0.5px solid ${T.sand}`, padding: "14px 18px", zIndex: 200, boxShadow: "0 6px 24px rgba(0,0,0,0.18)" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: T.ink, margin: "0 0 10px" }}>Adjust photo — day {cfg.day}</p>
            {/* Live preview */}
            <div style={{ width: "100%", height: 100, borderRadius: 6, overflow: "hidden", marginBottom: 12, border: `0.5px solid ${T.stone}`, position: "relative" }}>
              <img src={previewPhoto} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${cfg.ox ?? 50}% ${cfg.oy ?? 50}%`, transform: `scale(${cfg.zoom || 1})`, transformOrigin: `${cfg.ox ?? 50}% ${cfg.oy ?? 50}%` }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "0 0 3px" }}>Zoom: {Math.round((cfg.zoom || 1) * 100)}%</p>
              <input type="range" min="1" max="3" step="0.05" value={cfg.zoom || 1} onChange={e => setAdjustingCell(a => ({ ...a, zoom: parseFloat(e.target.value) }))} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "0 0 3px" }}>Horizontal</p>
              <input type="range" min="0" max="100" value={cfg.ox ?? 50} onChange={e => setAdjustingCell(a => ({ ...a, ox: parseInt(e.target.value) }))} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "0 0 3px" }}>Vertical</p>
              <input type="range" min="0" max="100" value={cfg.oy ?? 50} onChange={e => setAdjustingCell(a => ({ ...a, oy: parseInt(e.target.value) }))} style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <PillBtn small variant="grey" onClick={() => setAdjustingCell(null)}>cancel</PillBtn>
              <PillBtn small onClick={() => { saveConfig({ ox: cfg.ox ?? 50, oy: cfg.oy ?? 50, zoom: cfg.zoom || 1 }); setAdjustingCell(null); }}>save</PillBtn>
            </div>
          </div>
        );
      })()}

      {/* Placed stickers — z-index above cells so they sit on top of photos */}
      {stickers.map(s => <PlacedSticker key={s.uid} sticker={s} onRemove={() => setCalendarStickers(cs => ({ ...cs, [monthKey]: stickers.filter(x => x.uid !== s.uid) }))} />)}

      {stickerPanel && <StickerPanel onClose={() => setStickerPanel(false)} onPlace={placeSticker} />}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </JournalSpread>
  );
};

// ── SCREEN 7: Tracker ─────────────────────────────────────────────────────────
const TrackerScreen = ({ onNav, goals, checkins }) => {
  const [view, setView] = useState("weekly");
  const getDays = (n) => { const d = []; for (let i = n-1; i >= 0; i--) { const x = new Date(); x.setDate(x.getDate()-i); d.push(x.toISOString().slice(0,10)); } return d; };
  const days = view === "weekly" ? getDays(7) : getDays(30);
  const totalDone = days.reduce((a, dk) => a + (checkins[dk]?.habits?.filter(h => h.done).length || 0), 0);
  const total = goals.length * days.length, pct = total > 0 ? Math.round((totalDone/total)*100) : 0;

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}><MenuIcon onClick={() => onNav("menu")} /><span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Habit Streaks</span></div>
          <Divider my={6} />
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>{["weekly","monthly"].map(v => <button key={v} onClick={() => setView(v)} style={{ fontFamily: "Georgia, serif", fontSize: 10, padding: "3px 10px", borderRadius: 20, border: `0.5px solid ${T.stone}`, cursor: "pointer", background: view===v?T.coral:"transparent", color: view===v?T.white:T.driftwood }}>{v}</button>)}</div>
          {goals.length === 0 ? <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.mist, fontStyle: "italic" }}>No goals yet.</p> : goals.map(g => (
            <div key={g.id} style={{ marginBottom: 10 }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: "0 0 4px" }}>{g.text}</p>
              <div style={{ display: "flex", gap: view==="weekly"?6:2, flexWrap: "wrap" }}>{days.map((dk,j) => { const done = checkins[dk]?.habits?.find(h => h.id===g.id)?.done||false, had=!!checkins[dk]; return <div key={j} style={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, background: done?T.coral:"transparent", border: `1.5px solid ${done?T.coral:had?T.stone:T.sand}` }} />; })}</div>
            </div>
          ))}
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, margin: "0 0 6px" }}>{view==="weekly"?"This Week":"This Month"}</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 30, color: T.coral, margin: "0 0 2px", lineHeight: 1 }}>{total>0?`${totalDone}/${total}`:"—"}</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, marginBottom: 12 }}>habits completed</p>
          <Divider my={4} />
          <div style={{ width: "100%" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, margin: "6px 0" }}>completion rate</p>
            <div style={{ height: 8, background: T.sand, borderRadius: 4 }}><div style={{ width: `${pct}%`, height: "100%", background: T.coral, borderRadius: 4, transition: "width 0.5s" }} /></div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.coral, margin: "4px 0 0", textAlign: "right" }}>{pct}%</p>
          </div>
          <Divider my={8} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.driftwood, fontStyle: "italic", textAlign: "center" }}>{goals.length===0?"Add some goals to start tracking.":"Keep going — you're building momentum! ✦"}</p>
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 8: Reports ─────────────────────────────────────────────────────────
const ReportsScreen = ({ onNav, goals, checkins }) => {
  const [tab, setTab] = useState("weekly");
  const getDays = () => { const n=tab==="weekly"?7:30, d=[]; for (let i=n-1;i>=0;i--){const x=new Date();x.setDate(x.getDate()-i);d.push(x.toISOString().slice(0,10));}return d; };
  const days = getDays();
  const getGoalPct = (id) => { const rel=days.filter(d=>checkins[d]?.habits?.some(h=>h.id===id)); if(!rel.length) return 0; return Math.round((rel.filter(d=>checkins[d].habits.find(h=>h.id===id)?.done).length/rel.length)*100); };
  const recent = days.slice(-5).flatMap(d => { const ci=checkins[d]; if(!ci?.reflections) return []; return Object.entries(ci.reflections).map(([id,text])=>({date:d,habit:ci.habits?.find(h=>String(h.id)===String(id))?.label||"",text})); }).slice(0,4);
  const rangeLabel = tab==="weekly" ? `${new Date(days[0]+"T00:00:00").toLocaleString("default",{month:"short",day:"numeric"})} – ${new Date(days[days.length-1]+"T00:00:00").toLocaleString("default",{month:"short",day:"numeric"})}` : new Date().toLocaleString("default",{month:"long",year:"numeric"});

  return (
    <JournalSpread>
      <LeftPage>
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}><MenuIcon onClick={() => onNav("menu")} /><span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Reports</span></div>
          <div style={{ display: "flex", gap: 8, margin: "4px 0 6px" }}>{["weekly","monthly"].map(t=><button key={t} onClick={()=>setTab(t)} style={{ fontFamily:"Georgia,serif",fontSize:10,padding:"3px 10px",borderRadius:20,border:`0.5px solid ${T.stone}`,cursor:"pointer",background:tab===t?T.coral:"transparent",color:tab===t?T.white:T.driftwood }}>{t}</button>)}</div>
          <Divider my={4} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist, margin: "0 0 8px" }}>{rangeLabel}</p>
          {goals.length===0?<p style={{ fontFamily:"Georgia,serif",fontSize:11,color:T.mist,fontStyle:"italic" }}>No goals to report on yet.</p>:goals.map(g=>{const pct=getGoalPct(g.id);return(<div key={g.id} style={{ marginBottom:8 }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:2 }}><span style={{ fontFamily:"Georgia,serif",fontSize:10,color:T.ink }}>{g.text}</span><span style={{ fontFamily:"Georgia,serif",fontSize:10,color:T.mist }}>{pct}%</span></div><div style={{ height:6,background:T.sand,borderRadius:3 }}><div style={{ width:`${pct}%`,height:"100%",background:T.coral,borderRadius:3,transition:"width 0.5s" }} /></div></div>);})}
        </div>
      </LeftPage>
      <RightPage>
        <div style={{ padding: "12px 12px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.ink, margin: "0 0 10px" }}>Recent Reflections</p>
          {recent.length===0?<p style={{ fontFamily:"Georgia,serif",fontSize:11,color:T.mist,fontStyle:"italic" }}>No reflections yet.</p>:recent.map((r,i)=><div key={i} style={{ marginBottom:10 }}><p style={{ fontFamily:"Georgia,serif",fontSize:9,color:T.coral,margin:"0 0 2px",letterSpacing:"0.04em" }}>{r.habit} · {new Date(r.date+"T00:00:00").toLocaleString("default",{month:"short",day:"numeric"})}</p><p style={{ fontFamily:"Georgia,serif",fontSize:10,color:T.ink,fontStyle:"italic",lineHeight:1.5,margin:0 }}>"{r.text}"</p></div>)}
        </div>
      </RightPage>
    </JournalSpread>
  );
};

// ── SCREEN 9: Settings ────────────────────────────────────────────────────────
const SettingsScreen = ({ onNav, theme, setTheme }) => (
  <JournalSpread>
    <LeftPage>
      <div style={{ padding: "8px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><MenuIcon onClick={() => onNav("menu")} /><span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: T.ink, fontWeight: 500 }}>Settings</span></div>
        <Divider />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: T.driftwood, margin: "8px 0 6px" }}>Theme</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>{["light","dark"].map(t=><button key={t} onClick={()=>setTheme(t)} style={{ display:"flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",padding:0 }}><div style={{ width:12,height:12,borderRadius:"50%",border:`1.5px solid ${T.mist}`,background:theme===t?T.coral:"transparent",transition:"background 0.2s" }} /><span style={{ fontFamily:"Georgia,serif",fontSize:12,color:T.ink }}>{t}</span></button>)}</div>
        <Divider my={12} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: T.mist }}>Version 1.0</p>
      </div>
    </LeftPage>
    <RightPage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 16px" }}>
        <div style={{ width: 40, height: 1, background: T.stone, marginBottom: 20 }} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: T.driftwood, lineHeight: 1.7, textAlign: "center", margin: "0 0 16px" }}>"A journal is a mirror<br />that never lies."</p>
        <div style={{ width: 40, height: 1, background: T.stone }} />
      </div>
    </RightPage>
  </JournalSpread>
);

// ── App Shell ─────────────────────────────────────────────────────────────────
const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

export default function App() {
  const [screen,              setScreen]             = useState(() => load("aj_screen", "onboarding"));
  const [theme,               setTheme]              = useState(() => load("aj_theme", "light"));
  const [goals,               setGoals]              = useState(() => load("aj_goals", []));
  const [checkins,            setCheckins]           = useState(() => load("aj_checkins", {}));
  const [journalEntries,      setJournalEntries]     = useState(() => load("aj_journalEntries", {}));
  const [calendarPhotos,      setCalendarPhotos]     = useState(() => load("aj_calendarPhotos", {}));
  const [calendarStickers,    setCalendarStickers]   = useState(() => load("aj_calendarStickers", {}));
  const [calendarPhotoConfig, setCalendarPhotoConfig] = useState(() => load("aj_calendarPhotoConfig", {}));
  const [navData,             setNavData]            = useState({});

  useEffect(() => save("aj_screen", screen),              [screen]);
  useEffect(() => save("aj_theme", theme),                [theme]);
  useEffect(() => save("aj_goals", goals),                [goals]);
  useEffect(() => save("aj_checkins", checkins),          [checkins]);
  useEffect(() => save("aj_journalEntries", journalEntries), [journalEntries]);
  useEffect(() => save("aj_calendarPhotos", calendarPhotos), [calendarPhotos]);
  useEffect(() => save("aj_calendarStickers", calendarStickers), [calendarStickers]);
  useEffect(() => save("aj_calendarPhotoConfig", calendarPhotoConfig), [calendarPhotoConfig]);

  // Migrate v1 data (goals had a .type field; checkins used .habits array)
  useEffect(() => {
    if (localStorage.getItem("aj_version") !== "2") {
      if (goals.length > 0 && goals[0]?.type !== undefined) {
        setGoals([]);
        setCheckins({});
        setScreen("onboarding");
      }
      localStorage.setItem("aj_version", "2");
    }
  }, []);

  const onNav = (s, data = {}) => { setNavData(data); setScreen(s); };

  const bg = theme === "dark" ? "#1e1a17" : "#f0e9e0";
  const shared = { onNav, goals, setGoals, checkins, setCheckins, journalEntries, setJournalEntries, calendarPhotos, setCalendarPhotos, calendarStickers, setCalendarStickers, calendarPhotoConfig, setCalendarPhotoConfig, theme, setTheme };

  const screenMap = {
    onboarding:     <OnboardingScreen  {...shared} onDone={() => setScreen("menu")} />,
    menu:           <MenuScreen        {...shared} />,
    dashboard:      <DashboardScreen   {...shared} />,
    checkin:        <CheckInScreen     {...shared} />,
    mirror:         <MirrorScreen      {...shared} />,
    actionplan:     <ActionPlanScreen  {...shared} />,
    summary:        <SummaryScreen     {...shared} />,
    goals:          <GoalsScreen       {...shared} />,
    deleteresponse: <DeleteResponseScreen onNav={onNav} habit={navData.habit||""} reason={navData.reason||""} />,
    journal:        <JournalScreen     {...shared} />,
    calendar:       <CalendarScreen    {...shared} />,
    tracker:        <TrackerScreen     {...shared} />,
    reports:        <ReportsScreen     {...shared} />,
    settings:       <SettingsScreen    {...shared} />,
    dayreport:      <DayReportScreen   {...shared} dateKey={navData.dateKey || todayKey()} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", transition: "background 0.4s", fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: 13, color: theme==="dark" ? T.mist : T.driftwood, letterSpacing: "0.12em", margin: "0 0 20px", fontWeight: 400 }}>MY JOURNAL</h1>
      <div style={{ zoom: 1.3 }}>{screenMap[screen] || screenMap.menu}</div>
      <p style={{ marginTop: 14, fontFamily: "Georgia, serif", fontSize: 10, color: theme==="dark" ? T.bark : T.mist, fontStyle: "italic" }}>double-click a placed sticker or photo to remove it</p>
    </div>
  );
}
