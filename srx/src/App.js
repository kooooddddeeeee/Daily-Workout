import { useState, useEffect, useRef } from "react";

const WEEK = [
  {
    day: "LUN", full: "LUNDI", theme: "FORCE", emoji: "⚡",
    color: "#C8F542", duration: "8 min", description: "Séries lourdes, focus pectoraux",
    exercises: [
      { name: "Échauffement Rotation Épaules", sets: 1, reps: "20", rest: 0, isWarmup: true, cue: "Grands cercles vers l'avant puis l'arrière. 10 dans chaque sens." },
      { name: "Dips Pectoraux", sets: 4, reps: "8", rest: 40, cue: "Buste penché ~30° en avant. Descends lentement (2s), remonte vite. Repos 40s entre sets." },
      { name: "Dips Négatifs", sets: 2, reps: "5", rest: 40, cue: "Remonte vite, descends en 5 secondes. La descente lente = hypertrophie maximale." },
    ],
  },
  {
    day: "MAR", full: "MARDI", theme: "ENDURANCE", emoji: "🔥",
    color: "#FF5733", duration: "9 min", description: "Volume & brûlure, peu de repos",
    exercises: [
      { name: "Rotations de poignets + bras", sets: 1, reps: "30s", rest: 0, isWarmup: true, cue: "Tourne les poignets puis fais des cercles de bras. Prépare les articulations." },
      { name: "Dips 3×15 (légers)", sets: 3, reps: "15", rest: 30, cue: "Rythme régulier, pas d'arrêt. Si tu bloques, pause 5s puis continue. Repos 30s seulement." },
      { name: "Knee Raise sur Barres", sets: 3, reps: "12", rest: 30, cue: "En appui sur les barres, bras tendus. Monte les genoux à la poitrine. Core serré." },
    ],
  },
  {
    day: "MER", full: "MERCREDI", theme: "EXPLOSIF", emoji: "💥",
    color: "#00C9FF", duration: "8 min", description: "Puissance & vitesse d'exécution",
    exercises: [
      { name: "Dips Lents (mise en chauffe)", sets: 1, reps: "5", rest: 0, isWarmup: true, cue: "5 dips très lents pour activer les muscles. Pas d'effort max." },
      { name: "Dips Explosifs", sets: 4, reps: "5", rest: 50, cue: "Descends contrôlé, EXPLOSE vers le haut le plus fort possible. Repos 50s. Qualité absolue." },
      { name: "L-Sit Hold", sets: 3, reps: "15s", rest: 30, cue: "Bras tendus en appui, jambes à l'horizontale. Si trop dur : un genou plié. Tiens 15s." },
    ],
  },
  {
    day: "JEU", full: "JEUDI", theme: "VOLUME", emoji: "📈",
    color: "#FF9F1C", duration: "10 min", description: "Max de reps, circuit non-stop",
    exercises: [
      { name: "Arm Swings", sets: 1, reps: "20s", rest: 0, isWarmup: true, cue: "Balance les bras d'avant en arrière, puis croisés devant. Active l'ensemble du haut du corps." },
      { name: "Dips 21s", sets: 3, reps: "7+7+7", rest: 45, cue: "7 reps demi-basses → 7 reps demi-hautes → 7 reps complètes SANS PAUSE. Repos 45s." },
      { name: "Pushup entre les barres", sets: 3, reps: "10", rest: 30, cue: "Mains sur les barres basses. Descends plus bas qu'un pompe normal. ROM total = gains totaux." },
    ],
  },
  {
    day: "VEN", full: "VENDREDI", theme: "FINISHER", emoji: "🏆",
    color: "#E040FB", duration: "7 min", description: "Tout donner pour finir la semaine",
    exercises: [
      { name: "Dips Isométrique (warm)", sets: 1, reps: "2×10s", rest: 0, isWarmup: true, cue: "Descends à mi-chemin. Tiens 10 secondes. Remonte. Répète 2 fois. Activation ciblée." },
      { name: "Dips AMRAP", sets: 1, reps: "MAX", rest: 0, cue: "UN seul set, tout donner jusqu'à l'échec complet. Note ton score et bats-le la semaine prochaine !" },
      { name: "Dips Large Prise", sets: 3, reps: "8", rest: 35, cue: "Mains en bout de barre, buste très incliné. Simule un fly. Étirement maximal des pecs en bas." },
    ],
  },
];

function TimerRing({ progress, color, size = 140 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
    </svg>
  );
}

function RestTimer({ seconds, color, onDone }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef();
  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft(t => { if (t <= 1) { clearInterval(ref.current); onDone(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: 6, color: "#555" }}>REPOS</div>
      <div style={{ position: "relative" }}>
        <TimerRing progress={left / seconds} color={color} size={160} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 900, fontFamily: "monospace", color }}>{left}</div>
      </div>
      <div style={{ fontSize: 13, color: "#444" }}>Prochain set dans {left}s</div>
      <button onClick={onDone} style={{ marginTop: 10, padding: "12px 32px", borderRadius: 30, border: "1px solid #333", background: "transparent", color: "#555", cursor: "pointer", fontSize: 14, fontFamily: "monospace" }}>Passer →</button>
    </div>
  );
}

function WorkoutModal({ day, onClose }) {
  const [step, setStep] = useState(0);
  const [resting, setResting] = useState(false);
  const steps = [];
  day.exercises.forEach((ex) => {
    for (let s = 0; s < ex.sets; s++) steps.push({ ex, setNum: s + 1 });
  });
  const current = steps[step];
  const isDone = step >= steps.length;
  const handleDone = () => {
    const next = step + 1;
    if (next >= steps.length) { setStep(next); return; }
    if (current.ex.rest > 0 && !current.ex.isWarmup) setResting(true);
    else setStep(next);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#060608", display: "flex", flexDirection: "column", fontFamily: "'Courier New', monospace" }}>
      {resting && <RestTimer seconds={current.ex.rest} color={day.color} onDone={() => { setResting(false); setStep(s => s + 1); }} />}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", fontSize: 22, cursor: "pointer", padding: 4 }}>✕</button>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#444" }}>{day.full} — {day.theme}</div>
        <div style={{ fontSize: 12, color: day.color, fontWeight: 900 }}>{step}/{steps.length}</div>
      </div>
      <div style={{ margin: "16px 20px 0", height: 3, background: "#1a1a1a", borderRadius: 2 }}>
        <div style={{ height: "100%", borderRadius: 2, background: day.color, width: `${(step / steps.length) * 100}%`, transition: "width 0.3s" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28 }}>
        {isDone ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: day.color, letterSpacing: -1 }}>SÉANCE<br />TERMINÉE !</div>
            <div style={{ fontSize: 14, color: "#555", marginTop: 12 }}>Repos mérité. À demain.</div>
            <button onClick={onClose} style={{ marginTop: 32, padding: "16px 48px", borderRadius: 14, border: "none", background: day.color, color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>TERMINER</button>
          </div>
        ) : (
          <>
            {current.ex.isWarmup && <div style={{ fontSize: 10, letterSpacing: 4, color: "#555", marginBottom: 12 }}>ÉCHAUFFEMENT</div>}
            <div style={{ fontSize: 10, letterSpacing: 4, color: current.ex.isWarmup ? "#555" : day.color, marginBottom: 10 }}>SET {current.setNum} / {current.ex.sets}</div>
            <div style={{ fontSize: 26, fontWeight: 900, textAlign: "center", lineHeight: 1.1, marginBottom: 10 }}>{current.ex.name}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: day.color, fontFamily: "monospace", marginBottom: 24 }}>{current.ex.reps}</div>
            <div style={{ background: "#0e0e14", border: `1px solid ${day.color}22`, borderLeft: `3px solid ${day.color}`, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#888", lineHeight: 1.7, maxWidth: 340, textAlign: "left", marginBottom: 32 }}>{current.ex.cue}</div>
            <button onClick={handleDone} style={{ width: "100%", maxWidth: 340, padding: "18px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${day.color}, ${day.color}aa)`, color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>
              {step === steps.length - 1 ? "TERMINER ✓" : "SET FAIT ✓"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [activeDay, setActiveDay] = useState(null);
  const [doneDays, setDoneDays] = useState({});
  const today = new Date().getDay();
  const todayIdx = today >= 1 && today <= 5 ? today - 1 : null;
  const markDone = (idx) => setDoneDays(p => ({ ...p, [idx]: true }));

  return (
    <div style={{ minHeight: "100vh", background: "#07070C", fontFamily: "'Courier New', monospace", color: "#E0DDD6" }}>
      {activeDay !== null && <WorkoutModal day={WEEK[activeDay]} onClose={() => { markDone(activeDay); setActiveDay(null); }} />}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 16px 60px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#444", marginBottom: 10 }}>BARRE À DIPS • 5 JOURS • MAX 10 MIN</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, lineHeight: 0.95, letterSpacing: -2 }}>
              DIP BAR<br /><span style={{ color: "#C8F542" }}>5-DAY</span>
            </h1>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#333", letterSpacing: 2 }}>SAM & DIM</div>
              <div style={{ fontSize: 11, color: "#444" }}>REPOS TOTAL</div>
            </div>
          </div>
          <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, #C8F54244, transparent)" }} />
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {WEEK.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 3, borderRadius: 2, marginBottom: 6, background: doneDays[i] ? d.color : todayIdx === i ? d.color + "55" : "#1a1a1a" }} />
              <div style={{ fontSize: 9, letterSpacing: 1, color: todayIdx === i ? d.color : "#333", fontWeight: todayIdx === i ? 900 : 400 }}>{d.day}</div>
            </div>
          ))}
          {["SAM","DIM"].map(d => (
            <div key={d} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 3, borderRadius: 2, marginBottom: 6, background: "#111" }} />
              <div style={{ fontSize: 9, color: "#222" }}>{d}</div>
            </div>
          ))}
        </div>
        {WEEK.map((d, i) => {
          const isToday = todayIdx === i;
          const isDone = !!doneDays[i];
          return (
            <div key={i} onClick={() => !isDone && setActiveDay(i)} style={{ background: isToday ? `${d.color}08` : "#0b0b12", border: `1px solid ${isToday ? d.color + "44" : isDone ? "#1a1a1a" : "#131320"}`, borderRadius: 16, padding: "18px 20px", marginBottom: 10, cursor: isDone ? "default" : "pointer", opacity: isDone ? 0.5 : 1, position: "relative", overflow: "hidden" }}>
              {isToday && !isDone && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${d.color}, transparent)` }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: isDone ? "#333" : isToday ? d.color : "#555" }}>{d.day}</div>
                  <div style={{ fontSize: 8, letterSpacing: 2, color: "#333", marginTop: 2 }}>{isDone ? "FAIT" : isToday ? "TODAY" : ""}</div>
                </div>
                <div style={{ width: 1, height: 36, background: "#1e1e2a", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14 }}>{d.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: isDone ? "#333" : "#ccc" }}>{d.theme}</span>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: isDone ? "#1a1a1a" : `${d.color}18`, color: isDone ? "#333" : d.color }}>{d.duration}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#444" }}>{d.description}</div>
                </div>
                <div style={{ fontSize: 16, color: isDone ? "#2a2a2a" : isToday ? d.color : "#222" }}>{isDone ? "✓" : "→"}</div>
              </div>
              {isToday && !isDone && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${d.color}22`, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {d.exercises.filter(e => !e.isWarmup).map((ex, ei) => (
                    <span key={ei} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 6, background: `${d.color}12`, color: d.color }}>{ex.name}</span>
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); setActiveDay(i); }} style={{ marginLeft: "auto", padding: "4px 14px", borderRadius: 6, border: "none", background: d.color, color: "#000", fontWeight: 900, fontSize: 10, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>START ▶</button>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
          {["SAMEDI", "DIMANCHE"].map(d => (
            <div key={d} style={{ background: "#090910", border: "1px solid #111", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "#222", marginBottom: 4 }}>{d}</div>
              <div style={{ fontSize: 18 }}>😴</div>
              <div style={{ fontSize: 11, color: "#2a2a2a", marginTop: 4 }}>Récupération</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: "14px 16px", background: "#0b0b12", border: "1px solid #1a1a2a", borderLeft: "2px solid #C8F542", borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: "#C8F542", letterSpacing: 3, marginBottom: 6 }}>RÈGLE D'OR</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>
            Buste <span style={{ color: "#C8F542" }}>penché en avant</span> = pectoraux activés.<br />
            Repos <span style={{ color: "#C8F542" }}>samedi & dimanche</span> = croissance musculaire.
          </div>
        </div>
      </div>
    </div>
  );
}
