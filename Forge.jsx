import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, CartesianAxis
} from "recharts";
import {
  Flame, Check, ChevronDown, ChevronRight, Dumbbell, Droplets, Moon,
  BookOpen, Sparkles, Briefcase, TrendingUp, Target, Award, Settings,
  Home, CalendarDays, User, Plus, X, Pencil, Footprints, Brain,
  HeartHandshake, Wine, ScrollText, Lock, Unlock, ChevronLeft, Trash2
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens — "The Forge"                                        */
/*  bg graphite / ember accent (hot) / steel accent (cool, disciplined)*/
/* ------------------------------------------------------------------ */
const T = {
  bg: "#0D0E10",
  surface: "#17191C",
  surfaceRaised: "#1F2226",
  border: "#2A2D32",
  borderSoft: "#212327",
  textPrimary: "#F3F1EC",
  textSecondary: "#9A9DA3",
  textTertiary: "#5C6066",
  ember: "#FF6A35",
  emberDim: "#7A3B22",
  emberSoft: "rgba(255,106,53,0.14)",
  steel: "#6E93A6",
  steelSoft: "rgba(110,147,166,0.14)",
  success: "#6FAE7C",
  successSoft: "rgba(111,174,124,0.14)",
  miss: "#C15C51",
  missSoft: "rgba(193,92,81,0.14)",
};

const displayFont = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const monoFont = "'SF Mono', ui-monospace, 'Roboto Mono', Menlo, monospace";

const CONFIG_KEY = "forge-config-v2";
const LOGS_KEY = "forge-logs-v2";

/* ------------------------------------------------------------------ */
/*  Default data model                                                 */
/* ------------------------------------------------------------------ */
const ICONS = {
  prayer: HeartHandshake, bible: BookOpen, workout: Dumbbell, steps: Footprints,
  sleep: Moon, protein: Flame, water: Droplets, creatine: Sparkles,
  noporn: Lock, read: BookOpen, journal: ScrollText, screen: Wine,
  ai: Brain, interview: Briefcase, work: Briefcase, content: TrendingUp,
  trading: TrendingUp, hobby: Sparkles,
};

const defaultHabits = [
  { id: "morningPrayer", name: "Morning Prayer", category: "Spiritual", points: 5, icon: "prayer" },
  { id: "bibleReading", name: "Bible Reading", category: "Spiritual", points: 10, icon: "bible" },
  { id: "nightPrayer", name: "Night Prayer", category: "Spiritual", points: 5, icon: "prayer" },

  { id: "workout", name: "Workout Completed", category: "Fitness", points: 20, icon: "workout" },
  { id: "steps", name: "10,000 Steps / Run", category: "Fitness", points: 10, icon: "steps" },
  { id: "sleep", name: "Sleep 8 Hours", category: "Fitness", points: 10, icon: "sleep" },

  { id: "proteinGoal", name: "Protein Goal (80g+)", category: "Nutrition", points: 15, icon: "protein", type: "counter", target: 80, unit: "g" },
  { id: "waterGoal", name: "Water Goal (4L)", category: "Nutrition", points: 10, icon: "water", type: "counter", target: 4, unit: "L" },
  { id: "creatine", name: "Creatine", category: "Nutrition", points: 3, icon: "creatine" },
  { id: "eggs", name: "Eggs", category: "Nutrition", points: 0, icon: "protein", optional: true },
  { id: "chicken", name: "Chicken", category: "Nutrition", points: 0, icon: "protein", optional: true },
  { id: "proteinShake", name: "Protein Shake", category: "Nutrition", points: 0, icon: "protein", optional: true },

  { id: "noPorn", name: "No Porn / NoFap", category: "Discipline", points: 10, icon: "noporn" },
  { id: "read10", name: "Read 10 Pages", category: "Discipline", points: 5, icon: "read" },
  { id: "journal", name: "Journal", category: "Discipline", points: 5, icon: "journal" },
  { id: "screenTime", name: "Screen Time Under Target", category: "Discipline", points: 0, icon: "screen", optional: true },

  { id: "aiml", name: "AI/ML Learning", category: "Career", points: 7, icon: "ai" },
  { id: "interview", name: "Google Interview Prep", category: "Career", points: 7, icon: "interview" },
  { id: "workDone", name: "Work Completed", category: "Career", points: 6, icon: "work" },

  { id: "content", name: "Content Creation", category: "Growth", points: 5, icon: "content" },
  { id: "trading", name: "Trading Practice", category: "Growth", points: 5, icon: "trading" },
  { id: "guitar", name: "Guitar", category: "Growth", points: 3, icon: "hobby", phase: "phase1" },
  { id: "badminton", name: "Badminton", category: "Growth", points: 3, icon: "hobby", phase: "phase1" },
  { id: "cricket", name: "Cricket", category: "Growth", points: 3, icon: "hobby", phase: "phase2" },
  { id: "dance", name: "Dance", category: "Growth", points: 3, icon: "hobby", phase: "phase3" },
];

const CATEGORY_ORDER = ["Spiritual", "Fitness", "Nutrition", "Discipline", "Career", "Growth"];

const defaultGoals = [
  { id: "g1", name: "Become excellent at my AI/ML job", category: "Career", progress: 20 },
  { id: "g2", name: "Land a Google AI/ML role", category: "Career", progress: 10 },
  { id: "g3", name: "Lean athletic physique", category: "Fitness", progress: 30 },
  { id: "g4", name: "Consistent gym attendance", category: "Fitness", progress: 45 },
  { id: "g5", name: "Daily prayer", category: "Spiritual", progress: 60 },
  { id: "g6", name: "Daily Bible reading", category: "Spiritual", progress: 55 },
  { id: "g7", name: "Grow Instagram", category: "Content", progress: 15 },
  { id: "g8", name: "Start YouTube", category: "Content", progress: 5 },
  { id: "g9", name: "Travel every two months", category: "Lifestyle", progress: 25 },
];

const defaultRewards = [
  { id: "r1", name: "MacBook", threshold: 90, note: "90 Elite Days" },
  { id: "r2", name: "iPhone", threshold: 60, note: "60 Elite Days" },
  { id: "r3", name: "Chelsea Boots", threshold: 30, note: "30 Elite Days" },
  { id: "r4", name: "Silver Chain", threshold: 15, note: "15 Elite Days" },
];

const defaultConfig = {
  habits: defaultHabits,
  goals: defaultGoals,
  rewards: defaultRewards,
  phase: "phase1",
  profile: { name: "", height: "", goalWeight: "", currentWeightFallback: "" },
  quotes: [
    "Small wins become great lives.",
    "Don't break the chain.",
    "Forge yourself today.",
    "Live every inch of life.",
    "Consistency outlasts intensity.",
    "Discipline is remembering what you want.",
  ],
};

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */
const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => toKey(new Date());
const addDays = (key, n) => {
  const d = new Date(key + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toKey(d);
};
const dayLabel = (key) => {
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};
const fmtGreetTime = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
};

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */
async function loadConfig() {
  try {
    const res = await window.storage.get(CONFIG_KEY, false);
    if (res && res.value) return { ...defaultConfig, ...JSON.parse(res.value) };
  } catch (e) {}
  return defaultConfig;
}
async function saveConfig(cfg) {
  try { await window.storage.set(CONFIG_KEY, JSON.stringify(cfg), false); } catch (e) {}
}
async function loadLogs() {
  try {
    const res = await window.storage.get(LOGS_KEY, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {}
  return {};
}
async function saveLogs(logs) {
  try { await window.storage.set(LOGS_KEY, JSON.stringify(logs), false); } catch (e) {}
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                             */
/* ------------------------------------------------------------------ */
function activeHabitsFor(config) {
  return config.habits.filter((h) => !h.phase || h.phase === config.phase);
}
function scoredHabitsFor(config) {
  return activeHabitsFor(config).filter((h) => !h.optional && h.points > 0);
}
function dayScore(config, log) {
  const habits = scoredHabitsFor(config);
  const total = habits.reduce((s, h) => s + h.points, 0);
  if (!total) return 0;
  let earned = 0;
  habits.forEach((h) => {
    const v = log ? log[h.id] : undefined;
    if (h.type === "counter") {
      if (typeof v === "number" && v >= h.target) earned += h.points;
      else if (typeof v === "number") earned += h.points * Math.min(1, v / h.target);
    } else if (v === true) earned += h.points;
  });
  return Math.round((earned / total) * 100);
}
function scoreLabel(score) {
  if (score >= 95) return { label: "Elite Day", color: T.ember };
  if (score >= 85) return { label: "Great Day", color: T.ember };
  if (score >= 70) return { label: "Good Day", color: T.steel };
  return { label: "Needs Improvement", color: T.textTertiary };
}
function computeStreak(config, logs, endKey) {
  let streak = 0;
  let cursor = endKey;
  for (let i = 0; i < 3650; i++) {
    const s = dayScore(config, logs[cursor]);
    if (s >= 70) { streak++; cursor = addDays(cursor, -1); }
    else break;
  }
  return streak;
}
function computeLongestStreak(config, logs) {
  const keys = Object.keys(logs).sort();
  if (!keys.length) return 0;
  let longest = 0, cur = 0, prevKey = null;
  keys.forEach((k) => {
    const s = dayScore(config, logs[k]);
    if (s >= 70) {
      if (prevKey && addDays(prevKey, 1) === k) cur++;
      else cur = 1;
      longest = Math.max(longest, cur);
    } else cur = 0;
    prevKey = k;
  });
  return longest;
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                     */
/* ------------------------------------------------------------------ */
function Card({ children, style }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20,
      padding: 18, ...style,
    }}>{children}</div>
  );
}

function ForgeRing({ score, size = 148 }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  // heat colour interpolation: steel (cool) -> ember (mid) -> white (hot)
  const heatColor = score >= 90 ? "#FFE9D6" : score >= 70 ? T.ember : score >= 40 ? "#D97A46" : T.steel;
  const glow = Math.min(1, score / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.borderSoft} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={heatColor} strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 ${6 + glow * 14}px ${heatColor})`, transition: "stroke-dasharray .6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: monoFont, fontSize: 34, fontWeight: 700, color: T.textPrimary, lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: monoFont, fontSize: 11, color: T.textTertiary, marginTop: 4, letterSpacing: 1 }}>/ 100</div>
      </div>
    </div>
  );
}

function Pill({ children, color = T.textSecondary, bg = "transparent" }) {
  return (
    <span style={{
      fontFamily: monoFont, fontSize: 11, letterSpacing: 0.4, color, background: bg,
      padding: "3px 9px", borderRadius: 999, border: bg === "transparent" ? `1px solid ${T.border}` : "none",
    }}>{children}</span>
  );
}

function IconFor({ name, size = 17, color }) {
  const Icon = ICONS[name] || Sparkles;
  return <Icon size={size} color={color || T.textSecondary} strokeWidth={2} />;
}

/* ------------------------------------------------------------------ */
/*  Today tab                                                          */
/* ------------------------------------------------------------------ */
function TodayTab({ config, logs, setLogs, selectedDate, setSelectedDate }) {
  const [collapsed, setCollapsed] = useState({});
  const habits = activeHabitsFor(config);
  const log = logs[selectedDate] || {};
  const score = dayScore(config, log);

  const toggle = (id, habit) => {
    const newLog = { ...log };
    if (habit.type === "counter") return; // handled separately
    newLog[id] = !newLog[id];
    const newLogs = { ...logs, [selectedDate]: newLog };
    setLogs(newLogs);
  };
  const setCounter = (id, val) => {
    const newLog = { ...log, [id]: val };
    setLogs({ ...logs, [selectedDate]: newLog });
  };

  const yesterdayKey = addDays(selectedDate, -1);
  const yesterdayLog = logs[yesterdayKey];
  const yesterdayScore = yesterdayLog ? dayScore(config, yesterdayLog) : null;
  const missedYesterday = yesterdayScore !== null && yesterdayScore < 70;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} style={navBtnStyle}><ChevronLeft size={18} color={T.textSecondary} /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 16, color: T.textPrimary }}>
            {selectedDate === todayKey() ? "Today" : dayLabel(selectedDate)}
          </div>
          <div style={{ fontFamily: monoFont, fontSize: 11, color: T.textTertiary }}>{selectedDate}</div>
        </div>
        <button
          onClick={() => selectedDate !== todayKey() && setSelectedDate(addDays(selectedDate, 1))}
          style={{ ...navBtnStyle, opacity: selectedDate === todayKey() ? 0.3 : 1 }}
        ><ChevronRight size={18} color={T.textSecondary} /></button>
      </div>

      {missedYesterday && (
        <Card style={{ background: T.steelSoft, border: `1px solid ${T.steel}33` }}>
          <div style={{ fontFamily: displayFont, fontWeight: 600, fontSize: 13, color: T.textPrimary, marginBottom: 2 }}>
            Yesterday was missed.
          </div>
          <div style={{ fontFamily: displayFont, fontSize: 12.5, color: T.textSecondary, lineHeight: 1.5 }}>
            Today is your chance to restart. Don't miss twice.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <ForgeRing score={score} size={92} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 15, color: T.textPrimary }}>{scoreLabel(score).label}</div>
          <div style={{ fontFamily: displayFont, fontSize: 12.5, color: T.textSecondary, marginTop: 2 }}>
            {activeHabitsFor(config).filter(h => !h.optional && h.points > 0 && !(log[h.id] === true || (h.type==='counter' && log[h.id] >= h.target))).length} habits remaining
          </div>
        </div>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = habits.filter((h) => h.category === cat);
        if (!items.length) return null;
        const isCollapsed = collapsed[cat];
        const doneCount = items.filter(h => h.type === 'counter' ? (log[h.id] >= h.target) : log[h.id] === true).length;
        return (
          <Card key={cat} style={{ padding: 0, overflow: "hidden" }}>
            <button
              onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "transparent", border: "none", padding: "14px 16px", cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 14, color: T.textPrimary, letterSpacing: 0.2 }}>{cat}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: monoFont, fontSize: 11, color: T.textTertiary }}>{doneCount}/{items.length}</span>
                {isCollapsed ? <ChevronRight size={16} color={T.textTertiary} /> : <ChevronDown size={16} color={T.textTertiary} />}
              </div>
            </button>
            {!isCollapsed && (
              <div style={{ borderTop: `1px solid ${T.borderSoft}` }}>
                {items.map((h) => (
                  <HabitRow key={h.id} habit={h} value={log[h.id]} onToggle={() => toggle(h.id, h)} onCounter={(v) => setCounter(h.id, v)} />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

const navBtnStyle = {
  width: 34, height: 34, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};

function HabitRow({ habit, value, onToggle, onCounter }) {
  const done = habit.type === "counter" ? (value >= habit.target) : value === true;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      borderBottom: `1px solid ${T.borderSoft}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, background: T.surfaceRaised,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <IconFor name={habit.icon} color={done ? T.ember : T.textSecondary} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: displayFont, fontSize: 13.5, fontWeight: 500, color: T.textPrimary }}>{habit.name}</div>
        {habit.optional && <div style={{ fontFamily: monoFont, fontSize: 10, color: T.textTertiary }}>optional shortcut</div>}
      </div>
      {habit.type === "counter" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="number" value={value || ""} placeholder="0"
            onChange={(e) => onCounter(Number(e.target.value))}
            style={{
              width: 52, background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.textPrimary, fontFamily: monoFont, fontSize: 12, padding: "6px 6px", textAlign: "center",
            }}
          />
          <span style={{ fontFamily: monoFont, fontSize: 11, color: T.textTertiary }}>{habit.unit}</span>
        </div>
      ) : (
        <button
          onClick={onToggle}
          style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
            border: `1.5px solid ${done ? T.ember : T.border}`,
            background: done ? T.ember : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: done ? `0 0 12px ${T.emberSoft}` : "none", transition: "all .15s ease",
          }}
        >
          {done && <Check size={15} color="#0D0E10" strokeWidth={3} />}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard tab                                                       */
/* ------------------------------------------------------------------ */
function DashboardTab({ config, logs, quote }) {
  const tKey = todayKey();
  const yKey = addDays(tKey, -1);
  const tScore = dayScore(config, logs[tKey]);
  const yScore = logs[yKey] ? dayScore(config, logs[yKey]) : null;
  const streak = computeStreak(config, logs, tKey);
  const longest = computeLongestStreak(config, logs);
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const daysCompleted = Object.keys(logs).filter((k) => k >= yearStart && dayScore(config, logs[k]) >= 70).length;
  const habits = activeHabitsFor(config).filter(h => !h.optional && h.points > 0);
  const log = logs[tKey] || {};
  const remaining = habits.filter(h => !(h.type === 'counter' ? log[h.id] >= h.target : log[h.id] === true)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: displayFont, fontSize: 13, color: T.textTertiary }}>
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <div style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 24, color: T.textPrimary, marginTop: 2, letterSpacing: -0.3 }}>
          {fmtGreetTime()}.
        </div>
        <div style={{ fontFamily: displayFont, fontSize: 13, color: T.textSecondary, marginTop: 4, fontStyle: "italic" }}>
          "{quote}"
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <ForgeRing score={tScore} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontFamily: monoFont, fontSize: 10, color: T.textTertiary, letterSpacing: 1 }}>TODAY'S SCORE</div>
              <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 15, color: scoreLabel(tScore).color }}>{scoreLabel(tScore).label}</div>
            </div>
            {yScore !== null && (
              <div style={{ display: "flex", gap: 14 }}>
                <div>
                  <div style={{ fontFamily: monoFont, fontSize: 10, color: T.textTertiary }}>YESTERDAY</div>
                  <div style={{ fontFamily: monoFont, fontSize: 15, color: T.textSecondary }}>{yScore}%</div>
                </div>
                <div>
                  <div style={{ fontFamily: monoFont, fontSize: 10, color: T.textTertiary }}>TODAY</div>
                  <div style={{ fontFamily: monoFont, fontSize: 15, color: tScore >= yScore ? T.success : T.miss }}>{tScore}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 12, fontFamily: displayFont, fontSize: 12.5, color: T.textSecondary }}>
          {remaining === 0 ? "Everything forged for today." : `Only ${remaining} habit${remaining === 1 ? "" : "s"} remaining.`}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <StatCard icon={<Flame size={16} color={T.ember} />} label="Current Streak" value={`${streak}d`} />
        <StatCard icon={<Award size={16} color={T.steel} />} label="Longest Streak" value={`${longest}d`} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <StatCard icon={<CalendarDays size={16} color={T.textSecondary} />} label={`${new Date().getFullYear()} Progress`} value={`${daysCompleted}d`} />
        <StatCard icon={<Target size={16} color={T.textSecondary} />} label="Habits Active" value={`${habits.length}`} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      {icon}
      <div style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 20, color: T.textPrimary }}>{value}</div>
      <div style={{ fontFamily: displayFont, fontSize: 11.5, color: T.textTertiary }}>{label}</div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress tab                                                        */
/* ------------------------------------------------------------------ */
function heatColor(score) {
  if (score === undefined || score === null) return T.borderSoft;
  if (score >= 95) return "#FFE9D6";
  if (score >= 85) return T.ember;
  if (score >= 70) return "#B9683B";
  if (score >= 40) return T.steel;
  return T.miss;
}

function CalendarHeatmap({ config, logs, weeks = 12 }) {
  const days = [];
  let cursor = todayKey();
  const total = weeks * 7;
  for (let i = 0; i < total; i++) { days.unshift(cursor); cursor = addDays(cursor, -1); }
  const cols = weeks;
  const grid = [];
  for (let c = 0; c < cols; c++) grid.push(days.slice(c * 7, c * 7 + 7));
  return (
    <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 4 }}>
      {grid.map((col, ci) => (
        <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {col.map((k) => {
            const has = logs[k];
            const s = has ? dayScore(config, logs[k]) : null;
            return (
              <div key={k} title={`${k}: ${s === null ? "no data" : s + "%"}`}
                style={{ width: 11, height: 11, borderRadius: 3, background: heatColor(s) }} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ProgressTab({ config, logs }) {
  const last14 = useMemo(() => {
    const arr = [];
    let cursor = addDays(todayKey(), -13);
    for (let i = 0; i < 14; i++) {
      arr.push({ date: cursor.slice(5), score: logs[cursor] ? dayScore(config, logs[cursor]) : 0 });
      cursor = addDays(cursor, 1);
    }
    return arr;
  }, [config, logs]);

  const habitConsistency = useMemo(() => {
    const habits = scoredHabitsFor(config);
    const keys = Object.keys(logs).slice(-30);
    return habits.map((h) => {
      const relevant = keys.filter((k) => logs[k] && (h.type === "counter" ? typeof logs[k][h.id] === "number" : true));
      const hits = keys.filter((k) => {
        const v = logs[k] && logs[k][h.id];
        return h.type === "counter" ? v >= h.target : v === true;
      });
      const pct = keys.length ? Math.round((hits.length / keys.length) * 100) : 0;
      return { name: h.name, pct };
    }).sort((a, b) => b.pct - a.pct);
  }, [config, logs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle>Calendar Heatmap</SectionTitle>
      <Card><CalendarHeatmap config={config} logs={logs} /></Card>

      <SectionTitle>Last 14 Days</SectionTitle>
      <Card>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={last14}>
            <CartesianGrid stroke={T.borderSoft} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: T.textTertiary, fontSize: 10, fontFamily: monoFont }} axisLine={{ stroke: T.border }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: T.textTertiary, fontSize: 10, fontFamily: monoFont }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 10, fontFamily: monoFont, fontSize: 11 }} labelStyle={{ color: T.textSecondary }} />
            <Line type="monotone" dataKey="score" stroke={T.ember} strokeWidth={2} dot={{ r: 2, fill: T.ember }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle>Habit Consistency (30d)</SectionTitle>
      <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {habitConsistency.map((h) => (
          <div key={h.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: displayFont, fontSize: 12.5, color: T.textPrimary }}>{h.name}</span>
              <span style={{ fontFamily: monoFont, fontSize: 11.5, color: T.textSecondary }}>{h.pct}%</span>
            </div>
            <div style={{ height: 6, background: T.surfaceRaised, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${h.pct}%`, height: "100%", background: h.pct >= 70 ? T.ember : T.steel, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 13, color: T.textTertiary, letterSpacing: 0.6, textTransform: "uppercase" }}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Goals tab                                                           */
/* ------------------------------------------------------------------ */
function GoalsTab({ config, setConfig, logs }) {
  const [newGoal, setNewGoal] = useState("");
  const eliteDays = Object.keys(logs).filter((k) => dayScore(config, logs[k]) >= 95).length;

  const updateGoal = (id, progress) => {
    setConfig({ ...config, goals: config.goals.map((g) => g.id === id ? { ...g, progress } : g) });
  };
  const removeGoal = (id) => setConfig({ ...config, goals: config.goals.filter((g) => g.id !== id) });
  const addGoal = () => {
    if (!newGoal.trim()) return;
    setConfig({ ...config, goals: [...config.goals, { id: "g" + Date.now(), name: newGoal, category: "Custom", progress: 0 }] });
    setNewGoal("");
  };

  const grouped = {};
  config.goals.forEach((g) => { (grouped[g.category] = grouped[g.category] || []).push(g); });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle>Long-Term Goals</SectionTitle>
      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 13, color: T.textPrimary, marginBottom: 10 }}>{cat}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((g) => (
              <div key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: displayFont, fontSize: 12.5, color: T.textPrimary }}>{g.name}</span>
                  <button onClick={() => removeGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <X size={13} color={T.textTertiary} />
                  </button>
                </div>
                <input type="range" min={0} max={100} value={g.progress}
                  onChange={(e) => updateGoal(g.id, Number(e.target.value))}
                  style={{ width: "100%", accentColor: T.ember }} />
                <div style={{ fontFamily: monoFont, fontSize: 11, color: T.textTertiary, textAlign: "right" }}>{g.progress}%</div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div style={{ display: "flex", gap: 8 }}>
        <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a new goal…"
          style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 12px", color: T.textPrimary, fontFamily: displayFont, fontSize: 13 }} />
        <button onClick={addGoal} style={{ width: 40, borderRadius: 12, background: T.ember, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={18} color="#0D0E10" />
        </button>
      </div>

      <SectionTitle>Rewards</SectionTitle>
      <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {config.rewards.map((r) => {
          const unlocked = eliteDays >= r.threshold;
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, opacity: unlocked ? 1 : 0.55 }}>
              {unlocked ? <Unlock size={16} color={T.ember} /> : <Lock size={16} color={T.textTertiary} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: displayFont, fontSize: 13, color: T.textPrimary }}>{r.name}</div>
                <div style={{ fontFamily: monoFont, fontSize: 10.5, color: T.textTertiary }}>{r.note}</div>
              </div>
              <Pill color={unlocked ? T.ember : T.textTertiary}>{Math.min(eliteDays, r.threshold)}/{r.threshold}</Pill>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews tab                                                         */
/* ------------------------------------------------------------------ */
function ReviewsTab({ config, logs }) {
  const habits = scoredHabitsFor(config);

  function buildReview(days) {
    let cursor = todayKey();
    const keys = [];
    for (let i = 0; i < days; i++) { keys.unshift(cursor); cursor = addDays(cursor, -1); }
    const withData = keys.filter((k) => logs[k]);
    const scores = withData.map((k) => dayScore(config, logs[k]));
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const completion = keys.length ? Math.round((withData.filter(k => dayScore(config, logs[k]) >= 70).length / keys.length) * 100) : 0;

    const habitStats = habits.map((h) => {
      const hits = withData.filter((k) => {
        const v = logs[k][h.id];
        return h.type === "counter" ? v >= h.target : v === true;
      }).length;
      const pct = withData.length ? Math.round((hits / withData.length) * 100) : 0;
      return { name: h.name, pct };
    });
    const best = habitStats.slice().sort((a, b) => b.pct - a.pct)[0];
    const worst = habitStats.slice().sort((a, b) => a.pct - b.pct)[0];

    let longest = 0, cur = 0, prevK = null;
    keys.forEach((k) => {
      const s = logs[k] ? dayScore(config, logs[k]) : 0;
      if (s >= 70) { cur = prevK && addDays(prevK, 1) === k ? cur + 1 : 1; longest = Math.max(longest, cur); }
      else cur = 0;
      prevK = k;
    });

    return { avg, completion, best, worst, longest, withDataCount: withData.length, total: keys.length };
  }

  const weekly = buildReview(7);
  const monthly = buildReview(30);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle>This Week</SectionTitle>
      <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <RevRow label="Overall Score" value={`${weekly.avg}/100`} />
        <RevRow label="Completion" value={`${weekly.completion}%`} />
        <RevRow label="Longest Streak" value={`${weekly.longest}d`} />
        {weekly.best && <RevRow label="Best Habit" value={weekly.best.name} />}
        {weekly.worst && <RevRow label="Weakest Habit" value={weekly.worst.name} />}
        <div style={{ marginTop: 6, padding: 12, background: T.emberSoft, borderRadius: 12 }}>
          <div style={{ fontFamily: displayFont, fontSize: 12.5, color: T.textPrimary, lineHeight: 1.5 }}>
            {weekly.withDataCount === 0
              ? "No entries logged yet this week — start today, one habit at a time."
              : weekly.avg >= 85
                ? `Strong week. You averaged ${weekly.avg}/100 with a ${weekly.longest}-day run — keep the pressure steady.`
                : `You averaged ${weekly.avg}/100 this week. Focus one more rep on "${weekly.worst ? weekly.worst.name : "your weakest habit"}" and the week tips upward.`}
          </div>
        </div>
      </Card>

      <SectionTitle>This Month</SectionTitle>
      <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <RevRow label="Average Score" value={`${monthly.avg}/100`} />
        <RevRow label="Completion" value={`${monthly.completion}%`} />
        <RevRow label="Longest Streak" value={`${monthly.longest}d`} />
        {monthly.best && <RevRow label="Best Habit" value={monthly.best.name} />}
        {monthly.worst && <RevRow label="Weakest Habit" value={monthly.worst.name} />}
        <Card style={{ padding: 8, background: "transparent" }}>
          <CalendarHeatmap config={config} logs={logs} weeks={5} />
        </Card>
      </Card>
    </div>
  );
}
function RevRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: displayFont, fontSize: 12.5, color: T.textSecondary }}>{label}</span>
      <span style={{ fontFamily: monoFont, fontSize: 12.5, color: T.textPrimary }}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile / Settings tab                                              */
/* ------------------------------------------------------------------ */
function ProfileTab({ config, setConfig, logs }) {
  const [editingWeights, setEditingWeights] = useState(false);
  const tKey = todayKey();
  const streak = computeStreak(config, logs, tKey);
  const longest = computeLongestStreak(config, logs);
  const eliteDays = Object.keys(logs).filter((k) => dayScore(config, logs[k]) >= 95).length;
  const totalDays = Object.keys(logs).length;
  const avgScore = totalDays ? Math.round(Object.keys(logs).reduce((s, k) => s + dayScore(config, logs[k]), 0) / totalDays) : 0;

  const updateProfile = (field, value) => setConfig({ ...config, profile: { ...config.profile, [field]: value } });
  const updateHabitPoints = (id, points) => setConfig({ ...config, habits: config.habits.map(h => h.id === id ? { ...h, points } : h) });
  const removeHabit = (id) => setConfig({ ...config, habits: config.habits.filter(h => h.id !== id) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 54, height: 54, borderRadius: "50%", background: T.emberSoft,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><User size={24} color={T.ember} /></div>
        <div style={{ flex: 1 }}>
          <input
            value={config.profile.name} onChange={(e) => updateProfile("name", e.target.value)}
            placeholder="Your name"
            style={{ background: "transparent", border: "none", fontFamily: displayFont, fontWeight: 700, fontSize: 16, color: T.textPrimary, width: "100%" }}
          />
          <div style={{ fontFamily: monoFont, fontSize: 11, color: T.textTertiary }}>Phase: {config.phase}</div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <StatCard icon={<Flame size={16} color={T.ember} />} label="Current Streak" value={`${streak}d`} />
        <StatCard icon={<Award size={16} color={T.steel} />} label="Longest Streak" value={`${longest}d`} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <StatCard icon={<Sparkles size={16} color={T.ember} />} label="Elite Days" value={`${eliteDays}`} />
        <StatCard icon={<TrendingUp size={16} color={T.textSecondary} />} label="Overall Avg" value={`${avgScore}`} />
      </div>

      <SectionTitle>Body</SectionTitle>
      <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FieldRow label="Height (cm)" value={config.profile.height} onChange={(v) => updateProfile("height", v)} />
        <FieldRow label="Goal Weight (kg)" value={config.profile.goalWeight} onChange={(v) => updateProfile("goalWeight", v)} />
      </Card>

      <SectionTitle>Phase</SectionTitle>
      <Card style={{ display: "flex", gap: 8 }}>
        {["phase1", "phase2", "phase3"].map((p) => (
          <button key={p} onClick={() => setConfig({ ...config, phase: p })}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
              border: `1px solid ${config.phase === p ? T.ember : T.border}`,
              background: config.phase === p ? T.emberSoft : "transparent",
              color: config.phase === p ? T.ember : T.textSecondary,
              fontFamily: monoFont, fontSize: 12,
            }}>{p.replace("phase", "Phase ")}</button>
        ))}
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle>Habits &amp; Scoring Weights</SectionTitle>
        <button onClick={() => setEditingWeights((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Pencil size={13} color={T.textTertiary} />
        </button>
      </div>
      {editingWeights && (
        <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {config.habits.map((h) => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ flex: 1, fontFamily: displayFont, fontSize: 12.5, color: T.textPrimary }}>{h.name}</span>
              <input type="number" value={h.points} onChange={(e) => updateHabitPoints(h.id, Number(e.target.value))}
                style={{ width: 48, background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textPrimary, fontFamily: monoFont, fontSize: 11, padding: "5px", textAlign: "center" }} />
              <button onClick={() => removeHabit(h.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Trash2 size={13} color={T.textTertiary} />
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
function FieldRow({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: displayFont, fontSize: 12.5, color: T.textSecondary }}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 90, background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textPrimary, fontFamily: monoFont, fontSize: 12, padding: "6px 8px", textAlign: "right" }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root app                                                            */
/* ------------------------------------------------------------------ */
const TABS = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "today", label: "Today", icon: Check },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "goals", label: "Goals", icon: Target },
  { id: "reviews", label: "Reviews", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: User },
];

export default function Forge() {
  const [tab, setTab] = useState("dashboard");
  const [config, setConfig] = useState(defaultConfig);
  const [logs, setLogs] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [quote] = useState(() => {
    const list = defaultConfig.quotes;
    return list[Math.floor(Math.random() * list.length)];
  });

  useEffect(() => {
    (async () => {
      const [c, l] = await Promise.all([loadConfig(), loadLogs()]);
      setConfig(c); setLogs(l); setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) saveConfig(config); }, [config, loaded]);
  useEffect(() => { if (loaded) saveLogs(logs); }, [logs, loaded]);

  if (!loaded) {
    return (
      <div style={{ background: T.bg, minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: monoFont, color: T.textTertiary, fontSize: 13 }}>Warming the forge…</div>
      </div>
    );
  }

  return (
    <div style={{
      background: T.bg, minHeight: 640, maxWidth: 430, margin: "0 auto",
      display: "flex", flexDirection: "column", fontFamily: displayFont,
      borderRadius: 28, overflow: "hidden", border: `1px solid ${T.border}`,
    }}>
      <div style={{ padding: "18px 16px 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <Flame size={18} color={T.ember} />
        <span style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 15, color: T.textPrimary, letterSpacing: -0.2 }}>FORGE</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 90px" }}>
        {tab === "dashboard" && <DashboardTab config={config} logs={logs} quote={quote} />}
        {tab === "today" && <TodayTab config={config} logs={logs} setLogs={setLogs} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        {tab === "progress" && <ProgressTab config={config} logs={logs} />}
        {tab === "goals" && <GoalsTab config={config} setConfig={setConfig} logs={logs} />}
        {tab === "reviews" && <ReviewsTab config={config} logs={logs} />}
        {tab === "profile" && <ProfileTab config={config} setConfig={setConfig} logs={logs} />}
      </div>

      <div style={{
        position: "sticky", bottom: 0, background: `${T.surface}F2`, backdropFilter: "blur(10px)",
        borderTop: `1px solid ${T.border}`, display: "flex", padding: "8px 6px",
      }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer", padding: "6px 0",
              }}>
              <Icon size={19} color={active ? T.ember : T.textTertiary} strokeWidth={active ? 2.4 : 2} />
              <span style={{ fontFamily: monoFont, fontSize: 9.5, color: active ? T.ember : T.textTertiary }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
