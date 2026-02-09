/* Physical Center - Sistema Front-end (localStorage) */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const LS_KEYS = {
  users: "pc_users",
  session: "pc_session",
  theme: "pc_theme"
};

const toastEl = $("#toast");
function toast(msg){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=> toastEl.classList.remove("show"), 2400);
}

function uid(){
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function todayISO(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtDate(iso){
  const [y,m,d] = iso.split("-").map(Number);
  const dt = new Date(y, m-1, d);
  return dt.toLocaleDateString("pt-BR");
}

function weekdayPt(){
  const names = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  return names[new Date().getDay()];
}

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch{
    return fallback;
  }
}

function saveJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers(){
  return loadJSON(LS_KEYS.users, []);
}
function setUsers(users){
  saveJSON(LS_KEYS.users, users);
}

function getSession(){
  return loadJSON(LS_KEYS.session, null);
}
function setSession(session){
  saveJSON(LS_KEYS.session, session);
}
function clearSession(){
  localStorage.removeItem(LS_KEYS.session);
}

function getTheme(){
  return localStorage.getItem(LS_KEYS.theme) || "dark";
}
function setTheme(t){
  localStorage.setItem(LS_KEYS.theme, t);
  document.documentElement.setAttribute("data-theme", t === "light" ? "light" : "dark");
}

function hashPass(p){
  let h = 0;
  for (let i=0;i<p.length;i++){
    h = (h * 31 + p.charCodeAt(i)) >>> 0;
  }
  return "h" + h.toString(16);
}

function defaultWorkouts(goal){
  const base = [
    {
      id: uid(),
      title: "A • Peito e Tríceps",
      day: "Segunda",
      exercises: [
        { name:"Supino reto", sets:4, reps:"8-12", rest:"90s" },
        { name:"Supino inclinado", sets:3, reps:"10-12", rest:"90s" },
        { name:"Crucifixo", sets:3, reps:"12-15", rest:"60s" },
        { name:"Tríceps corda", sets:3, reps:"12-15", rest:"60s" }
      ]
    },
    {
      id: uid(),
      title: "B • Costas e Bíceps",
      day: "Quarta",
      exercises: [
        { name:"Puxada na barra", sets:4, reps:"8-12", rest:"90s" },
        { name:"Remada", sets:3, reps:"10-12", rest:"90s" },
        { name:"Pulldown", sets:3, reps:"12-15", rest:"60s" },
        { name:"Rosca direta", sets:3, reps:"10-12", rest:"60s" }
      ]
    },
    {
      id: uid(),
      title: "C • Pernas e Ombros",
      day: "Sexta",
      exercises: [
        { name:"Agachamento", sets:4, reps:"8-10", rest:"120s" },
        { name:"Leg press", sets:3, reps:"10-12", rest:"90s" },
        { name:"Elevação lateral", sets:3, reps:"12-15", rest:"60s" },
        { name:"Desenvolvimento", sets:3, reps:"8-12", rest:"90s" }
      ]
    }
  ];

  if(goal === "Emagrecimento"){
    base.unshift({
      id: uid(),
      title: "Cardio + Core (leve)",
      day: "Terça",
      exercises: [
        { name:"Esteira (moderado)", sets:1, reps:"25 min", rest:"—" },
        { name:"Prancha", sets:3, reps:"30-45s", rest:"45s" },
        { name:"Abdominal infra", sets:3, reps:"12-15", rest:"45s" }
      ]
    });
  }
  return base;
}

function defaultTips(goal, level){
  const tips = [];
  tips.push("Hidrate-se: 30–40ml/kg ao dia (ajuste conforme rotina).");
  tips.push("Sono conta: tente 7–9h por noite para recuperar melhor.");
  if(goal === "Hipertrofia"){
    tips.push("Priorize progressão: aumente carga ou repetições toda semana.");
    tips.push("Proteína diária consistente faz diferença (divida nas refeições).");
  } else if(goal === "Emagrecimento"){
    tips.push("Constância > intensidade: 3–5 treinos/semana é ouro.");
    tips.push("Foque em passos diários e proteína para preservar massa magra.");
  } else if(goal === "Condicionamento"){
    tips.push("Inclua 1–2 sessões intervaladas na semana (HIIT leve/moderado).");
  } else {
    tips.push("Comece devagar e mantenha frequência. O corpo agradece.");
  }
  if(level === "Iniciante") tips.push("Técnica primeiro. Carga depois.");
  if(level === "Avançado") tips.push("Periodize: semanas fortes e semanas de deload.");
  return tips;
}

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function valOrDash(v){
  if(v === null || v === undefined || v === "") return "—";
  return `${v} cm`;
}

/* UI refs */
const authPanel = $("#authPanel");
const appPanel = $("#appPanel");
const btnLogout = $("#btnLogout");
const btnTheme = $("#btnTheme");

const navItems = $$(".nav-item");
const views = $$(".view");

const userNameEl = $("#userName");
const userMetaEl = $("#userMeta");
const helloNameEl = $("#helloName");

/* Dashboard refs */
const kpiCheckins = $("#kpiCheckins");
const kpiWorkouts = $("#kpiWorkouts");
const kpiWeight = $("#kpiWeight");
const kpiNext = $("#kpiNext");
const btnCheckin = $("#btnCheckin");

const lastCheckins = $("#lastCheckins");
const todayWorkout = $("#todayWorkout");
const todayPill = $("#todayPill");
const weightCanvas = $("#weightChart");

/* Workouts refs */
const workoutList = $("#workoutList");
const workoutSearch = $("#workoutSearch");
const btnNewWorkout = $("#btnNewWorkout");
const workoutForm = $("#workoutForm");
const workoutEmpty = $("#workoutEmpty");
const workoutId = $("#workoutId");
const workoutTitle = $("#workoutTitle");
const workoutDay = $("#workoutDay");
const exercisesWrap = $("#exercises");
const btnAddExercise = $("#btnAddExercise");
const btnDeleteWorkout = $("#btnDeleteWorkout");
const btnAddWorkout = $("#btnAddWorkout");

/* Progress refs */
const btnNewMeasure = $("#btnNewMeasure");
const btnAddMeasure = $("#btnAddMeasure");
const measureForm = $("#measureForm");
const btnCancelMeasure = $("#btnCancelMeasure");
const measureList = $("#measureList");

const mDate = $("#mDate");
const mWeight = $("#mWeight");
const mChest = $("#mChest");
const mWaist = $("#mWaist");
const mHip = $("#mHip");
const mArm = $("#mArm");

const checkinList = $("#checkinList");
const btnCheckin2 = $("#btnCheckin2");
const btnClearCheckins = $("#btnClearCheckins");

/* Schedule refs */
const btnNewEvent = $("#btnNewEvent");
const btnAddEvent = $("#btnAddEvent");
const eventForm = $("#eventForm");
const btnCancelEvent = $("#btnCancelEvent");
const eventList = $("#eventList");

const eventId = $("#eventId");
const eDate = $("#eDate");
const eTime = $("#eTime");
const eTitle = $("#eTitle");
const eNote = $("#eNote");

/* Plan refs */
const planPill = $("#planPill");
const planName = $("#planName");
const planDesc = $("#planDesc");
const planPrice = $("#planPrice");
const btnUpgrade = $("#btnUpgrade");
const btnCancelPlan = $("#btnCancelPlan");
const tipsList = $("#tipsList");

/* Settings refs */
const profileForm = $("#profileForm");
const pName = $("#pName");
const pEmail = $("#pEmail");
const pGoal = $("#pGoal");
const pLevel = $("#pLevel");
const btnResetAll = $("#btnResetAll");

/* AUTH forms */
const loginForm = $("#loginForm");
const registerForm = $("#registerForm");
const loginEmail = $("#loginEmail");
const loginPass = $("#loginPass");

const regName = $("#regName");
const regEmail = $("#regEmail");
const regPass = $("#regPass");
const regGoal = $("#regGoal");
const regLevel = $("#regLevel");

/* State */
let currentUser = null;

/* Navigation */
function setView(viewName){
  views.forEach(v => v.classList.add("hide"));
  const target = $("#view-" + viewName);
  if(target) target.classList.remove("hide");
  navItems.forEach(b => b.classList.toggle("active", b.dataset.view === viewName));

  if(viewName === "dashboard" && currentUser){
    setTimeout(() => drawWeightChart(), 50);
  }
}

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    setView(btn.dataset.view);
    if(!currentUser) return;

    if(btn.dataset.view === "workout") renderWorkouts();
    if(btn.dataset.view === "progress") { renderMeasures(); renderCheckins(); }
    if(btn.dataset.view === "schedule") renderEvents();
    if(btn.dataset.view === "plan") renderPlan();
    if(btn.dataset.view === "dashboard") renderDashboard();
  });
});

/* Theme */
setTheme(getTheme());
btnTheme?.addEventListener("click", () => {
  const next = getTheme() === "light" ? "dark" : "light";
  setTheme(next);
  toast(`Tema: ${next === "light" ? "Claro" : "Escuro"}`);
});

/* Users */
function findUserByEmail(email){
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
function saveUser(user){
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if(idx >= 0) users[idx] = user;
  else users.push(user);
  setUsers(users);
}
function getUserById(id){
  return getUsers().find(u => u.id === id) || null;
}
function persist(){
  if(!currentUser) return;
  saveUser(currentUser);
}

/* AUTH */
registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const pass = regPass.value;
  const goal = regGoal.value;
  const level = regLevel.value;

  if(findUserByEmail(email)){
    toast("Esse e-mail já está cadastrado.");
    return;
  }

  const user = {
    id: uid(),
    name,
    email,
    passHash: hashPass(pass),
    goal,
    level,
    workouts: defaultWorkouts(goal),
    measures: [],
    checkins: [],
    events: [],
    plan: { status:"Ativo", name:"Plano Mensal", price:"R$ 129,90", desc:"Acesso total • Treinos • Avaliação • App" }
  };

  saveUser(user);
  toast("Conta criada! Agora você pode entrar.");
  registerForm.reset();
  loginEmail.value = email;
  loginPass.value = pass;
});

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const pass = loginPass.value;
  const user = findUserByEmail(email);

  if(!user || user.passHash !== hashPass(pass)){
    toast("E-mail ou senha inválidos.");
    return;
  }

  setSession({ userId: user.id });
  boot();
  toast("Bem-vindo(a)!");
});

btnLogout?.addEventListener("click", () => {
  clearSession();
  currentUser = null;
  appPanel?.classList.add("hide");
  authPanel?.classList.remove("hide");
  btnLogout?.classList.add("hide");
  toast("Você saiu da conta.");
});

/* Boot */
function boot(){
  const session = getSession();
  if(!session?.userId){
    authPanel?.classList.remove("hide");
    appPanel?.classList.add("hide");
    btnLogout?.classList.add("hide");
    return;
  }

  const user = getUserById(session.userId);
  if(!user){
    clearSession();
    boot();
    return;
  }

  currentUser = user;

  authPanel?.classList.add("hide");
  appPanel?.classList.remove("hide");
  btnLogout?.classList.remove("hide");

  userNameEl.textContent = currentUser.name;
  userMetaEl.textContent = `${currentUser.goal} • ${currentUser.level}`;
  helloNameEl.textContent = currentUser.name.split(" ")[0] || currentUser.name;

  pName.value = currentUser.name;
  pEmail.value = currentUser.email;
  pGoal.value = currentUser.goal;
  pLevel.value = currentUser.level;

  setView("dashboard");
  renderDashboard();
  renderPlan();
}

/* Dashboard */
function renderDashboard(){
  if(!currentUser) return;

  const last30 = Date.now() - 30*24*60*60*1000;
  const checkins30 = currentUser.checkins.filter(c => new Date(c.date).getTime() >= last30).length;
  kpiCheckins.textContent = String(checkins30);
  kpiWorkouts.textContent = String(currentUser.workouts.length);

  const ms = [...currentUser.measures].sort((a,b)=> a.date.localeCompare(b.date));
  const lastM = ms.at(-1);
  kpiWeight.textContent = lastM ? String(lastM.weight) : "—";

  const wd = weekdayPt();
  const next = currentUser.workouts.find(w => w.day === wd) || currentUser.workouts[0] || null;
  kpiNext.textContent = next ? next.title : "—";

  renderLastCheckins();
  renderTodayWorkout();
  setTimeout(() => drawWeightChart(), 30);
}

function renderLastCheckins(){
  const items = [...currentUser.checkins].slice(-5).reverse();
  lastCheckins.innerHTML = "";

  if(items.length === 0){
    lastCheckins.innerHTML = `<li class="li"><div class="title">Nenhum check-in ainda</div><div class="meta">Clique em “Fazer check-in”.</div></li>`;
    return;
  }

  for(const c of items){
    const li = document.createElement("li");
    li.className = "li";
    li.innerHTML = `
      <div class="row">
        <div class="title">Check-in</div>
        <div class="pill">${fmtDate(c.date)}</div>
      </div>
      <div class="meta">${escapeHtml(c.note || "Presença registrada")}</div>
    `;
    lastCheckins.appendChild(li);
  }
}

function renderTodayWorkout(){
  const wd = weekdayPt();
  const w = currentUser.workouts.find(x => x.day === wd) || currentUser.workouts[0] || null;

  if(!w){
    todayPill.textContent = "Sem treino";
    todayWorkout.className = "empty muted";
    todayWorkout.textContent = "Cadastre treinos para aparecer aqui.";
    return;
  }

  todayPill.textContent = wd;
  const ex = w.exercises.slice(0, 6);

  todayWorkout.className = "";
  todayWorkout.innerHTML = `
    <div class="li">
      <div class="row">
        <div class="title">${escapeHtml(w.title)}</div>
        <div class="pill">${escapeHtml(w.day)}</div>
      </div>
      <div class="meta">
        ${ex.map(e => `• ${escapeHtml(e.name)} — ${e.sets}x ${escapeHtml(e.reps)} (desc. ${escapeHtml(e.rest)})`).join("<br/>")}
      </div>
    </div>
  `;
}

function addCheckin(){
  const d = todayISO();
  if(currentUser.checkins.some(c => c.date === d)){
    toast("Você já fez check-in hoje ✅");
    return;
  }
  currentUser.checkins.push({ id: uid(), date: d, note: "Presença registrada" });
  persist();
  toast("Check-in feito! 🔥");
  renderDashboard();
  renderCheckins();
}

btnCheckin?.addEventListener("click", addCheckin);
btnCheckin2?.addEventListener("click", addCheckin);

btnClearCheckins?.addEventListener("click", () => {
  if(!confirm("Tem certeza que deseja limpar os check-ins?")) return;
  currentUser.checkins = [];
  persist();
  toast("Check-ins limpos.");
  renderDashboard();
  renderCheckins();
});

/* Chart (Canvas) - corrigido */
function drawWeightChart(){
  if(!currentUser || !weightCanvas) return;

  const ctx = weightCanvas.getContext("2d");

  const cssWidth = Math.max(
    320,
    weightCanvas.parentElement?.clientWidth || weightCanvas.clientWidth || 320
  );
  const cssHeight = 120;

  const dpr = window.devicePixelRatio || 1;

  weightCanvas.style.width = cssWidth + "px";
  weightCanvas.style.height = cssHeight + "px";
  weightCanvas.width = Math.floor(cssWidth * dpr);
  weightCanvas.height = Math.floor(cssHeight * dpr);

  const W = weightCanvas.width;
  const H = weightCanvas.height;

  ctx.clearRect(0, 0, W, H);

  const measures = [...currentUser.measures]
    .sort((a,b)=> a.date.localeCompare(b.date))
    .slice(-10);

  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1 * dpr;
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--line").trim() || "#223055";
  for(let i=0;i<=4;i++){
    const y = (H/4)*i;
    ctx.beginPath();
    ctx.moveTo(0,y);
    ctx.lineTo(W,y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if(measures.length < 2){
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#94a3b8";
    ctx.font = `${Math.floor(12*dpr)}px system-ui`;
    ctx.fillText("Adicione pelo menos 2 pesos para ver o gráfico.", 12*dpr, 30*dpr);
    ctx.globalAlpha = 1;
    return;
  }

  const weights = measures.map(m => Number(m.weight)).filter(n => Number.isFinite(n));
  if(weights.length < 2){
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#94a3b8";
    ctx.font = `${Math.floor(12*dpr)}px system-ui`;
    ctx.fillText("Registros de peso inválidos.", 12*dpr, 30*dpr);
    ctx.globalAlpha = 1;
    return;
  }

  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = (max-min) * 0.2 || 1;
  const yMin = min - pad;
  const yMax = max + pad;

  const xStep = W / (weights.length - 1);

  const toY = (val) => {
    const t = (val - yMin) / (yMax - yMin);
    return H - (t * (H - 24*dpr)) - 12*dpr;
  };

  const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#3b82f6";

  ctx.lineWidth = 3*dpr;
  ctx.strokeStyle = primary;
  ctx.beginPath();
  weights.forEach((val, i) => {
    const x = i * xStep;
    const y = toY(val);
    if(i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = primary;
  weights.forEach((val, i) => {
    const x = i * xStep;
    const y = toY(val);
    ctx.beginPath();
    ctx.arc(x, y, 3.8*dpr, 0, Math.PI*2);
    ctx.fill();
  });

  ctx.globalAlpha = 0.8;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#94a3b8";
  ctx.font = `${Math.floor(11*dpr)}px system-ui`;
  ctx.fillText(`${weights.at(-1)} kg`, (W - 85*dpr), 18*dpr);
  ctx.globalAlpha = 1;
}

/* Workouts */
function renderWorkouts(){
  const q = (workoutSearch?.value || "").trim().toLowerCase();
  const items = currentUser.workouts
    .filter(w => (w.title + " " + w.day).toLowerCase().includes(q))
    .sort((a,b)=> a.day.localeCompare(b.day));

  workoutList.innerHTML = "";
  if(items.length === 0){
    workoutList.innerHTML = `<li class="li"><div class="title">Nenhum treino</div><div class="meta">Clique em “Criar treino”.</div></li>`;
    return;
  }

  for(const w of items){
    const li = document.createElement("li");
    li.className = "li";
    li.innerHTML = `
      <div class="row">
        <div>
          <div class="title">${escapeHtml(w.title)}</div>
          <div class="meta">${escapeHtml(w.day)} • ${w.exercises.length} exercícios</div>
        </div>
        <button class="btn" data-open="${w.id}">Editar</button>
      </div>
    `;
    li.querySelector("[data-open]").addEventListener("click", () => openWorkout(w.id));
    workoutList.appendChild(li);
  }
}

workoutSearch?.addEventListener("input", renderWorkouts);

function openWorkout(id){
  const w = currentUser.workouts.find(x => x.id === id);
  if(!w) return;

  workoutEmpty?.classList.add("hide");
  workoutForm?.classList.remove("hide");

  workoutId.value = w.id;
  workoutTitle.value = w.title;
  workoutDay.value = w.day;

  exercisesWrap.innerHTML = "";
  for(const ex of w.exercises) addExerciseRow(ex);
}

function clearWorkoutEditor(){
  workoutId.value = "";
  workoutTitle.value = "";
  workoutDay.value = "Segunda";
  exercisesWrap.innerHTML = "";
  workoutForm?.classList.add("hide");
  workoutEmpty?.classList.remove("hide");
}

function addExerciseRow(ex = {name:"", sets:3, reps:"10-12", rest:"60s"}){
  const row = document.createElement("div");
  row.className = "exercise";
  row.innerHTML = `
    <div class="exercise-grid">
      <div>
        <label>Exercício</label>
        <input class="ex-name" placeholder="Ex: Supino reto" value="${escapeHtml(ex.name)}" required />
      </div>
      <div>
        <label>Séries</label>
        <input class="ex-sets" type="number" min="1" value="${Number(ex.sets) || 3}" required />
      </div>
      <div>
        <label>Reps</label>
        <input class="ex-reps" placeholder="Ex: 8-12" value="${escapeHtml(ex.reps)}" required />
      </div>
      <div>
        <label>Descanso</label>
        <input class="ex-rest" placeholder="Ex: 60s" value="${escapeHtml(ex.rest)}" required />
      </div>
    </div>
    <div class="row space mini">
      <div class="muted">Dica: técnica primeiro.</div>
      <button class="btn danger" type="button">Remover</button>
    </div>
  `;
  row.querySelector("button.btn.danger").addEventListener("click", ()=> row.remove());
  exercisesWrap.appendChild(row);
}

btnAddExercise?.addEventListener("click", () => addExerciseRow());

btnNewWorkout?.addEventListener("click", () => {
  setView("workout");
  clearWorkoutEditor();
  workoutForm?.classList.remove("hide");
  workoutEmpty?.classList.add("hide");
  workoutId.value = uid();
  workoutTitle.value = "Novo treino";
  workoutDay.value = weekdayPt();
  exercisesWrap.innerHTML = "";
  addExerciseRow();
});

btnAddWorkout?.addEventListener("click", () => btnNewWorkout.click());

workoutForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = workoutId.value || uid();
  const title = workoutTitle.value.trim();
  const day = workoutDay.value;

  const rows = Array.from(exercisesWrap.querySelectorAll(".exercise"));
  if(rows.length === 0){
    toast("Adicione pelo menos 1 exercício.");
    return;
  }

  const exercises = rows.map(r => ({
    name: r.querySelector(".ex-name").value.trim(),
    sets: Number(r.querySelector(".ex-sets").value),
    reps: r.querySelector(".ex-reps").value.trim(),
    rest: r.querySelector(".ex-rest").value.trim()
  })).filter(ex => ex.name.length > 0);

  if(!title){
    toast("Informe o nome do treino.");
    return;
  }
  if(exercises.length === 0){
    toast("Preencha os exercícios.");
    return;
  }

  const existingIdx = currentUser.workouts.findIndex(w => w.id === id);
  const payload = { id, title, day, exercises };

  if(existingIdx >= 0) currentUser.workouts[existingIdx] = payload;
  else currentUser.workouts.push(payload);

  persist();
  toast("Treino salvo ✅");
  renderWorkouts();
  renderDashboard();
});

btnDeleteWorkout?.addEventListener("click", () => {
  const id = workoutId.value;
  if(!id) return;
  if(!confirm("Excluir este treino?")) return;

  currentUser.workouts = currentUser.workouts.filter(w => w.id !== id);
  persist();
  toast("Treino excluído.");
  clearWorkoutEditor();
  renderWorkouts();
  renderDashboard();
});

/* Measures */
function renderMeasures(){
  const measures = [...currentUser.measures].sort((a,b)=> b.date.localeCompare(a.date));
  measureList.innerHTML = "";

  if(measures.length === 0){
    measureList.innerHTML = `<li class="li"><div class="title">Nenhuma medida</div><div class="meta">Clique em “Registrar”.</div></li>`;
    return;
  }

  for(const m of measures){
    const li = document.createElement("li");
    li.className = "li";
    li.innerHTML = `
      <div class="row">
        <div class="title">${fmtDate(m.date)} • ${m.weight} kg</div>
        <button class="btn danger" data-del="${m.id}">Excluir</button>
      </div>
      <div class="meta">
        Peito: ${valOrDash(m.chest)} • Cintura: ${valOrDash(m.waist)} • Quadril: ${valOrDash(m.hip)} • Braço: ${valOrDash(m.arm)}
      </div>
    `;
    li.querySelector("[data-del]").addEventListener("click", () => {
      if(!confirm("Excluir esta medida?")) return;
      currentUser.measures = currentUser.measures.filter(x => x.id !== m.id);
      persist();
      toast("Medida excluída.");
      renderMeasures();
      renderDashboard();
    });
    measureList.appendChild(li);
  }
}

function openMeasureForm(){
  measureForm?.classList.remove("hide");
  mDate.value = todayISO();
  mWeight.value = "";
  mChest.value = "";
  mWaist.value = "";
  mHip.value = "";
  mArm.value = "";
}

function closeMeasureForm(){
  measureForm?.classList.add("hide");
}

btnNewMeasure?.addEventListener("click", openMeasureForm);
btnAddMeasure?.addEventListener("click", () => { setView("progress"); openMeasureForm(); });
btnCancelMeasure?.addEventListener("click", closeMeasureForm);

measureForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    id: uid(),
    date: mDate.value,
    weight: Number(mWeight.value),
    chest: mChest.value ? Number(mChest.value) : "",
    waist: mWaist.value ? Number(mWaist.value) : "",
    hip: mHip.value ? Number(mHip.value) : "",
    arm: mArm.value ? Number(mArm.value) : ""
  };

  if(!payload.date){
    toast("Selecione uma data.");
    return;
  }
  if(!Number.isFinite(payload.weight) || payload.weight <= 0){
    toast("Informe um peso válido.");
    return;
  }

  currentUser.measures.push(payload);
  persist();
  toast("Medida salva ✅");
  closeMeasureForm();
  renderMeasures();
  renderDashboard();
});

/* Checkins */
function renderCheckins(){
  const items = [...currentUser.checkins].sort((a,b)=> b.date.localeCompare(a.date));
  checkinList.innerHTML = "";

  if(items.length === 0){
    checkinList.innerHTML = `<li class="li"><div class="title">Nenhum check-in</div><div class="meta">Clique em “Fazer check-in agora”.</div></li>`;
    return;
  }

  for(const c of items){
    const li = document.createElement("li");
    li.className = "li";
    li.innerHTML = `
      <div class="row">
        <div class="title">${fmtDate(c.date)}</div>
        <button class="btn danger" data-del="${c.id}">Excluir</button>
      </div>
      <div class="meta">${escapeHtml(c.note || "")}</div>
    `;
    li.querySelector("[data-del]").addEventListener("click", () => {
      if(!confirm("Excluir este check-in?")) return;
      currentUser.checkins = currentUser.checkins.filter(x => x.id !== c.id);
      persist();
      toast("Check-in excluído.");
      renderCheckins();
      renderDashboard();
    });
    checkinList.appendChild(li);
  }
}

/* Events */
function renderEvents(){
  const items = [...currentUser.events].sort((a,b)=>{
    const ad = a.date + " " + a.time;
    const bd = b.date + " " + b.time;
    return ad.localeCompare(bd);
  });

  eventList.innerHTML = "";
  if(items.length === 0){
    eventList.innerHTML = `<li class="li"><div class="title">Sem eventos</div><div class="meta">Adicione lembretes de avaliação, treinos, etc.</div></li>`;
    return;
  }

  for(const ev of items){
    const li = document.createElement("li");
    li.className = "li";
    li.innerHTML = `
      <div class="row">
        <div>
          <div class="title">${escapeHtml(ev.title)}</div>
          <div class="meta">${fmtDate(ev.date)} • ${escapeHtml(ev.time)}</div>
        </div>
        <div class="row">
          <button class="btn" data-edit="${ev.id}">Editar</button>
          <button class="btn danger" data-del="${ev.id}">Excluir</button>
        </div>
      </div>
      ${ev.note ? `<div class="meta">${escapeHtml(ev.note)}</div>` : ""}
    `;

    li.querySelector("[data-edit]").addEventListener("click", () => openEvent(ev.id));
    li.querySelector("[data-del]").addEventListener("click", () => {
      if(!confirm("Excluir este evento?")) return;
      currentUser.events = currentUser.events.filter(x => x.id !== ev.id);
      persist();
      toast("Evento excluído.");
      renderEvents();
      renderDashboard();
    });

    eventList.appendChild(li);
  }
}

function openEventForm(){
  eventForm?.classList.remove("hide");
  eventId.value = "";
  eDate.value = todayISO();
  eTime.value = "18:00";
  eTitle.value = "";
  eNote.value = "";
}
function closeEventForm(){
  eventForm?.classList.add("hide");
}
function openEvent(id){
  const ev = currentUser.events.find(x => x.id === id);
  if(!ev) return;
  eventForm?.classList.remove("hide");
  eventId.value = ev.id;
  eDate.value = ev.date;
  eTime.value = ev.time;
  eTitle.value = ev.title;
  eNote.value = ev.note || "";
}

btnNewEvent?.addEventListener("click", openEventForm);
btnAddEvent?.addEventListener("click", () => { setView("schedule"); openEventForm(); });
btnCancelEvent?.addEventListener("click", closeEventForm);

eventForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    id: eventId.value || uid(),
    date: eDate.value,
    time: eTime.value,
    title: eTitle.value.trim(),
    note: eNote.value.trim()
  };

  if(!payload.title){
    toast("Informe um título.");
    return;
  }

  const idx = currentUser.events.findIndex(x => x.id === payload.id);
  if(idx >= 0) currentUser.events[idx] = payload;
  else currentUser.events.push(payload);

  persist();
  toast("Evento salvo ✅");
  closeEventForm();
  renderEvents();
});

/* Plan */
function renderPlan(){
  const plan = currentUser.plan || { status:"Ativo", name:"Plano Mensal", price:"R$ 129,90", desc:"Acesso total • Treinos • Avaliação • App" };
  planPill.textContent = plan.status;
  planName.textContent = plan.name;
  planPrice.textContent = plan.price;
  planDesc.textContent = plan.desc;

  tipsList.innerHTML = "";
  defaultTips(currentUser.goal, currentUser.level).forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    tipsList.appendChild(li);
  });
}

btnUpgrade?.addEventListener("click", () => {
  const options = [
    { name:"Plano Mensal", price:"R$ 129,90", desc:"Acesso total • Treinos • Avaliação • App" },
    { name:"Plano Trimestral", price:"R$ 349,90", desc:"Economia • Acesso total • Bônus: 1 avaliação" },
    { name:"Plano Anual", price:"R$ 999,90", desc:"Melhor custo • Acesso total • 3 avaliações" }
  ];

  const pick = prompt("Digite 1, 2 ou 3:\n1) Mensal\n2) Trimestral\n3) Anual", "1");
  const idx = Number(pick) - 1;

  if(idx < 0 || idx >= options.length){
    toast("Opção inválida.");
    return;
  }

  currentUser.plan = { status:"Ativo", ...options[idx] };
  persist();
  toast("Plano atualizado ✅");
  renderPlan();
});

btnCancelPlan?.addEventListener("click", () => {
  if(!confirm("Cancelar plano? (simulação)")) return;
  currentUser.plan = { status:"Cancelado", name:"Sem plano", price:"—", desc:"Assinatura cancelada" };
  persist();
  toast("Plano cancelado.");
  renderPlan();
});

/* Settings */
profileForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const newName = pName.value.trim();
  const newEmail = pEmail.value.trim();

  const users = getUsers();
  const emailOwner = users.find(u => u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== currentUser.id);
  if(emailOwner){
    toast("Esse e-mail já está em uso.");
    return;
  }

  currentUser.name = newName;
  currentUser.email = newEmail;
  currentUser.goal = pGoal.value;
  currentUser.level = pLevel.value;

  persist();
  toast("Perfil atualizado ✅");
  boot();
});

btnResetAll?.addEventListener("click", () => {
  if(!confirm("Isso apagará TODOS os dados deste site no seu navegador. Continuar?")) return;
  localStorage.removeItem(LS_KEYS.users);
  localStorage.removeItem(LS_KEYS.session);
  toast("Tudo resetado. Recarregando...");
  setTimeout(()=> location.reload(), 700);
});

/* Initial + resize */
window.addEventListener("resize", () => {
  if(currentUser) drawWeightChart();
});

boot();
