import { useState, useEffect, useRef } from “react”;

// ── DATA ──────────────────────────────────────────────────────────────────────
const WEEK = [
{
id: 0, day: “LUN”, full: “LUNDI”, theme: “FORCE”, emoji: “⚡”,
color: “#C8F542”, duration: “8 min”, description: “Séries lourdes, focus pectoraux”,
exercises: [
{ id: “lun-1”, name: “Rotation Épaules”, sets: 1, reps: 20, rest: 0, isWarmup: true, cue: “Grands cercles vers l’avant puis l’arrière. 10 dans chaque sens.” },
{ id: “lun-2”, name: “Dips Pectoraux”, sets: 4, reps: 8, rest: 40, cue: “Buste penché ~30° en avant. Descends lentement (2s), remonte vite.” },
{ id: “lun-3”, name: “Dips Négatifs”, sets: 2, reps: 5, rest: 40, cue: “Remonte vite, descends en 5 secondes. Hypertrophie maximale.” },
],
},
{
id: 1, day: “MAR”, full: “MARDI”, theme: “ENDURANCE”, emoji: “🔥”,
color: “#FF5733”, duration: “9 min”, description: “Volume & brûlure, peu de repos”,
exercises: [
{ id: “mar-1”, name: “Rotations Poignets”, sets: 1, reps: 20, rest: 0, isWarmup: true, cue: “Tourne les poignets puis fais des cercles de bras.” },
{ id: “mar-2”, name: “Dips ×15”, sets: 3, reps: 15, rest: 30, cue: “Rythme régulier, pas d’arrêt. Repos 30s seulement.” },
{ id: “mar-3”, name: “Knee Raise”, sets: 3, reps: 12, rest: 30, cue: “En appui sur les barres, bras tendus. Monte les genoux à la poitrine.” },
],
},
{
id: 2, day: “MER”, full: “MERCREDI”, theme: “EXPLOSIF”, emoji: “💥”,
color: “#00C9FF”, duration: “8 min”, description: “Puissance & vitesse d’exécution”,
exercises: [
{ id: “mer-1”, name: “Dips Lents ×5”, sets: 1, reps: 5, rest: 0, isWarmup: true, cue: “5 dips très lents pour activer les muscles.” },
{ id: “mer-2”, name: “Dips Explosifs”, sets: 4, reps: 5, rest: 50, cue: “Descends contrôlé, EXPLOSE vers le haut le plus fort possible.” },
{ id: “mer-3”, name: “L-Sit Hold”, sets: 3, reps: 15, rest: 30, cue: “Bras tendus en appui, jambes à l’horizontale. Tiens 15s.” },
],
},
{
id: 3, day: “JEU”, full: “JEUDI”, theme: “VOLUME”, emoji: “📈”,
color: “#FF9F1C”, duration: “10 min”, description: “Max de reps, circuit non-stop”,
exercises: [
{ id: “jeu-1”, name: “Arm Swings”, sets: 1, reps: 20, rest: 0, isWarmup: true, cue: “Balance les bras d’avant en arrière, puis croisés devant.” },
{ id: “jeu-2”, name: “Dips 21s”, sets: 3, reps: 21, rest: 45, cue: “7 reps demi-basses → 7 demi-hautes → 7 complètes SANS PAUSE.” },
{ id: “jeu-3”, name: “Pushup Barres”, sets: 3, reps: 10, rest: 30, cue: “Mains sur les barres basses. ROM total = gains totaux.” },
],
},
{
id: 4, day: “VEN”, full: “VENDREDI”, theme: “FINISHER”, emoji: “🏆”,
color: “#E040FB”, duration: “7 min”, description: “Tout donner pour finir la semaine”,
exercises: [
{ id: “ven-1”, name: “Dips Iso ×2”, sets: 1, reps: 2, rest: 0, isWarmup: true, cue: “Descends à mi-chemin. Tiens 10 secondes. Répète 2 fois.” },
{ id: “ven-2”, name: “Dips AMRAP”, sets: 1, reps: 0, rest: 0, cue: “UN seul set, tout donner jusqu’à l’échec. Note ton score !” },
{ id: “ven-3”, name: “Dips Large Prise”, sets: 3, reps: 8, rest: 35, cue: “Mains en bout de barre, buste très incliné. Étirement max des pecs.” },
],
},
];

// ── STORAGE ───────────────────────────────────────────────────────────────────
function load(key, fallback) {
try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── MINI CHART ────────────────────────────────────────────────────────────────
function MiniChart({ data, color, width = 180, height = 48 }) {
if (!data || data.length < 2) return (
<div style={{ width, height, display: “flex”, alignItems: “center”, justifyContent: “center” }}>
<span style={{ fontSize: 10, color: “#333” }}>Pas encore de données</span>
</div>
);
const vals = data.map(d => d.value);
const min = Math.min(…vals);
const max = Math.max(…vals);
const range = max - min || 1;
const pts = data.map((d, i) => {
const x = (i / (data.length - 1)) * (width - 8) + 4;
const y = height - 8 - ((d.value - min) / range) * (height - 16);
return `${x},${y}`;
}).join(” “);
const lastPt = pts.split(” “).at(-1).split(”,”);
return (
<svg width={width} height={height} style={{ overflow: “visible” }}>
<defs>
<linearGradient id={`g-${color.replace("#","")}`} x1=“0” x2=“0” y1=“0” y2=“1”>
<stop offset="0%" stopColor={color} stopOpacity="0.3" />
<stop offset="100%" stopColor={color} stopOpacity="0" />
</linearGradient>
</defs>
<polygon
points={`4,${height} ${pts} ${(data.length - 1) / (data.length - 1) * (width - 8) + 4},${height}`}
fill={`url(#g-${color.replace("#","")})`}
/>
<polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
<circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
</svg>
);
}

// ── REST TIMER ────────────────────────────────────────────────────────────────
function RestTimer({ seconds, color, onDone }) {
const [left, setLeft] = useState(seconds);
const ref = useRef();
useEffect(() => {
ref.current = setInterval(() => {
setLeft(t => { if (t <= 1) { clearInterval(ref.current); onDone(); return 0; } return t - 1; });
}, 1000);
return () => clearInterval(ref.current);
}, []);
const pct = left / seconds;
const r = 54; const circ = 2 * Math.PI * r;
return (
<div style={{ position: “fixed”, inset: 0, zIndex: 300, background: “#07070C”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, gap: 24, fontFamily: “‘Courier New’, monospace” }}>
<div style={{ fontSize: 10, letterSpacing: 6, color: “#444” }}>REPOS</div>
<div style={{ position: “relative”, width: 120, height: 120 }}>
<svg width=“120” height=“120” style={{ transform: “rotate(-90deg)”, position: “absolute” }}>
<circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a1a" strokeWidth="6" />
<circle cx=“60” cy=“60” r={r} fill=“none” stroke={color} strokeWidth=“6”
strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
strokeLinecap=“round” style={{ transition: “stroke-dashoffset 1s linear” }} />
</svg>
<div style={{ position: “absolute”, inset: 0, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 36, fontWeight: 900, color }}>{left}</div>
</div>
<div style={{ fontSize: 12, color: “#555” }}>Prochain set dans {left}s</div>
<button onClick={onDone} style={{ padding: “12px 32px”, borderRadius: 30, border: `1px solid ${color}44`, background: “transparent”, color, cursor: “pointer”, fontSize: 13, fontFamily: “‘Courier New’, monospace”, letterSpacing: 2 }}>PASSER →</button>
</div>
);
}

// ── REP INPUT ─────────────────────────────────────────────────────────────────
function RepInput({ target, color, onConfirm }) {
const [val, setVal] = useState(target || “”);
return (
<div style={{ position: “fixed”, inset: 0, zIndex: 300, background: “rgba(0,0,0,0.95)”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, gap: 20, fontFamily: “‘Courier New’, monospace”, padding: 32 }}>
<div style={{ fontSize: 10, letterSpacing: 6, color: “#555” }}>REPS EFFECTUÉES</div>
<div style={{ fontSize: 13, color: “#888” }}>Objectif : <span style={{ color }}>{target || “MAX”}</span></div>
<div style={{ display: “flex”, alignItems: “center”, gap: 20 }}>
<button onClick={() => setVal(v => Math.max(0, Number(v) - 1))} style={{ width: 52, height: 52, borderRadius: “50%”, border: `1px solid #2a2a2a`, background: “#111”, color: “#888”, fontSize: 24, cursor: “pointer” }}>−</button>
<div style={{ fontSize: 72, fontWeight: 900, color, fontFamily: “‘Courier New’, monospace”, minWidth: 100, textAlign: “center”, lineHeight: 1 }}>{val}</div>
<button onClick={() => setVal(v => Number(v) + 1)} style={{ width: 52, height: 52, borderRadius: “50%”, border: `1px solid ${color}44`, background: `${color}11`, color, fontSize: 24, cursor: “pointer” }}>+</button>
</div>
{/* Quick presets */}
<div style={{ display: “flex”, gap: 8, flexWrap: “wrap”, justifyContent: “center” }}>
{[3,4,5,6,7,8,10,12,15,20].map(n => (
<button key={n} onClick={() => setVal(n)} style={{ padding: “6px 12px”, borderRadius: 8, border: `1px solid ${val == n ? color : "#2a2a2a"}`, background: val == n ? `${color}22` : “#111”, color: val == n ? color : “#555”, fontSize: 12, cursor: “pointer” }}>{n}</button>
))}
</div>
<button onClick={() => onConfirm(Number(val))} style={{ width: “100%”, maxWidth: 280, padding: “16px”, borderRadius: 14, border: “none”, background: color, color: “#000”, fontWeight: 900, fontSize: 15, cursor: “pointer”, letterSpacing: 2, fontFamily: “‘Courier New’, monospace”, marginTop: 8 }}>CONFIRMER ✓</button>
</div>
);
}

// ── WORKOUT SCREEN ────────────────────────────────────────────────────────────
function WorkoutScreen({ day, history, onFinish, onBack }) {
const steps = [];
day.exercises.forEach(ex => {
for (let s = 0; s < ex.sets; s++) steps.push({ ex, setNum: s + 1, totalSets: ex.sets });
});
const [step, setStep] = useState(0);
const [resting, setResting] = useState(false);
const [askReps, setAskReps] = useState(false);
const [sessionReps, setSessionReps] = useState({});

const current = steps[step];
const isDone = step >= steps.length;
const progress = step / steps.length;

const handleSetDone = () => {
if (!current.ex.isWarmup) {
setAskReps(true);
} else {
advance(null);
}
};

const advance = (repsCount) => {
setAskReps(false);
if (repsCount !== null && !current.ex.isWarmup) {
const key = current.ex.id;
setSessionReps(prev => ({
…prev,
[key]: […(prev[key] || []), repsCount]
}));
}
const next = step + 1;
if (next >= steps.length) { setStep(next); return; }
const nextStep = steps[next];
if (!current.ex.isWarmup && current.ex.rest > 0 && nextStep.ex.id === current.ex.id) {
setResting(true);
} else {
setStep(next);
}
};

const finishWorkout = () => {
onFinish(sessionReps);
};

return (
<div style={{ position: “fixed”, inset: 0, zIndex: 100, background: “#07070C”, display: “flex”, flexDirection: “column”, fontFamily: “‘Courier New’, monospace”, overflowY: “auto” }}>
{resting && <RestTimer seconds={current.ex.rest} color={day.color} onDone={() => { setResting(false); setStep(s => s + 1); }} />}
{askReps && <RepInput target={current.ex.reps || 0} color={day.color} onConfirm={advance} />}

```
  {/* Header */}
  <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #111", flexShrink: 0 }}>
    <button onClick={onBack} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer", padding: "4px 8px 4px 0", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 18 }}>‹</span>
      <span style={{ fontSize: 12, letterSpacing: 1 }}>RETOUR</span>
    </button>
    <div style={{ flex: 1 }} />
    <div style={{ fontSize: 10, letterSpacing: 3, color: day.color }}>{day.theme}</div>
  </div>

  {/* Progress */}
  <div style={{ height: 3, background: "#111", flexShrink: 0 }}>
    <div style={{ height: "100%", background: day.color, width: `${progress * 100}%`, transition: "width 0.4s ease" }} />
  </div>

  {/* Content */}
  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
    {isDone ? (
      <div style={{ textAlign: "center", width: "100%", maxWidth: 340 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: day.color, letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>SÉANCE<br />TERMINÉE !</div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 32 }}>Repos mérité. À demain.</div>

        {/* Summary */}
        {Object.keys(sessionReps).length > 0 && (
          <div style={{ background: "#0e0e14", borderRadius: 14, padding: 16, marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 12 }}>RÉSUMÉ DE SÉANCE</div>
            {day.exercises.filter(e => !e.isWarmup).map(ex => {
              const reps = sessionReps[ex.id] || [];
              if (!reps.length) return null;
              return (
                <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #151515" }}>
                  <div style={{ fontSize: 12, color: "#888" }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {reps.map((r, i) => (
                      <span key={i} style={{ fontSize: 12, fontWeight: 900, color: day.color, background: `${day.color}15`, padding: "2px 8px", borderRadius: 6 }}>{r}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={finishWorkout} style={{ width: "100%", padding: "18px", borderRadius: 14, border: "none", background: day.color, color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>
          SAUVEGARDER ✓
        </button>
      </div>
    ) : (
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Exercise info */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {current.ex.isWarmup && (
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#555", marginBottom: 10 }}>ÉCHAUFFEMENT</div>
          )}
          <div style={{ fontSize: 11, color: day.color, letterSpacing: 3, marginBottom: 8 }}>
            SET {current.setNum} / {current.totalSets}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, color: "#E0DDD6" }}>
            {current.ex.name}
          </div>

          {/* Target reps */}
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 6, background: `${day.color}15`, border: `1px solid ${day.color}33`, borderRadius: 12, padding: "10px 24px", marginBottom: 24 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: day.color, fontFamily: "'Courier New', monospace", lineHeight: 1 }}>
              {current.ex.reps || "MAX"}
            </span>
            <span style={{ fontSize: 12, color: day.color + "99" }}>reps</span>
          </div>

          {/* Previous best */}
          {history[current.ex.id]?.length > 0 && (() => {
            const allSets = history[current.ex.id].flatMap(s => s);
            const best = Math.max(...allSets);
            const last = history[current.ex.id].at(-1);
            const lastAvg = Math.round(last.reduce((a,b)=>a+b,0)/last.length);
            return (
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
                <div style={{ background: "#111", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>RECORD</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{best}</div>
                </div>
                <div style={{ background: "#111", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>DERNIÈRE</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#888" }}>{lastAvg}</div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Cue */}
        <div style={{ background: "#0e0e14", borderLeft: `3px solid ${day.color}55`, borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 32, fontSize: 12, color: "#666", lineHeight: 1.7 }}>
          {current.ex.cue}
        </div>

        {/* CTA */}
        <button onClick={handleSetDone} style={{ width: "100%", padding: "18px", borderRadius: 14, border: "none", background: current.ex.isWarmup ? "#1a1a1a" : `linear-gradient(135deg, ${day.color}, ${day.color}bb)`, color: current.ex.isWarmup ? "#666" : "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>
          {current.ex.isWarmup ? "FAIT ✓" : "SET TERMINÉ ✓"}
        </button>
      </div>
    )}
  </div>
</div>
```

);
}

// ── PROGRESS SCREEN ───────────────────────────────────────────────────────────
function ProgressScreen({ history, onBack }) {
const [selectedEx, setSelectedEx] = useState(null);

const allExercises = WEEK.flatMap(d =>
d.exercises.filter(e => !e.isWarmup).map(e => ({ …e, dayColor: d.color, dayLabel: d.day }))
);

const exWithData = allExercises.filter(e => history[e.id]?.length > 0);

return (
<div style={{ minHeight: “100vh”, background: “#07070C”, fontFamily: “‘Courier New’, monospace”, color: “#E0DDD6” }}>
{/* Header */}
<div style={{ padding: “16px 20px”, display: “flex”, alignItems: “center”, gap: 12, borderBottom: “1px solid #111”, position: “sticky”, top: 0, background: “#07070C”, zIndex: 10 }}>
<button onClick={onBack} style={{ background: “none”, border: “none”, color: “#555”, fontSize: 20, cursor: “pointer”, display: “flex”, alignItems: “center”, gap: 6, padding: “4px 8px 4px 0” }}>
<span style={{ fontSize: 18 }}>‹</span>
<span style={{ fontSize: 12, letterSpacing: 1 }}>RETOUR</span>
</button>
<div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>PROGRESSION</div>
</div>

```
  <div style={{ padding: "20px 16px 60px" }}>
    {exWithData.length === 0 ? (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7 }}>
          Aucune donnée encore.<br />Lance ta première séance !
        </div>
      </div>
    ) : (
      exWithData.map(ex => {
        const sessions = history[ex.id];
        const chartData = sessions.map((sets, i) => ({
          value: Math.round(sets.reduce((a, b) => a + b, 0) / sets.length),
          label: `S${i + 1}`
        }));
        const allReps = sessions.flatMap(s => s);
        const best = Math.max(...allReps);
        const latest = sessions.at(-1);
        const latestAvg = Math.round(latest.reduce((a,b)=>a+b,0)/latest.length);
        const trend = sessions.length >= 2
          ? latestAvg - Math.round(sessions.at(-2).reduce((a,b)=>a+b,0)/sessions.at(-2).length)
          : 0;

        return (
          <div key={ex.id} style={{ background: "#0b0b12", border: `1px solid #1a1a24`, borderRadius: 16, padding: 18, marginBottom: 12 }}
            onClick={() => setSelectedEx(selectedEx === ex.id ? null : ex.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, background: `${ex.dayColor}22`, color: ex.dayColor, letterSpacing: 1 }}>{ex.dayLabel}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#ddd" }}>{ex.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: ex.dayColor }}>{latestAvg}</div>
                <div style={{ fontSize: 10, color: trend > 0 ? "#4CAF50" : trend < 0 ? "#f44336" : "#555" }}>
                  {trend > 0 ? `↑ +${trend}` : trend < 0 ? `↓ ${trend}` : "→ stable"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <MiniChart data={chartData} color={ex.dayColor} width={160} height={44} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>RECORD</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{best} 🏅</div>
                <div style={{ fontSize: 9, color: "#333" }}>{sessions.length} séances</div>
              </div>
            </div>

            {/* Expanded detail */}
            {selectedEx === ex.id && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #151515" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 10 }}>HISTORIQUE DES SETS</div>
                {sessions.slice(-5).reverse().map((sets, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: "#444", width: 40 }}>S-{sessions.length - i}</div>
                    <div style={{ display: "flex", gap: 4, flex: 1 }}>
                      {sets.map((r, j) => (
                        <span key={j} style={{ fontSize: 12, fontWeight: 900, color: ex.dayColor, background: `${ex.dayColor}15`, padding: "3px 8px", borderRadius: 6 }}>{r}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#555" }}>moy. {Math.round(sets.reduce((a,b)=>a+b,0)/sets.length)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
</div>
```

);
}

// ── DAY DETAIL SCREEN ─────────────────────────────────────────────────────────
function DayScreen({ day, history, onBack, onStart }) {
return (
<div style={{ minHeight: “100vh”, background: “#07070C”, fontFamily: “‘Courier New’, monospace”, color: “#E0DDD6” }}>
{/* Header */}
<div style={{ padding: “16px 20px”, display: “flex”, alignItems: “center”, gap: 12, borderBottom: “1px solid #111”, position: “sticky”, top: 0, background: “#07070C”, zIndex: 10 }}>
<button onClick={onBack} style={{ background: “none”, border: “none”, color: “#555”, fontSize: 20, cursor: “pointer”, display: “flex”, alignItems: “center”, gap: 6, padding: “4px 8px 4px 0” }}>
<span style={{ fontSize: 18 }}>‹</span>
<span style={{ fontSize: 12, letterSpacing: 1 }}>RETOUR</span>
</button>
<div>
<div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, color: day.color }}>{day.full}</div>
<div style={{ fontSize: 10, color: “#444”, letterSpacing: 2 }}>{day.theme} • {day.duration}</div>
</div>
</div>

```
  <div style={{ padding: "20px 16px 120px" }}>
    {/* Exercises list */}
    {day.exercises.map((ex, i) => {
      const exHistory = history[ex.id] || [];
      const lastSession = exHistory.at(-1);
      return (
        <div key={ex.id} style={{ background: "#0b0b12", border: `1px solid ${ex.isWarmup ? "#111" : "#1a1a24"}`, borderRadius: 14, padding: "16px", marginBottom: 10, opacity: ex.isWarmup ? 0.6 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              {ex.isWarmup && <div style={{ fontSize: 9, color: "#444", letterSpacing: 3, marginBottom: 4 }}>ÉCHAUFFEMENT</div>}
              <div style={{ fontSize: 14, fontWeight: 900, color: ex.isWarmup ? "#555" : "#ddd" }}>{ex.name}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "#111", color: "#666" }}>{ex.sets}×{ex.reps || "MAX"}</span>
              {ex.rest > 0 && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "#111", color: "#555" }}>{ex.rest}s</span>}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: lastSession ? 12 : 0 }}>{ex.cue}</div>

          {lastSession && !ex.isWarmup && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid #111" }}>
              <span style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>DERNIÈRE FOIS</span>
              {lastSession.map((r, j) => (
                <span key={j} style={{ fontSize: 12, fontWeight: 900, color: day.color, background: `${day.color}15`, padding: "2px 8px", borderRadius: 6 }}>{r}</span>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>

  {/* Start button fixed at bottom */}
  <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 32px", background: "linear-gradient(transparent, #07070C 40%)" }}>
    <button onClick={onStart} style={{ width: "100%", padding: "18px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${day.color}, ${day.color}cc)`, color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 3, fontFamily: "'Courier New', monospace" }}>
      DÉMARRER LA SÉANCE ▶
    </button>
  </div>
</div>
```

);
}

// ── HOME SCREEN ───────────────────────────────────────────────────────────────
export default function App() {
const [screen, setScreen] = useState(“home”); // home | day | workout | progress
const [selectedDay, setSelectedDay] = useState(null);
const [doneDays, setDoneDays] = useState(() => load(“doneDays_v2”, {}));
const [history, setHistory] = useState(() => load(“repHistory_v2”, {}));

const today = new Date().getDay();
const todayIdx = today >= 1 && today <= 5 ? today - 1 : null;

// Reset done days on new week
useEffect(() => {
const last = localStorage.getItem(“weekStart_v2”);
const thisMonday = getMonday();
if (last !== thisMonday) {
const fresh = {};
save(“doneDays_v2”, fresh);
setDoneDays(fresh);
localStorage.setItem(“weekStart_v2”, thisMonday);
}
}, []);

function getMonday() {
const d = new Date();
const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
return new Date(d.setDate(diff)).toDateString();
}

const handleFinish = (sessionReps) => {
// Merge session reps into history
const newHistory = { …history };
Object.entries(sessionReps).forEach(([exId, sets]) => {
if (!newHistory[exId]) newHistory[exId] = [];
newHistory[exId].push(sets);
});
setHistory(newHistory);
save(“repHistory_v2”, newHistory);

```
// Mark day done
const updated = { ...doneDays, [selectedDay.id]: true };
setDoneDays(updated);
save("doneDays_v2", updated);

setScreen("home");
setSelectedDay(null);
```

};

// ── SCREENS ──
if (screen === “progress”) return <ProgressScreen history={history} onBack={() => setScreen(“home”)} />;

if (screen === “day” && selectedDay) return (
<DayScreen
day={selectedDay} history={history}
onBack={() => { setScreen(“home”); setSelectedDay(null); }}
onStart={() => setScreen(“workout”)}
/>
);

if (screen === “workout” && selectedDay) return (
<WorkoutScreen
day={selectedDay} history={history}
onFinish={handleFinish}
onBack={() => setScreen(“day”)}
/>
);

// ── HOME ──
const totalDone = Object.keys(doneDays).length;
const totalReps = Object.values(history).flatMap(s => s).flatMap(s => s).reduce((a,b)=>a+b,0);

return (
<div style={{ minHeight: “100vh”, background: “#07070C”, fontFamily: “‘Courier New’, monospace”, color: “#E0DDD6” }}>
<div style={{ maxWidth: 480, margin: “0 auto”, padding: “28px 16px 80px” }}>

```
    {/* Header */}
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 9, letterSpacing: 6, color: "#333", marginBottom: 10 }}>BARRE À DIPS • 5J • MAX 10MIN</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, lineHeight: 0.9, letterSpacing: -2 }}>
          DIP BAR<br /><span style={{ color: "#C8F542" }}>5-DAY</span>
        </h1>
        <button onClick={() => setScreen("progress")} style={{ background: "#0e0e18", border: "1px solid #1a1a24", borderRadius: 12, padding: "10px 16px", cursor: "pointer", textAlign: "right", color: "#E0DDD6" }}>
          <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 2 }}>TOTAL REPS</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#C8F542" }}>{totalReps}</div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>voir progression →</div>
        </button>
      </div>
      <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, #C8F54233, transparent)" }} />
    </div>

    {/* Week strip */}
    <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
      {WEEK.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: 3, borderRadius: 2, marginBottom: 5, background: doneDays[i] ? d.color : todayIdx === i ? d.color + "44" : "#141414", transition: "background 0.3s" }} />
          <div style={{ fontSize: 9, color: todayIdx === i ? d.color : doneDays[i] ? "#333" : "#2a2a2a", fontWeight: todayIdx === i ? 900 : 400, letterSpacing: 1 }}>{d.day}</div>
        </div>
      ))}
      {["SAM", "DIM"].map(d => (
        <div key={d} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: 3, borderRadius: 2, marginBottom: 5, background: "#0e0e0e" }} />
          <div style={{ fontSize: 9, color: "#1a1a1a" }}>{d}</div>
        </div>
      ))}
    </div>

    {/* Day cards */}
    {WEEK.map((d, i) => {
      const isToday = todayIdx === i;
      const isDone = !!doneDays[i];
      const sessionCount = Object.keys(history).filter(k => k.startsWith(d.day.toLowerCase())).reduce((acc, k) => Math.max(acc, history[k]?.length || 0), 0);

      return (
        <div key={i}
          onClick={() => { setSelectedDay(d); setScreen("day"); }}
          style={{ background: isToday ? `${d.color}07` : "#0b0b12", border: `1px solid ${isToday ? d.color + "33" : "#131318"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 8, cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.2s", opacity: isDone ? 0.55 : 1 }}>
          {isToday && !isDone && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${d.color}, transparent)` }} />}

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, flexShrink: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: isDone ? "#2a2a2a" : isToday ? d.color : "#444", lineHeight: 1 }}>{d.day}</div>
              <div style={{ fontSize: 8, color: isDone ? "#2a2a2a" : isToday ? d.color + "99" : "#2a2a2a", marginTop: 3, letterSpacing: 1 }}>{isDone ? "✓ FAIT" : isToday ? "AUJOURD'HUI" : ""}</div>
            </div>
            <div style={{ width: 1, height: 34, background: "#1a1a1a", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13 }}>{d.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: isDone ? "#333" : "#ccc" }}>{d.theme}</span>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: isDone ? "#111" : `${d.color}15`, color: isDone ? "#333" : d.color }}>{d.duration}</span>
                {sessionCount > 0 && <span style={{ fontSize: 9, color: "#444" }}>×{sessionCount}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#3a3a3a" }}>{d.description}</div>
            </div>
            <div style={{ fontSize: 16, color: isDone ? "#222" : isToday ? d.color : "#1e1e1e" }}>›</div>
          </div>
        </div>
      );
    })}

    {/* Weekend */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4, marginBottom: 24 }}>
      {["SAMEDI", "DIMANCHE"].map(d => (
        <div key={d} style={{ background: "#090910", border: "1px solid #0f0f0f", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 1, marginBottom: 4 }}>{d}</div>
          <div style={{ fontSize: 16 }}>😴</div>
          <div style={{ fontSize: 10, color: "#1e1e1e", marginTop: 3 }}>Récupération</div>
        </div>
      ))}
    </div>

    {/* Stats bar */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {[
        { label: "SÉANCES", value: Object.values(history).flat().length, color: "#C8F542" },
        { label: "SEMAINE", value: `${totalDone}/5`, color: "#FF9F1C" },
        { label: "EXERCICES", value: Object.keys(history).length, color: "#00C9FF" },
      ].map(s => (
        <div key={s.label} style={{ background: "#0b0b12", border: "1px solid #111", borderRadius: 12, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>

  </div>
</div>
```

);
}
