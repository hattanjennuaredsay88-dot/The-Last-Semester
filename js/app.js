// Navigasi antar halaman: beranda, popup, dashboard, game.
const $ = (id) => document.getElementById(id);

// Musik menu dan kontrol volume global. Audio dimulai setelah interaksi pengguna.
const audioToggle = $("audioToggle"), audioVolume = $("audioVolume");
if (window.TLSAudio) TLSAudio.menu();
audioToggle.onclick = () => {
  const on = TLSAudio.toggle();
  audioToggle.textContent = on ? "♫" : "×";
  audioToggle.setAttribute("aria-label", on ? "Mute audio" : "Nyalakan audio");
};
audioVolume.oninput = () => TLSAudio.setVolume(audioVolume.value);

let mode = "login";
let currentSlot = 0;

// Beranda berbeda sesuai status login: tamu melihat Login/Register/How to Play/Credit,
// pemain yang sudah login melihat Lanjutkan/Logout/Achievement/Cutscene.
function renderHome() {
  const user = Store.currentUser();
  $("navGuest").hidden = !!user; $("navUser").hidden = !user;
  $("homeInfo").classList.remove("err");
  $("homeInfo").textContent = user ? "Masuk sebagai " + user : "";
}

function show(id) {
  if (id === "home") renderHome();
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  if (id !== "game" && window.TLSAudio) { TLSAudio.pause(false); TLSAudio.setScene("menu"); }
}

const ICON_LOGIN = '<path class="dim" d="M3 2h6v12H3z"/><path d="M9 2h3v11H9z"/><rect class="cut" x="10" y="7" width="1" height="2"/><rect x="2" y="14" width="12" height="1"/>';
const ICON_REGISTER = '<path d="M2 1h7l3 3v6H2z"/><rect class="cut" x="5" y="3" width="3" height="3"/><rect class="cut" x="4" y="7" width="5" height="2"/><rect x="11" y="9" width="2" height="6"/><rect x="9" y="11" width="6" height="2"/>';

function openModal(m) {
  mode = m;
  $("mTitle").textContent = m === "register" ? "Daftar Akun" : "Login";
  $("mSub").textContent = m === "register" ? "Mulai bab baru dalam perjalanan ini." : "Masuk ke dunia mimpi yang belum usai.";
  $("mIcon").innerHTML = m === "register" ? ICON_REGISTER : ICON_LOGIN;
  $("fPass").autocomplete = m === "register" ? "new-password" : "current-password";
  $("rowPass2").hidden = m !== "register";
  $("mMsg").textContent = "";
  $("authForm").reset();
  $("modal").hidden = false;
  $("fUser").focus();
}

function setMsg(el, res) {
  el.textContent = res.msg;
  el.classList.toggle("err", !res.ok);
}

$("btnRegister").onclick = () => openModal("register");
$("btnLogin").onclick = () => (Store.currentUser() ? openDashboard() : openModal("login"));
$("mClose").onclick = () => ($("modal").hidden = true);

$("authForm").onsubmit = (e) => {
  e.preventDefault();
  const user = $("fUser").value, pass = $("fPass").value;
  if (mode === "register") {
    const res = Store.register(user, pass, $("fPass2").value);
    setMsg($("mMsg"), res);
    if (res.ok) setTimeout(() => openModal("login"), 900);
  } else {
    const res = Store.login(user, pass);
    setMsg($("mMsg"), res);
    if (res.ok) setTimeout(() => { $("modal").hidden = true; openDashboard(); }, 600);
  }
};

// How to Play dan Credit: popup informasi, ditutup lewat tombol Tutup, Esc, atau klik di luar kartu.
const infoModals = [$("howModal"), $("creditModal"), $("achModal"), $("csModal")];
const closeInfo = () => infoModals.forEach((m) => (m.hidden = true));
$("btnHowTo").onclick = () => { $("howModal").hidden = false; $("howModal").querySelector("[data-close]").focus(); };
$("btnCredit").onclick = () => { $("creditModal").hidden = false; $("creditModal").querySelector("[data-close]").focus(); };
infoModals.forEach((m) => {
  m.querySelectorAll("[data-close]").forEach((b) => (b.onclick = closeInfo));
  m.addEventListener("mousedown", (e) => { if (e.target === m) closeInfo(); });
});
addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (infoModals.some((m) => !m.hidden)) closeInfo();
  else if (!$("modal").hidden) $("modal").hidden = true;
});

function openDashboard() {
  const user = Store.currentUser();
  if (!user) return show("home");
  $("dashUser").textContent = user;
  const saves = Store.saves(user);
  const played = saves.filter(Boolean).length;
  $("dashSummary").textContent = played
    ? played + " slot terpakai. Pilih slot untuk melanjutkan."
    : "Belum ada save. Pilih slot kosong untuk mulai dari awal.";
  $("slots").innerHTML = "";
  saves.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "slot" + (s ? " used" : "");
    row.innerHTML = '<span class="no">' + String(i + 1).padStart(2, "0") + '</span>' +
      '<span class="meta"><b>Slot ' + (i + 1) + '</b><small></small></span>';
    row.querySelector("small").textContent = s ? "Hari " + s.state.day + " \u00b7 " + s.savedAt : "Kosong \u00b7 belum ada cerita";
    const b = document.createElement("button");
    b.type = "button"; b.className = "hb sm" + (s ? "" : " alt");
    b.innerHTML = '<span class="frame"></span><span class="tx"><b></b></span>';
    b.querySelector("b").textContent = s ? "Lanjut" : "Mulai";
    b.onclick = () => startGame(i, s && s.state);
    row.appendChild(b);
    $("slots").appendChild(row);
  });
  show("dashboard");
}

function startGame(slot, state) {
  currentSlot = slot;
  // Tutorial "???" hanya untuk game pertama di akun yang belum pernah bermain. Slot lain di akun yang sama tidak mengulangnya;
  // bila tutorial belum selesai, ia tetap berlanjut dari save slot tempat ia dimulai.
  const user = Store.currentUser();
  let tutorial = false;
  if (!state || state.done) {
    const m = Store.meta(user);
    if (!m.tutorial && Store.saves(user).every((sv) => !sv)) { tutorial = true; m.tutorial = true; Store.saveMeta(user, m); }
  }
  show("game");
  Game.start(state, {
    tutorial,
    save: (st) => { Store.saveSlot(Store.currentUser(), currentSlot, st); unlock(Achievements.check(st), true); },
    exit: () => openDashboard()
  });
}

$("btnBack").onclick = () => show("home");   // tetap login, hanya kembali ke beranda
const doLogout = () => { Store.logout(); closeInfo(); show("home"); };
$("btnLogout").onclick = doLogout;
$("btnLogoutDash").onclick = doLogout;
$("btnContinue").onclick = openDashboard;
$("pResume").onclick = () => Game.togglePause(false);
$("pSave").onclick = () => Game.saveNow();
$("pHome").onclick = () => Game.quit();

// Simpan otomatis kalau tab ditutup saat sedang main.
window.addEventListener("beforeunload", () => Game.autosave());

// Kalau sesi masih ada setelah reload, langsung ke dashboard.
if (Store.currentUser()) openDashboard();


// ---------- Achievement & galeri Cutscene ----------
let toastTimer = 0;
function toast(text) {
  const t = $("toast"); t.textContent = text; t.hidden = false;
  t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3800);
}

// Simpan achievement baru ke akun yang sedang login. announce: tampilkan toast untuk yang baru terbuka.
function unlock(ids, announce) {
  const user = Store.currentUser(); if (!user) return;
  const m = Store.meta(user); let fresh = [];
  ids.forEach((id) => { if (!m.ach[id]) { m.ach[id] = Date.now(); fresh.push(id); } });
  if (!fresh.length) return;
  Store.saveMeta(user, m);
  if (announce) {
    // "Semester Dimulai" tidak perlu diumumkan bersama yang lain pada save pertama.
    const shown = fresh.filter((id) => id !== "start" || fresh.length === 1);
    const names = shown.map((id) => Achievements.LIST.find((a) => a.id === id).t);
    if (names.length) toast("Achievement: " + names.slice(0, 2).join(", ") + (names.length > 2 ? " +" + (names.length - 2) : ""));
  }
}

// Cutscene yang diputar dicatat supaya muncul di galeri.
addEventListener("tls:cutscene", (e) => {
  const user = Store.currentUser(); if (!user || !e.detail || e.detail === "replay") return;
  const m = Store.meta(user); if (m.cs[e.detail]) return;
  m.cs[e.detail] = true; Store.saveMeta(user, m);
});

function allStates(user) { return Store.saves(user).filter(Boolean).map((x) => x.state); }

function row(badge, title, sub, extra, used) {
  const r = document.createElement("div"); r.className = "slot" + (used ? " used" : "");
  const no = document.createElement("span"); no.className = "no"; if (typeof badge === "string") no.textContent = badge; else { no.classList.add("thumb"); no.appendChild(badge); }
  const meta = document.createElement("span"); meta.className = "meta";
  const b = document.createElement("b"); b.textContent = title; const sm = document.createElement("small"); sm.textContent = sub;
  meta.append(b, sm); r.append(no, meta); if (extra) r.appendChild(extra);
  return r;
}

function openAchievements() {
  const user = Store.currentUser(); if (!user) return;
  // Save yang sudah ada sebelum fitur ini dibuat ikut dihitung.
  allStates(user).forEach((st) => unlock(Achievements.check(st), false));
  const m = Store.meta(user), list = $("achList");
  list.innerHTML = "";
  const got = Achievements.LIST.filter((a) => m.ach[a.id]).length;
  $("achSub").textContent = got + " dari " + Achievements.LIST.length + " terbuka";
  Achievements.LIST.forEach((a) => {
    const on = !!m.ach[a.id], r = row(on ? "\u2605" : "?", on ? a.t : "Terkunci", a.d, null, on);
    if (!on) r.classList.add("locked");
    list.appendChild(r);
  });
  $("achModal").hidden = false; $("achModal").querySelector("[data-close]").focus();
}

const CUTSCENES = [
  { id: "intro", t: "Pembuka", sub: "Malam, pagi, lalu terbangun.", scenes: () => Cutscene.INTRO, opts: {} },
  { id: "angkot", t: "Naik Angkot", sub: "Perjalanan pagi bersama Evelyn.", scenes: () => Cutscene.ANGKOT, opts: { id: "angkot", rtl: true } }
];

function openCutscenes() {
  const user = Store.currentUser(); if (!user) return;
  const m = Store.meta(user), states = allStates(user);
  // Cutscene dianggap sudah dilihat jika ada save yang melewatinya.
  if (states.length) m.cs.intro = true;
  if (states.some((s) => s.q && s.q.flags && s.q.flags.angkotBoarded)) m.cs.angkot = true;
  Store.saveMeta(user, m);
  const list = $("csList"); list.innerHTML = "";
  const seen = CUTSCENES.filter((c) => m.cs[c.id]).length;
  $("csSub").textContent = seen + " dari " + CUTSCENES.length + " cutscene terbuka";
  CUTSCENES.forEach((c) => {
    const on = !!m.cs[c.id], scenes = c.scenes();
    let thumb;
    if (on) { thumb = new Image(); thumb.src = scenes[0]; thumb.alt = ""; } else thumb = "?";
    let btn = null;
    if (on) {
      btn = document.createElement("button"); btn.type = "button"; btn.className = "hb sm";
      btn.innerHTML = '<span class="frame"></span><span class="tx"><b>Putar</b></span>';
      btn.onclick = () => { closeInfo(); Cutscene.play(openCutscenes, Object.assign({ scenes }, c.opts, { id: "replay" })); };
    }
    const r = row(thumb, on ? c.t : "Terkunci", on ? c.sub + " \u00b7 " + scenes.length + " adegan" : "Mainkan game untuk membukanya.", btn, on);
    if (!on) r.classList.add("locked");
    list.appendChild(r);
  });
  $("csModal").hidden = false; $("csModal").querySelector("[data-close], .hb").focus();
}

$("btnAch").onclick = openAchievements;
$("btnCutscene").onclick = openCutscenes;

// Sesi lama masih aktif, atau beranda dibuka pertama kali.
renderHome();
