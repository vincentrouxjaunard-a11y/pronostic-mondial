import { useState, useEffect, useReducer } from "react";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "mondial2026_v1";
const PLAYERS = ["Vincent", "Samuel", "Thomas", "Denis", "Mika", "Laurent", "Gabin", "Raph", "Olivier S", "Olivier G", "Julien"];

const PLAYED = {
  "A1": { home: 2, away: 0 },
  "A2": { home: 2, away: 1 },
  "B1": { home: 1, away: 1 },
  "D1": { home: 4, away: 1 },
};

const GROUPS = [
  {
    id: "A", name: "Groupe A",
    teams: ["Mexique 🇲🇽", "Afrique du Sud 🇿🇦", "Corée du Sud 🇰🇷", "Tchéquie 🇨🇿"],
    matches: [
      { id: "A1", home: "Mexique 🇲🇽", away: "Afrique du Sud 🇿🇦", date: "11 juin" },
      { id: "A2", home: "Corée du Sud 🇰🇷", away: "Tchéquie 🇨🇿", date: "12 juin" },
      { id: "A3", home: "Mexique 🇲🇽", away: "Corée du Sud 🇰🇷", date: "18 juin" },
      { id: "A4", home: "Tchéquie 🇨🇿", away: "Afrique du Sud 🇿🇦", date: "18 juin" },
      { id: "A5", home: "Mexique 🇲🇽", away: "Tchéquie 🇨🇿", date: "24 juin" },
      { id: "A6", home: "Afrique du Sud 🇿🇦", away: "Corée du Sud 🇰🇷", date: "24 juin" },
    ],
  },
  {
    id: "B", name: "Groupe B",
    teams: ["Canada 🇨🇦", "Bosnie-Herzégovine 🇧🇦", "Qatar 🇶🇦", "Suisse 🇨🇭"],
    matches: [
      { id: "B1", home: "Canada 🇨🇦", away: "Bosnie-Herzégovine 🇧🇦", date: "12 juin" },
      { id: "B2", home: "Qatar 🇶🇦", away: "Suisse 🇨🇭", date: "13 juin" },
      { id: "B3", home: "Canada 🇨🇦", away: "Qatar 🇶🇦", date: "18 juin" },
      { id: "B4", home: "Suisse 🇨🇭", away: "Bosnie-Herzégovine 🇧🇦", date: "19 juin" },
      { id: "B5", home: "Canada 🇨🇦", away: "Suisse 🇨🇭", date: "24 juin" },
      { id: "B6", home: "Bosnie-Herzégovine 🇧🇦", away: "Qatar 🇶🇦", date: "24 juin" },
    ],
  },
  {
    id: "C", name: "Groupe C",
    teams: ["Brésil 🇧🇷", "Maroc 🇲🇦", "Haïti 🇭🇹", "Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
    matches: [
      { id: "C1", home: "Brésil 🇧🇷", away: "Maroc 🇲🇦", date: "13 juin" },
      { id: "C2", home: "Haïti 🇭🇹", away: "Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿", date: "14 juin" },
      { id: "C3", home: "Maroc 🇲🇦", away: "Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿", date: "19 juin" },
      { id: "C4", home: "Brésil 🇧🇷", away: "Haïti 🇭🇹", date: "19 juin" },
      { id: "C5", home: "Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿", away: "Brésil 🇧🇷", date: "24 juin" },
      { id: "C6", home: "Maroc 🇲🇦", away: "Haïti 🇭🇹", date: "24 juin" },
    ],
  },
  {
    id: "D", name: "Groupe D",
    teams: ["États-Unis 🇺🇸", "Paraguay 🇵🇾", "Australie 🇦🇺", "Türkiye 🇹🇷"],
    matches: [
      { id: "D1", home: "États-Unis 🇺🇸", away: "Paraguay 🇵🇾", date: "13 juin" },
      { id: "D2", home: "Australie 🇦🇺", away: "Türkiye 🇹🇷", date: "13 juin" },
      { id: "D3", home: "États-Unis 🇺🇸", away: "Australie 🇦🇺", date: "20 juin" },
      { id: "D4", home: "Paraguay 🇵🇾", away: "Türkiye 🇹🇷", date: "20 juin" },
      { id: "D5", home: "États-Unis 🇺🇸", away: "Türkiye 🇹🇷", date: "26 juin" },
      { id: "D6", home: "Australie 🇦🇺", away: "Paraguay 🇵🇾", date: "26 juin" },
    ],
  },
  {
    id: "E", name: "Groupe E",
    teams: ["Allemagne 🇩🇪", "Curaçao 🇨🇼", "Côte d'Ivoire 🇨🇮", "Équateur 🇪🇨"],
    matches: [
      { id: "E1", home: "Allemagne 🇩🇪", away: "Curaçao 🇨🇼", date: "14 juin" },
      { id: "E2", home: "Côte d'Ivoire 🇨🇮", away: "Équateur 🇪🇨", date: "14 juin" },
      { id: "E3", home: "Allemagne 🇩🇪", away: "Côte d'Ivoire 🇨🇮", date: "20 juin" },
      { id: "E4", home: "Équateur 🇪🇨", away: "Curaçao 🇨🇼", date: "20 juin" },
      { id: "E5", home: "Allemagne 🇩🇪", away: "Équateur 🇪🇨", date: "26 juin" },
      { id: "E6", home: "Curaçao 🇨🇼", away: "Côte d'Ivoire 🇨🇮", date: "26 juin" },
    ],
  },
  {
    id: "F", name: "Groupe F",
    teams: ["Pays-Bas 🇳🇱", "Japon 🇯🇵", "Suède 🇸🇪", "Tunisie 🇹🇳"],
    matches: [
      { id: "F1", home: "Pays-Bas 🇳🇱", away: "Japon 🇯🇵", date: "14 juin" },
      { id: "F2", home: "Suède 🇸🇪", away: "Tunisie 🇹🇳", date: "14 juin" },
      { id: "F3", home: "Pays-Bas 🇳🇱", away: "Suède 🇸🇪", date: "20 juin" },
      { id: "F4", home: "Japon 🇯🇵", away: "Tunisie 🇹🇳", date: "20 juin" },
      { id: "F5", home: "Pays-Bas 🇳🇱", away: "Tunisie 🇹🇳", date: "26 juin" },
      { id: "F6", home: "Suède 🇸🇪", away: "Japon 🇯🇵", date: "26 juin" },
    ],
  },
  {
    id: "G", name: "Groupe G",
    teams: ["Belgique 🇧🇪", "Égypte 🇪🇬", "Iran 🇮🇷", "Nouvelle-Zélande 🇳🇿"],
    matches: [
      { id: "G1", home: "Belgique 🇧🇪", away: "Égypte 🇪🇬", date: "15 juin" },
      { id: "G2", home: "Iran 🇮🇷", away: "Nouvelle-Zélande 🇳🇿", date: "15 juin" },
      { id: "G3", home: "Belgique 🇧🇪", away: "Iran 🇮🇷", date: "21 juin" },
      { id: "G4", home: "Égypte 🇪🇬", away: "Nouvelle-Zélande 🇳🇿", date: "21 juin" },
      { id: "G5", home: "Belgique 🇧🇪", away: "Nouvelle-Zélande 🇳🇿", date: "27 juin" },
      { id: "G6", home: "Égypte 🇪🇬", away: "Iran 🇮🇷", date: "27 juin" },
    ],
  },
  {
    id: "H", name: "Groupe H",
    teams: ["Espagne 🇪🇸", "Cap-Vert 🇨🇻", "Arabie saoudite 🇸🇦", "Uruguay 🇺🇾"],
    matches: [
      { id: "H1", home: "Espagne 🇪🇸", away: "Cap-Vert 🇨🇻", date: "15 juin" },
      { id: "H2", home: "Arabie saoudite 🇸🇦", away: "Uruguay 🇺🇾", date: "15 juin" },
      { id: "H3", home: "Espagne 🇪🇸", away: "Arabie saoudite 🇸🇦", date: "21 juin" },
      { id: "H4", home: "Cap-Vert 🇨🇻", away: "Uruguay 🇺🇾", date: "21 juin" },
      { id: "H5", home: "Espagne 🇪🇸", away: "Uruguay 🇺🇾", date: "27 juin" },
      { id: "H6", home: "Cap-Vert 🇨🇻", away: "Arabie saoudite 🇸🇦", date: "27 juin" },
    ],
  },
  {
    id: "I", name: "Groupe I",
    teams: ["France 🇫🇷", "Sénégal 🇸🇳", "Irak 🇮🇶", "Norvège 🇳🇴"],
    matches: [
      { id: "I1", home: "France 🇫🇷", away: "Sénégal 🇸🇳", date: "16 juin" },
      { id: "I2", home: "Irak 🇮🇶", away: "Norvège 🇳🇴", date: "16 juin" },
      { id: "I3", home: "France 🇫🇷", away: "Irak 🇮🇶", date: "22 juin" },
      { id: "I4", home: "Sénégal 🇸🇳", away: "Norvège 🇳🇴", date: "22 juin" },
      { id: "I5", home: "France 🇫🇷", away: "Norvège 🇳🇴", date: "26 juin" },
      { id: "I6", home: "Sénégal 🇸🇳", away: "Irak 🇮🇶", date: "26 juin" },
    ],
  },
  {
    id: "J", name: "Groupe J",
    teams: ["Argentine 🇦🇷", "Algérie 🇩🇿", "Autriche 🇦🇹", "Jordanie 🇯🇴"],
    matches: [
      { id: "J1", home: "Argentine 🇦🇷", away: "Algérie 🇩🇿", date: "16 juin" },
      { id: "J2", home: "Autriche 🇦🇹", away: "Jordanie 🇯🇴", date: "16 juin" },
      { id: "J3", home: "Argentine 🇦🇷", away: "Autriche 🇦🇹", date: "22 juin" },
      { id: "J4", home: "Algérie 🇩🇿", away: "Jordanie 🇯🇴", date: "22 juin" },
      { id: "J5", home: "Argentine 🇦🇷", away: "Jordanie 🇯🇴", date: "27 juin" },
      { id: "J6", home: "Autriche 🇦🇹", away: "Algérie 🇩🇿", date: "27 juin" },
    ],
  },
  {
    id: "K", name: "Groupe K",
    teams: ["Portugal 🇵🇹", "RD Congo 🇨🇩", "Ouzbékistan 🇺🇿", "Colombie 🇨🇴"],
    matches: [
      { id: "K1", home: "Portugal 🇵🇹", away: "RD Congo 🇨🇩", date: "17 juin" },
      { id: "K2", home: "Ouzbékistan 🇺🇿", away: "Colombie 🇨🇴", date: "17 juin" },
      { id: "K3", home: "Portugal 🇵🇹", away: "Ouzbékistan 🇺🇿", date: "23 juin" },
      { id: "K4", home: "RD Congo 🇨🇩", away: "Colombie 🇨🇴", date: "23 juin" },
      { id: "K5", home: "Portugal 🇵🇹", away: "Colombie 🇨🇴", date: "27 juin" },
      { id: "K6", home: "RD Congo 🇨🇩", away: "Ouzbékistan 🇺🇿", date: "27 juin" },
    ],
  },
  {
    id: "L", name: "Groupe L",
    teams: ["Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Ghana 🇬🇭", "Croatie 🇭🇷", "Ouzbékistan 🇺🇿"],
    matches: [
      { id: "L1", home: "Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿", away: "Ghana 🇬🇭", date: "17 juin" },
      { id: "L2", home: "Croatie 🇭🇷", away: "Ouzbékistan 🇺🇿", date: "17 juin" },
      { id: "L3", home: "Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿", away: "Croatie 🇭🇷", date: "23 juin" },
      { id: "L4", home: "Ghana 🇬🇭", away: "Ouzbékistan 🇺🇿", date: "23 juin" },
      { id: "L5", home: "Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿", away: "Ouzbékistan 🇺🇿", date: "27 juin" },
      { id: "L6", home: "Ghana 🇬🇭", away: "Croatie 🇭🇷", date: "27 juin" },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getResult = (home, away) => {
  if (home === "" || home === undefined || away === "" || away === undefined) return null;
  const h = parseInt(home), a = parseInt(away);
  if (isNaN(h) || isNaN(a)) return null;
  return h > a ? "H" : a > h ? "A" : "D";
};

const computePoints = (prediction, actual) => {
  if (!actual || prediction.home === "" || prediction.home === undefined || prediction.away === "" || prediction.away === undefined) return 0;
  const predResult = getResult(prediction.home, prediction.away);
  const actResult = getResult(actual.home, actual.away);
  if (!predResult || !actResult || predResult !== actResult) return 0;
  const exact = parseInt(prediction.home) === actual.home && parseInt(prediction.away) === actual.away;
  return exact ? 2 : 1;
};

const computeQualPointsDetailed = (playerQuals, officialQuals) => {
  if (!officialQuals || officialQuals.length < 2 || !playerQuals) {
    return { pts: 0, breakdown: { team1: 0, team2: 0, bonus: 0 } };
  }
  const [official1, official2] = officialQuals;
  const [pred1, pred2] = playerQuals;
  const team1Found = pred1 && [official1, official2].includes(pred1) ? 1 : 0;
  const team2Found = pred2 && [official1, official2].includes(pred2) ? 1 : 0;
  const perfectOrder = pred1 === official1 && pred2 === official2 ? 2 : 0;
  const pts = team1Found + team2Found + perfectOrder;
  return { pts, breakdown: { team1: team1Found, team2: team2Found, bonus: perfectOrder } };
};

// ─── PERSISTANCE localStorage ─────────────────────────────────────────────────

const buildFreshState = () => {
  const predictions = {};
  const quals = {};
  PLAYERS.forEach(p => {
    predictions[p] = {};
    GROUPS.forEach(g => { quals[`${p}-${g.id}`] = []; });
  });
  return { predictions, quals, actual: { ...PLAYED }, officialQuals: {}, tab: "prono", activePlayer: "Vincent", activeGroup: "A" };
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildFreshState();
    const saved = JSON.parse(raw);
    // Merge fresh state with saved to handle new fields safely
    const fresh = buildFreshState();
    return {
      ...fresh,
      predictions: saved.predictions ?? fresh.predictions,
      quals: saved.quals ?? fresh.quals,
      actual: { ...fresh.actual, ...(saved.actual ?? {}) },
      officialQuals: saved.officialQuals ?? fresh.officialQuals,
      tab: saved.tab ?? "prono",
      activePlayer: saved.activePlayer ?? "Vincent",
      activeGroup: saved.activeGroup ?? "A",
    };
  } catch {
    return buildFreshState();
  }
};

const saveState = (state) => {
  try {
    const toSave = {
      predictions: state.predictions,
      quals: state.quals,
      actual: state.actual,
      officialQuals: state.officialQuals,
      tab: state.tab,
      activePlayer: state.activePlayer,
      activeGroup: state.activeGroup,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn("Impossible de sauvegarder :", e);
  }
};

// ─── REDUCER ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case "SET_PREDICTION": {
      const { player, matchId, side, value } = action;
      return { ...state, predictions: { ...state.predictions, [player]: { ...state.predictions[player], [matchId]: { ...state.predictions[player][matchId], [side]: value } } } };
    }
    case "SET_ACTUAL": {
      const { matchId, side, value } = action;
      return { ...state, actual: { ...state.actual, [matchId]: { ...state.actual[matchId], [side]: value } } };
    }
    case "TOGGLE_QUAL": {
      const { player, groupId, team } = action;
      const key = `${player}-${groupId}`;
      const current = state.quals[key] || [];
      const idx = current.indexOf(team);
      const next = idx !== -1 ? current.filter(t => t !== team) : current.length < 2 ? [...current, team] : current;
      return { ...state, quals: { ...state.quals, [key]: next } };
    }
    case "TOGGLE_OFFICIAL_QUAL": {
      const { groupId, team } = action;
      const current = state.officialQuals[groupId] || [];
      const idx = current.indexOf(team);
      const next = idx !== -1 ? current.filter(t => t !== team) : current.length < 2 ? [...current, team] : current;
      return { ...state, officialQuals: { ...state.officialQuals, [groupId]: next } };
    }
    case "SET_TAB": return { ...state, tab: action.tab };
    case "SET_PLAYER": return { ...state, activePlayer: action.player };
    case "SET_GROUP": return { ...state, activeGroup: action.group };
    case "RESET": return { ...buildFreshState(), tab: state.tab };
    default: return state;
  }
}

// ─── COMPOSANTS ──────────────────────────────────────────────────────────────

const ScoreInput = ({ value, onChange, disabled, small }) => (
  <input
    type="number" min="0" max="20"
    value={value ?? ""}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    style={{
      width: small ? 36 : 44, height: small ? 36 : 44,
      textAlign: "center", fontSize: small ? 16 : 20, fontWeight: 700,
      border: disabled ? "2px solid #334155" : "2px solid #22d3ee",
      borderRadius: 8,
      background: disabled ? "#1e293b" : "#0f172a",
      color: disabled ? "#64748b" : "#e2e8f0",
      outline: "none", cursor: disabled ? "not-allowed" : "text",
      fontFamily: "'Courier New', monospace",
    }}
  />
);

const BadgePoints = ({ pts }) => {
  if (pts === null || pts === undefined) return null;
  const color = pts === 2 ? "#10b981" : pts === 1 ? "#f59e0b" : "#ef4444";
  const label = pts === 2 ? "+2 🎯" : pts === 1 ? "+1 ✓" : "0";
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}`, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
};

const QualButton = ({ team, rank, isOfficial, playerColor, onClick }) => {
  const rankLabel = rank === 1 ? "1er" : rank === 2 ? "2e" : null;
  const correct = rank && isOfficial;
  const borderColor = correct ? "#10b981" : rank ? (playerColor || "#22d3ee") : "#1e3a5f";
  const bgColor = correct ? "#10b98122" : rank ? (playerColor || "#22d3ee") + "22" : "transparent";
  const textColor = correct ? "#10b981" : rank ? (playerColor || "#22d3ee") : "#64748b";
  return (
    <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
      {rankLabel && <span style={{ background: correct ? "#10b981" : (playerColor || "#22d3ee"), color: "#000", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 900, minWidth: 24, textAlign: "center" }}>{rankLabel}</span>}
      {team}
      {correct && <span>✓</span>}
    </button>
  );
};

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sauvegarde automatique à chaque changement d'état
  useEffect(() => {
    saveState(state);
    setSaveIndicator(true);
    const t = setTimeout(() => setSaveIndicator(false), 1200);
    return () => clearTimeout(t);
  }, [state]);

  const { predictions, quals, actual, officialQuals, tab, activePlayer, activeGroup } = state;

  const PLAYER_COLORS = { Vincent: "#22d3ee", Samuel: "#a78bfa", Thomas: "#f472b6" };
  const colors = {
    bg: "#080f1e", surface: "#0f1f35", card: "#132038", border: "#1e3a5f",
    accent: "#22d3ee", gold: "#fbbf24", text: "#e2e8f0", muted: "#64748b",
    green: "#10b981", red: "#ef4444", purple: "#a78bfa",
  };

  // Calcul des totaux
  const totals = {};
  const breakdown = {};
  PLAYERS.forEach(p => {
    let matchPts = 0, qualPts = 0, bonusPts = 0;
    GROUPS.forEach(g => {
      g.matches.forEach(m => { matchPts += computePoints(predictions[p][m.id] || {}, actual[m.id]); });
      const detail = computeQualPointsDetailed(quals[`${p}-${g.id}`] || [], officialQuals[g.id] || []);
      qualPts += detail.breakdown.team1 + detail.breakdown.team2;
      bonusPts += detail.breakdown.bonus;
    });
    totals[p] = matchPts + qualPts + bonusPts;
    breakdown[p] = { matchPts, qualPts, bonusPts };
  });

  const sorted = [...PLAYERS].sort((a, b) => totals[b] - totals[a]);
  const currentGroup = GROUPS.find(g => g.id === activeGroup);

  const css = {
    app: { minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "'Inter', -apple-system, sans-serif", padding: "0 0 60px" },
    header: { background: "linear-gradient(135deg, #0f1f35 0%, #0a2540 100%)", borderBottom: `1px solid ${colors.border}`, padding: "20px 20px 0" },
    title: { fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", margin: 0, background: "linear-gradient(90deg, #22d3ee, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    subtitle: { color: colors.muted, fontSize: 12, margin: "2px 0 12px" },
    tabs: { display: "flex", gap: 4, borderBottom: `1px solid ${colors.border}`, marginTop: 8 },
    tab: (active) => ({ padding: "10px 16px", fontSize: 13, fontWeight: 600, border: "none", background: "transparent", color: active ? colors.accent : colors.muted, borderBottom: active ? `2px solid ${colors.accent}` : "2px solid transparent", cursor: "pointer", marginBottom: -1 }),
    body: { padding: "16px", maxWidth: 680, margin: "0 auto" },
    card: { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 14, marginBottom: 12 },
    playerTabs: { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
    playerBtn: (p, active) => ({ padding: "6px 16px", borderRadius: 999, border: `2px solid ${PLAYER_COLORS[p]}`, background: active ? PLAYER_COLORS[p] + "33" : "transparent", color: PLAYER_COLORS[p], fontWeight: 700, fontSize: 13, cursor: "pointer" }),
    groupTabs: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 },
    groupBtn: (active) => ({ padding: "4px 12px", borderRadius: 6, border: `1px solid ${active ? colors.accent : colors.border}`, background: active ? colors.accent + "22" : "transparent", color: active ? colors.accent : colors.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }),
    matchRow: { display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: `1px solid ${colors.border}` },
    teamName: { fontSize: 12, flex: 1, textAlign: "right", fontWeight: 600, lineHeight: 1.3 },
    teamNameAway: { fontSize: 12, flex: 1, textAlign: "left", fontWeight: 600, lineHeight: 1.3 },
    vs: { color: colors.muted, fontSize: 11, fontWeight: 700, width: 20, textAlign: "center" },
    scoreboard: { display: "flex", alignItems: "center", gap: 6 },
    sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: colors.muted, textTransform: "uppercase", marginBottom: 10 },
  };

  // ── LEADERBOARD ──────────────────────────────────────────────────────────────
  const Leaderboard = () => (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={css.sectionTitle}>Classement général</div>
        {sorted.map((p, i) => (
          <div key={p} style={{ ...css.card, display: "flex", alignItems: "center", gap: 12, borderColor: i === 0 ? colors.gold : colors.border }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: i === 0 ? "#fbbf2433" : "#9ca3af22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: PLAYER_COLORS[p] }}>{p}</div>
              <div style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                Matchs : <b style={{ color: colors.accent }}>{breakdown[p].matchPts}</b>
                {" · "}Qualifiés : <b style={{ color: colors.green }}>{breakdown[p].qualPts}</b>
                {" · "}Bonus ordre : <b style={{ color: colors.gold }}>{breakdown[p].bonusPts}</b>
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: PLAYER_COLORS[p] }}>
              {totals[p]}<span style={{ fontSize: 14, color: colors.muted, fontWeight: 400 }}> pts</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...css.card, background: "#0a1628", borderColor: "#1e3a5f" }}>
        <div style={{ fontSize: 12, color: colors.muted, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>📋 RÈGLES DU JEU</div>
        {[
          ["✓", colors.gold, "Bon résultat (V/N/D)", "+1 pt"],
          ["🎯", colors.green, "Score exact", "+2 pts (total)"],
          ["🏅", colors.green, "Équipe qualifiée trouvée", "+1 pt / équipe"],
          ["⭐", colors.gold, "1er ET 2e dans le bon ordre", "+2 pts bonus"],
        ].map(([icon, color, label, pts]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ flex: 1, color: colors.text }}>{label}</span>
            <span style={{ fontWeight: 700, color }}>{pts}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${colors.border}`, fontSize: 11, color: colors.muted }}>
          Max par groupe : 4 pts (1+1+2). Max matchs poules : 144 pts.
        </div>
      </div>

      {/* Reset */}
      <div style={{ marginTop: 16 }}>
        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)} style={{ background: "transparent", border: `1px solid ${colors.red}`, color: colors.red, borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer" }}>
            🗑️ Réinitialiser toutes les données
          </button>
        ) : (
          <div style={{ ...css.card, borderColor: colors.red, background: "#1a0a0a" }}>
            <div style={{ fontSize: 13, color: colors.red, marginBottom: 10, fontWeight: 600 }}>Confirmer la réinitialisation ? Tous les pronostics seront effacés.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { dispatch({ type: "RESET" }); setShowResetConfirm(false); }} style={{ background: colors.red, border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Oui, tout effacer</button>
              <button onClick={() => setShowResetConfirm(false)} style={{ background: "transparent", border: `1px solid ${colors.border}`, color: colors.muted, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── PRONOSTICS ────────────────────────────────────────────────────────────────
  const Pronostics = () => {
    const pQuals = quals[`${activePlayer}-${currentGroup?.id}`] || [];
    const oQuals = officialQuals[currentGroup?.id] || [];
    const detail = currentGroup ? computeQualPointsDetailed(pQuals, oQuals) : null;

    return (
      <div>
        <div style={css.playerTabs}>
          {PLAYERS.map(p => (
            <button key={p} style={css.playerBtn(p, activePlayer === p)} onClick={() => dispatch({ type: "SET_PLAYER", player: p })}>
              {p}
            </button>
          ))}
        </div>
        <div style={css.groupTabs}>
          {GROUPS.map(g => (
            <button key={g.id} style={css.groupBtn(activeGroup === g.id)} onClick={() => dispatch({ type: "SET_GROUP", group: g.id })}>
              {g.id}
            </button>
          ))}
        </div>

        {currentGroup && (
          <div style={css.card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: colors.accent }}>{currentGroup.name}</div>

            {currentGroup.matches.map(m => {
              const isPlayed = !!PLAYED[m.id];
              const pred = predictions[activePlayer][m.id] || {};
              const act = actual[m.id];
              const pts = act ? computePoints(pred, act) : null;
              return (
                <div key={m.id} style={css.matchRow}>
                  <div style={{ width: 44, textAlign: "center", fontSize: 10, color: colors.muted }}>{m.date}</div>
                  <div style={css.teamName}>{m.home}</div>
                  <div style={css.scoreboard}>
                    <ScoreInput value={isPlayed ? PLAYED[m.id]?.home : pred.home} disabled={isPlayed} onChange={v => dispatch({ type: "SET_PREDICTION", player: activePlayer, matchId: m.id, side: "home", value: v })} />
                    <div style={css.vs}>–</div>
                    <ScoreInput value={isPlayed ? PLAYED[m.id]?.away : pred.away} disabled={isPlayed} onChange={v => dispatch({ type: "SET_PREDICTION", player: activePlayer, matchId: m.id, side: "away", value: v })} />
                  </div>
                  <div style={css.teamNameAway}>{m.away}</div>
                  <div style={{ width: 54, textAlign: "center" }}>
                    {isPlayed ? <span style={{ fontSize: 11, color: colors.muted }}>Joué</span> : <BadgePoints pts={pts} />}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 12, color: colors.muted, marginBottom: 4, fontWeight: 600 }}>
                🎯 Qualifiés prédits — <b style={{ color: colors.accent }}>1er clic = 1er, 2e clic = 2e</b>
              </div>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 10 }}>Bonus +2 pts si les 2 équipes dans le bon ordre</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {currentGroup.teams.map(team => {
                  const rank = pQuals.indexOf(team) !== -1 ? pQuals.indexOf(team) + 1 : null;
                  const isOfficial = rank !== null && oQuals[rank - 1] === team;
                  return <QualButton key={team} team={team} rank={rank} isOfficial={isOfficial} playerColor={PLAYER_COLORS[activePlayer]} onClick={() => dispatch({ type: "TOGGLE_QUAL", player: activePlayer, groupId: currentGroup.id, team })} />;
                })}
              </div>
              {oQuals.length === 2 && detail && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: colors.muted }}>Points sur cette poule :</span>
                  <span style={{ fontSize: 12, color: colors.green, fontWeight: 700 }}>Qualifiés : +{detail.breakdown.team1 + detail.breakdown.team2}</span>
                  {detail.breakdown.bonus > 0 && <span style={{ fontSize: 12, color: colors.gold, fontWeight: 700 }}>⭐ Bonus ordre : +{detail.breakdown.bonus}</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── RÉSULTATS ─────────────────────────────────────────────────────────────────
  const Resultats = () => {
    const oQuals = officialQuals[currentGroup?.id] || [];
    return (
      <div>
        <div style={{ ...css.card, background: "#1a0f2e", borderColor: "#4c1d95", marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>✏️ Mode administrateur — Scores officiels et qualifiés par groupe</div>
        </div>

        <div style={css.groupTabs}>
          {GROUPS.map(g => (
            <button key={g.id} style={css.groupBtn(activeGroup === g.id)} onClick={() => dispatch({ type: "SET_GROUP", group: g.id })}>
              {g.id}
            </button>
          ))}
        </div>

        {currentGroup && (
          <div style={css.card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: colors.accent }}>{currentGroup.name} — Résultats officiels</div>

            {currentGroup.matches.map(m => {
              const isFixed = !!PLAYED[m.id];
              const act = actual[m.id] || {};
              return (
                <div key={m.id} style={css.matchRow}>
                  <div style={{ width: 44, fontSize: 10, color: colors.muted, textAlign: "center" }}>{m.date}</div>
                  <div style={css.teamName}>{m.home}</div>
                  <div style={css.scoreboard}>
                    <ScoreInput value={isFixed ? PLAYED[m.id].home : act.home ?? ""} disabled={isFixed} onChange={v => dispatch({ type: "SET_ACTUAL", matchId: m.id, side: "home", value: parseInt(v) })} small />
                    <div style={css.vs}>–</div>
                    <ScoreInput value={isFixed ? PLAYED[m.id].away : act.away ?? ""} disabled={isFixed} onChange={v => dispatch({ type: "SET_ACTUAL", matchId: m.id, side: "away", value: parseInt(v) })} small />
                  </div>
                  <div style={css.teamNameAway}>{m.away}</div>
                  <div style={{ width: 50, textAlign: "center" }}>{isFixed && <span style={{ fontSize: 10, color: colors.green }}>✓ officiel</span>}</div>
                </div>
              );
            })}

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 12, color: colors.purple, marginBottom: 4, fontWeight: 600 }}>✅ Qualifiés officiels — <b>1er clic = 1er, 2e clic = 2e</b></div>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 10 }}>Déclenche le calcul du bonus de classement (+2 pts)</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {currentGroup.teams.map(team => {
                  const rank = oQuals.indexOf(team) !== -1 ? oQuals.indexOf(team) + 1 : null;
                  return <QualButton key={team} team={team} rank={rank} isOfficial={!!rank} playerColor={colors.green} onClick={() => dispatch({ type: "TOGGLE_OFFICIAL_QUAL", groupId: currentGroup.id, team })} />;
                })}
              </div>
            </div>
          </div>
        )}

        {currentGroup && (
          <div style={css.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: colors.muted }}>Pronostics comparés — {currentGroup.name}</div>
            {currentGroup.matches.map(m => {
              const act = actual[m.id];
              return (
                <div key={m.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>
                    {m.home} vs {m.away} · {m.date}
                    {act && act.home !== undefined && !isNaN(act.home)
                      ? <span style={{ color: colors.green, marginLeft: 8 }}>Résultat : {act.home}-{act.away}</span>
                      : <span style={{ color: colors.muted, marginLeft: 8 }}>Pas encore joué</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {PLAYERS.map(p => {
                      const pred = predictions[p][m.id] || {};
                      const pts = (act && pred.home !== "" && pred.home !== undefined) ? computePoints(pred, act) : null;
                      return (
                        <div key={p} style={{ flex: 1, background: "#0f172a", borderRadius: 8, padding: "8px", textAlign: "center", border: `1px solid ${pts === 2 ? colors.green : pts === 1 ? colors.gold : pts === 0 ? colors.red : colors.border}` }}>
                          <div style={{ fontSize: 11, color: PLAYER_COLORS[p], fontWeight: 700, marginBottom: 4 }}>{p}</div>
                          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", color: colors.text }}>
                            {pred.home !== undefined && pred.home !== "" ? `${pred.home}-${pred.away}` : "—"}
                          </div>
                          {pts !== null && <div style={{ marginTop: 4 }}><BadgePoints pts={pts} /></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {oQuals.length > 0 && (
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, fontWeight: 600 }}>
                  Qualifiés officiels : {oQuals[0] || "?"} (1er) · {oQuals[1] || "?"} (2e)
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {PLAYERS.map(p => {
                    const pQ = quals[`${p}-${currentGroup.id}`] || [];
                    const detail = computeQualPointsDetailed(pQ, oQuals);
                    return (
                      <div key={p} style={{ flex: 1, background: "#0f172a", borderRadius: 8, padding: "8px", textAlign: "center", border: `1px solid ${detail.pts >= 4 ? colors.gold : detail.pts >= 2 ? colors.green : colors.border}` }}>
                        <div style={{ fontSize: 11, color: PLAYER_COLORS[p], fontWeight: 700, marginBottom: 4 }}>{p}</div>
                        <div style={{ fontSize: 11, color: colors.text, marginBottom: 2 }}>{pQ[0] || "—"} <span style={{ color: colors.muted }}>(1er)</span></div>
                        <div style={{ fontSize: 11, color: colors.text, marginBottom: 6 }}>{pQ[1] || "—"} <span style={{ color: colors.muted }}>(2e)</span></div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>
                          <span style={{ color: colors.green }}>+{detail.breakdown.team1 + detail.breakdown.team2}</span>
                          {detail.breakdown.bonus > 0 && <span style={{ color: colors.gold, marginLeft: 4 }}>+{detail.breakdown.bonus}⭐</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div style={css.app}>
      <div style={css.header}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={css.title}>⚽ Mondial 2026 — Pronostics</p>
            <p style={css.subtitle}>USA · Canada · Mexique · 11 juin – 19 juillet 2026</p>
          </div>
          {/* Indicateur de sauvegarde */}
          <div style={{ fontSize: 11, color: saveIndicator ? colors.green : "transparent", transition: "color 0.3s", paddingTop: 4, whiteSpace: "nowrap" }}>
            ✓ Sauvegardé
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {sorted.map((p, i) => (
            <div key={p} style={{ background: PLAYER_COLORS[p] + "22", border: `1px solid ${PLAYER_COLORS[p]}`, borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 700, color: PLAYER_COLORS[p] }}>
              {i === 0 ? "🏆 " : i === 1 ? "🥈 " : "🥉 "}{p} · {totals[p]} pts
            </div>
          ))}
        </div>

        <div style={css.tabs}>
          {[["prono", "📝 Pronostics"], ["resultats", "✅ Résultats"], ["classement", "🏆 Classement"]].map(([id, label]) => (
            <button key={id} style={css.tab(tab === id)} onClick={() => dispatch({ type: "SET_TAB", tab: id })}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={css.body}>
        {tab === "prono" && <Pronostics />}
        {tab === "resultats" && <Resultats />}
        {tab === "classement" && <Leaderboard />}
      </div>
    </div>
  );
}
