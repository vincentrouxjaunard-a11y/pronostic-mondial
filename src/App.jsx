import { useState, useEffect, useReducer, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyD6sLv85OSBJuZpqnNS2kcEoS-Ca5FEm5c",
  authDomain: "pronostic-mondial.firebaseapp.com",
  databaseURL: "https://pronostic-mondial-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pronostic-mondial",
  storageBucket: "pronostic-mondial.firebasestorage.app",
  messagingSenderId: "838624034284",
  appId: "1:838624034284:web:a712dcd70dde4f804fd4c9"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const PLAYERS = ["Vincent", "Samuel", "Thomas", "Denis", "Mika", "Laurent", "Gabin", "Raph", "Olivier S", "Olivier G", "Julien", "Paco"];
const PALETTE = ["#22d3ee","#a78bfa","#f472b6","#34d399","#fb923c","#818cf8","#facc15","#f87171","#4ade80","#38bdf8","#c084fc"];
const getPlayerColor = (p) => PALETTE[PLAYERS.indexOf(p) % PALETTE.length];

const PLAYED = {
  "A1": { home: 2, away: 0 },
  "A2": { home: 2, away: 1 },
  "B1": { home: 1, away: 1 },
  "D1": { home: 4, away: 1 },
};

const GROUPS = [
  { id:"A", name:"Groupe A", teams:["Mexique 🇲🇽","Afrique du Sud 🇿🇦","Corée du Sud 🇰🇷","Tchéquie 🇨🇿"], matches:[
    {id:"A1",home:"Mexique 🇲🇽",away:"Afrique du Sud 🇿🇦",date:"11 juin"},
    {id:"A2",home:"Corée du Sud 🇰🇷",away:"Tchéquie 🇨🇿",date:"12 juin"},
    {id:"A3",home:"Tchéquie 🇨🇿",away:"Afrique du Sud 🇿🇦",date:"18 juin"},
    {id:"A4",home:"Mexique 🇲🇽",away:"Corée du Sud 🇰🇷",date:"19 juin"},
    {id:"A5",home:"Tchéquie 🇨🇿",away:"Mexique 🇲🇽",date:"25 juin"},
    {id:"A6",home:"Afrique du Sud 🇿🇦",away:"Corée du Sud 🇰🇷",date:"25 juin"},
  ]},
  { id:"B", name:"Groupe B", teams:["Canada 🇨🇦","Bosnie-Herzégovine 🇧🇦","Qatar 🇶🇦","Suisse 🇨🇭"], matches:[
    {id:"B1",home:"Canada 🇨🇦",away:"Bosnie-Herzégovine 🇧🇦",date:"12 juin"},
    {id:"B2",home:"Qatar 🇶🇦",away:"Suisse 🇨🇭",date:"13 juin"},
    {id:"B3",home:"Suisse 🇨🇭",away:"Bosnie-Herzégovine 🇧🇦",date:"18 juin"},
    {id:"B4",home:"Canada 🇨🇦",away:"Qatar 🇶🇦",date:"19 juin"},
    {id:"B5",home:"Bosnie-Herzégovine 🇧🇦",away:"Qatar 🇶🇦",date:"24 juin"},
    {id:"B6",home:"Suisse 🇨🇭",away:"Canada 🇨🇦",date:"24 juin"},
  ]},
  { id:"C", name:"Groupe C", teams:["Brésil 🇧🇷","Maroc 🇲🇦","Haïti 🇭🇹","Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿"], matches:[
    {id:"C1",home:"Brésil 🇧🇷",away:"Maroc 🇲🇦",date:"14 juin"},
    {id:"C2",home:"Haïti 🇭🇹",away:"Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿",date:"14 juin"},
    {id:"C3",home:"Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿",away:"Maroc 🇲🇦",date:"20 juin"},
    {id:"C4",home:"Brésil 🇧🇷",away:"Haïti 🇭🇹",date:"20 juin"},
    {id:"C5",home:"Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿",away:"Brésil 🇧🇷",date:"25 juin"},
    {id:"C6",home:"Maroc 🇲🇦",away:"Haïti 🇭🇹",date:"25 juin"},
  ]},
  { id:"D", name:"Groupe D", teams:["États-Unis 🇺🇸","Paraguay 🇵🇾","Australie 🇦🇺","Türkiye 🇹🇷"], matches:[
    {id:"D1",home:"États-Unis 🇺🇸",away:"Paraguay 🇵🇾",date:"13 juin"},
    {id:"D2",home:"Australie 🇦🇺",away:"Türkiye 🇹🇷",date:"13 juin"},
    {id:"D3",home:"États-Unis 🇺🇸",away:"Australie 🇦🇺",date:"19 juin"},
    {id:"D4",home:"Türkiye 🇹🇷",away:"Paraguay 🇵🇾",date:"20 juin"},
    {id:"D5",home:"Türkiye 🇹🇷",away:"États-Unis 🇺🇸",date:"26 juin"},
    {id:"D6",home:"Paraguay 🇵🇾",away:"Australie 🇦🇺",date:"26 juin"},
  ]},
  { id:"E", name:"Groupe E", teams:["Allemagne 🇩🇪","Curaçao 🇨🇼","Côte d'Ivoire 🇨🇮","Équateur 🇪🇨"], matches:[
    {id:"E1",home:"Allemagne 🇩🇪",away:"Curaçao 🇨🇼",date:"14 juin"},
    {id:"E2",home:"Côte d'Ivoire 🇨🇮",away:"Équateur 🇪🇨",date:"14 juin"},
    {id:"E3",home:"Allemagne 🇩🇪",away:"Côte d'Ivoire 🇨🇮",date:"20 juin"},
    {id:"E4",home:"Équateur 🇪🇨",away:"Curaçao 🇨🇼",date:"21 juin"},
    {id:"E5",home:"Équateur 🇪🇨",away:"Allemagne 🇩🇪",date:"25 juin"},
    {id:"E6",home:"Curaçao 🇨🇼",away:"Côte d'Ivoire 🇨🇮",date:"25 juin"},
  ]},
  { id:"F", name:"Groupe F", teams:["Pays-Bas 🇳🇱","Japon 🇯🇵","Suède 🇸🇪","Tunisie 🇹🇳"], matches:[
    {id:"F1",home:"Pays-Bas 🇳🇱",away:"Japon 🇯🇵",date:"14 juin"},
    {id:"F2",home:"Suède 🇸🇪",away:"Tunisie 🇹🇳",date:"14 juin"},
    {id:"F3",home:"Pays-Bas 🇳🇱",away:"Suède 🇸🇪",date:"20 juin"},
    {id:"F4",home:"Tunisie 🇹🇳",away:"Japon 🇯🇵",date:"21 juin"},
    {id:"F5",home:"Japon 🇯🇵",away:"Suède 🇸🇪",date:"26 juin"},
    {id:"F6",home:"Tunisie 🇹🇳",away:"Pays-Bas 🇳🇱",date:"26 juin"},
  ]},
  { id:"G", name:"Groupe G", teams:["Belgique 🇧🇪","Égypte 🇪🇬","Iran 🇮🇷","Nouvelle-Zélande 🇳🇿"], matches:[
    {id:"G1",home:"Belgique 🇧🇪",away:"Égypte 🇪🇬",date:"15 juin"},
    {id:"G2",home:"Iran 🇮🇷",away:"Nouvelle-Zélande 🇳🇿",date:"15 juin"},
    {id:"G3",home:"Belgique 🇧🇪",away:"Iran 🇮🇷",date:"21 juin"},
    {id:"G4",home:"Nouvelle-Zélande 🇳🇿",away:"Égypte 🇪🇬",date:"22 juin"},
    {id:"G5",home:"Nouvelle-Zélande 🇳🇿",away:"Belgique 🇧🇪",date:"27 juin"},
    {id:"G6",home:"Égypte 🇪🇬",away:"Iran 🇮🇷",date:"27 juin"},
  ]},
  { id:"H", name:"Groupe H", teams:["Espagne 🇪🇸","Cap-Vert 🇨🇻","Arabie saoudite 🇸🇦","Uruguay 🇺🇾"], matches:[
    {id:"H1",home:"Espagne 🇪🇸",away:"Cap-Vert 🇨🇻",date:"15 juin"},
    {id:"H2",home:"Arabie saoudite 🇸🇦",away:"Uruguay 🇺🇾",date:"15 juin"},
    {id:"H3",home:"Espagne 🇪🇸",away:"Arabie saoudite 🇸🇦",date:"21 juin"},
    {id:"H4",home:"Uruguay 🇺🇾",away:"Cap-Vert 🇨🇻",date:"22 juin"},
    {id:"H5",home:"Cap-Vert 🇨🇻",away:"Arabie saoudite 🇸🇦",date:"26 juin"},
    {id:"H6",home:"Uruguay 🇺🇾",away:"Espagne 🇪🇸",date:"26 juin"},
  ]},
  { id:"I", name:"Groupe I", teams:["France 🇫🇷","Sénégal 🇸🇳","Irak 🇮🇶","Norvège 🇳🇴"], matches:[
    {id:"I1",home:"France 🇫🇷",away:"Sénégal 🇸🇳",date:"16 juin"},
    {id:"I2",home:"Irak 🇮🇶",away:"Norvège 🇳🇴",date:"16 juin"},
    {id:"I3",home:"France 🇫🇷",away:"Irak 🇮🇶",date:"22 juin"},
    {id:"I4",home:"Norvège 🇳🇴",away:"Sénégal 🇸🇳",date:"23 juin"},
    {id:"I5",home:"Sénégal 🇸🇳",away:"Irak 🇮🇶",date:"26 juin"},
    {id:"I6",home:"Norvège 🇳🇴",away:"France 🇫🇷",date:"26 juin"},
  ]},
  { id:"J", name:"Groupe J", teams:["Argentine 🇦🇷","Algérie 🇩🇿","Autriche 🇦🇹","Jordanie 🇯🇴"], matches:[
    {id:"J1",home:"Argentine 🇦🇷",away:"Algérie 🇩🇿",date:"16 juin"},
    {id:"J2",home:"Autriche 🇦🇹",away:"Jordanie 🇯🇴",date:"16 juin"},
    {id:"J3",home:"Argentine 🇦🇷",away:"Autriche 🇦🇹",date:"22 juin"},
    {id:"J4",home:"Jordanie 🇯🇴",away:"Algérie 🇩🇿",date:"23 juin"},
    {id:"J5",home:"Argentine 🇦🇷",away:"Jordanie 🇯🇴",date:"28 juin"},
    {id:"J6",home:"Autriche 🇦🇹",away:"Algérie 🇩🇿",date:"28 juin"},
  ]},
  { id:"K", name:"Groupe K", teams:["Portugal 🇵🇹","RD Congo 🇨🇩","Ouzbékistan 🇺🇿","Colombie 🇨🇴"], matches:[
    {id:"K1",home:"Portugal 🇵🇹",away:"RD Congo 🇨🇩",date:"17 juin"},
    {id:"K2",home:"Ouzbékistan 🇺🇿",away:"Colombie 🇨🇴",date:"17 juin"},
    {id:"K3",home:"Portugal 🇵🇹",away:"Ouzbékistan 🇺🇿",date:"23 juin"},
    {id:"K4",home:"Colombie 🇨🇴",away:"RD Congo 🇨🇩",date:"24 juin"},
    {id:"K5",home:"Portugal 🇵🇹",away:"Colombie 🇨🇴",date:"28 juin"},
    {id:"K6",home:"RD Congo 🇨🇩",away:"Ouzbékistan 🇺🇿",date:"28 juin"},
  ]},
  { id:"L", name:"Groupe L", teams:["Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿","Ghana 🇬🇭","Croatie 🇭🇷","Panama 🇵🇦"], matches:[
    {id:"L1",home:"Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿",away:"Croatie 🇭🇷",date:"17 juin"},
    {id:"L2",home:"Ghana 🇬🇭",away:"Panama 🇵🇦",date:"18 juin"},
    {id:"L3",home:"Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿",away:"Ghana 🇬🇭",date:"23 juin"},
    {id:"L4",home:"Panama 🇵🇦",away:"Croatie 🇭🇷",date:"24 juin"},
    {id:"L5",home:"Panama 🇵🇦",away:"Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿",date:"27 juin"},
    {id:"L6",home:"Croatie 🇭🇷",away:"Ghana 🇬🇭",date:"27 juin"},
  ]},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getResult = (home, away) => {
  if (home===""||home===undefined||away===""||away===undefined) return null;
  const h=parseInt(home),a=parseInt(away);
  if (isNaN(h)||isNaN(a)) return null;
  return h>a?"H":a>h?"A":"D";
};

const computePoints = (prediction, actual) => {
  if (!actual||prediction.home===""||prediction.home===undefined||prediction.away===""||prediction.away===undefined) return 0;
  const pr=getResult(prediction.home,prediction.away),ar=getResult(actual.home,actual.away);
  if (!pr||!ar||pr!==ar) return 0;
  return parseInt(prediction.home)===actual.home&&parseInt(prediction.away)===actual.away?2:1;
};

const computeQualPointsDetailed = (playerQuals, officialQuals) => {
  if (!officialQuals||officialQuals.length<2||!playerQuals) return {pts:0,breakdown:{team1:0,team2:0,bonus:0}};
  const [o1,o2]=officialQuals,[p1,p2]=playerQuals;
  const t1=p1&&[o1,o2].includes(p1)?1:0;
  const t2=p2&&[o1,o2].includes(p2)?1:0;
  const bonus=p1===o1&&p2===o2?2:0;
  return {pts:t1+t2+bonus,breakdown:{team1:t1,team2:t2,bonus}};
};

// ─── ÉTAT INITIAL ─────────────────────────────────────────────────────────────

const buildFreshState = () => {
  const predictions={},quals={};
  PLAYERS.forEach(p=>{
    predictions[p]={};
    GROUPS.forEach(g=>{quals[`${p}-${g.id}`]=[];});
  });
  return {predictions,quals,actual:{...PLAYED},officialQuals:{},tab:"prono",activePlayer:PLAYERS[0],activeGroup:"A"};
};

// ─── REDUCER ─────────────────────────────────────────────────────────────────

function reducer(state,action){
  switch(action.type){
    case "FIREBASE_LOAD": return {...state,...action.data};
    case "SET_PREDICTION":{const{player,matchId,side,value}=action;return{...state,predictions:{...state.predictions,[player]:{...state.predictions[player],[matchId]:{...state.predictions[player][matchId],[side]:value}}}};}
    case "SET_ACTUAL":{const{matchId,side,value}=action;return{...state,actual:{...state.actual,[matchId]:{...state.actual[matchId],[side]:value}}};}
    case "TOGGLE_QUAL":{
      const{player,groupId,team}=action;
      const key=`${player}-${groupId}`;
      const raw=state.quals[key]||[];
      // Nettoyer le tableau (Firebase peut corrompre en objet avec undefined)
      const cur=(Array.isArray(raw)?raw:Object.values(raw)).filter(t=>t!=null&&t!==undefined&&t!=="");
      const idx=cur.indexOf(team);
      let next;
      if(idx!==-1){
        // Déjà sélectionné → on le retire
        next=cur.filter(t=>t!==team);
      } else if(cur.length===0){
        next=[team];
      } else if(cur.length===1){
        next=[cur[0],team];
      } else {
        // 2 déjà sélectionnés → clic sur un 3e remplace le 1er, le 2e reste
        next=[team,cur[1]];
      }
      return{...state,quals:{...state.quals,[key]:next}};
    }
    case "TOGGLE_OFFICIAL_QUAL":{const{groupId,team}=action;const cur=state.officialQuals[groupId]||[];const idx=cur.indexOf(team);const next=idx!==-1?cur.filter(t=>t!==team):cur.length<2?[...cur,team]:cur;return{...state,officialQuals:{...state.officialQuals,[groupId]:next}};}
    case "SET_TAB":return{...state,tab:action.tab};
    case "SET_PLAYER":return{...state,activePlayer:action.player};
    case "SET_GROUP":return{...state,activeGroup:action.group};
    case "RESET":return{...buildFreshState(),tab:state.tab};
    default:return state;
  }
}

// ─── COULEURS ────────────────────────────────────────────────────────────────

const C={bg:"#080f1e",card:"#132038",border:"#1e3a5f",accent:"#22d3ee",gold:"#fbbf24",text:"#e2e8f0",muted:"#64748b",green:"#10b981",red:"#ef4444",purple:"#a78bfa"};

// ─── COMPOSANTS ──────────────────────────────────────────────────────────────

const ScoreInput=({value,onChange,disabled})=>(
  <input type="number" min="0" max="20" value={value??""} onChange={e=>onChange(e.target.value)} disabled={disabled} inputMode="numeric"
    style={{width:52,height:52,textAlign:"center",fontSize:22,fontWeight:700,border:disabled?"2px solid #334155":"2px solid #22d3ee",borderRadius:10,background:disabled?"#1e293b":"#0f172a",color:disabled?"#64748b":"#e2e8f0",outline:"none",cursor:disabled?"not-allowed":"text",fontFamily:"monospace",WebkitAppearance:"none",MozAppearance:"textfield"}}
  />
);

const Badge=({pts})=>{
  if(pts===null||pts===undefined) return null;
  const col=pts===2?C.green:pts===1?C.gold:C.red;
  return <span style={{background:col+"22",color:col,border:`1px solid ${col}`,borderRadius:999,padding:"3px 10px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{pts===2?"🎯 +2":pts===1?"✓ +1":"0"}</span>;
};

const QualBtn=({team,rank,isOfficial,playerColor,onClick})=>{
  const label=rank===1?"1er":rank===2?"2e":null;
  const ok=rank&&isOfficial;
  const bc=ok?"#10b981":rank?(playerColor||C.accent):"#1e3a5f";
  const bg=ok?"#10b98122":rank?(playerColor||C.accent)+"22":"transparent";
  const tc=ok?"#10b981":rank?(playerColor||C.accent):C.muted;
  return(
    <button onClick={onClick} style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${bc}`,background:bg,color:tc,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,minHeight:44}}>
      {label&&<span style={{background:ok?"#10b981":(playerColor||C.accent),color:"#000",borderRadius:4,padding:"2px 6px",fontSize:11,fontWeight:900,minWidth:28,textAlign:"center"}}>{label}</span>}
      {team}{ok&&" ✓"}
    </button>
  );
};

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────

export default function App(){
  const fresh=buildFreshState();
  const [state,dispatch]=useReducer(reducer,fresh);
  const [syncStatus,setSyncStatus]=useState("connecting"); // connecting | synced | saving | error
  const isMounted=useRef(true);
  const skipNextSave=useRef(false);

  // ── Chargement Firebase au démarrage ─────────────────────────────────────
  useEffect(()=>{
    isMounted.current=true;
    const dbRef=ref(db,"mondial2026");
    const unsub=onValue(dbRef,snapshot=>{
      if(!isMounted.current) return;
      const data=snapshot.val();
      if(data){
        skipNextSave.current=true;

        // Firebase stocke les tableaux comme objets {0:"Brésil",1:"Maroc"}
        // Cette fonction reconvertit en vrai tableau ordonné
        const toArray = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val.filter(Boolean);
          // Objet Firebase {0:"X", 1:"Y"} → ["X","Y"]
          return Object.keys(val).sort((a,b)=>Number(a)-Number(b)).map(k=>val[k]).filter(Boolean);
        };

        // Reconvertir tous les quals en vrais tableaux
        const rawQuals = data.quals || {};
        const fixedQuals = {...fresh.quals};
        Object.keys(rawQuals).forEach(key => {
          fixedQuals[key] = toArray(rawQuals[key]);
        });

        // Reconvertir officialQuals
        const rawOQ = data.officialQuals || {};
        const fixedOQ = {};
        Object.keys(rawOQ).forEach(gId => {
          fixedOQ[gId] = toArray(rawOQ[gId]);
        });

        const merged={
          predictions:{...fresh.predictions,...(data.predictions||{})},
          quals:fixedQuals,
          actual:{...fresh.actual,...(data.actual||{})},
          officialQuals:fixedOQ,
        };

        // S'assurer que chaque joueur a bien ses clés
        PLAYERS.forEach(p=>{
          if(!merged.predictions[p]) merged.predictions[p]={};
          GROUPS.forEach(g=>{
            const key=`${p}-${g.id}`;
            if(!merged.quals[key]) merged.quals[key]=[];
          });
        });
        dispatch({type:"FIREBASE_LOAD",data:merged});
      }
      setSyncStatus("synced");
    },err=>{
      console.error("Firebase error:",err);
      setSyncStatus("error");
    });
    return()=>{isMounted.current=false; unsub();};
  },[]);

  // ── Sauvegarde Firebase à chaque changement ───────────────────────────────
  useEffect(()=>{
    if(skipNextSave.current){skipNextSave.current=false;return;}
    if(syncStatus==="connecting") return;
    setSyncStatus("saving");
    const timer=setTimeout(()=>{
      const dbRef=ref(db,"mondial2026");
      set(dbRef,{
        predictions:state.predictions,
        quals:state.quals,
        actual:state.actual,
        officialQuals:state.officialQuals,
      }).then(()=>setSyncStatus("synced")).catch(()=>setSyncStatus("error"));
    },600); // debounce 600ms
    return()=>clearTimeout(timer);
  },[state.predictions,state.quals,state.actual,state.officialQuals]);

  const{predictions,quals,actual,officialQuals,tab,activePlayer,activeGroup}=state;
  const[resetConfirm,setResetConfirm]=useState(false);

  // Totaux
  const totals={},bk={};
  PLAYERS.forEach(p=>{
    let m=0,q=0,b=0;
    GROUPS.forEach(g=>{
      g.matches.forEach(mx=>{m+=computePoints(predictions[p][mx.id]||{},actual[mx.id]);});
      const d=computeQualPointsDetailed(quals[`${p}-${g.id}`]||[],officialQuals[g.id]||[]);
      q+=d.breakdown.team1+d.breakdown.team2;b+=d.breakdown.bonus;
    });
    totals[p]=m+q+b;bk[p]={m,q,b};
  });
  const sorted=[...PLAYERS].sort((a,b)=>totals[b]-totals[a]);
  const curGroup=GROUPS.find(g=>g.id===activeGroup);
  const pc=getPlayerColor(activePlayer);

  const syncIcon=syncStatus==="synced"?"☁️ Synchronisé":syncStatus==="saving"?"⏳ Sauvegarde...":syncStatus==="connecting"?"🔄 Connexion...":"❌ Erreur sync";
  const syncColor=syncStatus==="synced"?C.green:syncStatus==="error"?C.red:C.gold;

  const S={
    header:{background:"linear-gradient(135deg,#0f1f35,#0a2540)",borderBottom:`1px solid ${C.border}`,padding:"16px 16px 0"},
    body:{padding:"12px",maxWidth:600,margin:"0 auto"},
    card:{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:12},
    tab:(a)=>({padding:"10px 14px",fontSize:13,fontWeight:600,border:"none",background:"transparent",color:a?C.accent:C.muted,borderBottom:a?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer",marginBottom:-1,whiteSpace:"nowrap"}),
    groupBtn:(a)=>({padding:"8px 14px",borderRadius:8,border:`1px solid ${a?C.accent:C.border}`,background:a?C.accent+"22":"transparent",color:a?C.accent:C.muted,fontWeight:700,fontSize:14,cursor:"pointer",minHeight:40}),
    matchRow:{display:"flex",alignItems:"center",gap:6,padding:"10px 0",borderBottom:`1px solid ${C.border}`},
  };

  const shortName=n=>n.replace(/ 🇲🇽|🇿🇦|🇰🇷|🇨🇿|🇨🇦|🇧🇦|🇶🇦|🇨🇭|🇧🇷|🇲🇦|🇭🇹|🏴󠁧󠁢󠁳󠁣󠁴󠁿|🇺🇸|🇵🇾|🇦🇺|🇹🇷|🇩🇪|🇨🇼|🇨🇮|🇪🇨|🇳🇱|🇯🇵|🇸🇪|🇹🇳|🇧🇪|🇪🇬|🇮🇷|🇳🇿|🇪🇸|🇨🇻|🇸🇦|🇺🇾|🇫🇷|🇸🇳|🇮🇶|🇳🇴|🇦🇷|🇩🇿|🇦🇹|🇯🇴|🇵🇹|🇨🇩|🇺🇿|🇨🇴|🏴󠁧󠁢󠁥󠁮󠁧󠁿|🇬🇭|🇭🇷|🇵🇦/g,"").trim();

  const PlayerSelect=()=>(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>👤 Joueur</label>
      <select value={activePlayer} onChange={e=>dispatch({type:"SET_PLAYER",player:e.target.value})}
        style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`2px solid ${pc}`,background:"#0f172a",color:pc,fontSize:16,fontWeight:700,cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none"}}>
        {PLAYERS.map(p=><option key={p} value={p} style={{color:"#e2e8f0",background:"#132038"}}>{p} — {totals[p]} pts</option>)}
      </select>
    </div>
  );

  const GroupSelect=()=>(
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
      {GROUPS.map(g=>(
        <button key={g.id} style={S.groupBtn(activeGroup===g.id)} onClick={()=>dispatch({type:"SET_GROUP",group:g.id})}>{g.id}</button>
      ))}
    </div>
  );

  // ── PRONOSTICS ────────────────────────────────────────────────────────────
  const Pronostics=()=>{
    const pQuals=quals[`${activePlayer}-${curGroup?.id}`]||[];
    const oQuals=officialQuals[curGroup?.id]||[];
    const detail=curGroup?computeQualPointsDetailed(pQuals,oQuals):null;
    return(
      <div>
        <PlayerSelect/>
        <GroupSelect/>
        {curGroup&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.accent}}>{curGroup.name}</div>
            {curGroup.matches.map(m=>{
              const isPlayed=!!PLAYED[m.id]||(actual[m.id]&&actual[m.id].home!==undefined&&actual[m.id].away!==undefined&&!isNaN(actual[m.id].home)&&!isNaN(actual[m.id].away)&&!PLAYED[m.id]);
              const isFixed=!!PLAYED[m.id];
              const pred=predictions[activePlayer][m.id]||{};
              const act=actual[m.id];
              const pts=act?computePoints(pred,act):null;
              return(
                <div key={m.id} style={S.matchRow}>
                  <div style={{fontSize:10,color:C.muted,width:38,textAlign:"center",flexShrink:0}}>{m.date}</div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"right",lineHeight:1.3}}>{shortName(m.home)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                    <ScoreInput value={isFixed?PLAYED[m.id]?.home:pred.home} disabled={isPlayed} onChange={v=>dispatch({type:"SET_PREDICTION",player:activePlayer,matchId:m.id,side:"home",value:v})}/>
                    <span style={{color:C.muted,fontWeight:700,fontSize:14}}>–</span>
                    <ScoreInput value={isFixed?PLAYED[m.id]?.away:pred.away} disabled={isPlayed} onChange={v=>dispatch({type:"SET_PREDICTION",player:activePlayer,matchId:m.id,side:"away",value:v})}/>
                  </div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"left",lineHeight:1.3}}>{shortName(m.away)}</div>
                  <div style={{width:48,textAlign:"center",flexShrink:0}}>
                    {isPlayed?<span style={{fontSize:10,color:C.muted}}>Joué</span>:<Badge pts={pts}/>}
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,color:C.muted,marginBottom:4,fontWeight:600}}>🎯 Qualifiés — <span style={{color:pc}}>1er clic = 1er · 2e clic = 2e</span></div>
              <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Bonus +2 pts si les 2 dans le bon ordre</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {curGroup.teams.map(team=>{
                  const rank=pQuals.indexOf(team)!==-1?pQuals.indexOf(team)+1:null;
                  const isOfficial=rank!==null&&oQuals[rank-1]===team;
                  return <QualBtn key={team} team={team} rank={rank} isOfficial={isOfficial} playerColor={pc} onClick={()=>dispatch({type:"TOGGLE_QUAL",player:activePlayer,groupId:curGroup.id,team})}/>;
                })}
              </div>
              {oQuals.length===2&&detail&&(
                <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.muted}}>Cette poule :</span>
                  <span style={{fontSize:12,color:C.green,fontWeight:700}}>+{detail.breakdown.team1+detail.breakdown.team2} qualifiés</span>
                  {detail.breakdown.bonus>0&&<span style={{fontSize:12,color:C.gold,fontWeight:700}}>⭐ +{detail.breakdown.bonus} bonus ordre</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── RÉSULTATS ─────────────────────────────────────────────────────────────
  const Resultats=()=>{
    const oQuals=officialQuals[curGroup?.id]||[];
    return(
      <div>
        <div style={{...S.card,background:"#1a0f2e",borderColor:"#4c1d95",marginBottom:14}}>
          <div style={{fontSize:13,color:C.purple,fontWeight:600}}>✏️ Mode admin — Scores et qualifiés officiels</div>
        </div>
        <GroupSelect/>
        {curGroup&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.accent}}>{curGroup.name} — Résultats officiels</div>
            {curGroup.matches.map(m=>{
              const isFixed=!!PLAYED[m.id];
              const act=actual[m.id]||{};
              return(
                <div key={m.id} style={S.matchRow}>
                  <div style={{fontSize:10,color:C.muted,width:38,textAlign:"center",flexShrink:0}}>{m.date}</div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"right"}}>{shortName(m.home)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                    <ScoreInput value={isFixed?PLAYED[m.id].home:act.home??""} disabled={isFixed} onChange={v=>dispatch({type:"SET_ACTUAL",matchId:m.id,side:"home",value:parseInt(v)})}/>
                    <span style={{color:C.muted,fontWeight:700}}>–</span>
                    <ScoreInput value={isFixed?PLAYED[m.id].away:act.away??""} disabled={isFixed} onChange={v=>dispatch({type:"SET_ACTUAL",matchId:m.id,side:"away",value:parseInt(v)})}/>
                  </div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"left"}}>{shortName(m.away)}</div>
                  <div style={{width:48,textAlign:"center"}}>{isFixed&&<span style={{fontSize:10,color:C.green}}>✓</span>}</div>
                </div>
              );
            })}
            <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,color:C.purple,marginBottom:4,fontWeight:600}}>✅ Qualifiés officiels — <b>1er clic = 1er · 2e clic = 2e</b></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                {curGroup.teams.map(team=>{
                  const rank=oQuals.indexOf(team)!==-1?oQuals.indexOf(team)+1:null;
                  return <QualBtn key={team} team={team} rank={rank} isOfficial={!!rank} playerColor={C.green} onClick={()=>dispatch({type:"TOGGLE_OFFICIAL_QUAL",groupId:curGroup.id,team})}/>;
                })}
              </div>
            </div>
          </div>
        )}
        {curGroup&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:C.muted}}>Comparatif — {curGroup.name}</div>
            {curGroup.matches.map(m=>{
              const act=actual[m.id];
              return(
                <div key={m.id} style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6}}>
                    {m.home} vs {m.away}
                    {act&&act.home!==undefined&&!isNaN(act.home)?<span style={{color:C.green,marginLeft:8}}>→ {act.home}-{act.away}</span>:<span style={{color:C.muted,marginLeft:8}}>Pas encore joué</span>}
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {PLAYERS.map(p=>{
                      const pred=predictions[p][m.id]||{};
                      const pts=(act&&pred.home!==""&&pred.home!==undefined)?computePoints(pred,act):null;
                      return(
                        <div key={p} style={{background:"#0f172a",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${pts===2?C.green:pts===1?C.gold:pts===0?C.red:C.border}`,minWidth:70}}>
                          <div style={{fontSize:10,color:getPlayerColor(p),fontWeight:700,marginBottom:3}}>{p}</div>
                          <div style={{fontSize:15,fontWeight:900,fontFamily:"monospace"}}>{pred.home!==undefined&&pred.home!==""?`${pred.home}-${pred.away}`:"—"}</div>
                          {pts!==null&&<div style={{marginTop:4}}><Badge pts={pts}/></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {oQuals.length>0&&(
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:4}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>Qualifiés officiels : {oQuals[0]||"?"} (1er) · {oQuals[1]||"?"} (2e)</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {PLAYERS.map(p=>{
                    const pQ=quals[`${p}-${curGroup.id}`]||[];
                    const d=computeQualPointsDetailed(pQ,oQuals);
                    return(
                      <div key={p} style={{background:"#0f172a",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${d.pts>=4?C.gold:d.pts>=2?C.green:C.border}`,minWidth:70}}>
                        <div style={{fontSize:10,color:getPlayerColor(p),fontWeight:700,marginBottom:4}}>{p}</div>
                        <div style={{fontSize:10,color:C.text}}>{pQ[0]||"—"}</div>
                        <div style={{fontSize:10,color:C.text,marginBottom:4}}>{pQ[1]||"—"}</div>
                        <div style={{fontSize:11,fontWeight:700}}>
                          <span style={{color:C.green}}>+{d.breakdown.team1+d.breakdown.team2}</span>
                          {d.breakdown.bonus>0&&<span style={{color:C.gold}}> +{d.breakdown.bonus}⭐</span>}
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

  // ── CLASSEMENT ────────────────────────────────────────────────────────────
  const Classement=()=>(
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:10}}>Classement</div>
        {sorted.map((p,i)=>(
          <div key={p} style={{...S.card,display:"flex",alignItems:"center",gap:12,borderColor:i===0?C.gold:C.border,marginBottom:8}}>
            <div style={{fontSize:20,width:30,textAlign:"center"}}>{i===0?"🏆":i===1?"🥈":"🥉"}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:16,color:getPlayerColor(p)}}>{p}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:2}}>
                Matchs <b style={{color:C.accent}}>{bk[p].m}</b> · Qualifiés <b style={{color:C.green}}>{bk[p].q}</b> · Bonus <b style={{color:C.gold}}>{bk[p].b}</b>
              </div>
            </div>
            <div style={{fontSize:28,fontWeight:900,color:getPlayerColor(p)}}>{totals[p]}<span style={{fontSize:13,color:C.muted,fontWeight:400}}> pts</span></div>
          </div>
        ))}
      </div>
      <div style={{...S.card,background:"#0a1628"}}>
        <div style={{fontSize:12,color:C.muted,fontWeight:700,marginBottom:8}}>📋 RÈGLES</div>
        {[["✓",C.gold,"Bon résultat","+1 pt"],["🎯",C.green,"Score exact","+2 pts"],["🏅",C.green,"Qualifié trouvé","+1 pt/équipe"],["⭐",C.gold,"Ordre exact 1er+2e","+2 pts bonus"]].map(([ic,col,lb,pt])=>(
          <div key={lb} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,marginBottom:6}}>
            <span>{ic}</span><span style={{flex:1,color:C.text}}>{lb}</span><span style={{fontWeight:700,color:col}}>{pt}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:16}}>
        {!resetConfirm
          ?<button onClick={()=>setResetConfirm(true)} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:8,padding:"10px 16px",fontSize:13,cursor:"pointer"}}>🗑️ Réinitialiser toutes les données</button>
          :<div style={{...S.card,borderColor:C.red,background:"#1a0a0a"}}>
            <div style={{fontSize:13,color:C.red,marginBottom:10,fontWeight:600}}>Confirmer ? Toutes les données seront effacées pour tout le monde.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{dispatch({type:"RESET"});setResetConfirm(false);}} style={{background:C.red,border:"none",color:"#fff",borderRadius:8,padding:"10px 16px",fontSize:13,cursor:"pointer",fontWeight:700}}>Oui, effacer</button>
              <button onClick={()=>setResetConfirm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"10px 16px",fontSize:13,cursor:"pointer"}}>Annuler</button>
            </div>
          </div>
        }
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,sans-serif",paddingBottom:60}}>
      <div style={S.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:900,margin:0,background:"linear-gradient(90deg,#22d3ee,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚽ Mondial 2026</h1>
            <p style={{color:C.muted,fontSize:11,margin:"2px 0 10px"}}>USA · Canada · Mexique</p>
          </div>
          <div style={{fontSize:11,color:syncColor,paddingTop:4,textAlign:"right"}}>{syncIcon}</div>
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,scrollbarWidth:"none"}}>
          {sorted.map((p,i)=>(
            <div key={p} style={{background:getPlayerColor(p)+"22",border:`1px solid ${getPlayerColor(p)}`,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,color:getPlayerColor(p),whiteSpace:"nowrap",flexShrink:0}}>
              {i===0?"🏆":i===1?"🥈":"🥉"} {p} · {totals[p]}
            </div>
          ))}
        </div>
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginTop:4,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["prono","📝 Pronostics"],["resultats","✅ Résultats"],["classement","🏆 Classement"]].map(([id,lb])=>(
            <button key={id} style={S.tab(tab===id)} onClick={()=>dispatch({type:"SET_TAB",tab:id})}>{lb}</button>
          ))}
        </div>
      </div>
      <div style={S.body}>
        {tab==="prono"&&<Pronostics/>}
        {tab==="resultats"&&<Resultats/>}
        {tab==="classement"&&<Classement/>}
      </div>
    </div>
  );
}
