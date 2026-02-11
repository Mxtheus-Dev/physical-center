/* Physical Center - Portal do Aluno (localStorage) */

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const KEYS = {
  users: "pc_users_v3",
  session: "pc_session_v3",
  selectedPlan: "pc_selected_plan"
};

function load(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch{
    return fallback;
  }
}
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function uid(){ return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16); }

function todayISO(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function fmtDate(iso){
  if(!iso) return "—";
  const [y,m,d] = iso.split("-").map(Number);
  return new Date(y, m-1, d).toLocaleDateString("pt-BR");
}
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function toast(msg){
  const el = $("#toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(()=> el.classList.remove("show"), 2300);
}

function hashPass(p){
  let h = 0;
  for(let i=0;i<p.length;i++) h = (h*31 + p.charCodeAt(i)) >>> 0;
  return "h" + h.toString(16);
}

/* DOM refs */
const auth = $("#auth");
const portal = $("#portal");
const btnLogout = $("#btnLogout");

const loginForm = $("#loginForm");
const registerForm = $("#registerForm");

const loginEmail = $("#loginEmail");
const loginPass = $("#loginPass");

const regName = $("#regName");
const regEmail = $("#regEmail");
const regPass = $("#regPass");
const regPlan = $("#regPlan");

/* Sidebar */
const uName = $("#uName");
const uPlan = $("#uPlan");
const btnCheckin = $("#btnCheckin");
const checkinInfo = $("#checkinInfo");

/* Tabs */
const tabs = $$(".tab");
const views = $$(".view");

/* Home */
const pillStatus = $("#pillStatus");
const kCheckins = $("#kCheckins");
const kWorkouts = $("#kWorkouts");
const kWeight = $("#kWeight");
const lastCheckins = $("#lastCheckins");
const nextEvents = $("#nextEvents");
const btnAddWeight = $("#btnAddWeight");
const weightCanvas = $("#weightCanvas");

/* Workouts */
const btnNewWorkout = $("#btnNewWorkout");
const workoutSearch = $("#workoutSearch");
const workoutList = $("#workoutList");
const workoutHint = $("#workoutHint");
const workoutDetails = $("#workoutDetails");
const wTitle = $("#wTitle");
const wMeta = $("#wMeta");
const wExercises = $("#wExercises");
const btnDeleteWorkout = $("#btnDeleteWorkout");

const workoutForm = $("#workoutForm");
const fTitle = $("#fTitle");
const fDay = $("#fDay");
const fEx = $("#fEx");
const btnCancelWorkout = $("#btnCancelWorkout");

/* Agenda */
const btnNewEvent = $("#btnNewEvent");
const btnNewEvent2 = $("#btnNewEvent2");
const eventForm = $("#eventForm");
const eDate = $("#eDate");
const eTime = $("#eTime");
const eTitle = $("#eTitle");
const eNote = $("#eNote");
const btnCancelEvent = $("#btnCancelEvent");
const eventList = $("#eventList");

/* Progress */
const btnNewWeight = $("#btnNewWeight");
const weightForm = $("#weightForm");
const pDate = $("#pDate");
const pWeight = $("#pWeight");
const btnCancelWeight = $("#btnCancelWeight");
const weightList = $("#weightList");

/* Profile */
const profileForm = $("#profileForm");
const prName = $("#prName");
const prEmail = $("#prEmail");
const prPlan = $("#prPlan");
const btnReset = $("#btnReset");

/* State */
let users = load(KEYS.users, []);
let session = load(KEYS.session, null);
let currentUser = null;
let selectedWorkoutId = null;

/* Helpers */
function findUserByEmail(email){
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
function getUserById(id){
  return users.find(u => u.id === id) || null;
}
function persistUser(){
  users = users.map(u => u.id === currentUser.id ? currentUser : u);
  save(KEYS.users, users);
}
function setSession(userId){
  session = { userId };
  save(KEYS.session, session);
}
function clearSession(){
  session = null;
  localStorage.removeItem(KEYS.session);
}

/* Default content */
function seedWorkouts(){
  return [
    { id: uid(), title: "A • Peito e Tríceps", day: "Segunda", ex: ["Supino reto", "Supino inclinado", "Crucifixo", "Tríceps corda"] },
    { id: uid(), title: "B • Costas e Bíceps", day: "Quarta", ex: ["Puxada", "Remada", "Pulldown", "Rosca direta"] },
    { id: uid(), title: "C • Pernas e Ombros", day: "Sexta", ex: ["Agachamento", "Leg press", "Elevação lateral", "Desenvolvimento"] },
  ];
}
function userTemplate({name,email,passHash,plan}){
  return {
    id: uid(),
    name, email, passHash,
    plan,
    status: "Ativo",
    checkins: [],   // ISO dates
    workouts: seedWorkouts(),
    events: [],     // {id,date,time,title,note}
    weights: []     // {id,date,weight}
  };
}

/* Selected plan from Home */
function applySelectedPlanIfAny(){
  const raw = localStorage.getItem(KEYS.selectedPlan); // "Mensal|129.90"
  if(!raw || !regPlan) return;
  const [planName] = raw.split("|");
  const exists = Array.from(regPlan.options).some(o => o.value === planName);
  if(exists) regPlan.value = planName;
}

/* UI */
function showAuth(){
  auth?.classList.remove("hidden");
  portal?.classList.add("hidden");
  btnLogout?.classList.add("hidden");
  applySelectedPlanIfAny();
}
function showPortal(){
  auth?.classList.add("hidden");
  portal?.classList.remove("hidden");
  btnLogout?.classList.remove("hidden");
}

/* Tabs */
function setTab(name){
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  views.forEach(v => v.classList.add("hidden"));
  const target = $("#tab-" + name);
  target?.classList.remove("hidden");

  if(name === "home") renderHome();
  if(name === "workouts") renderWorkouts();
  if(name === "agenda") renderAgenda();
  if(name === "progress") renderProgress();
  if(name === "profile") renderProfile();
}
tabs.forEach(t => t.addEventListener("click", ()=> setTab(t.dataset.tab)));

/* Auth */
registerForm?.addEventListener("submit", (e)=>{
  e.preventDefault();

  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const pass = regPass.value;
  const plan = regPlan.value;

  if(findUserByEmail(email)){
    toast("Esse e-mail já está cadastrado.");
    return;
  }

  const u = userTemplate({name, email, passHash: hashPass(pass), plan});
  users.push(u);
  save(KEYS.users, users);

  toast("Conta criada! Agora faça login.");
  registerForm.reset();
  applySelectedPlanIfAny();
  loginEmail.value = email;
  loginPass.value = pass;
});

loginForm?.addEventListener("submit", (e)=>{
  e.preventDefault();

  const email = loginEmail.value.trim();
  const pass = loginPass.value;

  const u = findUserByEmail(email);
  if(!u || u.passHash !== hashPass(pass)){
    toast("E-mail ou senha inválidos.");
    return;
  }

  setSession(u.id);
  boot();
  toast("Bem-vindo(a)!");
});

btnLogout?.addEventListener("click", ()=>{
  clearSession();
  currentUser = null;
  showAuth();
  toast("Você saiu.");
});

/* Check-in */
function doCheckin(){
  const d = todayISO();
  if(currentUser.checkins.includes(d)){
    toast("Check-in já feito hoje ✅");
    return;
  }
  currentUser.checkins.push(d);
  persistUser();
  toast("Check-in registrado!");
  renderHome();
}
btnCheckin?.addEventListener("click", doCheckin);

/* Home render */
function renderHome(){
  uName.textContent = currentUser.name;
  uPlan.textContent = `Plano: ${currentUser.plan}`;
  pillStatus.textContent = currentUser.status;

  const last30 = Date.now() - 30*24*60*60*1000;
  const c30 = currentUser.checkins.filter(d => new Date(d).getTime() >= last30).length;

  kCheckins.textContent = String(c30);
  kWorkouts.textContent = String(currentUser.workouts.length);

  const lastW = [...currentUser.weights].sort((a,b)=> a.date.localeCompare(b.date)).at(-1);
  kWeight.textContent = lastW ? String(lastW.weight) : "—";

  checkinInfo.textContent = `Hoje: ${currentUser.checkins.includes(todayISO()) ? "✅ feito" : "—"}`;

  lastCheckins.innerHTML = "";
  const last = [...currentUser.checkins].slice(-5).reverse();
  if(last.length === 0){
    lastCheckins.innerHTML = `<li class="item"><div class="item__top"><strong>Nenhum check-in</strong></div><div class="item__meta">Clique em “Fazer check-in”.</div></li>`;
  }else{
    last.forEach(d=>{
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `<div class="item__top"><strong>✅ Check-in</strong><span class="pill">${fmtDate(d)}</span></div>`;
      lastCheckins.appendChild(li);
    });
  }

  renderNextEvents();
  drawWeightChart();
}

function renderNextEvents(){
  nextEvents.innerHTML = "";
  const nowKey = todayISO() + " 00:00";

  const items = [...currentUser.events]
    .sort((a,b)=> (a.date+" "+a.time).localeCompare(b.date+" "+b.time))
    .filter(ev => (ev.date+" "+ev.time) >= nowKey)
    .slice(0,4);

  if(items.length === 0){
    nextEvents.innerHTML = `<li class="item"><div class="item__top"><strong>Sem eventos</strong></div><div class="item__meta">Adicione na aba Agenda.</div></li>`;
    return;
  }

  for(const ev of items){
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div class="item__top">
        <strong>${escapeHtml(ev.title)}</strong>
        <span class="pill">${fmtDate(ev.date)} • ${escapeHtml(ev.time)}</span>
      </div>
      ${ev.note ? `<div class="item__meta">${escapeHtml(ev.note)}</div>` : ``}
    `;
    nextEvents.appendChild(li);
  }
}

/* Chart */
function drawWeightChart(){
  if(!weightCanvas) return;
  const ctx = weightCanvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(320, weightCanvas.parentElement?.clientWidth || 520);
  const cssH = 150;

  weightCanvas.style.width = cssW + "px";
  weightCanvas.style.height = cssH + "px";
  weightCanvas.width = Math.floor(cssW * dpr);
  weightCanvas.height = Math.floor(cssH * dpr);

  const W = weightCanvas.width, H = weightCanvas.height;
  ctx.clearRect(0,0,W,H);

  ctx.globalAlpha = .25;
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 1*dpr;
  for(let i=0;i<=4;i++){
    const y = (H/4)*i;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const arr = [...currentUser.weights].sort((a,b)=> a.date.localeCompare(b.date)).slice(-10);
  if(arr.length < 2){
    ctx.fillStyle = "rgba(255,255,255,.70)";
    ctx.font = `${Math.floor(12*dpr)}px system-ui`;
    ctx.fillText("Registre pelo menos 2 pesos para ver o gráfico.", 12*dpr, 26*dpr);
    return;
  }

  const values = arr.map(x => Number(x.weight)).filter(n => Number.isFinite(n));
  const min = Math.min(...values), max = Math.max(...values);
  const pad = (max-min)*.2 || 1;
  const yMin = min - pad, yMax = max + pad;
  const xStep = W / (values.length - 1);

  const toY = (v) => {
    const t = (v - yMin) / (yMax - yMin);
    return H - (t * (H - 28*dpr)) - 14*dpr;
  };

  ctx.strokeStyle = "#4f8cff";
  ctx.lineWidth = 3*dpr;
  ctx.beginPath();
  values.forEach((v,i)=>{
    const x = i*xStep;
    const y = toY(v);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.fillStyle = "#4f8cff";
  values.forEach((v,i)=>{
    const x = i*xStep;
    const y = toY(v);
    ctx.beginPath();
    ctx.arc(x,y,4*dpr,0,Math.PI*2);
    ctx.fill();
  });

  const last = values.at(-1);
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.font = `${Math.floor(12*dpr)}px system-ui`;
  ctx.fillText(`${last} kg`, (W - 72*dpr), 20*dpr);
}
window.addEventListener("resize", ()=> { if(currentUser) drawWeightChart(); });

/* Workouts */
function renderWorkouts(){
  const q = (workoutSearch.value || "").trim().toLowerCase();
  const items = currentUser.workouts
    .filter(w => (w.title + " " + w.day).toLowerCase().includes(q))
    .sort((a,b)=> a.day.localeCompare(b.day));

  workoutList.innerHTML = "";
  items.forEach(w=>{
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div class="item__top">
        <strong>${escapeHtml(w.title)}</strong>
        <span class="pill">${escapeHtml(w.day)}</span>
      </div>
      <div class="item__meta">${w.ex.length} exercícios</div>
    `;
    li.addEventListener("click", ()=> openWorkout(w.id));
    workoutList.appendChild(li);
  });

  if(items.length === 0){
    workoutList.innerHTML = `<li class="item"><div class="item__top"><strong>Nenhum treino</strong></div><div class="item__meta">Crie um novo treino.</div></li>`;
  }

  if(selectedWorkoutId && !currentUser.workouts.some(w => w.id === selectedWorkoutId)){
    selectedWorkoutId = null;
  }
  if(!selectedWorkoutId){
    workoutHint.classList.remove("hidden");
    workoutDetails.classList.add("hidden");
  }
}
function openWorkout(id){
  const w = currentUser.workouts.find(x => x.id === id);
  if(!w) return;
  selectedWorkoutId = id;

  workoutHint.classList.add("hidden");
  workoutForm.classList.add("hidden");
  workoutDetails.classList.remove("hidden");

  wTitle.textContent = w.title;
  wMeta.textContent = `${w.day} • ${w.ex.length} exercícios`;

  wExercises.innerHTML = "";
  w.ex.forEach(name=>{
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `<div class="item__top"><strong>${escapeHtml(name)}</strong></div>`;
    wExercises.appendChild(li);
  });
}
workoutSearch?.addEventListener("input", renderWorkouts);

btnNewWorkout?.addEventListener("click", ()=>{
  workoutHint.classList.add("hidden");
  workoutDetails.classList.add("hidden");
  workoutForm.classList.remove("hidden");
  fTitle.value = "";
  fDay.value = "Segunda";
  fEx.value = "";
  fTitle.focus();
});

btnCancelWorkout?.addEventListener("click", ()=>{
  workoutForm.classList.add("hidden");
  workoutHint.classList.remove("hidden");
});

workoutForm?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const title = fTitle.value.trim();
  const day = fDay.value;
  const ex = fEx.value.split("\n").map(s=>s.trim()).filter(Boolean);

  if(!title || ex.length === 0){
    toast("Preencha nome e exercícios.");
    return;
  }

  currentUser.workouts.push({ id: uid(), title, day, ex });
  persistUser();
  toast("Treino criado ✅");

  workoutForm.classList.add("hidden");
  renderWorkouts();
  renderHome();
});

btnDeleteWorkout?.addEventListener("click", ()=>{
  if(!selectedWorkoutId) return;
  if(!confirm("Excluir este treino?")) return;

  currentUser.workouts = currentUser.workouts.filter(w => w.id !== selectedWorkoutId);
  persistUser();
  toast("Treino excluído.");

  selectedWorkoutId = null;
  renderWorkouts();
  renderHome();
});

/* Agenda */
function openEventForm(){
  eventForm.classList.remove("hidden");
  eDate.value = todayISO();
  eTime.value = "18:00";
  eTitle.value = "";
  eNote.value = "";
}
function closeEventForm(){ eventForm.classList.add("hidden"); }

btnNewEvent?.addEventListener("click", ()=> { setTab("agenda"); openEventForm(); });
btnNewEvent2?.addEventListener("click", openEventForm);
btnCancelEvent?.addEventListener("click", closeEventForm);

eventForm?.addEventListener("submit", (e)=>{
  e.preventDefault();

  const ev = {
    id: uid(),
    date: eDate.value,
    time: eTime.value,
    title: eTitle.value.trim(),
    note: eNote.value.trim()
  };
  if(!ev.title){ toast("Informe um título."); return; }

  currentUser.events.push(ev);
  currentUser.events.sort((a,b)=> (a.date+" "+a.time).localeCompare(b.date+" "+b.time));
  persistUser();

  toast("Evento salvo ✅");
  closeEventForm();
  renderAgenda();
  renderHome();
});

function renderAgenda(){
  eventList.innerHTML = "";
  const items = [...currentUser.events]
    .sort((a,b)=> (a.date+" "+a.time).localeCompare(b.date+" "+b.time));

  if(items.length === 0){
    eventList.innerHTML = `<li class="item"><div class="item__top"><strong>Sem eventos</strong></div><div class="item__meta">Adicione um evento.</div></li>`;
    return;
  }

  for(const ev of items){
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div class="item__top">
        <strong>${escapeHtml(ev.title)}</strong>
        <span class="pill">${fmtDate(ev.date)} • ${escapeHtml(ev.time)}</span>
      </div>
      ${ev.note ? `<div class="item__meta">${escapeHtml(ev.note)}</div>` : ""}
      <div style="margin-top:10px; display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn btn--danger" data-del="${ev.id}">Excluir</button>
      </div>
    `;
    li.querySelector("[data-del]").addEventListener("click", ()=>{
      if(!confirm("Excluir evento?")) return;
      currentUser.events = currentUser.events.filter(x => x.id !== ev.id);
      persistUser();
      toast("Evento excluído.");
      renderAgenda();
      renderHome();
    });
    eventList.appendChild(li);
  }
}

/* Progress */
function openWeightForm(){
  weightForm.classList.remove("hidden");
  pDate.value = todayISO();
  pWeight.value = "";
  pWeight.focus();
}
function closeWeightForm(){ weightForm.classList.add("hidden"); }

btnAddWeight?.addEventListener("click", ()=> { setTab("progress"); openWeightForm(); });
btnNewWeight?.addEventListener("click", openWeightForm);
btnCancelWeight?.addEventListener("click", closeWeightForm);

weightForm?.addEventListener("submit", (e)=>{
  e.preventDefault();

  const date = pDate.value;
  const weight = Number(pWeight.value);

  if(!date || !Number.isFinite(weight) || weight <= 0){
    toast("Informe um peso válido.");
    return;
  }

  currentUser.weights.push({ id: uid(), date, weight });
  currentUser.weights.sort((a,b)=> a.date.localeCompare(b.date));
  persistUser();

  toast("Peso registrado ✅");
  closeWeightForm();
  renderProgress();
  renderHome();
});

function renderProgress(){
  weightList.innerHTML = "";
  const items = [...currentUser.weights].sort((a,b)=> b.date.localeCompare(a.date));

  if(items.length === 0){
    weightList.innerHTML = `<li class="item"><div class="item__top"><strong>Nenhum registro</strong></div><div class="item__meta">Registre seu peso.</div></li>`;
    return;
  }

  for(const w of items){
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div class="item__top">
        <strong>${fmtDate(w.date)}</strong>
        <span class="pill">${w.weight} kg</span>
      </div>
      <div style="margin-top:10px; display:flex; justify-content:flex-end;">
        <button class="btn btn--danger" data-del="${w.id}">Excluir</button>
      </div>
    `;
    li.querySelector("[data-del]").addEventListener("click", ()=>{
      if(!confirm("Excluir registro?")) return;
      currentUser.weights = currentUser.weights.filter(x => x.id !== w.id);
      persistUser();
      toast("Registro removido.");
      renderProgress();
      renderHome();
    });
    weightList.appendChild(li);
  }
}

/* Profile */
function renderProfile(){
  prName.value = currentUser.name;
  prEmail.value = currentUser.email;
  prPlan.value = currentUser.plan;
}

profileForm?.addEventListener("submit", (e)=>{
  e.preventDefault();

  const newName = prName.value.trim();
  const newEmail = prEmail.value.trim();
  const newPlan = prPlan.value;

  const other = users.find(u => u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== currentUser.id);
  if(other){
    toast("Esse e-mail já está em uso.");
    return;
  }

  currentUser.name = newName;
  currentUser.email = newEmail;
  currentUser.plan = newPlan;

  persistUser();
  toast("Perfil atualizado ✅");
  renderHome();
});

btnReset?.addEventListener("click", ()=>{
  if(!confirm("Resetar tudo (apagar dados do portal)?")) return;
  localStorage.removeItem(KEYS.users);
  localStorage.removeItem(KEYS.session);
  toast("Dados apagados. Recarregando...");
  setTimeout(()=> location.reload(), 600);
});

/* Boot */
function boot(){
  applySelectedPlanIfAny();

  if(location.hash === "#plan"){
    toast("Plano selecionado. Faça login ou cadastre-se.");
  }

  if(!session?.userId){
    showAuth();
    return;
  }

  const u = getUserById(session.userId);
  if(!u){
    clearSession();
    showAuth();
    return;
  }

  currentUser = u;
  showPortal();
  setTab("home");
}
boot();
