/* ============================================================
   RISK: WORLD DOMINATION — game engine, AI, rendering, FX.
   ============================================================ */
(() => {
"use strict";

const PLAYER_COLORS = ["#3a8ddb","#e25555","#3cc26e","#a96fd1","#e6912f","#e8cf3a"];
const AI_NAMES = ["Napoleon","Caesar","Genghis","Cleopatra","Hannibal","Boudica","Tokugawa","Saladin"];
const CARD_ICONS = { inf:"🪖", cav:"🐎", art:"💣", wild:"⭐" };
const CARD_LBL   = { inf:"Infantry", cav:"Cavalry", art:"Artillery", wild:"Wild" };

// AI difficulty tuning
const DIFF = {
  easy:   { label:"Easy",      desc:"timid AI",     ratio:1.95, maxAttacks:6,  focus:0.25, push:false, trade:false },
  medium: { label:"Medium",    desc:"balanced AI",  ratio:1.40, maxAttacks:20, focus:0.6,  push:false, trade:true  },
  hard:   { label:"Difficult", desc:"ruthless AI",  ratio:1.12, maxAttacks:60, focus:0.9,  push:true,  trade:true  },
};
// user preferences (set on the home screen)
const PREFS = { difficulty:"medium", players:4, music:true, sfx:true, names:true, lang:"en" };

// ---------- i18n ----------
const STR = {
  en: {
    reinforce:"Reinforce", attack:"Attack", fortify:"Fortify", gameover:"Game Over",
    endReinforce:"End Reinforce →", endAttack:"End Attack → Move troops", endTurn:"End Turn ⟳",
    aiThinking:"AI thinking…", cards:"Cards", armiesLeft:"Armies left:",
    yourReinf:"Your Reinforcements", toPlace:"armies to place", tapGlow:"tap glowing lands",
    nextTurn:"next turn", ifEnd:"if you end now", territories:"Territories", totalTurn:"Total / turn",
    placeMore:n=>`▼ Place ${n} more ▼`, contBonuses:"Continent Bonuses", ownCont:"own a continent for the bonus",
    bReinforceT:"➕ REINFORCE", bReinforceS:n=>`Place your <b>${n}</b> armies — tap your glowing territories`,
    bAttackT:"⚔ ATTACK", bAttackS:"Tap your army, then a highlighted enemy. You'll move troops after.",
    bFortifyT:"🛡 FORTIFY — move your troops", bFortifyS:"Tap a territory, then a connected one to relocate armies (one move)",
    bPlaceFirstT:"Place your armies first", bPlaceFirstS:n=>`${n} still to deploy`,
    bAllT:"All armies placed", bAllS:'Tap "End Reinforce →" to attack',
    bTurnS:"Enemy general is plotting…", turnOf:n=>`${n}'s turn`,
    bTakenT:"Territory taken!", bTakenS:"Keep attacking, or End Attack to move troops",
    roll:"🎲 Roll", auto:"⚡ Auto-Attack", retreat:"Retreat", armies:"armies", vs:"VS",
    conquered:n=>`🏆 Conquered ${n}`, wonWith:"You won this battle with:", you:"You", moveLbl:"Move",
    moveFwd:(a,b)=>`Move your armies forward: ${a} → <b>${b}</b>`, moveTitle:"Move Armies",
    cardsTitle:"🂠 Your Cards", cardsMust:"You hold 5+ cards — you must trade a set.",
    cardsTrade:"Trade a set of 3 (same, all-different, or any 2 + wild) for armies.",
    cardsNext:n=>`Next set is worth <b class="bonus-note">${n}</b> armies.`,
    tradeFor:n=>`Trade for +${n}`, close:"Close",
    cardsNone:"No cards yet — conquer a territory this turn to earn one.", anyTerr:"Any",
    tradeOnlyReinforce:"You can only trade cards during your Reinforce phase. Trade these at the start of your next turn.",
    diff_easy:"Easy", diff_medium:"Medium", diff_hard:"Difficult",
    desc_easy:"timid AI", desc_medium:"balanced AI", desc_hard:"ruthless AI",
    paused:"⏸ Paused", generalsWord:"generals",
    resume:"▶ Resume", restart:"⟳ Restart match", quitMenu:"⌂ Quit to Main Menu",
    victory:"🏆 VICTORY!", defeat:"💀 DEFEAT", rulesWorld:"rules the world!",
    conqWorld:"has conquered the world.", playAgain:"Play Again",
    inf:"Infantry", cav:"Cavalry", art:"Artillery", wild:"Wild",
    warBegins:"<b>The war for the world begins!</b>",
    yourTurn:n=>`<b>Your turn.</b> Place ${n} armies on your territories.`,
    mustTrade:"You must trade in cards (5+ held).",
    allPlacedLog:'All armies placed. Tap "End Reinforce" to attack.',
    placeAllLog:n=>`Place all ${n} armies first.`,
    attackLog:"Attack phase — pick a territory, then an adjacent enemy.",
    fortifyLog:"Fortify phase — move armies between connected territories (one move).",
    battleLog:(f,t,d,a)=>`${f} ⚔ ${t}: <b style="color:#ff9">−${d}</b> def / <b style="color:#9cf">−${a}</b> atk`,
    conqLog:(c,n,t)=>`<b style="color:${c}">${n}</b> conquered <b>${t}!</b>`,
    aiTookLog:(c,n,t)=>`<b style="color:${c}">${n}</b> took <b>${t}</b>.`,
    fortifiedLog:(n,t)=>`Fortified ${n} armies into <b>${t}</b>.`,
    earnedLog:t=>`You earned a <b>${t}</b> card.`,
    tradedLog:n=>`Traded a set for <b class="bonus-note">+${n}</b> armies!`,
    matchLog:t=>`+2 armies on <b>${t}</b> (card match).`,
    eliminatedLog:(c,n)=>`<b style="color:${c}">${n}</b> has been eliminated!`,
    // home / settings / about
    home_tag:"Conquer every territory on Earth. Set your battle, then march.",
    home_generals:"Generals in the war", home_difficulty:"Difficulty",
    home_start:"▶ Start Battle", home_howto:"📖 How to Play", home_settings:"⚙ Settings",
    playersWord:"players", back:"← Back", on:"On", off:"Off",
    about_title:"📖 How to Play", set_title:"⚙ Settings",
    set_music:"🎵 Battle music", set_sfx:"🔊 Sound effects",
    set_names:"🏷 Show names by default", set_lang:"🌐 Language",
    set_hint:"Generals and difficulty are chosen on the Play screen. You can pause, restart or quit any match from the ☰ menu in the top-right during play.",
    homeSummary:(g,d,a)=>`You vs <b>${g}</b> generals · <b>${d}</b> · <b>${a}</b> armies each`,
    about_html:`<p><b>Goal:</b> be the last general standing — eliminate every rival and rule the world.</p>
<p><b>1 · Reinforce.</b> Each turn you get new armies = your territories ÷ 3 (min 3), <b>plus a bonus for every continent you fully control</b>. Tap your glowing territories to place them.</p>
<p><b>2 · Attack.</b> Tap one of your territories (2+ armies), then a highlighted neighbour. Roll the dice — attacker rolls up to 3, defender up to 2; highest dice compared in pairs, <b>ties go to the defender</b>. Empty an enemy territory to conquer it, then move your armies in.</p>
<p><b>3 · Fortify.</b> Once per turn, move armies between two connected friendly territories.</p>
<p><b>Cards.</b> Conquer at least one territory in a turn to earn a card. Trade a set of three (all same, all different, or any two + a wild ⭐) for bonus armies. You must trade at 5+ cards.</p>
<p><b>Continents</b> are the key — each fully-held continent gives bonus reinforcements every turn.</p>`,
  },
  es: {
    reinforce:"Refuerzo", attack:"Ataque", fortify:"Fortificar", gameover:"Fin",
    endReinforce:"Fin refuerzo →", endAttack:"Fin ataque → Mover", endTurn:"Fin turno ⟳",
    aiThinking:"IA pensando…", cards:"Cartas", armiesLeft:"Ejércitos:",
    yourReinf:"Tus refuerzos", toPlace:"ejércitos por colocar", tapGlow:"toca los territorios brillantes",
    nextTurn:"próximo turno", ifEnd:"si terminas ahora", territories:"Territorios", totalTurn:"Total / turno",
    placeMore:n=>`▼ Coloca ${n} más ▼`, contBonuses:"Bonos de continente", ownCont:"controla el continente por el bono",
    bReinforceT:"➕ REFUERZO", bReinforceS:n=>`Coloca tus <b>${n}</b> ejércitos — toca tus territorios brillantes`,
    bAttackT:"⚔ ATAQUE", bAttackS:"Toca tu ejército y luego un enemigo resaltado. Después mueves tropas.",
    bFortifyT:"🛡 FORTIFICAR — mueve tus tropas", bFortifyS:"Toca un territorio y luego uno conectado para mover ejércitos (un movimiento)",
    bPlaceFirstT:"Coloca tus ejércitos primero", bPlaceFirstS:n=>`faltan ${n} por desplegar`,
    bAllT:"Ejércitos colocados", bAllS:'Pulsa "Fin refuerzo →" para atacar',
    bTurnS:"El general enemigo trama…", turnOf:n=>`Turno de ${n}`,
    bTakenT:"¡Territorio conquistado!", bTakenS:"Sigue atacando, o Fin ataque para mover tropas",
    roll:"🎲 Tirar", auto:"⚡ Auto-ataque", retreat:"Retirada", armies:"ejércitos", vs:"VS",
    conquered:n=>`🏆 Conquistaste ${n}`, wonWith:"Ganaste esta batalla con:", you:"Tú", moveLbl:"Mover",
    moveFwd:(a,b)=>`Avanza tus ejércitos: ${a} → <b>${b}</b>`, moveTitle:"Mover ejércitos",
    cardsTitle:"🂠 Tus cartas", cardsMust:"Tienes 5+ cartas — debes canjear un grupo.",
    cardsTrade:"Canjea 3 cartas (iguales, distintas, o 2 + comodín) por ejércitos.",
    cardsNext:n=>`El próximo grupo vale <b class="bonus-note">${n}</b> ejércitos.`,
    tradeFor:n=>`Canjear por +${n}`, close:"Cerrar",
    cardsNone:"Sin cartas — conquista un territorio este turno para ganar una.", anyTerr:"Cualquiera",
    tradeOnlyReinforce:"Solo puedes canjear cartas durante tu fase de Refuerzo. Canjéalas al inicio de tu próximo turno.",
    diff_easy:"Fácil", diff_medium:"Medio", diff_hard:"Difícil",
    desc_easy:"IA tímida", desc_medium:"IA equilibrada", desc_hard:"IA implacable",
    paused:"⏸ Pausa", generalsWord:"generales",
    resume:"▶ Continuar", restart:"⟳ Reiniciar partida", quitMenu:"⌂ Salir al menú",
    victory:"🏆 ¡VICTORIA!", defeat:"💀 DERROTA", rulesWorld:"¡domina el mundo!",
    conqWorld:"ha conquistado el mundo.", playAgain:"Jugar de nuevo",
    inf:"Infantería", cav:"Caballería", art:"Artillería", wild:"Comodín",
    warBegins:"<b>¡Comienza la guerra por el mundo!</b>",
    yourTurn:n=>`<b>Tu turno.</b> Coloca ${n} ejércitos en tus territorios.`,
    mustTrade:"Debes canjear cartas (tienes 5+).",
    allPlacedLog:'Ejércitos colocados. Pulsa "Fin refuerzo" para atacar.',
    placeAllLog:n=>`Coloca los ${n} ejércitos primero.`,
    attackLog:"Fase de ataque — elige un territorio y luego un enemigo adyacente.",
    fortifyLog:"Fase de fortificar — mueve ejércitos entre territorios conectados (un movimiento).",
    battleLog:(f,t,d,a)=>`${f} ⚔ ${t}: <b style="color:#ff9">−${d}</b> def / <b style="color:#9cf">−${a}</b> atq`,
    conqLog:(c,n,t)=>`<b style="color:${c}">${n}</b> conquistó <b>${t}!</b>`,
    aiTookLog:(c,n,t)=>`<b style="color:${c}">${n}</b> tomó <b>${t}</b>.`,
    fortifiedLog:(n,t)=>`Moviste ${n} ejércitos a <b>${t}</b>.`,
    earnedLog:t=>`Ganaste una carta de <b>${t}</b>.`,
    tradedLog:n=>`¡Canjeaste un grupo por <b class="bonus-note">+${n}</b> ejércitos!`,
    matchLog:t=>`+2 ejércitos en <b>${t}</b> (carta coincidente).`,
    eliminatedLog:(c,n)=>`<b style="color:${c}">${n}</b> ha sido eliminado!`,
    // home / settings / about
    home_tag:"Conquista cada territorio de la Tierra. Prepara tu batalla y avanza.",
    home_generals:"Generales en la guerra", home_difficulty:"Dificultad",
    home_start:"▶ Empezar batalla", home_howto:"📖 Cómo jugar", home_settings:"⚙ Ajustes",
    playersWord:"jugadores", back:"← Volver", on:"Sí", off:"No",
    about_title:"📖 Cómo jugar", set_title:"⚙ Ajustes",
    set_music:"🎵 Música de batalla", set_sfx:"🔊 Efectos de sonido",
    set_names:"🏷 Mostrar nombres por defecto", set_lang:"🌐 Idioma",
    set_hint:"Los generales y la dificultad se eligen en la pantalla de Jugar. Puedes pausar, reiniciar o salir de cualquier partida desde el menú ☰ arriba a la derecha.",
    homeSummary:(g,d,a)=>`Tú vs <b>${g}</b> generales · <b>${d}</b> · <b>${a}</b> ejércitos c/u`,
    about_html:`<p><b>Objetivo:</b> sé el último general en pie — elimina a todos y domina el mundo.</p>
<p><b>1 · Refuerzo.</b> Cada turno recibes ejércitos = tus territorios ÷ 3 (mín. 3), <b>más un bono por cada continente que controles por completo</b>. Toca tus territorios brillantes para colocarlos.</p>
<p><b>2 · Ataque.</b> Toca uno de tus territorios (2+ ejércitos) y luego un vecino resaltado. Tira los dados — el atacante tira hasta 3, el defensor hasta 2; se comparan los más altos por pares, <b>los empates los gana el defensor</b>. Vacía un territorio enemigo para conquistarlo y mueve tus ejércitos.</p>
<p><b>3 · Fortificar.</b> Una vez por turno, mueve ejércitos entre dos territorios amigos conectados.</p>
<p><b>Cartas.</b> Conquista al menos un territorio en un turno para ganar una carta. Canjea un grupo de tres (iguales, distintas, o dos + un comodín ⭐) por ejércitos extra. Debes canjear con 5+ cartas.</p>
<p><b>Los continentes</b> son la clave — cada continente completo da refuerzos extra cada turno.</p>`,
  },
};
function t(key, ...args) {
  const v = (STR[PREFS.lang] && STR[PREFS.lang][key]) ?? STR.en[key] ?? key;
  return typeof v === "function" ? v(...args) : v;
}
function tN(id) { return PREFS.lang === "es" ? (TERRITORIES[id].es || TERRITORIES[id].name) : TERRITORIES[id].name; }
function tC(c)  { return PREFS.lang === "es" ? (CONTINENTS[c].es || CONTINENTS[c].name) : CONTINENTS[c].name; }
function cardLabel(type) { return t(type); }

const SVGNS = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);

// ---------- game state ----------
const G = {
  players: [],
  turn: 0,
  phase: "reinforce",     // reinforce | attack | fortify | gameover
  reinf: 0,
  owner: {},              // terrId -> playerIndex
  armies: {},             // terrId -> count
  cardDeck: [],
  setsTraded: 0,
  conqueredThisTurn: false,
  sel: null,              // selected source territory
  busy: false,            // input lock during animations/AI
  fortifyFrom: null,
  fortifyDone: false,     // one fortify move per turn
  lastRoll: null,         // {ad, dd} of the conquering battle
};

const els = {};           // svg refs per territory: {poly, badge, txt, name}

// ============================================================
//  SETUP
// ============================================================
const STARTS = { 3:35, 4:30, 5:25, 6:20 };

function showSection(name) {
  document.querySelectorAll("#home .home-sec").forEach(s =>
    s.hidden = (s.dataset.sec !== name));
}

// fill every [data-i18n] / [data-i18n-html] element from the dictionary
function applyLang() {
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
}

function buildHome() {
  const pc = $("pcount");
  const diffRow = $("diffRow");

  function render() {
    applyLang();
    pc.innerHTML = "";
    [3,4,5,6].forEach(n => {
      const b = document.createElement("button");
      b.className = "choice" + (n === PREFS.players ? " sel" : "");
      b.innerHTML = `${n}<small>${t('playersWord')}</small>`;
      b.onclick = () => { PREFS.players = n; render(); };
      pc.appendChild(b);
    });
    diffRow.innerHTML = "";
    Object.keys(DIFF).forEach(k => {
      const b = document.createElement("button");
      b.className = "diff" + (k === PREFS.difficulty ? " sel" : "");
      b.innerHTML = `${t('diff_'+k)}<small>${t('desc_'+k)}</small>`;
      b.onclick = () => { PREFS.difficulty = k; render(); };
      diffRow.appendChild(b);
    });
    $("homeSummary").innerHTML =
      t('homeSummary', PREFS.players-1, t('diff_'+PREFS.difficulty), STARTS[PREFS.players]);
    // settings toggle labels
    $("setLang").textContent = PREFS.lang === "es" ? "Español" : "English";
    [["setMusic","music"],["setSfx","sfx"],["setNames","names"]].forEach(([id,key]) => {
      $(id).classList.toggle("on", PREFS[key]);
      $(id).textContent = PREFS[key] ? t('on') : t('off');
    });
  }
  render();

  // section navigation (Play / About / Settings)
  document.querySelectorAll("#home [data-go]").forEach(b =>
    b.onclick = () => showSection(b.dataset.go));

  // language toggle
  $("setLang").onclick = () => { PREFS.lang = PREFS.lang === "es" ? "en" : "es"; render(); };
  // settings toggles
  [["setMusic","music"],["setSfx","sfx"],["setNames","names"]].forEach(([id,key]) => {
    $(id).onclick = () => { PREFS[key] = !PREFS[key]; render(); };
  });

  $("startBtn").onclick = launchGame;
  showSection("play");
}

function launchGame() {
  Sound.init();
  // apply audio prefs
  if (PREFS.music && !Sound.isMusicOn()) Sound.toggleMusic();
  if (!PREFS.music && Sound.isMusicOn()) Sound.toggleMusic();
  if (PREFS.sfx !== Sound.isSfxOn()) Sound.toggleSfx();
  Sound.startMusic();
  $("musicBtn").classList.toggle("off", !PREFS.music);
  $("sfxBtn").classList.toggle("off", !PREFS.sfx);
  $("map").classList.toggle("shownames", PREFS.names);
  $("home").style.display = "none";
  startGame(PREFS.players, PREFS.difficulty);
}

function startGame(numPlayers, difficulty) {
  // full state reset (also used by Restart)
  G.difficulty = difficulty || "medium";
  G.owner = {}; G.armies = {}; G.cardDeck = []; G.players = [];
  G.setsTraded = 0; G.sel = null; G.fortifyFrom = null; G.busy = false;
  G.conqueredThisTurn = false; G.lastRoll = null; G.phase = "reinforce";
  $("modalMount").innerHTML = "";
  $("combat").style.display = "none";
  $("log").innerHTML = "";
  const starts = STARTS[numPlayers];
  const shuffled = AI_NAMES.slice().sort(() => Math.random() - 0.5);
  for (let i = 0; i < numPlayers; i++) {
    G.players.push({
      idx: i,
      name: i === 0 ? "You" : shuffled[i-1],
      color: PLAYER_COLORS[i],
      isHuman: i === 0,
      alive: true,
      cards: [],
    });
  }
  // distribute territories evenly at random
  const ids = Object.keys(TERRITORIES).sort(() => Math.random() - 0.5);
  ids.forEach((id, i) => { G.owner[id] = i % numPlayers; G.armies[id] = 1; });
  // place remaining starting armies randomly on owned territories
  for (let p = 0; p < numPlayers; p++) {
    const mine = ids.filter(id => G.owner[id] === p);
    let left = starts - mine.length;
    while (left-- > 0) G.armies[mine[(Math.random()*mine.length)|0]]++;
  }
  // build card deck (one per territory + 2 wild)
  const types = ["inf","cav","art"];
  G.cardDeck = ids.map((id,i) => ({ type: types[i % 3], terr: id }));
  G.cardDeck.push({ type:"wild", terr:null }, { type:"wild", terr:null });
  G.cardDeck.sort(() => Math.random() - 0.5);

  G.turn = 0; G.setsTraded = 0;
  buildMap();
  // on phones the info panel starts collapsed so it never covers the board
  $("infoPanel").classList.toggle("collapsed", window.matchMedia("(max-width:760px)").matches);
  renderPlayers();
  log(t('warBegins'));
  beginTurn();
}

// ============================================================
//  MAP RENDERING
// ============================================================
let atkLineG = null;   // overlay group for attack lines

function buildMap() {
  const svg = $("map");
  svg.innerHTML = `<defs>
    <filter id="landShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#04101f" flood-opacity="0.85"/>
    </filter>
    <radialGradient id="oceanGrad" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#1d4f7a"/>
      <stop offset="55%" stop-color="#123a5e"/>
      <stop offset="100%" stop-color="#0a2138"/>
    </radialGradient>
  </defs>`;

  // ocean backdrop
  const ocean = document.createElementNS(SVGNS, "rect");
  ocean.setAttribute("x", 0); ocean.setAttribute("y", 0);
  ocean.setAttribute("width", 1300); ocean.setAttribute("height", 828);
  ocean.setAttribute("fill", "url(#oceanGrad)");
  svg.appendChild(ocean);

  const hullG   = document.createElementNS(SVGNS, "g");  // continent grouping regions
  const connG   = document.createElementNS(SVGNS, "g");  // sea-route connector lines
  const polyG   = document.createElementNS(SVGNS, "g");  // territory shapes
  polyG.setAttribute("filter", "url(#landShadow)");
  atkLineG      = document.createElementNS(SVGNS, "g");  // attack arrows
  const badgeG  = document.createElementNS(SVGNS, "g");  // army badges + names
  const labelG  = document.createElementNS(SVGNS, "g");  // continent labels

  // --- continent grouping region: a translucent hull around each continent ---
  for (const c in CONTINENTS) {
    const pts = [];
    for (const id in TERRITORIES)
      if (TERRITORIES[id].cont === c) TERRITORIES[id].poly.forEach(p => pts.push(p));
    const hull = expandHull(convexHull(pts), 18);
    const path = document.createElementNS(SVGNS, "path");
    path.setAttribute("d", smoothPath(hull));
    path.setAttribute("class", "chull");
    path.style.fill = CONTINENTS[c].color;
    path.style.stroke = shade(CONTINENTS[c].color, 40);
    hullG.appendChild(path);
  }

  // --- sea routes: any adjacency whose shapes don't actually touch ---
  const seen = new Set();
  for (const id in TERRITORIES) {
    for (const n of TERRITORIES[id].adj) {
      const key = [id, n].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      if (polysTouch(TERRITORIES[id].poly, TERRITORIES[n].poly)) continue;  // share a land border
      const [a, b] = nearestPoints(TERRITORIES[id].poly, TERRITORIES[n].poly);
      const ln = document.createElementNS(SVGNS, "line");
      ln.setAttribute("x1", a[0]); ln.setAttribute("y1", a[1]);
      ln.setAttribute("x2", b[0]); ln.setAttribute("y2", b[1]);
      ln.setAttribute("class", "sea");
      connG.appendChild(ln);
      [a, b].forEach(p => {
        const dot = document.createElementNS(SVGNS, "circle");
        dot.setAttribute("cx", p[0]); dot.setAttribute("cy", p[1]);
        dot.setAttribute("r", 3); dot.setAttribute("class", "sea-dot");
        connG.appendChild(dot);
      });
    }
  }

  // --- continent labels (highlighted pills, built after the SVG is in the DOM) ---
  const labelData = [];
  for (const c in CONTINENTS) {
    const lp = CONTINENTS[c].labelPos;
    const lab = document.createElementNS(SVGNS, "text");
    lab.setAttribute("x", lp[0]); lab.setAttribute("y", lp[1]);
    lab.setAttribute("class", "cname");
    lab.style.fill = shade(CONTINENTS[c].color, 90);
    lab.textContent = tC(c) + "  +" + CONTINENTS[c].bonus;
    labelG.appendChild(lab);
    labelData.push({ lab, color: CONTINENTS[c].color });
  }

  // --- territory shapes + badges ---
  for (const id in TERRITORIES) {
    const tdata = TERRITORIES[id];
    const poly = document.createElementNS(SVGNS, "polygon");
    poly.setAttribute("points", tdata.poly.map(p => p.join(",")).join(" "));
    poly.setAttribute("class", "terr");
    poly.dataset.id = id;
    poly.addEventListener("click", () => onTerritoryClick(id));
    polyG.appendChild(poly);

    const name = document.createElementNS(SVGNS, "text");
    name.setAttribute("x", tdata.center[0]); name.setAttribute("y", tdata.center[1] + 20);
    name.setAttribute("class", "tname");
    name.textContent = tN(id);
    badgeG.appendChild(name);

    const badge = document.createElementNS(SVGNS, "circle");
    badge.setAttribute("cx", tdata.center[0]); badge.setAttribute("cy", tdata.center[1]);
    badge.setAttribute("r", 13);
    badge.setAttribute("class", "badge");
    badge.addEventListener("click", () => onTerritoryClick(id));
    badgeG.appendChild(badge);

    const txt = document.createElementNS(SVGNS, "text");
    txt.setAttribute("x", tdata.center[0]); txt.setAttribute("y", tdata.center[1]);
    txt.setAttribute("class", "btxt");
    txt.textContent = G.armies[id];
    badgeG.appendChild(txt);

    els[id] = { poly, badge, txt, name };
  }

  svg.appendChild(hullG);
  svg.appendChild(connG);
  svg.appendChild(polyG);
  svg.appendChild(atkLineG);
  svg.appendChild(badgeG);
  svg.appendChild(labelG);

  // now that labels are in the DOM, draw a highlighted pill behind each
  labelData.forEach(({ lab, color }) => {
    const b = lab.getBBox();
    const padX = 10, padY = 5;
    const rect = document.createElementNS(SVGNS, "rect");
    rect.setAttribute("x", b.x - padX); rect.setAttribute("y", b.y - padY);
    rect.setAttribute("width", b.width + padX*2); rect.setAttribute("height", b.height + padY*2);
    rect.setAttribute("rx", (b.height + padY*2) / 2);
    rect.setAttribute("class", "cname-pill");
    rect.style.fill = "rgba(6,14,28,0.72)";
    rect.style.stroke = shade(color, 30);
    labelG.insertBefore(rect, lab);
  });
  refreshMap();
}

// distance from point p to segment ab
function ptSegDist(p, a, b) {
  const dx = b[0]-a[0], dy = b[1]-a[1];
  const len2 = dx*dx + dy*dy || 1;
  let t = ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a[0]+t*dx, cy = a[1]+t*dy;
  return Math.hypot(p[0]-cx, p[1]-cy);
}
function segsIntersect(a,b,c,d){
  const ccw=(A,B,C)=>(C[1]-A[1])*(B[0]-A[0])-(B[1]-A[1])*(C[0]-A[0]);
  return ccw(a,c,d)!==ccw(b,c,d) && ccw(a,b,c)!==ccw(a,b,d);
}
// do two polygons share a border (touch / overlap)?  edge-distance based.
const TOUCH_THRESHOLD = 14;
function polysTouch(p1, p2) {
  const bb = p => p.reduce((a,[x,y]) => ({minx:Math.min(a.minx,x),maxx:Math.max(a.maxx,x),miny:Math.min(a.miny,y),maxy:Math.max(a.maxy,y)}),
    {minx:1e9,maxx:-1e9,miny:1e9,maxy:-1e9});
  const A = bb(p1), B = bb(p2), pad = TOUCH_THRESHOLD;
  if (A.maxx+pad < B.minx || B.maxx+pad < A.minx || A.maxy+pad < B.miny || B.maxy+pad < A.miny) return false;
  // minimum distance between any edge of p1 and any edge of p2
  for (let i=0;i<p1.length;i++){
    const a1=p1[i], a2=p1[(i+1)%p1.length];
    for (let j=0;j<p2.length;j++){
      const b1=p2[j], b2=p2[(j+1)%p2.length];
      if (segsIntersect(a1,a2,b1,b2)) return true;
      const d = Math.min(ptSegDist(a1,b1,b2),ptSegDist(a2,b1,b2),ptSegDist(b1,a1,a2),ptSegDist(b2,a1,a2));
      if (d < TOUCH_THRESHOLD) return true;
    }
  }
  return false;
}
// closest pair of points between two polygons (for connector endpoints)
function nearestPoints(p1, p2) {
  let best = null, bd = Infinity;
  for (const a of p1) for (const b of p2) {
    const d = (a[0]-b[0])**2 + (a[1]-b[1])**2;
    if (d < bd) { bd = d; best = [a, b]; }
  }
  return best;
}

// --- convex hull (Andrew's monotone chain) + outward expansion + smoothing ---
function convexHull(points) {
  const pts = points.slice().sort((a,b) => a[0]-b[0] || a[1]-b[1]);
  if (pts.length < 3) return pts;
  const cross = (o,a,b) => (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]);
  const lower = [];
  for (const p of pts) { while (lower.length>=2 && cross(lower[lower.length-2],lower[lower.length-1],p)<=0) lower.pop(); lower.push(p); }
  const upper = [];
  for (let i=pts.length-1;i>=0;i--){ const p=pts[i]; while (upper.length>=2 && cross(upper[upper.length-2],upper[upper.length-1],p)<=0) upper.pop(); upper.push(p); }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}
function expandHull(hull, pad) {
  const cx = hull.reduce((s,p)=>s+p[0],0)/hull.length;
  const cy = hull.reduce((s,p)=>s+p[1],0)/hull.length;
  return hull.map(([x,y]) => {
    const dx=x-cx, dy=y-cy, d=Math.hypot(dx,dy)||1;
    return [x+dx/d*pad, y+dy/d*pad];
  });
}
// rounded closed path through hull points (Catmull-Rom-ish via midpoints)
function smoothPath(pts) {
  if (pts.length < 3) return "";
  let d = "";
  const n = pts.length;
  const mid = (a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  let m0 = mid(pts[n-1], pts[0]);
  d = `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)} `;
  for (let i=0;i<n;i++){
    const cur = pts[i], next = pts[(i+1)%n];
    const m = mid(cur, next);
    d += `Q ${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

function refreshMap() {
  for (const id in TERRITORIES) {
    const e = els[id];
    const col = G.players[G.owner[id]].color;
    e.poly.style.fill = col;
    e.badge.style.fill = shade(col, -38);
    e.txt.textContent = G.armies[id];
    e.poly.classList.remove("sel","target","dim","reinforceable");
  }
  applyHighlights();
}

function clearAttackLines() { if (atkLineG) atkLineG.innerHTML = ""; }

// draw a gold arrow from selected territory to each attackable enemy
function drawAttackLines(from, targets) {
  clearAttackLines();
  const a = TERRITORIES[from].center;
  targets.forEach(to => {
    const b = TERRITORIES[to].center;
    const dx = b[0]-a[0], dy = b[1]-a[1], len = Math.hypot(dx,dy)||1;
    const ux = dx/len, uy = dy/len;
    const sx = a[0]+ux*16, sy = a[1]+uy*16;     // start outside source badge
    const ex = b[0]-ux*18, ey = b[1]-uy*18;     // stop before target badge
    const line = document.createElementNS(SVGNS, "line");
    line.setAttribute("x1",sx); line.setAttribute("y1",sy);
    line.setAttribute("x2",ex); line.setAttribute("y2",ey);
    line.setAttribute("class","atk-line");
    atkLineG.appendChild(line);
    // arrowhead
    const ah = document.createElementNS(SVGNS, "polygon");
    const px=-uy, py=ux, s=7;
    ah.setAttribute("points", `${ex},${ey} ${ex-ux*14+px*s},${ey-uy*14+py*s} ${ex-ux*14-px*s},${ey-uy*14-py*s}`);
    ah.setAttribute("class","atk-head");
    atkLineG.appendChild(ah);
  });
}

// selection / target highlighting based on phase
function applyHighlights() {
  for (const id in els) els[id].poly.classList.remove("sel","target","dim","reinforceable");
  clearAttackLines();
  const human = cur().isHuman;

  if (G.phase === "reinforce" && human && G.reinf > 0) {
    // glow every territory you can place on
    ownedBy(G.turn).forEach(id => els[id].poly.classList.add("reinforceable"));
  } else if (G.phase === "attack" && G.sel) {
    els[G.sel].poly.classList.add("sel");
    const targets = TERRITORIES[G.sel].adj.filter(n => G.owner[n] !== G.turn);
    for (const id in els)
      if (id !== G.sel && !targets.includes(id)) els[id].poly.classList.add("dim");
    targets.forEach(n => els[n].poly.classList.add("target"));
    drawAttackLines(G.sel, targets);
  } else if (G.phase === "fortify" && G.fortifyFrom) {
    els[G.fortifyFrom].poly.classList.add("sel");
    const reach = connectedOwned(G.fortifyFrom).filter(id => id !== G.fortifyFrom && G.armies[G.fortifyFrom] > 1);
    for (const id in els)
      if (id !== G.fortifyFrom && !reach.includes(id)) els[id].poly.classList.add("dim");
    reach.forEach(n => els[n].poly.classList.add("target"));
    drawAttackLines(G.fortifyFrom, reach);
  }
}

// ============================================================
//  TURN FLOW
// ============================================================
function cur() { return G.players[G.turn]; }

function beginTurn() {
  if (checkWin()) return;
  const p = cur();
  if (!p.alive) { nextTurn(); return; }
  G.phase = "reinforce";
  G.conqueredThisTurn = false;
  G.sel = null; G.fortifyFrom = null; G.fortifyDone = false;
  G.reinf = calcReinforcements(G.turn);
  updateHUD();
  refreshMap();
  renderInfoPanel();
  if (p.isHuman) {
    showBanner(t('bReinforceT'), t('bReinforceS', G.reinf));
    // force trade if holding 5+ cards
    if (countTradeableSets(p.cards) && p.cards.length >= 5) {
      log(t('mustTrade'));
      openCards(true);
    }
    log(t('yourTurn', G.reinf));
  } else {
    showBanner(t('turnOf', p.name), t('bTurnS'));
    runAITurn();
  }
}

function nextTurn() {
  do { G.turn = (G.turn + 1) % G.players.length; } while (!G.players[G.turn].alive);
  beginTurn();
}

// returns {terrCount, base, conts:[{name,bonus}], total}
function reinforcementBreakdown(p) {
  const terrCount = ownedBy(p).length;
  const base = Math.max(3, Math.floor(terrCount / 3));
  const conts = [];
  for (const c in CONTINENTS) {
    const terrs = Object.keys(TERRITORIES).filter(id => TERRITORIES[id].cont === c);
    if (terrs.length && terrs.every(id => G.owner[id] === p))
      conts.push({ name: tC(c), bonus: CONTINENTS[c].bonus });
  }
  const total = base + conts.reduce((s,c) => s + c.bonus, 0);
  return { terrCount, base, conts, total };
}
function calcReinforcements(p) { return reinforcementBreakdown(p).total; }

// advance phase via the top button
function advancePhase() {
  if (G.busy) return;
  const p = cur();
  if (!p.isHuman) return;
  if (G.phase === "reinforce") {
    if (G.reinf > 0) { showBanner(t('bPlaceFirstT'), t('bPlaceFirstS', G.reinf)); return; }
    G.phase = "attack"; G.sel = null;
    showBanner(t('bAttackT'), t('bAttackS'));
    log(t('attackLog'));
  } else if (G.phase === "attack") {
    G.phase = "fortify"; G.sel = null; G.fortifyFrom = null;
    showBanner(t('bFortifyT'), t('bFortifyS'));
    log(t('fortifyLog'));
  } else if (G.phase === "fortify") {
    endHumanTurn();
    return;
  }
  updateHUD(); refreshMap(); renderInfoPanel();
}

function endHumanTurn() {
  if (G.conqueredThisTurn) drawCard(cur());
  nextTurn();
}

// ============================================================
//  HUMAN INPUT
// ============================================================
function onTerritoryClick(id) {
  if (G.busy || G.phase === "gameover") return;
  const p = cur();
  if (!p.isHuman) return;

  if (G.phase === "reinforce") {
    if (G.owner[id] === G.turn && G.reinf > 0) {
      G.armies[id]++; G.reinf--;
      Sound.place();
      els[id].txt.textContent = G.armies[id];
      popBadge(id);
      updateHUD(); renderInfoPanel();
      if (G.reinf === 0) {
        applyHighlights();   // stop the placement glow
        showBanner(t('bAllT'), t('bAllS'));
        log(t('allPlacedLog'));
      }
    }
  } else if (G.phase === "attack") {
    if (G.sel === null) {
      if (G.owner[id] === G.turn && G.armies[id] > 1) { G.sel = id; applyHighlights(); }
    } else {
      if (id === G.sel) { G.sel = null; applyHighlights(); return; }
      if (G.owner[id] === G.turn) {
        if (G.armies[id] > 1) { G.sel = id; applyHighlights(); }
        return;
      }
      if (TERRITORIES[G.sel].adj.includes(id)) openCombat(G.sel, id);
    }
  } else if (G.phase === "fortify") {
    if (G.fortifyFrom === null) {
      if (G.owner[id] === G.turn && G.armies[id] > 1) { G.fortifyFrom = id; applyHighlights(); }
    } else {
      if (id === G.fortifyFrom) { G.fortifyFrom = null; applyHighlights(); return; }
      if (G.owner[id] === G.turn && connectedOwned(G.fortifyFrom).includes(id)) {
        openMoveSlider(G.fortifyFrom, id, 1, G.armies[G.fortifyFrom] - 1, (n) => {
          G.armies[G.fortifyFrom] -= n; G.armies[id] += n;
          Sound.march(); marchFX(G.fortifyFrom, id);
          els[G.fortifyFrom].txt.textContent = G.armies[G.fortifyFrom];
          els[id].txt.textContent = G.armies[id];
          log(t('fortifiedLog', n, tN(id)));
          G.fortifyFrom = null;
          endHumanTurn();
        });
      } else if (G.owner[id] === G.turn && G.armies[id] > 1) {
        G.fortifyFrom = id; applyHighlights();
      }
    }
  }
}

// ============================================================
//  COMBAT
// ============================================================
function openCombat(from, to) {
  const box = $("combat");
  box.style.display = "block";
  renderCombat(from, to, null, null);
}

function renderCombat(from, to, atkDice, defDice, result) {
  const box = $("combat");
  const fromP = G.players[G.owner[from]], toP = G.players[G.owner[to]];
  const diceHTML = (arr, cls, marks) => (arr||[]).map((v,i) =>
    `<div class="die ${cls} ${marks?marks[i]:''}">${v}</div>`).join("") || `<div style="color:#9fb4d6;font-size:12px">—</div>`;
  let am = "", dm = "";
  if (result) { am = result.atkMarks; dm = result.defMarks; }
  box.innerHTML = `
    <div class="vs">
      <div class="armline" style="color:${fromP.color}">${tN(from)}<small>${G.armies[from]} ${t('armies')}</small></div>
      <div class="combat-vs-x">${t('vs')}</div>
      <div class="armline" style="color:${toP.color}">${tN(to)}<small>${G.armies[to]} ${t('armies')}</small></div>
    </div>
    <div style="display:flex;justify-content:space-between;gap:30px">
      <div class="dicewrap">${diceHTML(atkDice,"red",am)}</div>
      <div class="dicewrap">${diceHTML(defDice,"",dm)}</div>
    </div>
    <div class="combat-btns">
      <button class="btn primary" id="rollBtn" ${G.armies[from]<2?"disabled":""}>${t('roll')}</button>
      <button class="btn gold" id="blitzBtn" ${G.armies[from]<2?"disabled":""}>${t('auto')}</button>
      <button class="btn ghost" id="retreatBtn">${t('retreat')}</button>
    </div>`;
  $("rollBtn").onclick = () => doBattle(from, to, false);
  $("blitzBtn").onclick = () => doBattle(from, to, true);
  $("retreatBtn").onclick = closeCombat;
}

function closeCombat() {
  $("combat").style.display = "none";
  G.sel = null;
  refreshMap();
}

function rollN(n) {
  const a = [];
  for (let i = 0; i < n; i++) a.push(1 + ((Math.random()*6)|0));
  return a.sort((x,y) => y - x);
}

// resolve one round, returns {atkLoss, defLoss, atkDice, defDice, marks...}
function battleRound(from, to) {
  const an = Math.min(3, G.armies[from] - 1);
  const dn = Math.min(2, G.armies[to]);
  const ad = rollN(an), dd = rollN(dn);
  const pairs = Math.min(ad.length, dd.length);
  let atkLoss = 0, defLoss = 0;
  const atkMarks = ad.map(()=>"" ), defMarks = dd.map(()=>"" );
  for (let i = 0; i < pairs; i++) {
    if (ad[i] > dd[i]) { defLoss++; atkMarks[i]="win"; defMarks[i]="lose"; }
    else { atkLoss++; atkMarks[i]="lose"; defMarks[i]="win"; }
  }
  return { ad, dd, atkLoss, defLoss, atkMarks, defMarks };
}

function doBattle(from, to, blitz) {
  if (G.busy) return;
  G.busy = true;
  Sound.dice(); Sound.cannon();
  const r = battleRound(from, to);
  // tumble animation then apply
  renderCombat(from, to, r.ad.map(()=>"?"), r.dd.map(()=>"?"));
  document.querySelectorAll("#combat .die").forEach(d => d.classList.add("roll"));
  setTimeout(() => {
    renderCombat(from, to, r.ad, r.dd, { atkMarks:r.atkMarks, defMarks:r.defMarks });
    G.armies[from] -= r.atkLoss;
    G.armies[to]   -= r.defLoss;
    els[from].txt.textContent = G.armies[from];
    els[to].txt.textContent = G.armies[to];
    if (r.atkLoss) { fx(from, `-${r.atkLoss}`, "#ff7b7b"); boom(from); }
    if (r.defLoss) { fx(to, `-${r.defLoss}`, "#ff7b7b"); boom(to); }
    log(t('battleLog', tN(from), tN(to), r.defLoss, r.atkLoss));

    if (G.armies[to] <= 0) {        // CONQUERED
      G.lastRoll = { ad: r.ad, dd: r.dd, am: r.atkMarks, dm: r.defMarks };
      conquer(from, to);
      G.busy = false;
      return;
    }
    G.busy = false;
    updateHUD();
    if (blitz && G.armies[from] > 1) {
      setTimeout(() => doBattle(from, to, true), 350);
    } else {
      renderCombat(from, to, r.ad, r.dd, { atkMarks:r.atkMarks, defMarks:r.defMarks });
    }
  }, 520);
}

function conquer(from, to) {
  const loser = G.owner[to];
  const dice = Math.min(3, G.armies[from] - 1);
  Sound.conquer();
  conquerFX(to);
  G.owner[to] = G.turn;
  G.conqueredThisTurn = true;
  els[to].poly.style.fill = cur().color;
  els[to].badge.style.fill = shade(cur().color, -38);
  els[to].poly.classList.add("flash-conq");
  setTimeout(() => els[to].poly.classList.remove("flash-conq"), 900);
  log(t('conqLog', cur().color, cur().name, tN(to)));

  const maxMove = G.armies[from] - 1;
  const finishMove = (n) => {
    G.armies[from] -= n; G.armies[to] = n;
    els[from].txt.textContent = G.armies[from];
    els[to].txt.textContent = G.armies[to];
    marchFX(from, to);
    checkEliminated(loser);
    if (checkWin()) return;
    // keep attacking from the same territory if it still has troops
    $("combat").style.display = "none";
    G.sel = (G.armies[from] > 1) ? from : null;
    refreshMap(); applyHighlights(); updateHUD();
    renderPlayers();
    if (G.sel) showBanner(t('bTakenT'), t('bTakenS'));
  };
  // human chooses how many to move; minimum = dice used
  if (cur().isHuman) {
    openMoveSlider(from, to, dice, maxMove, finishMove, t('conquered', tN(to)), G.lastRoll);
  } else {
    finishMove(maxMove); // AI moves everything forward
  }
}

// ============================================================
//  MOVE SLIDER (post-conquest occupation + fortify)
// ============================================================
function openMoveSlider(from, to, min, max, cb, title, won) {
  if (max < min) max = min;
  const mount = $("modalMount");
  let val = max;
  let wonHTML = "";
  if (won) {
    const dice = (arr, cls, marks) => arr.map((v,i) =>
      `<div class="die ${cls} ${marks?marks[i]:""}">${v}</div>`).join("");
    wonHTML = `
      <div class="wonbanner">${t('wonWith')}</div>
      <div class="wondice">
        <span class="lab">${t('you')}</span>${dice(won.ad,"red",won.am)}
        <span class="lab">${t('vs')}</span>${dice(won.dd,"",won.dm)}
      </div>`;
  }
  mount.innerHTML = `
    <div class="overlay">
      <div class="modal">
        <h2>${title || t('moveTitle')}</h2>
        ${wonHTML}
        <p>${t('moveFwd', tN(from), tN(to))}</p>
        <div class="slider-row">
          <button class="btn ghost" id="msDown">−</button>
          <input type="range" id="msRange" min="${min}" max="${max}" value="${val}">
          <span class="slider-val" id="msVal">${val}</span>
          <button class="btn ghost" id="msUp">+</button>
        </div>
        <button class="btn primary" id="msOk" style="padding:12px 30px">${t('moveLbl')}</button>
      </div>
    </div>`;
  const range = $("msRange"), out = $("msVal");
  const sync = () => { out.textContent = range.value; };
  range.oninput = sync;
  $("msDown").onclick = () => { range.value = Math.max(min, +range.value - 1); sync(); };
  $("msUp").onclick = () => { range.value = Math.min(max, +range.value + 1); sync(); };
  $("msOk").onclick = () => { mount.innerHTML = ""; cb(+range.value); };
}

// ============================================================
//  CARDS
// ============================================================
function drawCard(p) {
  if (!G.cardDeck.length) return;
  const c = G.cardDeck.pop();
  p.cards.push(c);
  if (p.isHuman) { Sound.card(); log(t('earnedLog', cardLabel(c.type))); }
  updateHUD();
}

// detect if a tradeable set exists
function countTradeableSets(cards) {
  return !!findBestSet(cards);
}
// find a valid 3-card set (returns indices array or null)
function findBestSet(cards) {
  const idx = cards.map((_,i)=>i);
  // try all combos of 3
  for (let a=0;a<cards.length;a++)
    for (let b=a+1;b<cards.length;b++)
      for (let c=b+1;c<cards.length;c++)
        if (isSet([cards[a],cards[b],cards[c]])) return [a,b,c];
  return null;
}
function isSet(three) {
  if (three.length !== 3) return false;
  const t = three.map(c => c.type);
  const wilds = t.filter(x => x === "wild").length;
  const nonW = t.filter(x => x !== "wild");
  if (wilds >= 1) return true;                       // any 2 + wild
  if (nonW[0] === nonW[1] && nonW[1] === nonW[2]) return true; // three same
  if (new Set(nonW).size === 3) return true;          // three different
  return false;
}
function setBonus() {
  const seq = [4,6,8,10,12,15];
  const n = G.setsTraded;
  return n < seq.length ? seq[n] : 15 + (n - seq.length + 1) * 5;
}

function openCards(mustTrade) {
  const p = cur();
  if (!p.isHuman) return;
  const mount = $("modalMount");
  let selected = [];
  const canTrade = G.phase === "reinforce";   // armies only awarded during reinforce
  const render = () => {
    const valid = selected.length === 3 && isSet(selected.map(i => p.cards[i]));
    mount.innerHTML = `
      <div class="overlay">
        <div class="modal" style="max-width:560px">
          <h2>${t('cardsTitle')}</h2>
          <p>${mustTrade ? t('cardsMust') : t('cardsTrade')} ${t('cardsNext', setBonus())}</p>
          ${canTrade ? "" : `<p style="color:var(--bad);font-weight:bold">${t('tradeOnlyReinforce')}</p>`}
          <div class="cardrow">${
            p.cards.map((c,i) => `
              <div class="card ${selected.includes(i)?'sel':''}" data-i="${i}">
                <div class="ico">${CARD_ICONS[c.type]}</div>
                <div class="lbl">${cardLabel(c.type)}</div>
                <div class="terr">${c.terr ? tN(c.terr) : t('anyTerr')}</div>
              </div>`).join("") || `<p style="color:#9fb4d6">${t('cardsNone')}</p>`
          }</div>
          <div class="choices">
            <button class="btn primary" id="tradeOk" ${valid && canTrade?"":"disabled"}>${t('tradeFor', setBonus())}</button>
            <button class="btn ghost" id="cardClose" ${mustTrade && countTradeableSets(p.cards)?"disabled":""}>${t('close')}</button>
          </div>
        </div>
      </div>`;
    mount.querySelectorAll(".card").forEach(el => {
      el.onclick = () => {
        const i = +el.dataset.i;
        if (selected.includes(i)) selected = selected.filter(x => x !== i);
        else if (selected.length < 3) selected.push(i);
        render();
      };
    });
    const ok = $("tradeOk");
    if (ok) ok.onclick = () => { doTrade(p, selected); selected = [];
      if (mustTrade && p.cards.length >= 5 && countTradeableSets(p.cards)) render();
      else { mount.innerHTML = ""; } };
    const cl = $("cardClose");
    if (cl) cl.onclick = () => { if (!cl.disabled) mount.innerHTML = ""; };
  };
  render();
}

function doTrade(p, indices) {
  if (G.phase !== "reinforce") return;   // armies are only awarded during reinforce
  const cardsUsed = indices.map(i => p.cards[i]);
  const bonus = setBonus();
  G.setsTraded++;
  // remove used cards (high to low)
  indices.slice().sort((a,b)=>b-a).forEach(i => p.cards.splice(i,1));
  if (G.phase === "reinforce") G.reinf += bonus;
  // +2 territory match
  const match = cardsUsed.find(c => c.terr && G.owner[c.terr] === p.idx);
  if (match) {
    G.armies[match.terr] += 2;
    if (els[match.terr]) els[match.terr].txt.textContent = G.armies[match.terr];
    log(t('matchLog', tN(match.terr)));
  }
  Sound.card();
  if (p.isHuman) log(t('tradedLog', bonus));
  // reflect new army total instantly on the board / panels
  updateHUD(); renderInfoPanel();
}

// ============================================================
//  ELIMINATION / WIN
// ============================================================
function checkEliminated(p) {
  if (ownedBy(p).length === 0 && G.players[p].alive) {
    G.players[p].alive = false;
    // captor takes their cards
    cur().cards.push(...G.players[p].cards);
    G.players[p].cards = [];
    Sound.defeat();
    log(t('eliminatedLog', G.players[p].color, G.players[p].name));
    renderPlayers();
  }
}

function checkWin() {
  const alive = G.players.filter(p => p.alive);
  if (alive.length === 1) {
    G.phase = "gameover";
    const w = alive[0];
    if (w.isHuman) Sound.victory(); else Sound.defeat();
    showEndModal(w);
    return true;
  }
  // human total domination
  return false;
}

function showEndModal(w) {
  $("combat").style.display = "none";
  $("modalMount").innerHTML = `
    <div class="overlay">
      <div class="modal">
        <h2>${w.isHuman ? t('victory') : t('defeat')}</h2>
        <p><b style="color:${w.color}">${w.name}</b> ${w.isHuman ? t('rulesWorld') : t('conqWorld')}</p>
        <button class="btn primary" style="padding:12px 30px" onclick="location.reload()">${t('playAgain')}</button>
      </div>
    </div>`;
}

// ============================================================
//  AI
// ============================================================
function runAITurn() {
  G.busy = true;
  updateHUD();
  // 1) trade cards — eager AIs cash sets early; timid ones only when forced (5+)
  const p = cur();
  const eager = (DIFF[G.difficulty] || DIFF.medium).trade;
  let guard = 0;
  while (countTradeableSets(p.cards) &&
         (p.cards.length >= 5 || (eager && p.cards.length >= 3 && G.setsTraded < 8)) &&
         guard++ < 10) {
    const set = findBestSet(p.cards);
    if (!set) break;
    doTrade(p, set);
  }
  // 2) place reinforcements on borders
  setTimeout(aiReinforce, 450);
}

function aiBorders(p) {
  return ownedBy(p).filter(id => TERRITORIES[id].adj.some(n => G.owner[n] !== p));
}

function aiReinforce() {
  const p = G.turn;
  const borders = aiBorders(p);
  const pool = borders.length ? borders : ownedBy(p);
  // weight: place on border with most enemy pressure (focus rises with difficulty)
  const focus = (DIFF[G.difficulty] || DIFF.medium).focus;
  while (G.reinf > 0) {
    pool.sort((a,b) => threat(b) - threat(a));
    const t = pool[(Math.random() < focus ? 0 : (Math.random()*pool.length)|0)];
    G.armies[t]++; G.reinf--;
    els[t].txt.textContent = G.armies[t];
  }
  refreshMap(); updateHUD();
  setTimeout(aiAttack, 500);
  function threat(id){ return TERRITORIES[id].adj.reduce((s,n)=> s + (G.owner[n]!==p?G.armies[n]:0),0) - G.armies[id]; }
}

function aiAttack() {
  const p = G.turn;
  const cfg = DIFF[G.difficulty] || DIFF.medium;
  let attacks = 0;
  const step = () => {
    if (attacks++ > cfg.maxAttacks) return finishAI();
    // find best attack: own territory armies>=2 vs adjacent weaker enemy
    let best = null;
    for (const from of ownedBy(p)) {
      if (G.armies[from] < 3) continue;
      for (const to of TERRITORIES[from].adj) {
        if (G.owner[to] === p) continue;
        const ratio = G.armies[from] / Math.max(1, G.armies[to]);
        if (ratio >= cfg.ratio) {
          const score = ratio + (G.armies[from] - G.armies[to]) * 0.1;
          if (!best || score > best.score) best = { from, to, score };
        }
      }
    }
    if (!best) return finishAI();
    aiResolve(best.from, best.to, () => setTimeout(step, 260));
  };
  step();
}

// AI battle: resolve rounds until conquer or not worth it, with light FX
function aiResolve(from, to, done) {
  const round = () => {
    if (G.armies[from] < 2) return done();
    Sound.cannon();
    const r = battleRound(from, to);
    G.armies[from] -= r.atkLoss;
    G.armies[to]   -= r.defLoss;
    if (r.defLoss) { fx(to, `-${r.defLoss}`, "#ff7b7b"); }
    els[from].txt.textContent = G.armies[from];
    els[to].txt.textContent = Math.max(0,G.armies[to]);
    if (G.armies[to] <= 0) {
      const loser = G.owner[to];
      Sound.conquer(); conquerFX(to);
      G.owner[to] = G.turn; G.conqueredThisTurn = true;
      els[to].poly.style.fill = cur().color;
      els[to].badge.style.fill = shade(cur().color,-38);
      els[to].poly.classList.add("flash-conq");
      setTimeout(()=>els[to].poly.classList.remove("flash-conq"),900);
      const move = G.armies[from] - 1;
      G.armies[from] -= move; G.armies[to] = move;
      els[from].txt.textContent = G.armies[from];
      els[to].txt.textContent = G.armies[to];
      marchFX(from,to);
      log(t('aiTookLog', cur().color, cur().name, tN(to)));
      checkEliminated(loser); renderPlayers();
      if (checkWin()) return;
      return done();
    }
    // keep attacking only if still favorable (harder AI presses thinner margins)
    const margin = (DIFF[G.difficulty] || DIFF.medium).push ? 0 : 1;
    if (G.armies[from] > G.armies[to] + margin && G.armies[from] >= 2)
      setTimeout(round, 200);
    else done();
  };
  round();
}

function finishAI() {
  if (G.phase === "gameover") return;
  // 3) fortify: move from safest interior to a border
  const p = G.turn;
  const borders = aiBorders(p);
  const interiors = ownedBy(p).filter(id => !borders.includes(id) && G.armies[id] > 1);
  if (interiors.length && borders.length) {
    interiors.sort((a,b)=>G.armies[b]-G.armies[a]);
    const from = interiors[0];
    const reach = connectedOwned(from).filter(id => borders.includes(id));
    if (reach.length) {
      reach.sort((a,b)=>threat(b)-threat(a));
      const to = reach[0];
      const move = G.armies[from] - 1;
      G.armies[from]-=move; G.armies[to]+=move;
      els[from].txt.textContent=G.armies[from]; els[to].txt.textContent=G.armies[to];
      marchFX(from,to); Sound.march();
    }
  }
  function threat(id){ return TERRITORIES[id].adj.reduce((s,n)=> s + (G.owner[n]!==p?G.armies[n]:0),0); }
  if (G.conqueredThisTurn) drawCard(cur());
  refreshMap(); renderPlayers();
  setTimeout(() => { G.busy = false; nextTurn(); }, 600);
}

// ============================================================
//  HELPERS
// ============================================================
function ownedBy(p) { return Object.keys(TERRITORIES).filter(id => G.owner[id] === p); }

// BFS through owned territories (for fortify reachability)
function connectedOwned(start) {
  const p = G.owner[start], seen = new Set([start]), q = [start];
  while (q.length) {
    const cur = q.shift();
    for (const n of TERRITORIES[cur].adj)
      if (G.owner[n] === p && !seen.has(n)) { seen.add(n); q.push(n); }
  }
  return [...seen];
}

function shade(hex, amt) {
  let c = hex.replace("#","");
  if (c.length === 3) c = c.split("").map(x=>x+x).join("");
  let r = clamp(parseInt(c.substr(0,2),16)+amt);
  let g = clamp(parseInt(c.substr(2,2),16)+amt);
  let b = clamp(parseInt(c.substr(4,2),16)+amt);
  return `rgb(${r},${g},${b})`;
  function clamp(v){return Math.max(0,Math.min(255,v));}
}

// ============================================================
//  FX (screen-space overlays positioned from SVG coords)
// ============================================================
function svgToScreen(id) {
  const svg = $("map");
  const pt = svg.createSVGPoint();
  const c = TERRITORIES[id].center;
  pt.x = c[0]; pt.y = c[1];
  const sp = pt.matrixTransform(svg.getScreenCTM());
  return sp;
}
function fx(id, text, color) {
  const sp = svgToScreen(id);
  const el = document.createElement("div");
  el.className = "fx";
  el.style.left = sp.x + "px"; el.style.top = sp.y + "px";
  el.style.color = color || "#fff"; el.style.fontSize = "20px";
  el.textContent = text;
  $("stage").appendChild(el);
  setTimeout(() => el.remove(), 1100);
}
function boom(id) {
  const sp = svgToScreen(id);
  const el = document.createElement("div");
  el.className = "boom";
  el.style.left = sp.x + "px"; el.style.top = sp.y + "px";
  $("stage").appendChild(el);
  setTimeout(() => el.remove(), 600);
}
function conquerFX(id) {
  boom(id);
  const sp = svgToScreen(id);
  for (let i=0;i<6;i++){
    const el=document.createElement("div");
    el.className="boom";
    el.style.left=(sp.x+(Math.random()*40-20))+"px";
    el.style.top=(sp.y+(Math.random()*40-20))+"px";
    el.style.animationDelay=(i*40)+"ms";
    $("stage").appendChild(el);
    setTimeout(()=>el.remove(),700);
  }
  fx(id,"CONQUERED!","#ffd24a");
}
function marchFX(from, to) {
  const a = svgToScreen(from), b = svgToScreen(to);
  const el = document.createElement("div");
  el.className = "fx";
  el.textContent = "🪖";
  el.style.fontSize = "20px";
  el.style.left = a.x + "px"; el.style.top = a.y + "px";
  el.style.animation = "none";
  el.style.transition = "left .6s ease, top .6s ease, opacity .6s";
  $("stage").appendChild(el);
  requestAnimationFrame(() => { el.style.left = b.x + "px"; el.style.top = b.y + "px"; });
  setTimeout(() => { el.style.opacity = "0"; }, 550);
  setTimeout(() => el.remove(), 750);
}
function popBadge(id) {
  const t = els[id].txt;
  t.style.transition = "none"; t.setAttribute("transform","scale(1)");
  els[id].badge.animate(
    [{transform:"scale(1)"},{transform:"scale(1.4)"},{transform:"scale(1)"}],
    {duration:260, transformOrigin:"center"});
}

// ============================================================
//  HUD
// ============================================================
function updateHUD() {
  const p = cur();
  $("turnDot").style.color = p.color;
  $("turnDot").style.background = p.color;
  $("turnName").textContent = p.name;
  $("phaseLbl").textContent = t(G.phase);
  $("reinfBox").style.display = (G.phase === "reinforce" && p.isHuman) ? "flex" : "none";
  $("reinfNum").textContent = G.reinf;
  $("cardCount").textContent = G.players[0].cards.length;
  $("cardsLbl").textContent = t('cards');
  $("armiesLbl").textContent = t('armiesLeft');

  const btn = $("phaseBtn");
  if (!p.isHuman || G.phase === "gameover") {
    btn.disabled = true;
    btn.textContent = G.phase === "gameover" ? "—" : t('aiThinking');
  } else {
    btn.disabled = false;
    btn.textContent = G.phase === "reinforce" ? t('endReinforce')
      : G.phase === "attack" ? t('endAttack') : t('endTurn');
  }
}

// banner: brief, clear instruction in the center
let bannerTimer = null;
function showBanner(title, sub) {
  const b = $("banner");
  b.innerHTML = `<div class="bt">${title}</div>` + (sub ? `<div class="bs">${sub}</div>` : "");
  b.classList.add("show");
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.remove("show"), 4200);
}

// left info panel: live reinforcement math + continent bonus reference
function renderInfoPanel() {
  const p = cur();
  const human = p.isHuman;
  const bd = reinforcementBreakdown(0);   // always show the human player's numbers

  const rp = $("reinfPanel");
  const showReinf = human && G.phase === "reinforce";
  rp.className = "ipanel" + (showReinf ? " active" : "");
  rp.innerHTML = `
    <h3>${t('yourReinf')}</h3>
    <div class="reinf-big ${showReinf && G.reinf>0 ? "pulse" : ""}">
      <div class="num">${showReinf ? G.reinf : bd.total}</div>
      <div class="lbl">${showReinf ? t('toPlace') : t('nextTurn')}
        <small>${showReinf ? t('tapGlow') : t('ifEnd')}</small></div>
    </div>
    <div class="bdrow"><span>${t('territories')} (${bd.terrCount} ÷ 3)</span><b>+${bd.base}</b></div>
    ${bd.conts.map(c => `<div class="bdrow"><span>${c.name}</span><b>+${c.bonus}</b></div>`).join("")}
    <div class="bdrow tot"><span>${t('totalTurn')}</span><b>+${bd.total}</b></div>
    ${showReinf && G.reinf>0 ? `<div class="reinf-cta">${t('placeMore', G.reinf)}</div>` : ""}`;

  const cp = $("contPanel");
  cp.className = "ipanel";
  let rows = `<h3>${t('contBonuses')}</h3>`;
  for (const c in CONTINENTS) {
    const terrs = Object.keys(TERRITORIES).filter(id => TERRITORIES[id].cont === c);
    const own = terrs.filter(id => G.owner[id] === 0).length;
    const full = own === terrs.length;
    rows += `<div class="cont-row ${full ? "owned" : ""}">
      <span class="sw" style="background:${CONTINENTS[c].color}"></span>
      <span class="cn">${tC(c)}<small>${t('ownCont')}</small></span>
      <span class="prog">${own}/${terrs.length}</span>
      <span class="bn">+${CONTINENTS[c].bonus}</span></div>`;
  }
  cp.innerHTML = rows;
}

function renderPlayers() {
  const box = $("players");
  box.innerHTML = "";
  G.players.forEach((p, i) => {
    const d = document.createElement("div");
    d.className = "pl" + (i === G.turn ? " active" : "") + (p.alive ? "" : " dead");
    const terrs = ownedBy(i).length;
    const arms = ownedBy(i).reduce((s,id)=>s+G.armies[id],0);
    d.innerHTML = `<span class="dot" style="background:${p.color}"></span>
      <span class="nm">${p.name}${p.isHuman?" ⭐":""}</span>
      <span class="st">🗺<b>${terrs}</b> 🪖<b>${arms}</b></span>`;
    box.appendChild(d);
  });
  renderInfoPanel();
}

function log(html) {
  const box = $("log");
  const ln = document.createElement("div");
  ln.className = "ln";
  ln.innerHTML = html;
  box.prepend(ln);
  while (box.children.length > 8) box.lastChild.remove();
}

// ============================================================
//  PAUSE / RESTART / QUIT MENU
// ============================================================
function openMenu() {
  if (G.phase === "gameover") return;
  $("modalMount").innerHTML = `
    <div class="overlay">
      <div class="modal" style="max-width:360px">
        <h2>${t('paused')}</h2>
        <p>${t('diff_'+G.difficulty)} · ${G.players.length} ${t('generalsWord')}</p>
        <div class="menu-list">
          <button class="btn primary" id="mResume">${t('resume')}</button>
          <button class="btn" id="mRestart">${t('restart')}</button>
          <button class="btn gold" id="mQuit">${t('quitMenu')}</button>
        </div>
      </div>
    </div>`;
  $("mResume").onclick = () => { $("modalMount").innerHTML = ""; };
  $("mRestart").onclick = () => {
    $("modalMount").innerHTML = "";
    startGame(G.players.length, G.difficulty);
  };
  $("mQuit").onclick = goHome;
}

function goHome() {
  Sound.stopMusic();
  $("modalMount").innerHTML = "";
  $("combat").style.display = "none";
  $("banner").classList.remove("show");
  $("home").style.display = "grid";
  showSection("play");
}

// ============================================================
//  WIRE UP CONTROLS
// ============================================================
$("phaseBtn").onclick = advancePhase;
$("cardsBtn").onclick = () => { if (!G.busy && cur().isHuman) openCards(false); };
$("namesBtn").onclick = () => $("map").classList.toggle("shownames");
$("infoToggle").onclick = () => $("infoPanel").classList.toggle("collapsed");
$("musicBtn").onclick = () => $("musicBtn").classList.toggle("off", !Sound.toggleMusic());
$("sfxBtn").onclick   = () => $("sfxBtn").classList.toggle("off", !Sound.toggleSfx());
$("menuBtn").onclick  = openMenu;

// resume audio on first interaction (mobile autoplay policies)
document.addEventListener("pointerdown", () => Sound.init(), { once:true });

buildHome();
})();
