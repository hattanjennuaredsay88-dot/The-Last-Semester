// Pemutar cutscene: ilustrasi diam (tidak bergeser), ENTER untuk lanjut. Dipakai untuk intro
// dan cutscene naik angkot (lihat Cutscene.ANGKOT). Pergantian gambar memakai pudar silang.
// Gambar tidak diubah sama sekali: hanya diskalakan agar menutup layar.
const Cutscene = (() => {
  // Mimpi Marco: urutan mengikuti aset yang diberikan (kiri ke kanan).
  const DREAM = Array.from({ length: 11 }, (_, i) => "assets/images/cutscenes/dream-" + String(i + 1).padStart(2, "0") + ".webp");
  const INTRO = ["assets/images/cutscenes/cutscene-1.webp", "assets/images/cutscenes/cutscene-2.webp", "assets/images/cutscenes/cutscene-3.webp"];
  // Urutan kanan -> kiri: angkot-cutscene-1 (naik angkot) tampil pertama, angkot-cutscene-7 (potret Marco) terakhir.
  const ANGKOT = Array.from({ length: 7 }, (_, i) => "assets/images/cutscenes/angkot-cutscene-" + (i + 1) + ".webp");
  // Dialog per ilustrasi angkot (indeks sama dengan ANGKOT). Tiap ilustrasi punya satu atau lebih baris;
  // ENTER menampilkan baris berikutnya, lalu lanjut ke ilustrasi berikutnya. thought: true = suara hati Marco.
  // Dialog mimpi Marco. Indeks mengikuti gambar dream-01 sampai dream-11.
  // Gambar 02 sengaja tanpa dialog; ENTER tetap melanjutkan ke gambar berikutnya.
  const DREAM_CAPTIONS = [
    [{ w: "Marco", t: "d-dimana gw??" }],
    [],
    [{ w: "Marco", t: "!!!" }],
    [{ w: "Marco", t: "L-Lohh !?" }],
    [{ w: "Marco", t: "B-BENTAR!" }],
    [{ w: "Marco", t: "K-Kalian bukannya..." }],
    [{ w: "Marco (Miliarder)", t: "Gue itu lu! versi terbaik tentunya!" }],
    [{ w: "Marco (Miskin)", t: "Ini hasil dari kebandelan lu ... Marco" }],
    [{ w: "Marco (Karyawan)", t: "Kenapa sih ... lu langsung puas karna dapetin itu?" }],
    [{ w: "Marco", t: "S-Siapa sebenarnya kalian..?" }],
    [{ w: "Ketiga Marco", t: "Kita itu Lu! dan ini yang akan lu alami nanti ... Marco!" }]
  ];
  const ANGKOT_CAPTIONS = [
    [],
    [{ w: "Evelyn", t: "Marco... boleh tanya sesuatu?" }],
    [{ w: "Evelyn", t: "Setelah lulus nanti, gimana? Kamu sudah kepikiran mau ke mana?" }],
    [{ w: "Marco", t: "Hmm... jujur, belum tahu pasti. Mungkin kuliah yang dekat-dekat sini, sambil bantu Nenek. Yang penting jalan dulu." }],
    [{ w: "Evelyn", t: "Hehe, jawabanmu jujur banget. Tapi aku suka. Aku juga belum tahu pasti, kok." }],
    [{ w: "Marco", t: "Kalau begitu, kita cari tahu pelan-pelan. Sama-sama." }],
    [{ thought: true, t: "Mungkin... kamu masa depanku." }]
  ];
  const SLIDE_MS = 1100, FADE_MS = 800, ENTER_LOCK_MS = 700;
  const easeSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const easeCubic = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function play(onDone, opts) {
    opts = opts || {};
    const SCENES = opts.scenes || INTRO;
    // Beri tahu aplikasi bahwa cutscene ini sudah dilihat (dipakai untuk membuka galeri Cutscene).
    dispatchEvent(new CustomEvent("tls:cutscene", { detail: opts.id || "intro" }));
    const root = document.createElement("div");
    root.id = "cutscene";
    root.innerHTML = '<div class="cs-stage"></div><div class="cs-caption" aria-live="polite"></div><div class="cs-prompt" aria-live="polite">Tekan <b>ENTER</b> untuk melanjutkan</div><div class="cs-dots"></div>';
    document.body.appendChild(root);
    const stage = root.querySelector(".cs-stage"), prompt = root.querySelector(".cs-prompt"), capEl = root.querySelector(".cs-caption"), dots = root.querySelector(".cs-dots");
    SCENES.forEach(() => dots.appendChild(document.createElement("i")));
    const CAPS = opts.captions || (SCENES === ANGKOT ? ANGKOT_CAPTIONS : (SCENES === DREAM ? DREAM_CAPTIONS : null));
    let capIdx = 0;
    function renderCaption() {
      const line = CAPS && CAPS[cur] && CAPS[cur][capIdx];
      capEl.classList.remove("on", "thought");
      if (!line) { capEl.textContent = ""; return; }
      capEl.textContent = "";
      if (line.w) { const b = document.createElement("b"); b.textContent = line.w; capEl.appendChild(b); }
      const s = document.createElement("span"); s.textContent = line.thought ? "( " + line.t + " )" : line.t; capEl.appendChild(s);
      if (line.thought) capEl.classList.add("thought");
      void capEl.offsetWidth; capEl.classList.add("on");
    }

    // Muat semua gambar lebih dulu supaya perpindahan tidak tersendat.
    const imgs = SCENES.map((src) => { const im = new Image(); im.decoding = "async"; im.src = src; return im; });
    const ready = Promise.all(imgs.map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve())));

    let cur = -1, layers = [], vw = innerWidth, vh = innerHeight, startAt = 0, finished = false, fade = null, trans = null, promptAt = 0;

    function metrics(im) {
      // Skala agar gambar menutup layar (cover). Gambar diam di tempat: tidak ada geseran sama sekali.
      const s = Math.max(vh / im.naturalHeight, vw / im.naturalWidth);
      return { w: im.naturalWidth * s, h: im.naturalHeight * s };
    }
    function addLayer(i) {
      const box = document.createElement("div"); box.className = "cs-layer";
      const el = imgs[i].cloneNode(); el.draggable = false; box.appendChild(el); stage.appendChild(box);
      const L = { box, el, i, at: performance.now(), frozen: 0 };
      layers.push(L); return L;
    }
    function layout(L, now) {
      const m = metrics(imgs[L.i]);
      L.el.style.width = m.w + "px"; L.el.style.height = m.h + "px";
      L.el.style.transform = "translate3d(" + (-(m.w - vw) / 2) + "px," + (-(m.h - vh) * 0.4) + "px,0)";
    }
    function show(i) {
      const L = addLayer(i), prev = layers.length > 1 ? layers[layers.length - 2] : null;
      cur = i; capIdx = 0; renderCaption();
      [...dots.children].forEach((d, k) => d.classList.toggle("on", k <= i));
      prompt.classList.remove("on"); promptAt = performance.now() + 1500;
      // Pergantian gambar memakai pudar silang (crossfade), bukan geseran.
      if (prev) { L.box.style.opacity = "0"; trans = { from: prev, to: L, at: performance.now() }; }
      else trans = null;
    }
    function next() {
      if (finished || fade || trans || cur < 0) return;
      if (CAPS && CAPS[cur] && capIdx + 1 < CAPS[cur].length) { capIdx++; renderCaption(); return; }
      if (cur + 1 < SCENES.length) show(cur + 1);
      else { fade = { at: performance.now() }; prompt.classList.remove("on"); capEl.classList.remove("on"); }
    }
    function end() {
      finished = true;
      removeEventListener("keydown", onKey, true); removeEventListener("resize", onResize);
      root.remove(); onDone();
    }
    const unlockAt = performance.now() + ENTER_LOCK_MS;
    function onKey(e) {
      if (e.key !== "Enter") return;
      e.preventDefault(); e.stopPropagation();
      if (e.repeat || performance.now() < unlockAt) return;   // Enter dari klik tombol "Mulai" tidak ikut dihitung
      next();
    }
    const onResize = () => { vw = innerWidth; vh = innerHeight; };
    addEventListener("keydown", onKey, true); addEventListener("resize", onResize);
    root.addEventListener("click", () => { if (performance.now() >= unlockAt) next(); });

    function frame(now) {
      if (finished) return;
      if (trans) {
        const k = easeCubic(clamp01((now - trans.at) / SLIDE_MS));
        // Gambar baru memudar masuk di atas gambar lama; tidak ada yang bergeser.
        trans.to.box.style.opacity = String(k);
        if (k >= 1) {
          trans.from.box.remove(); layers = layers.filter((l) => l !== trans.from);
          trans.to.box.style.opacity = "1"; trans = null;
        }
      }
      layers.forEach((L) => layout(L, now));
      if (!trans && !fade && promptAt && now >= promptAt) prompt.classList.add("on");
      if (fade) {
        const k = clamp01((now - fade.at) / FADE_MS);
        root.style.opacity = String(1 - k);
        if (k >= 1) return end();
      }
      requestAnimationFrame(frame);
    }
    ready.then(() => { startAt = performance.now(); show(0); requestAnimationFrame(frame); });
  }
  return { play, DREAM, INTRO, ANGKOT };
})();
