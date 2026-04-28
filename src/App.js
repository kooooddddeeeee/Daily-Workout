import { useState, useEffect, useRef } from “react”;

var WEEK = [
{
id: 0, day: “LUN”, full: “LUNDI”, theme: “FORCE”, emoji: “⚡”,
color: “#C8F542”, duration: “8 min”, description: “Series lourdes, focus pectoraux”,
exercises: [
{ id: “lun-1”, name: “Rotation Epaules”, sets: 1, reps: 20, rest: 0, isWarmup: true, cue: “Grands cercles vers l avant puis l arriere. 10 dans chaque sens.” },
{ id: “lun-2”, name: “Dips Pectoraux”, sets: 4, reps: 8, rest: 40, cue: “Buste penche 30 degres en avant. Descends lentement 2s, remonte vite.” },
{ id: “lun-3”, name: “Dips Negatifs”, sets: 2, reps: 5, rest: 40, cue: “Remonte vite, descends en 5 secondes. Hypertrophie maximale.” }
]
},
{
id: 1, day: “MAR”, full: “MARDI”, theme: “ENDURANCE”, emoji: “🔥”,
color: “#FF5733”, duration: “9 min”, description: “Volume et bruture, peu de repos”,
exercises: [
{ id: “mar-1”, name: “Rotations Poignets”, sets: 1, reps: 20, rest: 0, isWarmup: true, cue: “Tourne les poignets puis fais des cercles de bras.” },
{ id: “mar-2”, name: “Dips x15”, sets: 3, reps: 15, rest: 30, cue: “Rythme regulier, pas d arret. Repos 30s seulement.” },
{ id: “mar-3”, name: “Knee Raise”, sets: 3, reps: 12, rest: 30, cue: “En appui sur les barres, bras tendus. Monte les genoux a la poitrine.” }
]
},
{
id: 2, day: “MER”, full: “MERCREDI”, theme: “EXPLOSIF”, emoji: “💥”,
color: “#00C9FF”, duration: “8 min”, description: “Puissance et vitesse d execution”,
exercises: [
{ id: “mer-1”, name: “Dips Lents x5”, sets: 1, reps: 5, rest: 0, isWarmup: true, cue: “5 dips tres lents pour activer les muscles.” },
{ id: “mer-2”, name: “Dips Explosifs”, sets: 4, reps: 5, rest: 50, cue: “Descends controle, EXPLOSE vers le haut le plus fort possible.” },
{ id: “mer-3”, name: “L-Sit Hold”, sets: 3, reps: 15, rest: 30, cue: “Bras tendus en appui, jambes a l horizontale. Tiens 15s.” }
]
},
{
id: 3, day: “JEU”, full: “JEUDI”, theme: “VOLUME”, emoji: “📈”,
color: “#FF9F1C”, duration: “10 min”, description: “Max de reps, circuit non-stop”,
exercises: [
{ id: “jeu-1”, name: “Arm Swings”, sets: 1, reps: 20, rest: 0, isWarmup: true, cue: “Balance les bras d avant en arriere, puis croises devant.” },
{ id: “jeu-2”, name: “Dips 21s”, sets: 3, reps: 21, rest: 45, cue: “7 reps demi-basses, 7 demi-hautes, 7 completes SANS PAUSE.” },
{ id: “jeu-3”, name: “Pushup Barres”, sets: 3, reps: 10, rest: 30, cue: “Mains sur les barres basses. ROM total = gains totaux.” }
]
},
{
id: 4, day: “VEN”, full: “VENDREDI”, theme: “FINISHER”, emoji: “🏆”,
color: “#E040FB”, duration: “7 min”, description: “Tout donner pour finir la semaine”,
exercises: [
{ id: “ven-1”, name: “Dips Iso x2”, sets: 1, reps: 2, rest: 0, isWarmup: true, cue: “Descends a mi-chemin. Tiens 10 secondes. Repete 2 fois.” },
{ id: “ven-2”, name: “Dips AMRAP”, sets: 1, reps: 0, rest: 0, cue: “UN seul set, tout donner jusqu a l echec. Note ton score !” },
{ id: “ven-3”, name: “Dips Large Prise”, sets: 3, reps: 8, rest: 35, cue: “Mains en bout de barre, buste tres incline. Etirement max des pecs.” }
]
}
];

function load(key, fallback) {
try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch(e) { return fallback; }
}
function save(key, val) {
try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

function MiniChart(props) {
var data = props.data;
var color = props.color;
var width = props.width || 180;
var height = props.height || 48;
if (!data || data.length < 2) {
return (
<div style={{ width: width, height: height, display: “flex”, alignItems: “center”, justifyContent: “center” }}>
<span style={{ fontSize: 10, color: “#333” }}>Pas encore de donnees</span>
</div>
);
}
var vals = data.map(function(d) { return d.value; });
var min = Math.min.apply(null, vals);
var max = Math.max.apply(null, vals);
var range = max - min || 1;
var pts = data.map(function(d, i) {
var x = (i / (data.length - 1)) * (width - 8) + 4;
var y = height - 8 - ((d.value - min) / range) * (height - 16);
return x + “,” + y;
}).join(” “);
var lastArr = pts.split(” “);
var lastPt = lastArr[lastArr.length - 1].split(”,”);
var gradId = “g” + color.replace(”#”, “”);
return (
<svg width={width} height={height} style={{ overflow: “visible” }}>
<defs>
<linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor={color} stopOpacity="0.3" />
<stop offset="100%" stopColor={color} stopOpacity="0" />
</linearGradient>
</defs>
<polygon points={“4,” + height + “ “ + pts + “ “ + (width - 4) + “,” + height} fill={“url(#” + gradId + “)”} />
<polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
<circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
</svg>
);
}

function RestTimer(props) {
var seconds = props.seconds;
var color = props.color;
var onDone = props.onDone;
var ref = useRef();
var state = useState(seconds);
var left = state[0];
var setLeft = state[1];
useEffect(function() {
ref.current = setInterval(function() {
setLeft(function(t) {
if (t <= 1) { clearInterval(ref.current); onDone(); return 0; }
return t - 1;
});
}, 1000);
return function() { clearInterval(ref.current); };
}, []);
var pct = left / seconds;
var r = 54;
var circ = 2 * Math.PI * r;
return (
<div style={{ position: “fixed”, inset: 0, zIndex: 300, background: “#07070C”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, gap: 24, fontFamily: “monospace” }}>
<div style={{ fontSize: 10, letterSpacing: 6, color: “#444” }}>REPOS</div>
<div style={{ position: “relative”, width: 120, height: 120 }}>
<svg width=“120” height=“120” style={{ transform: “rotate(-90deg)”, position: “absolute” }}>
<circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a1a" strokeWidth="6" />
<circle cx=“60” cy=“60” r={r} fill=“none” stroke={color} strokeWidth=“6”
strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
strokeLinecap=“round” style={{ transition: “stroke-dashoffset 1s linear” }} />
</svg>
<div style={{ position: “absolute”, inset: 0, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 36, fontWeight: 900, color: color }}>{left}</div>
</div>
<div style={{ fontSize: 12, color: “#555” }}>Prochain set dans {left}s</div>
<button onClick={onDone} style={{ padding: “12px 32px”, borderRadius: 30, border: “1px solid “ + color + “44”, background: “transparent”, color: color, cursor: “pointer”, fontSize: 13, fontFamily: “monospace”, letterSpacing: 2 }}>PASSER</button>
</div>
);
}

function RepInput(props) {
var target = props.target;
var color = props.color;
var onConfirm = props.onConfirm;
var state = useState(target || 0);
var val = state[0];
var setVal = state[1];
var presets = [3, 4, 5, 6, 7, 8, 10, 12, 15, 20];
return (
<div style={{ position: “fixed”, inset: 0, zIndex: 300, background: “rgba(0,0,0,0.95)”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, gap: 20, fontFamily: “monospace”, padding: 32 }}>
<div style={{ fontSize: 10, letterSpacing: 6, color: “#555” }}>REPS EFFECTUEES</div>
<div style={{ fontSize: 13, color: “#888” }}>Objectif: <span style={{ color: color }}>{target || “MAX”}</span></div>
<div style={{ display: “flex”, alignItems: “center”, gap: 20 }}>
<button onClick={function() { setVal(function(v) { return Math.max(0, Number(v) - 1); }); }} style={{ width: 52, height: 52, borderRadius: “50%”, border: “1px solid #2a2a2a”, background: “#111”, color: “#888”, fontSize: 24, cursor: “pointer” }}>-</button>
<div style={{ fontSize: 72, fontWeight: 900, color: color, minWidth: 100, textAlign: “center”, lineHeight: 1 }}>{val}</div>
<button onClick={function() { setVal(function(v) { return Number(v) + 1; }); }} style={{ width: 52, height: 52, borderRadius: “50%”, border: “1px solid “ + color + “44”, background: color + “11”, color: color, fontSize: 24, cursor: “pointer” }}>+</button>
</div>
<div style={{ display: “flex”, gap: 8, flexWrap: “wrap”, justifyContent: “center” }}>
{presets.map(function(n) {
return (
<button key={n} onClick={function() { setVal(n); }} style={{ padding: “6px 12px”, borderRadius: 8, border: “1px solid “ + (val === n ? color : “#2a2a2a”), background: val === n ? color + “22” : “#111”, color: val === n ? color : “#555”, fontSize: 12, cursor: “pointer” }}>{n}</button>
);
})}
</div>
<button onClick={function() { onConfirm(Number(val)); }} style={{ width: “100%”, maxWidth: 280, padding: “16px”, borderRadius: 14, border: “none”, background: color, color: “#000”, fontWeight: 900, fontSize: 15, cursor: “pointer”, letterSpacing: 2, fontFamily: “monospace”, marginTop: 8 }}>CONFIRMER</button>
</div>
);
}

function WorkoutScreen(props) {
var day = props.day;
var history = props.history;
var onFinish = props.onFinish;
var onBack = props.onBack;

var steps = [];
day.exercises.forEach(function(ex) {
for (var s = 0; s < ex.sets; s++) {
steps.push({ ex: ex, setNum: s + 1, totalSets: ex.sets });
}
});

var s1 = useState(0); var step = s1[0]; var setStep = s1[1];
var s2 = useState(false); var resting = s2[0]; var setResting = s2[1];
var s3 = useState(false); var askReps = s3[0]; var setAskReps = s3[1];
var s4 = useState({}); var sessionReps = s4[0]; var setSessionReps = s4[1];

var current = steps[step];
var isDone = step >= steps.length;
var progress = step / steps.length;

function handleSetDone() {
if (!current.ex.isWarmup) {
setAskReps(true);
} else {
advance(null);
}
}

function advance(repsCount) {
setAskReps(false);
if (repsCount !== null && !current.ex.isWarmup) {
var key = current.ex.id;
setSessionReps(function(prev) {
var next = Object.assign({}, prev);
next[key] = (next[key] || []).concat([repsCount]);
return next;
});
}
var next = step + 1;
if (next >= steps.length) { setStep(next); return; }
var nextStep = steps[next];
if (!current.ex.isWarmup && current.ex.rest > 0 && nextStep.ex.id === current.ex.id) {
setResting(true);
} else {
setStep(next);
}
}

function finishWorkout() {
onFinish(sessionReps);
}

return (
<div style={{ position: “fixed”, inset: 0, zIndex: 100, background: “#07070C”, display: “flex”, flexDirection: “column”, fontFamily: “monospace”, overflowY: “auto” }}>
{resting && <RestTimer seconds={current.ex.rest} color={day.color} onDone={function() { setResting(false); setStep(function(s) { return s + 1; }); }} />}
{askReps && <RepInput target={current.ex.reps || 0} color={day.color} onConfirm={advance} />}

```
  <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #111", flexShrink: 0 }}>
    <button onClick={onBack} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer", padding: "4px 8px 4px 0", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 18 }}>{"<"}</span>
      <span style={{ fontSize: 12, letterSpacing: 1 }}>RETOUR</span>
    </button>
    <div style={{ flex: 1 }} />
    <div style={{ fontSize: 10, letterSpacing: 3, color: day.color }}>{day.theme}</div>
  </div>

  <div style={{ height: 3, background: "#111", flexShrink: 0 }}>
    <div style={{ height: "100%", background: day.color, width: (progress * 100) + "%", transition: "width 0.4s ease" }} />
  </div>

  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
    {isDone ? (
      <div style={{ textAlign: "center", width: "100%", maxWidth: 340 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: day.color, lineHeight: 1.1, marginBottom: 8 }}>SEANCE TERMINEE !</div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 32 }}>Repos merite. A demain.</div>
        {Object.keys(sessionReps).length > 0 && (
          <div style={{ background: "#0e0e14", borderRadius: 14, padding: 16, marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 12 }}>RESUME DE SEANCE</div>
            {day.exercises.filter(function(e) { return !e.isWarmup; }).map(function(ex) {
              var reps = sessionReps[ex.id] || [];
              if (!reps.length) return null;
              return (
                <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #151515" }}>
                  <div style={{ fontSize: 12, color: "#888" }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {reps.map(function(r, i) {
                      return <span key={i} style={{ fontSize: 12, fontWeight: 900, color: day.color, background: day.color + "15", padding: "2px 8px", borderRadius: 6 }}>{r}</span>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={finishWorkout} style={{ width: "100%", padding: "18px", borderRadius: 14, border: "none", background: day.color, color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 2, fontFamily: "monospace" }}>SAUVEGARDER</button>
      </div>
    ) : (
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {current.ex.isWarmup && <div style={{ fontSize: 10, letterSpacing: 4, color: "#555", marginBottom: 10 }}>ECHAUFFEMENT</div>}
          <div style={{ fontSize: 11, color: day.color, letterSpacing: 3, marginBottom: 8 }}>SET {current.setNum} / {current.totalSets}</div>
          <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, color: "#E0DDD6" }}>{current.ex.name}</div>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 6, background: day.color + "15", border: "1px solid " + day.color + "33", borderRadius: 12, padding: "10px 24px", marginBottom: 24 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: day.color, lineHeight: 1 }}>{current.ex.reps || "MAX"}</span>
            <span style={{ fontSize: 12, color: day.color + "99" }}>reps</span>
          </div>
          {history[current.ex.id] && history[current.ex.id].length > 0 && (function() {
            var allSets = [].concat.apply([], history[current.ex.id]);
            var best = Math.max.apply(null, allSets);
            var last = history[current.ex.id][history[current.ex.id].length - 1];
            var lastAvg = Math.round(last.reduce(function(a,b){return a+b;},0)/last.length);
            return (
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
                <div style={{ background: "#111", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>RECORD</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{best}</div>
                </div>
                <div style={{ background: "#111", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>DERNIERE</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#888" }}>{lastAvg}</div>
                </div>
              </div>
            );
          })()}
        </div>
        <div style={{ background: "#0e0e14", borderLeft: "3px solid " + day.color + "55", borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 32, fontSize: 12, color: "#666", lineHeight: 1.7 }}>{current.ex.cue}</div>
        <button onClick={handleSetDone} style={{ width: "100%", padding: "18px", borderRadius: 14, border: "none", background: current.ex.isWarmup ? "#1a1a1a" : day.color, color: current.ex.isWarmup ? "#666" : "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 2, fontFamily: "monospace" }}>
          {current.ex.isWarmup ? "FAIT" : "SET TERMINE"}
        </button>
      </div>
    )}
  </div>
</div>
```

);
}

function ProgressScreen(props) {
var history = props.history;
var onBack = props.onBack;
var s1 = useState(null); var selectedEx = s1[0]; var setSelectedEx = s1[1];

var allExercises = [];
WEEK.forEach(function(d) {
d.exercises.forEach(function(e) {
if (!e.isWarmup) allExercises.push(Object.assign({}, e, { dayColor: d.color, dayLabel: d.day }));
});
});

var exWithData = allExercises.filter(function(e) { return history[e.id] && history[e.id].length > 0; });

return (
<div style={{ minHeight: “100vh”, background: “#07070C”, fontFamily: “monospace”, color: “#E0DDD6” }}>
<div style={{ padding: “16px 20px”, display: “flex”, alignItems: “center”, gap: 12, borderBottom: “1px solid #111”, position: “sticky”, top: 0, background: “#07070C”, zIndex: 10 }}>
<button onClick={onBack} style={{ background: “none”, border: “none”, color: “#555”, fontSize: 20, cursor: “pointer”, display: “flex”, alignItems: “center”, gap: 6, padding: “4px 8px 4px 0” }}>
<span style={{ fontSize: 18 }}>{”<”}</span>
<span style={{ fontSize: 12, letterSpacing: 1 }}>RETOUR</span>
</button>
<div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>PROGRESSION</div>
</div>
<div style={{ padding: “20px 16px 60px” }}>
{exWithData.length === 0 ? (
<div style={{ textAlign: “center”, padding: “60px 20px” }}>
<div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
<div style={{ fontSize: 14, color: “#444”, lineHeight: 1.7 }}>Aucune donnee encore. Lance ta premiere seance !</div>
</div>
) : exWithData.map(function(ex) {
var sessions = history[ex.id];
var chartData = sessions.map(function(sets, i) {
return { value: Math.round(sets.reduce(function(a,b){return a+b;},0)/sets.length), label: “S” + (i+1) };
});
var allReps = [].concat.apply([], sessions);
var best = Math.max.apply(null, allReps);
var latest = sessions[sessions.length - 1];
var latestAvg = Math.round(latest.reduce(function(a,b){return a+b;},0)/latest.length);
var trend = 0;
if (sessions.length >= 2) {
var prev = sessions[sessions.length - 2];
var prevAvg = Math.round(prev.reduce(function(a,b){return a+b;},0)/prev.length);
trend = latestAvg - prevAvg;
}
return (
<div key={ex.id} style={{ background: “#0b0b12”, border: “1px solid #1a1a24”, borderRadius: 16, padding: 18, marginBottom: 12 }}
onClick={function() { setSelectedEx(selectedEx === ex.id ? null : ex.id); }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, marginBottom: 12 }}>
<div>
<span style={{ fontSize: 9, padding: “2px 8px”, borderRadius: 20, background: ex.dayColor + “22”, color: ex.dayColor, letterSpacing: 1 }}>{ex.dayLabel}</span>
<div style={{ fontSize: 14, fontWeight: 900, color: “#ddd”, marginTop: 4 }}>{ex.name}</div>
</div>
<div style={{ textAlign: “right” }}>
<div style={{ fontSize: 24, fontWeight: 900, color: ex.dayColor }}>{latestAvg}</div>
<div style={{ fontSize: 10, color: trend > 0 ? “#4CAF50” : trend < 0 ? “#f44336” : “#555” }}>
{trend > 0 ? (”+ “ + trend) : trend < 0 ? (”- “ + Math.abs(trend)) : “stable”}
</div>
</div>
</div>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-end” }}>
<MiniChart data={chartData} color={ex.dayColor} width={160} height={44} />
<div style={{ textAlign: “right” }}>
<div style={{ fontSize: 9, color: “#444”, letterSpacing: 2 }}>RECORD</div>
<div style={{ fontSize: 18, fontWeight: 900, color: “#FFD700” }}>{best}</div>
<div style={{ fontSize: 9, color: “#333” }}>{sessions.length} seances</div>
</div>
</div>
{selectedEx === ex.id && (
<div style={{ marginTop: 16, paddingTop: 16, borderTop: “1px solid #151515” }}>
<div style={{ fontSize: 10, letterSpacing: 3, color: “#444”, marginBottom: 10 }}>HISTORIQUE</div>
{sessions.slice(-5).reverse().map(function(sets, i) {
return (
<div key={i} style={{ display: “flex”, alignItems: “center”, gap: 8, marginBottom: 8 }}>
<div style={{ fontSize: 10, color: “#444”, width: 40 }}>S-{sessions.length - i}</div>
<div style={{ display: “flex”, gap: 4, flex: 1 }}>
{sets.map(function(r, j) {
return <span key={j} style={{ fontSize: 12, fontWeight: 900, color: ex.dayColor, background: ex.dayColor + “15”, padding: “3px 8px”, borderRadius: 6 }}>{r}</span>;
})}
</div>
<div style={{ fontSize: 11, color: “#555” }}>moy. {Math.round(sets.reduce(function(a,b){return a+b;},0)/sets.length)}</div>
</div>
);
})}
</div>
)}
</div>
);
})}
</div>
</div>
);
}

function DayScreen(props) {
var day = props.day;
var history = props.history;
var onBack = props.onBack;
var onStart = props.onStart;
return (
<div style={{ minHeight: “100vh”, background: “#07070C”, fontFamily: “monospace”, color: “#E0DDD6” }}>
<div style={{ padding: “16px 20px”, display: “flex”, alignItems: “center”, gap: 12, borderBottom: “1px solid #111”, position: “sticky”, top: 0, background: “#07070C”, zIndex: 10 }}>
<button onClick={onBack} style={{ background: “none”, border: “none”, color: “#555”, fontSize: 20, cursor: “pointer”, display: “flex”, alignItems: “center”, gap: 6, padding: “4px 8px 4px 0” }}>
<span style={{ fontSize: 18 }}>{”<”}</span>
<span style={{ fontSize: 12, letterSpacing: 1 }}>RETOUR</span>
</button>
<div>
<div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, color: day.color }}>{day.full}</div>
<div style={{ fontSize: 10, color: “#444”, letterSpacing: 2 }}>{day.theme} - {day.duration}</div>
</div>
</div>
<div style={{ padding: “20px 16px 120px” }}>
{day.exercises.map(function(ex) {
var exHistory = history[ex.id] || [];
var lastSession = exHistory.length > 0 ? exHistory[exHistory.length - 1] : null;
return (
<div key={ex.id} style={{ background: “#0b0b12”, border: “1px solid “ + (ex.isWarmup ? “#111” : “#1a1a24”), borderRadius: 14, padding: “16px”, marginBottom: 10, opacity: ex.isWarmup ? 0.6 : 1 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, marginBottom: 8 }}>
<div>
{ex.isWarmup && <div style={{ fontSize: 9, color: “#444”, letterSpacing: 3, marginBottom: 4 }}>ECHAUFFEMENT</div>}
<div style={{ fontSize: 14, fontWeight: 900, color: ex.isWarmup ? “#555” : “#ddd” }}>{ex.name}</div>
</div>
<div style={{ display: “flex”, gap: 6 }}>
<span style={{ fontSize: 10, padding: “3px 8px”, borderRadius: 6, background: “#111”, color: “#666” }}>{ex.sets}x{ex.reps || “MAX”}</span>
{ex.rest > 0 && <span style={{ fontSize: 10, padding: “3px 8px”, borderRadius: 6, background: “#111”, color: “#555” }}>{ex.rest}s</span>}
</div>
</div>
<div style={{ fontSize: 12, color: “#555”, lineHeight: 1.6, marginBottom: lastSession ? 12 : 0 }}>{ex.cue}</div>
{lastSession && !ex.isWarmup && (
<div style={{ display: “flex”, alignItems: “center”, gap: 8, paddingTop: 10, borderTop: “1px solid #111” }}>
<span style={{ fontSize: 9, color: “#444”, letterSpacing: 2 }}>DERNIERE FOIS</span>
{lastSession.map(function(r, j) {
return <span key={j} style={{ fontSize: 12, fontWeight: 900, color: day.color, background: day.color + “15”, padding: “2px 8px”, borderRadius: 6 }}>{r}</span>;
})}
</div>
)}
</div>
);
})}
</div>
<div style={{ position: “fixed”, bottom: 0, left: 0, right: 0, padding: “16px 20px 32px”, background: “linear-gradient(transparent, #07070C 40%)” }}>
<button onClick={onStart} style={{ width: “100%”, padding: “18px”, borderRadius: 16, border: “none”, background: day.color, color: “#000”, fontWeight: 900, fontSize: 16, cursor: “pointer”, letterSpacing: 3, fontFamily: “monospace” }}>DEMARRER LA SEANCE</button>
</div>
</div>
);
}

export default function App() {
var s1 = useState(“home”); var screen = s1[0]; var setScreen = s1[1];
var s2 = useState(null); var selectedDay = s2[0]; var setSelectedDay = s2[1];
var s3 = useState(function() { return load(“doneDays_v2”, {}); }); var doneDays = s3[0]; var setDoneDays = s3[1];
var s4 = useState(function() { return load(“repHistory_v2”, {}); }); var history = s4[0]; var setHistory = s4[1];

var today = new Date().getDay();
var todayIdx = (today >= 1 && today <= 5) ? today - 1 : null;

useEffect(function() {
var last = localStorage.getItem(“weekStart_v2”);
var d = new Date();
var day = d.getDay();
var diff = d.getDate() - day + (day === 0 ? -6 : 1);
var monday = new Date(d.setDate(diff)).toDateString();
if (last !== monday) {
setDoneDays({});
save(“doneDays_v2”, {});
localStorage.setItem(“weekStart_v2”, monday);
}
}, []);

function handleFinish(sessionReps) {
var newHistory = Object.assign({}, history);
Object.keys(sessionReps).forEach(function(exId) {
if (!newHistory[exId]) newHistory[exId] = [];
newHistory[exId].push(sessionReps[exId]);
});
setHistory(newHistory);
save(“repHistory_v2”, newHistory);
var updated = Object.assign({}, doneDays);
updated[selectedDay.id] = true;
setDoneDays(updated);
save(“doneDays_v2”, updated);
setScreen(“home”);
setSelectedDay(null);
}

if (screen === “progress”) return <ProgressScreen history={history} onBack={function() { setScreen(“home”); }} />;
if (screen === “day” && selectedDay) return <DayScreen day={selectedDay} history={history} onBack={function() { setScreen(“home”); setSelectedDay(null); }} onStart={function() { setScreen(“workout”); }} />;
if (screen === “workout” && selectedDay) return <WorkoutScreen day={selectedDay} history={history} onFinish={handleFinish} onBack={function() { setScreen(“day”); }} />;

var totalDone = Object.keys(doneDays).length;
var totalReps = 0;
Object.values(history).forEach(function(sessions) {
sessions.forEach(function(sets) {
sets.forEach(function(r) { totalReps += r; });
});
});

return (
<div style={{ minHeight: “100vh”, background: “#07070C”, fontFamily: “monospace”, color: “#E0DDD6” }}>
<div style={{ maxWidth: 480, margin: “0 auto”, padding: “28px 16px 80px” }}>
<div style={{ marginBottom: 28 }}>
<div style={{ fontSize: 9, letterSpacing: 6, color: “#333”, marginBottom: 10 }}>BARRE A DIPS - 5J - MAX 10MIN</div>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-end” }}>
<h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, lineHeight: 0.9, letterSpacing: -2 }}>
DIP BAR<br /><span style={{ color: “#C8F542” }}>5-DAY</span>
</h1>
<button onClick={function() { setScreen(“progress”); }} style={{ background: “#0e0e18”, border: “1px solid #1a1a24”, borderRadius: 12, padding: “10px 16px”, cursor: “pointer”, textAlign: “right”, color: “#E0DDD6” }}>
<div style={{ fontSize: 9, color: “#444”, letterSpacing: 2, marginBottom: 2 }}>TOTAL REPS</div>
<div style={{ fontSize: 20, fontWeight: 900, color: “#C8F542” }}>{totalReps}</div>
<div style={{ fontSize: 9, color: “#555”, marginTop: 2 }}>voir progression</div>
</button>
</div>
<div style={{ marginTop: 16, height: 1, background: “linear-gradient(90deg, #C8F54233, transparent)” }} />
</div>

```
    <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
      {WEEK.map(function(d, i) {
        return (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 3, borderRadius: 2, marginBottom: 5, background: doneDays[i] ? d.color : todayIdx === i ? d.color + "44" : "#141414", transition: "background 0.3s" }} />
            <div style={{ fontSize: 9, color: todayIdx === i ? d.color : doneDays[i] ? "#333" : "#2a2a2a", fontWeight: todayIdx === i ? 900 : 400, letterSpacing: 1 }}>{d.day}</div>
          </div>
        );
      })}
      {["SAM", "DIM"].map(function(d) {
        return (
          <div key={d} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 3, borderRadius: 2, marginBottom: 5, background: "#0e0e0e" }} />
            <div style={{ fontSize: 9, color: "#1a1a1a" }}>{d}</div>
          </div>
        );
      })}
    </div>

    {WEEK.map(function(d, i) {
      var isToday = todayIdx === i;
      var isDone = !!doneDays[i];
      return (
        <div key={i} onClick={function() { setSelectedDay(d); setScreen("day"); }}
          style={{ background: isToday ? d.color + "07" : "#0b0b12", border: "1px solid " + (isToday ? d.color + "33" : "#131318"), borderRadius: 16, padding: "16px 18px", marginBottom: 8, cursor: "pointer", position: "relative", overflow: "hidden", opacity: isDone ? 0.55 : 1 }}>
          {isToday && !isDone && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, " + d.color + ", transparent)" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, flexShrink: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: isDone ? "#2a2a2a" : isToday ? d.color : "#444", lineHeight: 1 }}>{d.day}</div>
              <div style={{ fontSize: 8, color: isDone ? "#2a2a2a" : isToday ? d.color + "99" : "#2a2a2a", marginTop: 3, letterSpacing: 1 }}>{isDone ? "FAIT" : isToday ? "AUJOURD HUI" : ""}</div>
            </div>
            <div style={{ width: 1, height: 34, background: "#1a1a1a", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13 }}>{d.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: isDone ? "#333" : "#ccc" }}>{d.theme}</span>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: isDone ? "#111" : d.color + "15", color: isDone ? "#333" : d.color }}>{d.duration}</span>
              </div>
              <div style={{ fontSize: 11, color: "#3a3a3a" }}>{d.description}</div>
            </div>
            <div style={{ fontSize: 16, color: isDone ? "#222" : isToday ? d.color : "#1e1e1e" }}>{">"}</div>
          </div>
        </div>
      );
    })}

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4, marginBottom: 24 }}>
      {["SAMEDI", "DIMANCHE"].map(function(d) {
        return (
          <div key={d} style={{ background: "#090910", border: "1px solid #0f0f0f", borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 1, marginBottom: 4 }}>{d}</div>
            <div style={{ fontSize: 16 }}>😴</div>
            <div style={{ fontSize: 10, color: "#1e1e1e", marginTop: 3 }}>Recuperation</div>
          </div>
        );
      })}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {[
        { label: "SEANCES", value: Object.values(history).reduce(function(a,s){return a+s.length;},0), color: "#C8F542" },
        { label: "SEMAINE", value: totalDone + "/5", color: "#FF9F1C" },
        { label: "EXERCICES", value: Object.keys(history).length, color: "#00C9FF" }
      ].map(function(s) {
        return (
          <div key={s.label} style={{ background: "#0b0b12", border: "1px solid #111", borderRadius: 12, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        );
      })}
    </div>
  </div>
</div>
```

);
}
