// Dunia The Last Semester: peta, dekorasi, cahaya, dan animasi lingkungan.
// Semua gambar dibuat dari kode (fillRect dan bentuk piksel), tanpa spritesheet.
const World = (() => {
  const TS = 16;
  const T = { GRASS: 0, ROAD: 1, WALL: 2, TREE: 3, FLOOR: 4, DOOR: 5, PATH: 6, BED: 7, DESK: 8, WATER: 9, FENCE: 10,
    PADDY: 11, RUG: 12, SHELF: 13, KITCHEN: 14, BOARD: 15, PLANT: 16, POST: 17, BENCH: 18, GARDEN: 19, TEACHER: 20,
    ARCH: 21, TOILET: 22, SINK: 23, TUB: 24, FRIDGE: 25, TABLE: 26, WARDROBE: 27, SOFA: 28, BEDN: 29, TV: 30, CUPBOARD: 31, STAIR: 32, HOOP: 33, BLEACH: 34, IDOOR: 35 };
  // Ruangan yang sudah dipoles dengan gaya baru (garis tepi, bayangan jatuh, ambient occlusion, palet ungu senja).
  // Untuk memoles ruangan lain (sekolah, gym) cukup tambahkan namanya di sini, mis. class: true.
  const POLISH = { home: true, world: true, class: true, house: true };
  const SOLID = {};
  [2, 3, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35].forEach((k) => (SOLID[k] = 1));

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = (i, j, s) => ((i * 73856093) ^ (j * 19349663) ^ ((s || 0) * 83492791)) >>> 0;
  const sh = (hex, d) => {
    const n = parseInt(hex.slice(1), 16), f = (v) => clamp(v + d, 0, 255);
    return "rgb(" + f(n >> 16) + "," + f((n >> 8) & 255) + "," + f(n & 255) + ")";
  };
  const pen = (c) => (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const disc = (c, cx, cy, r, col) => {
    c.fillStyle = col;
    for (let d = -r; d <= r; d++) { const w = Math.floor(Math.sqrt(r * r - d * d + r * 0.5)); c.fillRect(Math.round(cx) - w, Math.round(cy) + d, w * 2 + 1, 1); }
  };

  // ---------- peta ----------
  const makeMap = (w, h, fill) => ({ w, h, t: Array.from({ length: h }, () => Array(w).fill(fill)) });
  const rect = (m, t, x, y, w, h) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (m.t[j] && m.t[j][i] !== undefined) m.t[j][i] = t;
  };
  const props = {};
  const post = (m, i, j, kind) => { m.t[j][i] = T.POST; props[i + "," + j] = kind; };

  const buildings = [
    { x: 6, y: 7, w: 8, h: 6, kind: "house", roof: "#b5523b", wall: "#ead8b4", door: 9, name: "RUMAH NENEK", fh: 40, wins: [] },
    { x: 15, y: 7, w: 6, h: 6, kind: "house", roof: "#8e6bb0", wall: "#e9d8e8", door: 17, name: "RUMAH EVELYN", fh: 40, wins: [] },
    { x: 105, y: 2, w: 19, h: 10, kind: "school", roof: "#3f6aa3", wall: "#f1e8d4", door: 114, name: "SMA NUSA", fh: 120, wins: [] },
    { x: 8, y: 23, w: 6, h: 3, kind: "shop", roof: "#2f8a5b", wall: "#f3e0b5", door: -1, name: "WARUNG", fh: 30, wins: [] },
    { x: 15, y: 22, w: 2, h: 10, kind: "row", roof: "#8f6b55", wall: "#c98f72", door: -1, fh: 18, wins: [] },
    { x: 19, y: 22, w: 2, h: 10, kind: "row", roof: "#7a8a96", wall: "#b8a07a", door: -1, fh: 18, wins: [] },
    { x: 52, y: 6, w: 7, h: 6, kind: "house", roof: "#4f8b78", wall: "#e4d9b9", door: 55, name: "RUMAH PAK RT", fh: 40, wins: [] },
    { x: 62, y: 6, w: 7, h: 6, kind: "house", roof: "#c18a48", wall: "#ead7bd", door: 65, name: "RUMAH KELUARGA", fh: 40, wins: [] },
    { x: 79, y: 7, w: 7, h: 6, kind: "house", roof: "#6686a8", wall: "#e7dfd0", door: 82, name: "RUMAH BIRU", fh: 40, wins: [] },
    { x: 89, y: 7, w: 7, h: 6, kind: "house", roof: "#b56c62", wall: "#e8d4bd", door: 92, name: "RUMAH MERAH", fh: 40, wins: [] },
    { x: 5, y: 38, w: 7, h: 6, kind: "house", roof: "#9a7958", wall: "#e9d9bd", door: 8, name: "RUMAH BU WARTI", fh: 40, wins: [] },
    { x: 14, y: 38, w: 7, h: 6, kind: "house", roof: "#7d9a72", wall: "#e7dfc8", door: 17, name: "RUMAH PAK HAJI", fh: 40, wins: [] },
    { x: 31, y: 38, w: 7, h: 6, kind: "house", roof: "#9b6b8d", wall: "#e8d6cf", door: 34, name: "RUMAH KECIL", fh: 40, wins: [] },
    { x: 42, y: 38, w: 7, h: 6, kind: "house", roof: "#6f8c9a", wall: "#e4ddc8", door: 45, name: "RUMAH SAWAH", fh: 40, wins: [] },
    { x: 79, y: 38, w: 7, h: 6, kind: "house", roof: "#b18a58", wall: "#eadcc4", door: 82, name: "RUMAH TAMAN", fh: 40, wins: [] },
    { x: 89, y: 38, w: 7, h: 6, kind: "house", roof: "#8a759e", wall: "#e5d9e8", door: 92, name: "RUMAH UNGU", fh: 40, wins: [] },
    { x: 53, y: 60, w: 7, h: 6, kind: "house", roof: "#bd795d", wall: "#e9d8c1", door: 56, name: "RUMAH PINGGIR SUNGAI", fh: 40, wins: [] },
    { x: 64, y: 60, w: 7, h: 6, kind: "house", roof: "#648b9b", wall: "#e3ddce", door: 67, name: "RUMAH NELAYAN", fh: 40, wins: [] },
    { x: 80, y: 60, w: 7, h: 6, kind: "house", roof: "#8b9b68", wall: "#e8dfc8", door: 83, name: "RUMAH KEBUN", fh: 40, wins: [] },
    // Distrik elite: rumah besar, vila berpagar, dan kompleks apartemen.
    { x: 166, y: 8, w: 12, h: 9, kind: "house", roof: "#596f9e", wall: "#eee7d7", door: 171, name: "VILA KELUARGA ADIPRAJA", fh: 58, wins: [] },
    { x: 184, y: 8, w: 12, h: 9, kind: "house", roof: "#a58a57", wall: "#f4e9d2", door: 189, name: "RUMAH BESAR", fh: 58, wins: [] },
    { x: 204, y: 8, w: 17, h: 10, kind: "shop", roof: "#687b9f", wall: "#e9e1d5", door: -1, name: "GALERI KOTA", fh: 56, wins: [] },
    { x: 166, y: 30, w: 11, h: 8, kind: "house", roof: "#7f9d9b", wall: "#f0e9dc", door: 171, name: "RUMAH KACA", fh: 52, wins: [] },
    { x: 188, y: 30, w: 13, h: 8, kind: "house", roof: "#8b759e", wall: "#eee4e8", door: 194, name: "VILA TAMAN", fh: 52, wins: [] },
    // Distrik padat: kontrakan, rumah petak, bengkel, dan kios kecil.
    { x: 8, y: 96, w: 8, h: 6, kind: "row", roof: "#9b6550", wall: "#c99a78", door: -1, fh: 22, wins: [] },
    { x: 20, y: 96, w: 8, h: 6, kind: "row", roof: "#697d89", wall: "#b9a18a", door: -1, fh: 22, wins: [] },
    { x: 34, y: 96, w: 9, h: 7, kind: "shop", roof: "#3f8b65", wall: "#d9c29d", door: -1, name: "BENGKEL UJANG", fh: 28, wins: [] },
    { x: 8, y: 116, w: 8, h: 6, kind: "row", roof: "#a45e53", wall: "#c7a58a", door: -1, fh: 22, wins: [] },
    { x: 22, y: 116, w: 8, h: 6, kind: "row", roof: "#777f91", wall: "#c6b49b", door: -1, fh: 22, wins: [] },
    { x: 39, y: 116, w: 9, h: 7, kind: "house", roof: "#8a765f", wall: "#d0b99b", door: 43, name: "KONTRAKAN BU TINI", fh: 25, wins: [] },
    { x: 61, y: 96, w: 9, h: 7, kind: "shop", roof: "#b16a4b", wall: "#d8c19c", door: -1, name: "WARUNG UJUNG GANG", fh: 28, wins: [] },
    { x: 62, y: 117, w: 10, h: 7, kind: "house", roof: "#647f73", wall: "#d2c4a7", door: 66, name: "RUMAH KELUARGA KECIL", fh: 25, wins: [] },
    // Distrik malam: ruko, pasar malam, panggung musik, dan kedai.
    { x: 166, y: 96, w: 12, h: 8, kind: "shop", roof: "#533c70", wall: "#b9a0bd", door: -1, name: "PASAR MALAM", fh: 38, wins: [] },
    { x: 184, y: 96, w: 10, h: 8, kind: "shop", roof: "#9b4968", wall: "#d0a0a8", door: -1, name: "KEDAI LENTERA", fh: 34, wins: [] },
    { x: 202, y: 96, w: 13, h: 8, kind: "shop", roof: "#3e5c83", wall: "#b9bdcb", door: -1, name: "ARCADE 88", fh: 34, wins: [] },
    { x: 166, y: 119, w: 12, h: 8, kind: "shop", roof: "#7d4c78", wall: "#c9a6bd", door: -1, name: "PANGGUNG KECIL", fh: 36, wins: [] },
    { x: 188, y: 119, w: 12, h: 8, kind: "shop", roof: "#a05b4c", wall: "#d5b29c", door: -1, name: "KEDAI SUDUT", fh: 32, wins: [] },
    { x: 209, y: 119, w: 12, h: 8, kind: "shop", roof: "#495b7c", wall: "#b7bac8", door: -1, name: "TOKO MUSIK", fh: 32, wins: [] }
  ];

  // Semua bangunan memiliki pintu fisik. Bangunan yang sebelumnya hanya dekorasi
  // diberi posisi pintu di tengah fasad agar bisa dikenali dan diinteraksi.
  buildings.forEach((b) => {
    if (b.door == null || b.door < 0) b.door = b.x + Math.floor(b.w / 2);
    if (!b.name) b.name = b.kind === "row" ? "RUMAH PETAK" : "TOKO WARGA";
  });

  function buildWorld() {
    const m = makeMap(240, 160, T.GRASS);
    // Jaringan jalan utama menghubungkan lima distrik dalam satu peta yang saling tersambung.
    [17, 49, 88, 128].forEach((y) => { rect(m, T.PATH, 0, y, 240, 1); rect(m, T.ROAD, 0, y + 1, 240, 3); rect(m, T.PATH, 0, y + 4, 240, 1); });
    [22, 72, 120, 160, 205].forEach((x) => { rect(m, T.PATH, x - 1, 0, 1, 160); rect(m, T.ROAD, x, 0, 2, 160); rect(m, T.PATH, x + 2, 0, 1, 160); });
    rect(m, T.PATH, 0, 34, 150, 1); rect(m, T.ROAD, 0, 35, 150, 1); rect(m, T.PATH, 0, 36, 150, 1);
    // Jalan lingkungan dan gang penghubung di tiap kawasan.
    [[8,27,18,1],[8,27,1,18],[30,34,20,1],[78,34,20,1],[151,24,30,1],[151,45,30,1],[166,68,45,1],[12,105,64,1],[12,140,64,1],[151,105,72,1],[151,140,72,1],[95,72,1,45],[135,58,1,70]].forEach(a => rect(m,T.PATH,a[0],a[1],a[2],a[3]));
    for (let j = 2; j < 10; j++) for (let i = 14; i < 22; i++) {
      if (Math.pow((i - 17.5) / 3.4, 2) + Math.pow((j - 5.5) / 3.2, 2) < 1) m.t[j][i] = T.WATER;   // kolam
    }
    rect(m, T.PADDY, 26, 24, 22, 8);
    rect(m, T.PADDY, 28, 57, 18, 12);
    // Ruang terbuka distrik elit dan plaza distrik malam.
    rect(m, T.GARDEN, 180, 56, 28, 10); rect(m, T.WATER, 190, 59, 5, 5);
    rect(m, T.PATH, 164, 108, 62, 25); rect(m, T.GARDEN, 174, 109, 8, 7);
    rect(m, T.BENCH, 177, 113, 2, 1); rect(m, T.BENCH, 181, 113, 2, 1);
    // Lapangan kecil di distrik padat.
    rect(m, T.GARDEN, 48, 111, 10, 10); rect(m, T.BENCH, 51, 115, 2, 1);
    rect(m, T.GARDEN, 2, 8, 4, 4);
    for (let j = 29; j < 44; j++) for (let i = 55; i < 69; i++) {
      if (Math.pow((i - 62) / 6.2, 2) + Math.pow((j - 36) / 6.8, 2) < 1) m.t[j][i] = T.WATER;
    }
    rect(m, T.GARDEN, 76, 25, 17, 8);
    rect(m, T.BENCH, 82, 28, 2, 1); rect(m, T.BENCH, 88, 30, 2, 1);
    rect(m, T.PATH, 15, 13, 6, 4); rect(m, T.PATH, 50, 12, 1, 6); rect(m, T.PATH, 60, 12, 1, 6);
    rect(m, T.PATH, 78, 13, 20, 3); rect(m, T.PATH, 4, 27, 18, 1);
    rect(m, T.PATH, 4, 27, 1, 11); rect(m, T.PATH, 14, 27, 1, 11);
    rect(m, T.PATH, 30, 34, 20, 1); rect(m, T.PATH, 30, 34, 1, 4); rect(m, T.PATH, 42, 34, 1, 4);
    rect(m, T.PATH, 78, 34, 20, 1); rect(m, T.PATH, 78, 34, 1, 4); rect(m, T.PATH, 89, 34, 1, 4);
    rect(m, T.PATH, 52, 53, 1, 7); rect(m, T.PATH, 64, 53, 1, 7); rect(m, T.PATH, 80, 53, 1, 7);
    buildings.forEach((b) => rect(m, T.WALL, b.x, b.y, b.w, b.h));
    buildings.forEach((b) => { if (b.kind !== "school") m.t[b.y + b.h - 1][b.door] = T.DOOR; });
    rect(m, T.DOOR, 9, 12, 1, 1); rect(m, T.PATH, 9, 13, 1, 4);
    rect(m, T.DOOR, 114, 11, 1, 1); rect(m, T.PATH, 106, 12, 17, 4); rect(m, T.PATH, 114, 16, 1, 1);
    rect(m, T.PATH, 124, 3, 5, 4);          // parkiran motor di samping sekolah
    rect(m, T.PATH, 10, 14, 6, 3); rect(m, T.PATH, 109, 16, 11, 3);
    post(m, 12, 15, "halte"); post(m, 116, 17, "halte");   // halte SMA digeser ke timur (dekat celah gerbang di x=114)
    // Papan penunjuk distrik di persimpangan utama.
    post(m, 151, 18, "district:ELIT"); post(m, 12, 91, "district:PADAT"); post(m, 166, 91, "district:MALAM"); post(m, 123, 91, "district:KOTA");
    // Halte dan titik angkot tambahan di pusat kota serta distrik malam.
    post(m, 124, 89, "halte"); post(m, 202, 130, "halte");
    [[158,20],[211,20],[157,73],[214,73],[14,108],[72,108],[14,145],[70,145],[170,108],[218,108],[170,145],[218,145],[125,75],[125,120]].forEach(a => post(m,a[0],a[1],"lamp"));
    rect(m, T.PATH, 17, 22, 2, 10);
    rect(m, T.FENCE, 105, 16, 9, 1); rect(m, T.FENCE, 115, 16, 9, 1); rect(m, T.FENCE, 105, 12, 1, 4); rect(m, T.FENCE, 123, 12, 1, 4);
    rect(m, T.TREE, 0, 0, 240, 1); rect(m, T.TREE, 0, 159, 240, 1); rect(m, T.TREE, 0, 0, 1, 160); rect(m, T.TREE, 239, 0, 1, 160);
    [[4, 16], [12, 16], [44, 16], [4, 22], [30, 22], [44, 22]].forEach((p) => post(m, p[0], p[1], "lamp"));
    post(m, 21, 15, "signal"); post(m, 30, 13, "flag"); [[45, 4], [47, 4], [45, 6], [47, 6], [48, 5]].forEach((b, k) => post(m, b[0], b[1], "bike" + (k % 3))); post(m, 36, 27, "scarecrow"); post(m, 12, 27, "parasol");
    rect(m, T.BENCH, 44, 9, 2, 1);
    let seed = 7;
    for (let n = 0; n < 2600; n++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const x = 1 + (seed % 238), y = 1 + ((seed >> 8) % 158);
      let ok = true;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const v = m.t[y + j] && m.t[y + j][x + i]; if (v !== T.GRASS && v !== T.TREE) ok = false; }
      if (ok) m.t[y][x] = T.TREE;
    }
    return m;
  }

  function buildRoom(w, h, doorX, theme, windows) {
    const m = makeMap(w, h, T.FLOOR);
    rect(m, T.WALL, 0, 0, w, 1); rect(m, T.WALL, 0, 0, 1, h); rect(m, T.WALL, w - 1, 0, 1, h); rect(m, T.WALL, 0, h - 1, w, 1);
    if (doorX != null) m.t[h - 1][doorX] = T.DOOR;
    m.theme = theme; m.windows = windows;
    return m;
  }
  const maps = {
    world: buildWorld(),
    home: buildRoom(24, 14, 11, { name: "home", floor: "#c9a07a", floor2: "#b48a66", wall: "#ddd2e4", wain: "#7f739f", rug: ["#4a2f66", "#7a56a6", "#f0cfa0"] }, [3, 12, 20])
  };
  // Denah rumah Nenek (24x14 tile). Atas: kamar Marco | kamar Nenek | kamar mandi. Bawah: ruang tengah | dapur.
  const zones = [
    { name: "Kamar Marco", x: 1, y: 1, w: 7, h: 6, kind: "wood", a: "#cfa47c", b: "#b58b66" },
    { name: "Kamar Nenek", x: 9, y: 1, w: 7, h: 6, kind: "wood", a: "#c79a78", b: "#ae8362" },
    { name: "Kamar Mandi", x: 17, y: 1, w: 6, h: 6, kind: "tile", a: "#d6e6f0", b: "#a8c4d8" },
    { name: "Ruang Tengah", x: 1, y: 8, w: 12, h: 5, kind: "wood", a: "#cfa47c", b: "#b58b66" },
    { name: "Dapur", x: 14, y: 8, w: 9, h: 5, kind: "tile", a: "#e4d8c8", b: "#c6b49a" }
  ];
  const zoneIn = (m, i, j) => (m && m.zones ? m.zones.find((z) => i >= z.x && i < z.x + z.w && j >= z.y && j < z.y + z.h) : null);
  const zoneAt = (name, i, j) => (name === "home" ? zones.find((z) => i >= z.x && i < z.x + z.w && j >= z.y && j < z.y + z.h) : zoneIn(maps[name], i, j));
  const roomName = (name, px, py) => { const z = zoneAt(name, Math.floor(px / TS), Math.floor(py / TS)); return z ? z.name : ""; };
  (() => {
    const h = maps.home;
    rect(h, T.WALL, 0, 7, 24, 1);                                   // sekat memanjang
    rect(h, T.WALL, 8, 1, 1, 6); rect(h, T.WALL, 16, 1, 1, 6);      // sekat antar kamar
    rect(h, T.WALL, 13, 8, 1, 5);                                   // sekat ruang tengah | dapur
    [[4, 7], [12, 7], [19, 7], [13, 10]].forEach((a) => { h.t[a[1]][a[0]] = T.IDOOR; });   // pintu antar ruangan (tutup, buka dengan E)
    // kamar Marco
    rect(h, T.BED, 1, 1, 2, 1); rect(h, T.DESK, 5, 1, 2, 1); h.t[1][7] = T.WARDROBE; rect(h, T.RUG, 3, 3, 3, 2); h.t[6][1] = T.PLANT;
    // kamar Nenek
    h.t[1][9] = T.DESK; rect(h, T.BEDN, 10, 1, 2, 1); rect(h, T.WARDROBE, 13, 1, 2, 1); rect(h, T.RUG, 11, 3, 3, 2); h.t[6][15] = T.PLANT;
    // kamar mandi
    h.t[1][17] = T.TOILET; h.t[1][18] = T.SINK; rect(h, T.TUB, 21, 1, 2, 1); h.t[6][22] = T.PLANT;
    // ruang tengah
    rect(h, T.SHELF, 2, 8, 2, 1); h.t[8][9] = T.TV; rect(h, T.RUG, 4, 9, 5, 3); rect(h, T.SOFA, 3, 12, 3, 1); h.t[8][1] = T.PLANT; h.t[12][12] = T.PLANT;
    // dapur
    rect(h, T.KITCHEN, 14, 8, 2, 1); h.t[8][16] = T.FRIDGE; rect(h, T.CUPBOARD, 21, 8, 2, 1); rect(h, T.TABLE, 17, 10, 2, 1); h.t[12][22] = T.PLANT;
  })();
  // ---------- sekolah bertingkat: lantai 1 (kepsek + XII A-E), lantai 2 (XI A-E), lantai 3 (X A-E) ----------
  // Tiap ruang 7x6 petak, sekat 1 petak, lorong 3 petak di bawah. Tangga di ujung kiri lorong: naik (1,9), turun (1,10).
  const schoolTheme = { name: "class", floor: "#d9d2c0", floor2: "#c6bda7", wall: "#e8e4cc", wain: "#7aa08a", rug: ["#2f3d5e", "#4a5f8a", "#8fa6d0"] };
  const SCHOOL_TILE = { name: "", kind: "tile", a: "#d9dee0", b: "#c1c9ce" }, SCHOOL_WOOD = { kind: "wood", a: "#b98a5a", b: "#a67a4c" };
  function buildFloor(floorNo, rooms, up, down, doorX) {
    const n = rooms.length, W = 2 + n * 7 + (n - 1), H = 12, m = buildRoom(W, H, doorX, schoolTheme, []);
    m.zones = []; m.rooms = []; m.stairs = {};
    rect(m, T.WALL, 1, 7, W - 2, 1);                                                        // sekat lorong
    rooms.forEach((r, k) => {
      const ox = 1 + k * 8, kep = r.kind === "kepsek" || r.kind === "wakepsek", uks = r.kind === "uks", guru = r.kind === "guru";
      if (k < n - 1) rect(m, T.WALL, ox + 7, 1, 1, 6);                                      // sekat antar ruang
      m.t[7][ox + 3] = T.IDOOR;                                                             // pintu ruangan ke lorong (buka dengan E)
      m.zones.push(Object.assign({ name: r.name, x: ox, y: 1, w: 7, h: 6, kind: kep ? "wood" : uks ? "tile" : "plain" }, kep ? SCHOOL_WOOD : uks ? { a: "#e4eff2", b: "#cfe1e6" } : {}));
      m.rooms.push({ ox, label: r.label, kind: r.kind || "class" });
      if (kep) {
        rect(m, T.SHELF, ox, 1, 2, 1); rect(m, T.SHELF, ox + 5, 1, 2, 1);                  // lemari piala & arsip
        rect(m, T.TEACHER, ox + 2, 3, 3, 1);                                                // meja kepala sekolah
        rect(m, T.RUG, ox + 1, 4, 5, 2);                                                    // karpet tamu
        rect(m, T.SOFA, ox, 6, 3, 1); m.t[6][ox + 6] = T.PLANT; m.t[3][ox] = T.PLANT;
        m.windows.push(ox + 1, ox + 5);
        rect(m, T.WARDROBE, ox + 5, 8, 2, 1);
      } else if (uks) {
        rect(m, T.BED, ox, 1, 2, 1); rect(m, T.BED, ox + 3, 1, 2, 1);                       // dua tempat tidur pasien
        rect(m, T.CUPBOARD, ox + 5, 1, 2, 1);                                               // lemari obat
        rect(m, T.TEACHER, ox + 5, 3, 2, 1);                                                // meja petugas UKS
        m.t[5][ox + 6] = T.SINK; m.t[6][ox] = T.PLANT; rect(m, T.RUG, ox + 1, 3, 2, 3);
        m.windows.push(ox + 2, ox + 5);
        rect(m, T.WARDROBE, ox, 8, 2, 1); rect(m, T.WARDROBE, ox + 5, 8, 2, 1);
      } else if (guru) {
        rect(m, T.SHELF, ox, 1, 2, 1); rect(m, T.SHELF, ox + 5, 1, 2, 1);                   // lemari buku & arsip
        [3, 5].forEach((y) => { rect(m, T.TEACHER, ox + 1, y, 2, 1); rect(m, T.TEACHER, ox + 4, y, 2, 1); });   // meja guru
        m.t[6][ox] = T.PLANT; m.t[6][ox + 6] = T.PLANT; m.t[3][ox + 6] = T.PLANT; rect(m, T.RUG, ox + 3, 2, 1, 4);
        m.windows.push(ox + 2, ox + 5);
        rect(m, T.WARDROBE, ox, 8, 2, 1); rect(m, T.WARDROBE, ox + 5, 8, 2, 1);
      } else {
        rect(m, T.BOARD, ox + 1, 0, 5, 1);                                                  // papan tulis di tembok atas
        rect(m, T.TEACHER, ox + 4, 1, 2, 1);                                                // meja guru
        rect(m, T.RUG, ox + 3, 2, 1, 5);
        [3, 5].forEach((y) => { rect(m, T.DESK, ox + 1, y, 2, 1); rect(m, T.DESK, ox + 4, y, 2, 1); });
        m.t[1][ox + 6] = T.PLANT; m.t[6][ox] = T.PLANT;
        m.windows.push(ox);
        rect(m, T.WARDROBE, ox, 8, 2, 1); rect(m, T.WARDROBE, ox + 5, 8, 2, 1);            // loker siswa
      }
    });
    m.zones.push(Object.assign({ name: "Lorong Lantai " + floorNo, x: 1, y: 8, w: W - 2, h: 3 }, SCHOOL_TILE));
    m.t[10][W - 2] = T.PLANT;
    if (up) { m.t[9][1] = T.STAIR; m.stairs["1,9"] = "up"; }
    if (down) { m.t[10][1] = T.STAIR; m.stairs["1,10"] = "down"; }
    return m;
  }
  const ruangKelas = (g, ) => ["A", "B", "C", "D", "E"].map((l) => ({ label: g + "-" + l, name: "Ruang Kelas " + g + "-" + l }));
  // Lantai 1, dari kiri ke kanan: sayap administrasi (Kepsek, Wakepsek, Ruang Guru) | LOBI + pintu utama | UKS (dekat pintu masuk) |
  // kelas XII A-E | lalu kantin, lapangan indoor, dan halaman belakang di ujung kanan lorong.
  const SCHOOL_ENTRANCE_X = 24;   // pintu utama tepat di antara Ruang Guru dan UKS
  maps.class = buildFloor(1, [
    { label: "KEPSEK", name: "Ruang Kepala Sekolah", kind: "kepsek" },
    { label: "WAKEPSEK", name: "Ruang Wakil Kepala Sekolah", kind: "wakepsek" },
    { label: "GURU", name: "Ruang Guru", kind: "guru" },
    { label: "UKS", name: "Ruang UKS", kind: "uks" }
  ].concat(ruangKelas("XII")), true, false, SCHOOL_ENTRANCE_X);
  maps.lt2 = buildFloor(2, ruangKelas("XI"), true, true, null);
  maps.lt3 = buildFloor(3, ruangKelas("X"), false, true, null);
  // Lobi utama: area terbuka di depan pintu masuk, dengan lantai lebih terang dan tanaman di kedua sisi pintu.
  maps.class.zones.unshift({ name: "Lobi Utama", x: SCHOOL_ENTRANCE_X - 4, y: 8, w: 9, h: 3, kind: "tile", a: "#e6dfcd", b: "#d2c9b2" });
  maps.class.t[10][SCHOOL_ENTRANCE_X - 3] = T.PLANT; maps.class.t[10][SCHOOL_ENTRANCE_X + 3] = T.PLANT;
  // ---------- lapangan indoor (gedung olahraga), pintu di ujung kanan lorong lantai 1 ----------
  const SW = maps.class.w, GYM_X = SW - 5, CANTEEN_X = SW - 13, YARD_Y = 9;
  // Papan nama ditempel tepat di kiri pintunya masing-masing (lebar papan ~ 3,6 px per huruf + 6 px bingkai).
  const signLeftOf = (doorX, text) => (doorX * TS) - 3 - (Math.ceil(text.length * 3.6) + 6) / 2;
  maps.class.t[11][GYM_X] = T.DOOR;
  maps.class.signs = [{ cx: signLeftOf(GYM_X, "LAPANGAN INDOOR"), y: 11 * TS + 3, text: "LAPANGAN INDOOR" },
    { cx: (SCHOOL_ENTRANCE_X + 4) * TS + 8, y: 11 * TS + 3, text: "LOBI UTAMA" }];
  maps.gym = buildRoom(24, 16, 2, { name: "gym", floor: "#c99b5f", floor2: "#b78a52", wall: "#e9e2cf", wain: "#4f7aa8", rug: ["#2f3d5e", "#4a5f8a", "#8fa6d0"] }, [3, 7, 15, 19]);
  (() => {
    const g = maps.gym;
    g.zones = [{ name: "Lapangan Indoor", x: 1, y: 1, w: 22, h: 14, kind: "wood", a: "#cfa062", b: "#b98a52" }];
    g.court = true;
    rect(g, T.BLEACH, 1, 3, 2, 10); rect(g, T.BLEACH, 21, 3, 2, 10);        // bangku penonton kiri & kanan
    g.t[1][11] = T.HOOP; g.t[14][11] = T.HOOP;                                // ring basket di kedua ujung
    rect(g, T.CUPBOARD, 5, 14, 3, 1); g.t[14][21] = T.PLANT;                  // lemari peralatan olahraga
  })();
  // ---------- kantin sekolah ----------
  // Kantin terhubung langsung dari lorong lantai 1; area cukup luas untuk ramai saat istirahat.
  maps.canteen = buildRoom(28, 18, 13, { name: "canteen", floor: "#d8c6a5", floor2: "#c5ae89", wall: "#eee3ce", wain: "#d08a4c", rug: ["#8c5135", "#bd8051", "#f1d8a8"] }, [4, 12, 22]);
  (() => {
    const c = maps.canteen;
    c.zones = [{ name: "Kantin SMA Nusa", x: 1, y: 1, w: 26, h: 16, kind: "tile", a: "#d8c6a5", b: "#c5ae89" }];
    // Konter makanan, etalase, kulkas minuman, serta meja-meja siswa.
    rect(c, T.KITCHEN, 2, 2, 5, 1); rect(c, T.CUPBOARD, 7, 2, 2, 1); c.t[2][10] = T.FRIDGE;
    rect(c, T.TABLE, 3, 7, 3, 1); rect(c, T.TABLE, 10, 7, 3, 1); rect(c, T.TABLE, 17, 7, 3, 1); rect(c, T.TABLE, 22, 7, 3, 1);
    rect(c, T.BENCH, 3, 9, 3, 1); rect(c, T.BENCH, 10, 9, 3, 1); rect(c, T.BENCH, 17, 9, 3, 1); rect(c, T.BENCH, 22, 9, 3, 1);
    rect(c, T.TABLE, 6, 12, 3, 1); rect(c, T.TABLE, 14, 12, 3, 1); rect(c, T.TABLE, 21, 12, 3, 1);
    rect(c, T.BENCH, 6, 14, 3, 1); rect(c, T.BENCH, 14, 14, 3, 1); rect(c, T.BENCH, 21, 14, 3, 1);
    c.signs = [{ cx: 5 * TS + 8, y: 1 * TS + 2, text: "KANTIN SMA NUSA" }, { cx: 22 * TS + 8, y: 4 * TS + 2, text: "MENU HARI INI" }];
  })();
  // Pintu kantin di lorong lantai 1, terpisah dari akses lapangan indoor.
  maps.class.t[11][CANTEEN_X] = T.DOOR;
  maps.class.signs.push({ cx: signLeftOf(CANTEEN_X, "KANTIN"), y: 11 * TS + 3, text: "KANTIN" });
  maps.class.t[YARD_Y][SW - 1] = T.DOOR;
  maps.class.signs.push({ cx: (SW - 5) * TS + 8, y: 8 * TS, text: "KE HALAMAN" });   // di celah antar loker, supaya tidak tertutup

  const doors = {
    world: [{ x: 9, y: 12, to: "home", tx: 11, ty: 12 }, { x: 114, y: 11, to: "class", tx: SCHOOL_ENTRANCE_X, ty: 10 }],
    home: [{ x: 11, y: 13, to: "world", tx: 9, ty: 13 }],
    class: [{ x: SCHOOL_ENTRANCE_X, y: 11, to: "world", tx: 114, ty: 18 }, { x: 1, y: 9, to: "lt2", tx: 3, ty: 9 }, { x: GYM_X, y: 11, to: "gym", tx: 2, ty: 14 }, { x: CANTEEN_X, y: 11, to: "canteen", tx: 13, ty: 16 }, { x: SW - 1, y: YARD_Y, to: "backyard", tx: 12, ty: 15 }],
    canteen: [{ x: 13, y: 17, to: "class", tx: CANTEEN_X, ty: 10 }],
    lt2: [{ x: 1, y: 9, to: "lt3", tx: 3, ty: 9 }, { x: 1, y: 10, to: "class", tx: 3, ty: 9 }],
    lt3: [{ x: 1, y: 10, to: "lt2", tx: 3, ty: 9 }],
    gym: [{ x: 2, y: 15, to: "class", tx: GYM_X, ty: 10 }],
    backyard: [{ x: 12, y: 17, to: "class", tx: SW - 2, ty: YARD_Y }]
  };

  // ---------- halaman belakang sekolah ----------
  maps.backyard = buildRoom(26, 18, 12, {
    name: "backyard", floor: "#91b873", floor2: "#7da461",
    wall: "#b8c99a", wain: "#547a4a", rug: ["#5b744d", "#78965d", "#c5d7a2"]
  }, []);
  (() => {
    const b = maps.backyard;
    rect(b, T.GRASS, 1, 1, 24, 16);
    rect(b, T.PATH, 10, 1, 6, 16);
    rect(b, T.FENCE, 1, 1, 24, 1);
    rect(b, T.FENCE, 1, 1, 1, 16);
    rect(b, T.FENCE, 24, 1, 1, 16);
    rect(b, T.BENCH, 4, 6, 2, 1); rect(b, T.BENCH, 19, 6, 2, 1);
    b.t[3][3] = T.TREE; b.t[3][22] = T.TREE;
    b.t[13][4] = T.PLANT; b.t[13][21] = T.PLANT;
    b.zones = [{ name: "Halaman Belakang Sekolah", x: 1, y: 1, w: 24, h: 16, kind: "tile", a: "#91b873", b: "#7da461" }];
    b.signs = [{ cx: 13 * TS, y: 2 * TS, text: "HALAMAN BELAKANG" }];
  })();

  // ---------- interior rumah warga ----------
  // Setiap rumah punya denah, palet, dan susunan perabot sendiri. Pintu selalu kembali
  // ke halaman rumah yang sama; semua ruangan memakai tile/perabot bawaan renderer.
  const HOUSE_STYLES = [
    { floor: "#cbb5d8", floor2: "#b99dc9", wall: "#eadcf0", wain: "#987eaa", rug: ["#4a3560", "#8565a0", "#e8c8e8"], accent: "#8e6bb0" },
    { floor: "#c9b08d", floor2: "#b9956c", wall: "#e9dfc8", wain: "#8eaa98", rug: ["#385b4b", "#6f947c", "#e6d5a0"], accent: "#4f8b78" },
    { floor: "#d0b18c", floor2: "#bd956c", wall: "#f0dfc7", wain: "#c18a48", rug: ["#71462d", "#b47a43", "#f0d59c"], accent: "#c18a48" },
    { floor: "#b6c5d0", floor2: "#9eafbf", wall: "#e1e8ed", wain: "#6686a8", rug: ["#304d70", "#527aa0", "#d8e5ef"], accent: "#6686a8" },
    { floor: "#d0aaa0", floor2: "#bd8f86", wall: "#f0ddd6", wain: "#b56c62", rug: ["#713e43", "#a85f68", "#f0d4c8"], accent: "#b56c62" },
    { floor: "#c6b49b", floor2: "#ad997e", wall: "#e8dfd0", wain: "#9a7958", rug: ["#584431", "#92734d", "#e4d0a8"], accent: "#9a7958" },
    { floor: "#b9c9ad", floor2: "#9eaf91", wall: "#e4e8d8", wain: "#7d9a72", rug: ["#3e5d3d", "#72956b", "#e0e7bb"], accent: "#7d9a72" },
    { floor: "#c8aec2", floor2: "#b394ae", wall: "#eddfeb", wain: "#9b6b8d", rug: ["#5d3857", "#986b8d", "#e9c9df"], accent: "#9b6b8d" }
  ];
  function buildHouseInterior(b, index) {
    const id = b.name === "RUMAH EVELYN" ? "evelynHome" : "house" + index;
    const style = HOUSE_STYLES[index % HOUSE_STYLES.length];
    const m = buildRoom(22, 14, 11, { name: "house", floor: style.floor, floor2: style.floor2, wall: style.wall, wain: style.wain, rug: style.rug }, [3, 8, 17]);
    const specialRoom = {
      "RUMAH EVELYN": "Sudut Belajar Evelyn", "RUMAH PAK RT": "Ruang Arsip Pak RT",
      "RUMAH KELUARGA": "Kamar Anak", "RUMAH BIRU": "Ruang Hobi",
      "RUMAH MERAH": "Ruang Jahit", "RUMAH BU WARTI": "Ruang Jahit Bu Warti",
      "RUMAH PAK HAJI": "Ruang Keluarga", "RUMAH KECIL": "Ruang Belajar",
      "RUMAH SAWAH": "Gudang Tani", "RUMAH TAMAN": "Ruang Tanaman",
      "RUMAH UNGU": "Studio Kerajinan", "RUMAH PINGGIR SUNGAI": "Gudang Perahu",
      "RUMAH NELAYAN": "Ruang Jaring", "RUMAH KEBUN": "Ruang Bibit"
    }[b.name] || "Ruang Kegiatan";
    m.houseMeta = { name: b.name.replace("RUMAH ", "Rumah "), owner: b.name };
    // Denah: Ruang Tamu | Kamar Tidur di atas, lorong tengah (Ruang Keluarga), lalu Dapur | Lorong Depan | Kamar Mandi | ruang khusus di bawah.
    // Setiap ruangan tertutup dinding dan hanya bisa dimasuki lewat pintu (tekan E di depan pintu).
    m.zones = [
      { name: "Ruang Tamu", x: 1, y: 1, w: 12, h: 5, kind: "wood", a: style.floor, b: style.floor2 },
      { name: "Kamar Tidur", x: 14, y: 1, w: 7, h: 5, kind: "wood", a: style.floor, b: style.floor2 },
      { name: "Ruang Keluarga", x: 1, y: 7, w: 20, h: 1, kind: "wood", a: style.floor, b: style.floor2 },
      { name: "Dapur", x: 1, y: 9, w: 8, h: 3, kind: "tile", a: "#dfd7c9", b: "#c7b9a6" },
      { name: "Lorong Depan", x: 10, y: 8, w: 3, h: 5, kind: "wood", a: style.floor, b: style.floor2 },
      { name: "Kamar Mandi", x: 14, y: 9, w: 3, h: 3, kind: "tile", a: "#d6e6ec", b: "#a9c6d2" },
      { name: specialRoom, x: 18, y: 9, w: 3, h: 3, kind: "wood", a: style.floor, b: style.floor2 }
    ];
    // Dinding antar-ruang. Pintu (T.IDOOR) bersifat padat sampai dibuka dengan E.
    rect(m, T.WALL, 0, 6, 22, 1); rect(m, T.WALL, 13, 1, 1, 5);          // sekat atas + sekat Ruang Tamu | Kamar Tidur
    rect(m, T.WALL, 0, 8, 10, 1); rect(m, T.WALL, 13, 8, 8, 1);          // dinding atas ruangan bawah (lorong tengah tetap terbuka)
    rect(m, T.WALL, 0, 12, 10, 1); rect(m, T.WALL, 13, 12, 8, 1);        // dinding bawah ruangan bawah
    rect(m, T.WALL, 9, 8, 1, 5); rect(m, T.WALL, 13, 8, 1, 5); rect(m, T.WALL, 17, 9, 1, 3);   // sekat Dapur | Lorong | Kamar Mandi | ruang khusus
    m.t[6][8] = T.IDOOR; m.t[6][17] = T.IDOOR; m.t[4][13] = T.IDOOR;     // Ruang Tamu, Kamar Tidur, dan pintu penghubung keduanya
    m.t[8][5] = T.IDOOR; m.t[8][15] = T.IDOOR; m.t[8][18] = T.IDOOR;     // Dapur, Kamar Mandi, ruang khusus
    // Ruang tamu: karpet, sofa, meja, televisi, rak, dan tanaman.
    rect(m, T.RUG, 3, 3, 5, 2); rect(m, T.SOFA, 3, 5, 3, 1); m.t[1][9] = T.TV;
    rect(m, T.SHELF, 1, 1, 2, 1); m.t[5][11] = T.PLANT; m.t[1][12] = T.PLANT;
    // Kamar tidur: tempat tidur, lemari, meja kecil; tata letak bergeser per keluarga.
    rect(m, T.BED, 15, 1, 2, 1); rect(m, T.WARDROBE, 19, 1, 2, 1); m.t[4][19] = T.DESK;
    // Dapur, kamar mandi, dan ruang khusus punya perabot sendiri.
    rect(m, T.KITCHEN, 1, 9, 2, 1); m.t[9][4] = T.FRIDGE; rect(m, T.TABLE, 5, 10, 2, 1); m.t[11][8] = T.PLANT;
    m.t[9][14] = T.TOILET; m.t[11][16] = T.SINK;
    rect(m, T.DESK, 19, 9, 2, 1); m.t[11][20] = T.SHELF;
    // Identitas rumah: variasi tambahan yang terlihat saat masuk.
    if (index % 4 === 0) { rect(m, T.RUG, 7, 3, 3, 2); m.t[2][11] = T.CUPBOARD; }
    if (index % 4 === 1) { rect(m, T.TABLE, 7, 4, 2, 1); m.t[2][11] = T.SHELF; }
    if (index % 4 === 2) { m.t[3][11] = T.PLANT; rect(m, T.CUPBOARD, 18, 4, 2, 1); }
    if (index % 4 === 3) { rect(m, T.RUG, 16, 3, 3, 2); m.t[2][11] = T.PLANT; }
    // Benda khas sesuai identitas penghuni: sudut belajar, arsip, jahitan, hasil tani,
    // perlengkapan sungai, dan tanaman. Tile yang dipakai sudah punya ilustrasi pixel.
    if (b.name === "RUMAH EVELYN") { rect(m, T.SHELF, 17, 4, 2, 1); m.t[3][19] = T.PLANT; }
    else if (b.name === "RUMAH PAK RT") { rect(m, T.SHELF, 19, 9, 2, 1); rect(m, T.CUPBOARD, 19, 10, 2, 1); }
    else if (b.name === "RUMAH BU WARTI" || b.name === "RUMAH MERAH") { rect(m, T.TABLE, 19, 9, 2, 1); m.t[11][19] = T.WARDROBE; }
    else if (b.name === "RUMAH SAWAH") { rect(m, T.CUPBOARD, 19, 9, 2, 1); m.t[11][19] = T.PLANT; }
    else if (b.name === "RUMAH PINGGIR SUNGAI" || b.name === "RUMAH NELAYAN") { rect(m, T.SHELF, 19, 9, 2, 1); rect(m, T.TABLE, 19, 11, 2, 1); }
    else if (b.name === "RUMAH TAMAN" || b.name === "RUMAH KEBUN") { m.t[9][20] = T.PLANT; m.t[11][20] = T.PLANT; }
    else if (b.name === "RUMAH PAK HAJI") { rect(m, T.RUG, 18, 10, 3, 2); }
    return { id, map: m };
  }
  buildings.filter(b => b.kind === "house" && b.name !== "RUMAH NENEK").forEach((b, index) => {
    const room = buildHouseInterior(b, index);
    maps[room.id] = room.map;
    doors[room.id] = [{ x: 11, y: 13, to: "world", tx: b.door, ty: b.y + b.h }];
    doors.world.push({ x: b.door, y: b.y + b.h - 1, to: room.id, tx: 11, ty: 12 });
  });

  // Toko, bengkel, kios, dan rumah petak juga dapat dimasuki. Interior generik
  // dibuat per bangunan agar pintu keluar selalu kembali ke fasad yang tepat.
  buildings.filter(b => b.kind === "shop" || b.kind === "row").forEach((b, index) => {
    const id = "building" + index;
    const theme = { name: b.kind === "shop" ? "shop" : "house", floor: "#c9b08d", floor2: "#b9956c", wall: "#eadcc5", wain: "#987e63", rug: ["#584431", "#92734d", "#e4d0a8"] };
    const m = buildRoom(20, 14, 10, theme, [4, 15]);
    m.houseMeta = { name: b.name.replace("RUMAH ", "Rumah "), owner: b.name };
    m.zones = [{ name: b.name, x: 1, y: 1, w: 18, h: 12, kind: "wood", a: theme.floor, b: theme.floor2 }];
    if (b.kind === "shop") {
      rect(m, T.SHELF, 2, 2, 4, 1); rect(m, T.SHELF, 14, 2, 4, 1);
      rect(m, T.TABLE, 7, 5, 5, 2); rect(m, T.TABLE, 2, 9, 5, 1);
      m.signs = [{ cx: 10 * TS, y: 2 * TS, text: b.name }];
    } else {
      rect(m, T.BED, 3, 2, 2, 1); rect(m, T.TABLE, 12, 5, 3, 1);
      rect(m, T.SHELF, 15, 9, 3, 1);
      m.signs = [{ cx: 10 * TS, y: 2 * TS, text: b.name }];
    }
    maps[id] = m;
    doors[id] = [{ x: 10, y: 13, to: "world", tx: b.door, ty: b.y + b.h }];
    doors.world.push({ x: b.door, y: b.y + b.h - 1, to: id, tx: 10, ty: 12 });
  });

  // ---------- gambar tanah ----------
  const at = (m, i, j) => (m.t[j] && m.t[j][i] !== undefined ? m.t[j][i] : -1);
  const grassLike = (n) => n === T.GRASS || n === T.TREE || n === T.BENCH || n === T.GARDEN;

  // ---------- gaya baru: jalan, trotoar, bayangan ----------
  const EDGE_DK = "#7d7494", CURB = "#d9d1e4", CURB_HI = "#f2edf7";
  function paved(R, m, i, j) {
    const n = (a, b) => at(m, i + a, j + b);
    // Trotoar beton berubin: lavender-abu, dengan nat tipis dan variasi tiap ubin.
    for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
      const q = ((hash(i * 2 + sx, j * 2 + sy, 42) % 9) - 4) * 1.25;
      R(sx * 8, sy * 8, 8, 8, sh("#bcb6c9", Math.round(q)));
      R(sx * 8, sy * 8, 8, 1, "rgba(255,250,255,.25)");
      R(sx * 8, sy * 8 + 7, 8, 1, "rgba(48,39,70,.16)");
      R(sx * 8 + 7, sy * 8, 1, 8, "rgba(48,39,70,.12)");
    }
    const q = hash(i, j, 43);
    if (q % 8 === 0) R(2 + (q >>> 4) % 10, 3 + (q >>> 9) % 9, 3, 1, "rgba(70,55,90,.17)");
    if (q % 19 === 1) { R(5 + (q >>> 5) % 6, 2 + (q >>> 8) % 10, 1, 3, "rgba(60,48,82,.24)"); R(6 + (q >>> 5) % 6, 4 + (q >>> 8) % 8, 2, 1, "rgba(235,225,245,.25)"); }
    // Kurb batu berlapis dengan garis refleksi halus.
    if (n(0, 1) === T.ROAD) { R(0, 10, TS, 1, "#e0d7e5"); R(0, 11, TS, 3, "#827b91"); R(0, 14, TS, 2, "#514b65"); }
    if (n(0, -1) === T.ROAD) { R(0, 0, TS, 2, "#514b65"); R(0, 2, TS, 3, "#827b91"); R(0, 5, TS, 1, "#e0d7e5"); }
    if (n(-1, 0) === T.ROAD) { R(0, 0, 2, TS, "#514b65"); R(2, 0, 3, TS, "#827b91"); R(5, 0, 1, TS, "#e0d7e5"); }
    if (n(1, 0) === T.ROAD) { R(10, 0, 1, TS, "#e0d7e5"); R(11, 0, 3, TS, "#827b91"); R(14, 0, 2, TS, "#514b65"); }
    // Rumput liar kecil di sela trotoar.
    [[0,-1,0,0,TS,2], [0,1,0,14,TS,2], [-1,0,0,0,2,TS], [1,0,14,0,2,TS]].forEach((e, k) => {
      if (!grassLike(n(e[0], e[1])) || hash(i, j, 90 + k) % 3) return;
      const o = (hash(i, j, 100 + k) >>> 2) % 13;
      if (e[1]) R(o, e[1] < 0 ? 0 : 14, 2, 2, "#68866b");
      else R(e[0] < 0 ? 0 : 14, o, 2, 2, "#68866b");
    });
  }

  function roadTile(R, m, i, j, h0) {
    const n = (a, b) => at(m, i + a, j + b), pathy = (v) => v === T.PATH || v === T.DOOR || v === T.POST;
    // Aspal kota berwarna arang-ungu, tidak terlalu kontras agar karakter tetap menjadi fokus.
    R(0, 0, TS, TS, "#454354");
    R(0, 0, TS, 1, "rgba(225,218,239,.08)");
    for (let k = 0; k < 9; k++) {
      const q = hash(i, j, 50 + k);
      R((q >>> 3) % 15, (q >>> 8) % 15, 1 + (q % 2), 1, q % 2 ? "#555365" : "#393847");
    }
    if (h0 % 29 === 0) { R(3, 4, 6, 1, "#302f3c"); R(8, 5, 3, 1, "#302f3c"); R(10, 6, 2, 1, "#302f3c"); }
    if (h0 % 43 === 0) { R(2, 2, 10, 8, "rgba(20,18,35,.10)"); R(4, 3, 5, 1, "rgba(190,185,210,.08)"); }
    const hCount = (n(-1, 0) === T.ROAD ? 1 : 0) + (n(1, 0) === T.ROAD ? 1 : 0);
    const vCount = (n(0, -1) === T.ROAD ? 1 : 0) + (n(0, 1) === T.ROAD ? 1 : 0);
    const horiz = hCount >= vCount;
    if (horiz) {
      // Dua lajur bayangan roda dan marka lajur putus-putus.
      R(0, 2, TS, 1, "rgba(15,14,25,.12)"); R(0, 13, TS, 1, "rgba(15,14,25,.12)");
      if (n(0, -1) !== T.ROAD) { R(0, 1, TS, 1, "rgba(224,216,234,.38)"); R(0, 3, TS, 1, "rgba(30,28,42,.30)"); }
      if (n(0, 1) !== T.ROAD) { R(0, 12, TS, 1, "rgba(224,216,234,.30)"); R(0, 14, TS, 1, "rgba(30,28,42,.30)"); }
      if (n(0, -1) === T.ROAD && n(0, 1) === T.ROAD && i % 2 === 0) { R(2, 7, 10, 2, "#d8cfae"); R(2, 7, 10, 1, "#eee7d3"); }
      if (i === 25 || i === 26) {
        [[3, 3], [10, 3]].forEach((b) => { R(0, b[0], TS, b[1], "#e7e3e8"); R(0, b[0], TS, 1, "#fffaf0"); });
      }
    } else {
      R(2, 0, 1, TS, "rgba(15,14,25,.12)");
      if (i === 22) { R(1, 0, 1, TS, "rgba(224,216,234,.38)"); R(4, 0, 1, TS, "rgba(30,28,42,.25)"); }
      else { R(14, 0, 1, TS, "rgba(224,216,234,.38)"); R(11, 0, 1, TS, "rgba(30,28,42,.25)"); }
      if (j % 2 === 0) { R(i === 22 ? 14 : 0, 2, 2, 10, "#d8cfae"); R(i === 22 ? 14 : 0, 2, 1, 10, "#eee7d3"); }
    }
    // Pantulan tipis genangan setelah hujan dan tutup drainase.
    if (hash(i, j, 55) % 37 === 0 && !(i === 25 || i === 26)) {
      R(3, 6, 10, 4, "rgba(142,151,190,.22)"); R(5, 7, 5, 1, "rgba(225,230,245,.30)");
    }
    if (hash(i, j, 56) % 83 === 0) {
      R(4, 4, 8, 8, "#302f3e"); R(5, 5, 6, 6, "#555365");
      for (let k = 6; k < 11; k += 2) R(5, k, 6, 1, "#343342");
      R(7, 6, 2, 1, "#777387");
    }
    if (pathy(n(0, -1))) R(0, 0, TS, 2, "rgba(20,15,35,.34)");
    if (pathy(n(0, 1))) R(0, 14, TS, 2, "rgba(20,15,35,.34)");
    if (pathy(n(-1, 0))) R(0, 0, 2, TS, "rgba(20,15,35,.34)");
    if (pathy(n(1, 0))) R(14, 0, 2, TS, "rgba(20,15,35,.34)");
  }

  function worldGround(c, m, i, j) {
    const x = i * TS, y = j * TS, tp = m.t[j][i], h0 = hash(i, j, 1);
    const R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(x + a, y + b, w, h); };
    const flagPost = tp === T.POST && (props[i + "," + j] === "flag" || /^bike/.test(props[i + "," + j]));
    if (POLISH.world) {
      if (tp === T.ROAD) return roadTile(R, m, i, j, h0);
      if (tp === T.PATH || tp === T.FENCE || tp === T.DOOR || flagPost) return paved(R, m, i, j);
    }
    if (tp === T.GRASS || tp === T.TREE || tp === T.BENCH || (tp === T.POST && !flagPost)) {
      const baseGrass = i >= 150 && j >= 80 ? ((i+j)%2 ? "#557b75" : "#5d887c") : i >= 150 ? ((i+j)%2 ? "#719b72" : "#79a77a") : j >= 80 ? ((i+j)%2 ? "#67905e" : "#709b65") : ((i+j)%2 ? "#59a06a" : "#5ba36c");
      R(0, 0, TS, TS, baseGrass);
      if (h0 % 3 === 0) R(2 + (h0 % 7), 3 + ((h0 >>> 3) % 8), 5, 3, "#69b177");
      if (h0 % 4 === 1) R(9, 10, 4, 3, "#4a8d5c");
      for (let k = 0; k < 3; k++) {
        const q = hash(i, j, 10 + k);
        if (q % 4 === 0) { const a = (q >>> 4) % 14, b = (q >>> 9) % 13; R(a, b, 1, 2, "#38774f"); R(a + 1, b + 1, 1, 1, "#38774f"); R(a - 1, b + 1, 1, 1, "#86c88c"); }
      }
      const f = hash(i, j, 5) % 100;
      if (f < 8 && tp === T.GRASS) {
        const col = ["#ffd9e8", "#fff3a8", "#ffffff", "#c9b3ff"][f % 4], a = 2 + ((h0 >>> 5) % 10), b = 3 + ((h0 >>> 9) % 9);
        R(a, b + 1, 1, 3, "#38774f"); R(a - 1, b, 3, 1, col); R(a, b - 1, 1, 3, col); R(a, b, 1, 1, "#ffcf4a");
      }
    } else if (tp === T.PATH || tp === T.FENCE || tp === T.DOOR || flagPost) {
      R(0, 0, TS, TS, "#d3bf9a");
      if (h0 % 3 === 0) R(1 + (h0 % 9), 2 + ((h0 >>> 4) % 9), 5, 3, "#c9b48c");
      for (let k = 0; k < 3; k++) { const q = hash(i, j, 20 + k); if (q % 3 === 0) { R((q >>> 3) % 14, (q >>> 8) % 14, 2, 1, "#b3a07c"); R((q >>> 12) % 14, (q >>> 16) % 14, 1, 1, "#e9dcc0"); } }
      [[0, -1, 0, 0, TS, 2], [0, 1, 0, 14, TS, 2], [-1, 0, 0, 0, 2, TS], [1, 0, 14, 0, 2, TS]].forEach((s, k) => {
        if (!grassLike(at(m, i + s[0], j + s[1]))) return;
        R(s[2], s[3], s[4], s[5], "#b8a37a");
        for (let q = 0; q < 4; q++) { const p = (hash(i, j, 30 + k * 4 + q) >>> 2) % 14; if (s[1]) R(p, s[1] < 0 ? 0 : 14, 2, 2, "#58a65c"); else R(s[0] < 0 ? 0 : 14, p, 2, 2, "#58a65c"); }
      });
    } else if (tp === T.ROAD) {
      R(0, 0, TS, TS, "#4b4b5a");
      if (h0 % 2 === 0) R(h0 % 14, (h0 >>> 4) % 14, 2, 1, "#585869");
      if (h0 % 5 === 0) R((h0 >>> 6) % 14, (h0 >>> 10) % 14, 1, 1, "#3d3d49");
      const hCount = (n(-1, 0) === T.ROAD ? 1 : 0) + (n(1, 0) === T.ROAD ? 1 : 0);
    const vCount = (n(0, -1) === T.ROAD ? 1 : 0) + (n(0, 1) === T.ROAD ? 1 : 0);
    const horiz = hCount >= vCount;
      if (horiz) {
        if (j === 18) R(0, 0, TS, 2, "#8a8a98");
        if (j === 20) R(0, 14, TS, 2, "#8a8a98");
        if (j === 19 && i % 2 === 0) R(2, 7, 10, 2, "#e8d36a");
        if ((i === 25 || i === 26)) { R(0, 3, TS, 4, "#ecebe6"); R(0, 10, TS, 3, "#ecebe6"); }   // zebra cross
      } else {
        if (i === 22) R(0, 0, 2, TS, "#8a8a98"); else R(14, 0, 2, TS, "#8a8a98");
        if (j % 2 === 0) R(i === 22 ? 14 : 0, 2, 2, 10, "#e8d36a");
      }
    } else if (tp === T.WATER) {
      R(0, 0, TS, TS, "#3b82b8");
      R(0, 0, TS, 6, "#4691c8");
      if (h0 % 2 === 0) R(2 + (h0 % 8), 6 + ((h0 >>> 3) % 6), 5, 1, "#2f6fa3");
      [[0, -1, 0, 0, TS, 3], [0, 1, 0, 13, TS, 3], [-1, 0, 0, 0, 3, TS], [1, 0, 13, 0, 3, TS]].forEach((s) => {
        if (at(m, i + s[0], j + s[1]) === T.WATER) return;
        R(s[2], s[3], s[4], s[5], "#cbb98a");
        if (s[1]) R(s[2], s[3] + (s[1] < 0 ? 3 : -1), s[4], 1, "#a3946b"); else R(s[2] + (s[0] < 0 ? 3 : -1), s[3], 1, s[5], "#a3946b");
      });
    } else if (tp === T.PADDY) {
      const dike = (i - 26) % 7 === 0 || (j - 24) % 4 === 0 && j !== 24 || j === 24 || j === 31;
      if (dike) {
        R(0, 0, TS, TS, "#b79b68"); R(0, 0, TS, 2, "#a68a58");
        if (h0 % 3 === 0) R(h0 % 12, 5 + (h0 % 6), 3, 2, "#6fae52");
      } else {
        R(0, 0, TS, TS, "#7fb356");
        for (let r = 0; r < 4; r++) { R(0, r * 4 + 3, TS, 1, "#5f9a45"); for (let k = 0; k < 4; k++) { const q = hash(i * 4 + k, j * 4 + r, 41); R(k * 4 + (q % 3), r * 4, 1, 3, q % 4 ? "#98cc66" : "#d9e08a"); } }
      }
    } else if (tp === T.GARDEN) {
      R(0, 0, TS, TS, "#7b5a3c");
      for (let r = 0; r < 3; r++) { R(0, 2 + r * 5, TS, 2, "#5d422b"); R(0, 4 + r * 5, TS, 1, "#8d6b48"); }
      for (let k = 0; k < 6; k++) { const q = hash(i, j, 50 + k); R(1 + (k % 3) * 5, 1 + Math.floor(k / 3) * 7 + (q % 2), 3, 4, k % 2 ? "#4caf50" : "#e0693a"); R(2 + (k % 3) * 5, (Math.floor(k / 3) * 7) + (q % 2), 1, 2, "#2f7a3a"); }
    } else if (tp === T.WALL) {
      R(0, 0, TS, TS, "#c9b48c");
    }
  }

  // ---------- gaya baru: lantai, dinding, bayangan, jendela ----------
  function homeFloor(R, z, i, j, h0) {
    if (z.kind === "tile") {
      const v = (hash(i, j, 21) % 5) - 2;
      for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
        const q = (hash(i * 2 + sx, j * 2 + sy, 22) % 7) - 3;
        R(sx * 8, sy * 8, 8, 8, sh(z.a, v * 2 + q * 2));
        R(sx * 8 + 1, sy * 8 + 1, 6, 1, "rgba(255,255,255,.28)");   // kilau tepi atas
        R(sx * 8, sy * 8 + 7, 8, 1, "rgba(70,55,110,.16)");         // nat bawah
        R(sx * 8 + 7, sy * 8, 1, 8, "rgba(70,55,110,.16)");         // nat kanan
      }
      if ((i + j) % 4 === 0) { R(3, 2, 2, 9, "rgba(255,255,255,.10)"); R(6, 1, 1, 11, "rgba(255,255,255,.07)"); }   // pantulan lampu
    } else {
      [0, 8].forEach((ry, r) => {
        const seam = (i * 5 + j * 3 + r * 7) % 11 + 2, tone = ((hash(i, j + r * 31, 23) % 5) - 2) * 3, q = hash(i, j + r * 9, 24);
        R(0, ry, 16, 8, sh(z.a, tone));
        R(0, ry, 16, 1, "rgba(255,255,255,.14)");     // sorot tepi papan
        R(0, ry + 7, 16, 1, "rgba(80,45,50,.20)");      // celah antar papan
        R(seam, ry, 1, 7, "rgba(80,45,50,.14)");        // sambungan papan
        if (q % 3 === 0) R(2 + (q % 9), ry + 3, 4, 1, "rgba(90,50,30,.18)");   // serat kayu
        if (q % 5 === 0) R(6 + (q % 6), ry + 5, 3, 1, "rgba(90,50,30,.14)");
      });
    }
  }
  function wallDetail(R, i, h0, school) {
    if (school) {
      if ((i + h0) % 3 === 0) R(3 + (h0 % 9), 3 + ((h0 >>> 3) % 4), 1, 1, "rgba(76,92,112,.13)");
      R(0, 7, TS, 9, "#929eaa"); R(0, 7, TS, 1, "#d7dce0"); R(0, 8, TS, 1, "#b2bbc3");
      R(0, 10, 1, 4, "rgba(37,48,63,.12)"); R(8, 10, 1, 4, "rgba(37,48,63,.12)");
      R(0, 14, TS, 2, "#596575"); R(0, 14, TS, 1, "#82909d");
      return;
    }
    if ((i + h0) % 2 === 0) R(3 + (h0 % 9), 3 + ((h0 >>> 3) % 4), 1, 1, "rgba(120,90,150,.16)");
    R(0, 7, TS, 9, "#7f739f"); R(0, 7, TS, 1, "#b3a8cf"); R(0, 8, TS, 1, "#9588b5");
    R(0, 10, 1, 4, "rgba(0,0,0,.12)"); R(8, 10, 1, 4, "rgba(0,0,0,.12)");
    R(0, 14, TS, 2, "#4a3550"); R(0, 14, TS, 1, "#6a4f6e");
  }
  // Bayangan lembut di lantai yang menempel ke dinding (ambient occlusion).
  function ambient(g, m) {
    const isWall = (n) => n === T.WALL || n === T.BOARD || n === T.IDOOR || n === -1;
    const ramp = (x, y, w, h, vert, a0, a1) => {
      const gr = vert ? g.createLinearGradient(0, y, 0, y + h) : g.createLinearGradient(x, 0, x + w, 0);
      gr.addColorStop(0, "rgba(35,20,60," + a0 + ")"); gr.addColorStop(1, "rgba(35,20,60," + a1 + ")");
      g.fillStyle = gr; g.fillRect(x, y, w, h);
    };
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
      const tp = m.t[j][i];
      if (isWall(tp) || tp === T.DOOR) continue;
      const x = i * TS, y = j * TS;
      if (isWall(at(m, i, j - 1))) ramp(x, y, TS, 7, true, 0.36, 0);
      if (isWall(at(m, i - 1, j))) ramp(x, y, 5, TS, false, 0.26, 0);
      if (isWall(at(m, i + 1, j))) ramp(x + TS - 5, y, 5, TS, false, 0, 0.26);
      if (isWall(at(m, i, j + 1))) ramp(x, y + TS - 3, TS, 3, true, 0, 0.2);
    }
  }
  // Perabot digambar di layer sendiri, lalu diberi bayangan jatuh + garis tepi gelap seperti sprite pada referensi.
  function mergeLayer(g, fl) {
    const w = fl.width, h = fl.height, t = document.createElement("canvas");
    t.width = w; t.height = h;
    const tx = t.getContext("2d"); tx.imageSmoothingEnabled = false;
    const sil = (col) => {
      tx.globalCompositeOperation = "source-over"; tx.clearRect(0, 0, w, h); tx.drawImage(fl, 0, 0);
      tx.globalCompositeOperation = "source-in"; tx.fillStyle = col; tx.fillRect(0, 0, w, h); tx.globalCompositeOperation = "source-over";
    };
    sil("rgba(24,12,44,.26)"); g.drawImage(t, 1, 2); g.drawImage(t, 0, 3);
    sil("#2a2038"); [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach((o) => g.drawImage(t, o[0], o[1]));
    g.drawImage(fl, 0, 0);
  }
  function rugDetail(p, e, th) {
    const hi = th.rug[2], dk = th.rug[0];
    if (e[0]) p(0, 3, TS, 1, hi); if (e[1]) p(0, 12, TS, 1, hi);
    if (e[2]) p(3, 0, 1, TS, hi); if (e[3]) p(12, 0, 1, TS, hi);
    if (e[0] || e[1]) for (let k = 1; k < TS; k += 3) p(k, e[0] ? 0 : 15, 1, 1, hi);   // rumbai
    if (!e.some(Boolean)) p(7, 7, 2, 2, dk);
  }
  function furnDetail(p, c, tp, i, j, m, x, y) {
    const L = at(m, i - 1, j) !== tp, Rt = at(m, i + 1, j) !== tp;
    if (tp === T.BED || tp === T.BEDN) {
      if (L) { p(5, 5, 6, 1, "#ffffff"); p(4, 12, 8, 1, "rgba(0,0,0,.08)"); }
      else { p(3, 7, 1, 6, "rgba(255,255,255,.18)"); p(8, 7, 1, 6, "rgba(255,255,255,.18)"); p(0, 9, 14, 1, "rgba(0,0,0,.12)"); }
    } else if (tp === T.SOFA) {
      p(5, 4, 1, 5, "rgba(0,0,0,.16)"); p(10, 4, 1, 5, "rgba(0,0,0,.16)");
      if (L) { p(3, 5, 4, 4, "#e8c25a"); p(3, 5, 4, 1, "#f6dc85"); }
      if (Rt) { p(9, 5, 4, 4, "#6fa8a0"); p(9, 5, 4, 1, "#93c8c0"); }
    } else if (tp === T.PLANT) {
      p(3, 8, 10, 1, "#e09a6a"); p(5, 13, 6, 1, "#8f4a2a"); p(7, 1, 1, 2, "#8be58a"); p(10, 3, 1, 2, "#8be58a"); p(4, 5, 1, 1, "#8be58a");
    } else if (tp === T.WARDROBE) {
      p(2, 2, 12, 1, "rgba(255,255,255,.12)"); p(2, 12, 12, 1, "rgba(0,0,0,.18)");
    } else if (tp === T.TV) {
      p(4, 2, 3, 1, "rgba(255,255,255,.4)"); p(4, 3, 1, 2, "rgba(255,255,255,.25)");
    } else if (tp === T.TABLE) {
      if (!L) { p(11, 3, 3, 3, "#f0d9a0"); p(12, 2, 1, 1, "#c0392b"); }
    }
  }
  function homeWindow(P, x) {
    P(x, 1, 16, 13, "#c9bfdc"); P(x + 1, 2, 14, 11, "#2e2640");
    P(x + 2, 3, 12, 9, "#9cc4ee"); P(x + 2, 3, 12, 4, "#bcd9f5"); P(x + 2, 3, 12, 1, "#d6e8fa");
    P(x + 2, 9, 12, 3, "#3f6f5a"); P(x + 3, 8, 4, 1, "#3f6f5a"); P(x + 9, 7, 4, 2, "#4d8266"); P(x + 5, 9, 2, 1, "#5f9a78"); P(x + 11, 4, 2, 2, "#fff6d0");
    P(x + 5, 3, 1, 9, "#2e2640"); P(x + 9, 3, 1, 9, "#2e2640"); P(x + 2, 7, 12, 1, "#2e2640");
    P(x + 1, 3, 2, 9, "#c0536a"); P(x + 13, 3, 2, 9, "#c0536a"); P(x + 2, 3, 1, 9, "#e0788d"); P(x + 14, 3, 1, 9, "#9c3f56");   // tirai
    P(x, 2, 16, 1, "#7a4a60");
    P(x - 1, 13, 18, 2, "#efe5f0"); P(x - 1, 15, 18, 1, "rgba(60,40,90,.35)");
  }
  function homeFloorDeco(P) {
    P(11 * TS, 12 * TS + 5, 16, 9, "#2a2038"); P(11 * TS + 1, 12 * TS + 6, 14, 7, "#4d4070");
    P(11 * TS + 3, 12 * TS + 8, 10, 1, "#8f7fc0"); P(11 * TS + 3, 12 * TS + 10, 10, 1, "#8f7fc0");
    P(10 * TS + 1, 12 * TS + 10, 3, 2, "#e0787d"); P(10 * TS + 5, 12 * TS + 10, 3, 2, "#e0787d");   // sandal jepit
  }

  function roomGround(c, m, i, j) {
    const x = i * TS, y = j * TS, tp = m.t[j][i], th = m.theme, h0 = hash(i, j, 3);
    const R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(x + a, y + b, w, h); };
    const wall = tp === T.WALL || tp === T.BOARD || tp === T.DOOR;
    if (!wall) {
      if (th.name === "home") {
        const z = zoneAt("home", i, j) || zones[3];
        if (POLISH.home) homeFloor(R, z, i, j, h0);
        else if (z.kind === "tile") {
          for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) R(sx * 8, sy * 8, 8, 8, (i * 2 + sx + j * 2 + sy) % 2 ? z.a : z.b);
          R(0, 0, TS, 1, "rgba(255,255,255,.35)"); R(0, 0, 1, TS, "rgba(255,255,255,.3)"); R(8, 0, 1, TS, "rgba(0,0,0,.06)"); R(0, 8, TS, 1, "rgba(0,0,0,.06)");
        } else {
          R(0, 0, TS, TS, z.a); R(0, 15, TS, 1, z.b); R((j * 7) % 12 + 2, 0, 1, TS, z.b);
          if (h0 % 3 === 0) R(h0 % 10 + 2, 5 + (h0 % 6), 4, 1, z.b);
        }
      } else if (th.name === "class" && m.zones && zoneIn(m, i, j)) {
        const z = zoneIn(m, i, j);
        if (z.name.indexOf("Lorong") === 0) {
          const base = (i + j) % 2 ? "#b9c1c9" : "#c8cdd1";
          R(0, 0, TS, TS, sh(base, (h0 % 5) - 2));
          R(0, 0, TS, 1, "rgba(255,255,255,.36)");
          R(0, 15, TS, 1, "rgba(48,52,72,.20)");
          R(15, 0, 1, TS, "rgba(48,52,72,.12)");
          if (j === 9 && i % 2 === 0) { R(0, 7, TS, 2, "#d8c89c"); R(0, 7, TS, 1, "rgba(255,245,210,.5)"); }
        } else {
          const base = z.kind === "wood" ? "#b8a58e" : z.kind === "tile" ? "#c7d2d5" : "#c9c4b8";
          R(0, 0, TS, TS, sh(base, ((h0 % 7) - 3) * 2));
          R(0, 0, TS, 1, "rgba(255,255,255,.32)");
          R(0, 15, TS, 1, "rgba(53,48,65,.17)");
          R(15, 0, 1, TS, "rgba(53,48,65,.10)");
          if (z.kind === "wood" && (i + j) % 3 === 0) R(2, 5 + h0 % 6, 10, 1, "rgba(104,82,72,.12)");
          if (z.kind === "tile" && (i + j) % 4 === 0) R(3, 3, 5, 1, "rgba(255,255,255,.22)");
        }
      } else if (m.zones && zoneIn(m, i, j) && zoneIn(m, i, j).kind === "tile") {
        const z = zoneIn(m, i, j);
        for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) R(sx * 8, sy * 8, 8, 8, (i * 2 + sx + j * 2 + sy) % 2 ? z.a : z.b);
        R(0, 0, TS, 1, "rgba(255,255,255,.4)"); R(0, 0, 1, TS, "rgba(255,255,255,.3)"); R(8, 0, 1, TS, "rgba(0,0,0,.06)"); R(0, 8, TS, 1, "rgba(0,0,0,.06)");
        if (j === 9 && i % 2 === 0) R(0, 7, TS, 2, "rgba(214,176,60,.25)");   // jalur kuning di tengah lorong
      } else if (m.zones && zoneIn(m, i, j) && zoneIn(m, i, j).kind === "wood") {
        const z = zoneIn(m, i, j);
        R(0, 0, TS, TS, z.a); R(0, 15, TS, 1, z.b); R((j * 7) % 12 + 2, 0, 1, TS, z.b);
        if (h0 % 3 === 0) R(h0 % 10 + 2, 5 + (h0 % 6), 4, 1, z.b);
      } else {
        R(0, 0, TS, TS, (i + j) % 2 ? th.floor : th.floor2); R(0, 0, TS, 1, "rgba(255,255,255,.25)"); R(0, 0, 1, TS, "rgba(255,255,255,.18)");
        if (h0 % 7 === 0) R(h0 % 12 + 2, 6, 3, 1, "rgba(0,0,0,.08)");
      }
      return;
    }
    const flo = (a, b) => { const n = at(m, a, b); return n !== -1 && n !== T.WALL && n !== T.DOOR && n !== T.BOARD; };
    if ((th.name === "home" || th.name === "class" || th.name === "house") && tp === T.WALL && j > 0 && j < m.h - 1 && (flo(i, j + 1) || (j === m.h - 2 && flo(i, j - 1))) && (at(m, i - 1, j) === T.WALL || at(m, i + 1, j) === T.WALL)) {
      // sisi depan sekat (menghadap ruangan di bawahnya)
      R(0, 0, TS, TS, th.wall); R(0, 9, TS, 7, th.wain); R(0, 8, TS, 1, "rgba(255,255,255,.4)"); R(0, 0, TS, 2, "rgba(0,0,0,.28)"); R(0, 14, TS, 2, "rgba(0,0,0,.22)");
      if (h0 % 2) R(h0 % 12, 11, 1, 4, "rgba(0,0,0,.1)");
      if (POLISH[th.name]) wallDetail(R, i, h0, th.name === "class");
    } else if ((th.name === "home" || th.name === "class" || th.name === "house") && tp === T.WALL && j > 0 && j < m.h - 1 && i > 0 && i < m.w - 1) {
      // sekat tegak: dilihat dari atas
      R(0, 0, TS, TS, "#5d4a3c"); R(4, 0, 8, TS, "#7a6350");
      if (flo(i - 1, j)) R(0, 0, 4, TS, "#3d2f27"); if (flo(i + 1, j)) R(12, 0, 4, TS, "#3d2f27");
      if (POLISH[th.name]) {
        R(0, 0, TS, TS, "#3b3050"); R(3, 0, 10, TS, "#6a5f8c"); R(4, 0, 1, TS, "#8f84b4"); R(11, 0, 1, TS, "#51466f");
        if (flo(i - 1, j)) R(0, 0, 3, TS, "#2a2038"); if (flo(i + 1, j)) R(13, 0, 3, TS, "#2a2038");
      }
    } else if (j === 0) {
      R(0, 0, TS, TS, th.wall); R(0, 9, TS, 7, th.wain); R(0, 8, TS, 1, "rgba(255,255,255,.4)"); R(0, 0, TS, 2, "rgba(0,0,0,.28)"); R(0, 14, TS, 2, "rgba(0,0,0,.22)");
      if (h0 % 2) R(h0 % 12, 11, 1, 4, "rgba(0,0,0,.1)");
      if (POLISH[th.name]) wallDetail(R, i, h0, th.name === "class");
    } else if (j === m.h - 1) {
      R(0, 0, TS, TS, "#5d4a3c"); R(0, 0, TS, 3, "#7a6350"); R(0, 13, TS, 3, "#3d2f27");
      if (POLISH[th.name]) { R(0, 0, TS, TS, "#3b3050"); R(0, 0, TS, 3, "#6a5f8c"); R(0, 13, TS, 3, "#2a2038"); }
    } else {
      R(0, 0, TS, TS, "#5d4a3c"); R(i === 0 ? 12 : 0, 0, 4, TS, "#3d2f27"); R(i === 0 ? 0 : 15, 0, 1, TS, "#7a6350");
      if (POLISH[th.name]) { R(0, 0, TS, TS, "#3b3050"); R(i === 0 ? 1 : 3, 0, 12, TS, "#6a5f8c"); R(i === 0 ? 12 : 0, 0, 4, TS, "#2a2038"); }
    }
    if (tp === T.DOOR) {
      R(0, 0, TS, TS, "#3d2f27"); R(2, 0, 12, 14, "#8a5a30"); R(3, 1, 4, 5, "#a06a38"); R(9, 1, 4, 5, "#a06a38"); R(3, 8, 10, 5, "#7a4d28"); R(11, 7, 2, 2, "#e8c25a");
      R(1, 14, 14, 2, "#6b4a2c");
    }
  }

  // ---------- bangunan ----------
  function roof(c, x, y, w, h, col, tin) {
    const P = pen(c), dk = sh(col, -26), lt = sh(col, 24);
    P(x, y, w, h, col);
    if (tin) { for (let k = 0; k < w; k += 3) P(x + k, y, 1, h, dk); for (let k = 0; k < 7; k++) { const q = hash(k, Math.floor(w), 77); P(x + (q % (w - 6)), y + ((q >>> 8) % (h - 4)), 5, 3, "rgba(150,70,30,.35)"); } }
    else for (let r = 0; r < h; r += 4) { P(x, y + r + 3, w, 1, dk); for (let k = (r / 4) % 2 ? 3 : 0; k < w; k += 6) P(x + k, y + r, 1, 4, dk); }
    P(x, y, w, 2, lt); P(x, y + h - 3, w, 3, sh(col, -48));
  }
  function win(c, x, y, w, h, list, shutter) {
    const P = pen(c), mw = Math.floor(w / 2), mh = Math.floor(h / 2);
    P(x - 2, y - 2, w + 4, h + 4, "#5a3a20"); P(x, y, w, h, "#8ebfda"); P(x, y, w, mh, "#b7e0f2");
    P(x + mw - 1, y, 2, h, "#5a3a20"); P(x, y + mh - 1, w, 2, "#5a3a20"); P(x + 1, y + 1, 2, 3, "#e8f6ff");
    P(x - 3, y + h + 2, w + 6, 2, "#efe5cf");
    if (shutter) { P(x - 6, y - 2, 4, h + 4, shutter); P(x + w + 2, y - 2, 4, h + 4, shutter); P(x - 6, y + 2, 4, 1, "rgba(0,0,0,.25)"); P(x + w + 2, y + 2, 4, 1, "rgba(0,0,0,.25)"); }
    list.push({ x, y, w, h });
  }
  function planter(c, x, y, w) {
    const P = pen(c); P(x - 2, y, w + 4, 4, "#6b4a2c");
    for (let k = 0; k < w + 2; k += 3) { P(x - 1 + k, y - 2, 2, 3, "#3f8f4a"); P(x + k, y - 3, 1, 2, ["#ff7aa2", "#ffd24a", "#fff"][(k / 3) % 3]); }
  }
  function plaque(c, text, cx, y) {
    c.font = "bold 6px monospace";
    const w = Math.ceil(c.measureText(text).width) + 6, P = pen(c);
    P(cx - w / 2, y, w, 9, "#3b2616"); P(cx - w / 2 + 1, y + 1, w - 2, 7, "#6b4429");
    c.fillStyle = "#ffe9b0"; c.fillText(text, cx - w / 2 + 3, y + 7);
  }
  function door(c, dx, dy) {
    const P = pen(c);
    P(dx, dy, TS, TS, "#4a2f1c"); P(dx + 2, dy + 2, 12, 14, "#9a6334"); P(dx + 3, dy + 3, 4, 5, "#b27a45"); P(dx + 9, dy + 3, 4, 5, "#b27a45");
    P(dx + 3, dy + 10, 10, 5, "#85532a"); P(dx + 11, dy + 8, 2, 2, "#f0cf70"); P(dx - 1, dy + 16, 18, 2, "#bdb7a8"); P(dx + 1, dy + 18, 14, 2, "#a59f90");
  }
  function awning(c, x, y, w, a, b) {
    const P = pen(c);
    for (let k = 0; k < w; k += 6) { P(x + k, y, 3, 6, a); P(x + k + 3, y, 3, 6, b); }
    P(x, y + 6, w, 1, "rgba(0,0,0,.3)");
    for (let k = 0; k < w; k += 6) { P(x + k, y + 6, 3, 2, a); P(x + k + 3, y + 6, 3, 2, b); }
  }

  function drawBuilding(c, b) {
    const P = pen(c), X = b.x * TS, W = b.w * TS, H = b.h * TS, Y = b.y * TS, fy = Y + H - b.fh;
    P(X + 3, Y + H, W, 5, "rgba(0,0,0,.2)");
    if (POLISH.world) { P(X + 4, Y + H + 5, W - 4, 4, "rgba(40,20,70,.12)"); P(X + W, Y + 14, 9, H - 8, "rgba(40,20,70,.13)"); P(X + W, Y + H - 4, 9, 9, "rgba(40,20,70,.10)"); }
    if (b.kind === "row") {
      roof(c, X - 2, Y, W + 4, H - b.fh, b.roof, true);
      for (let k = 0; k < 2; k++) {
        const q = hash(b.x, k, 9), ty = Y + 22 + k * 60 + (q % 12), tx = X + 4 + (q >>> 5) % 12;
        P(tx + 1, ty + 14, 2, 5, "#555"); P(tx + 9, ty + 14, 2, 5, "#555");
        P(tx, ty + 3, 12, 12, "#3a6ea5"); P(tx, ty + 3, 3, 12, "#5a8fc6"); P(tx + 9, ty + 3, 3, 12, "#2c5380"); disc(c, tx + 6, ty + 3, 6, "#6a9bd0");
        P(X + 20, ty - 4, 1, 10, "#333"); P(X + 17, ty - 1, 7, 1, "#333");   // antena
      }
      P(X, fy, W, b.fh, b.wall); P(X, fy, W, 3, "rgba(0,0,0,.25)");
      for (let r = 0; r < b.fh; r += 4) for (let k = (r / 4) % 2 ? 4 : 0; k < W; k += 8) P(X + k, fy + r, 7, 1, "rgba(0,0,0,.12)");
      win(c, X + 4, fy + 6, 8, 7, b.wins, "#5a8f6a");
      const rdx = b.door * TS, rdy = Y + H - TS;
      door(c, rdx, rdy);
      return;
    }
    roof(c, X - 3, Y, W + 6, H - b.fh, b.roof);
    P(X, fy, W, b.fh, b.wall); P(X, fy, W, 3, "rgba(0,0,0,.22)"); P(X, Y + H - 5, W, 5, sh(b.wall, -45));
    for (let k = 0; k < 14; k++) { const q = hash(b.x, k, 2); P(X + (q % (W - 3)), fy + 6 + ((q >>> 7) % (b.fh - 12)), 3, 1, "rgba(0,0,0,.07)"); }
    P(X, fy, 1, b.fh, "rgba(0,0,0,.25)"); P(X + W - 1, fy, 1, b.fh, "rgba(0,0,0,.25)");
    const dx = b.door * TS, dy = Y + H - TS;
    if (b.kind === "house") {
      win(c, X + 14, fy + 12, 16, 14, b.wins, "#3f7a8f"); win(c, X + 82, fy + 12, 16, 14, b.wins, "#3f7a8f");
      planter(c, X + 14, fy + 31, 16); planter(c, X + 82, fy + 31, 16);
      door(c, dx, dy); awning(c, dx - 3, dy - 8, 22, "#c0392b", "#f5ead0"); plaque(c, b.name, dx + 8, fy + 1);
      P(X + 100, Y - 10, 8, 14, "#8a5a46"); P(X + 99, Y - 12, 10, 3, "#6b4430");   // cerobong
    } else if (b.kind === "school") {
      // tiga lantai: jendela di sayap kiri & kanan, kornis antar lantai, pagar balkon
      [6, 36].forEach((yy) => { P(X, fy + yy + 30, W, 2, "rgba(0,0,0,.16)"); P(X, fy + yy + 32, W, 1, "rgba(255,255,255,.35)"); });
      [8, 32, 56, 80, 204, 228, 252, 276].forEach((o) => { [6, 46, 84].forEach((yy) => win(c, X + o, fy + yy, 18, 14, b.wins)); });
      [[2, 112], [192, 110]].forEach((sp) => { P(X + sp[0], fy + 64, sp[1], 1, "#8a8a92"); for (let k = 0; k < sp[1]; k += 6) P(X + sp[0] + k, fy + 64, 1, 5, "#8a8a92"); P(X + sp[0], fy + 69, sp[1], 1, "#6f6f7a"); });
      planter(c, X + 8, fy + 110, 90); planter(c, X + 206, fy + 110, 90);
      // blok tengah (teras, pilar, jendela tengah, papan nama)
      P(dx - 28, fy + 3, 72, b.fh - 3, "#f7f0dc"); P(dx - 28, fy + 3, 72, 3, "#c9bfa5");
      P(dx - 30, fy - 6, 76, 9, b.roof); P(dx - 30, fy + 1, 76, 2, "rgba(0,0,0,.3)");   // atap teras
      [-26, 38].forEach((o) => { P(dx + o, fy + 3, 5, b.fh - 3, "#ffffff"); P(dx + o + 4, fy + 3, 1, b.fh - 3, "#c9bfa5"); });
      [6, 46].forEach((yy) => { win(c, dx - 18, fy + yy, 14, 14, b.wins); win(c, dx + 20, fy + yy, 14, 14, b.wins); });
      P(dx - 28, fy + 40, 72, 2, "#c9bfa5"); P(dx - 28, fy + 78, 72, 2, "#c9bfa5");
      for (let s = 0; s < 3; s++) P(dx - 30 + s * 3, Y + H + s * 2, 76 - s * 6, 2, s % 2 ? "#a59f90" : "#bdb7a8");
      door(c, dx, dy); P(dx - 8, dy + 1, 8, 15, "#9a6334"); P(dx + 16, dy + 1, 8, 15, "#9a6334");
      plaque(c, b.name, dx + 8, fy + 27);
      disc(c, dx + 8, fy - 14, 7, "#f5ead0"); disc(c, dx + 8, fy - 14, 5, "#ffffff"); P(dx + 8, fy - 18, 1, 5, "#222"); P(dx + 8, fy - 14, 4, 1, "#222");
      P(dx + 1, fy - 24, 14, 3, b.roof); P(dx + 7, fy - 30, 2, 6, "#ddd");
    } else if (b.kind === "shop") {
      P(X + 6, fy + 10, 84, 20, "#2a1d14");
      for (let r = 0; r < 2; r++) { P(X + 8, fy + 14 + r * 7, 80, 1, "#6b4a2c"); for (let k = 0; k < 20; k++) { const q = hash(k, r, 12); P(X + 9 + k * 4, fy + 10 + r * 7, 3, 4, ["#e03a3a", "#f0c040", "#3a8fe0", "#4caf50", "#fff"][q % 5]); } }
      P(X + 4, fy + 22, 88, 6, "#9a6334"); P(X + 4, fy + 22, 88, 2, "#c58a50");
      awning(c, X - 2, fy + 2, 100, "#d94a3a", "#f5ead0"); plaque(c, b.name, X + 48, fy - 8);
      P(X + 74, fy + 28, 10, 8, "#d8e6f0"); P(X + 75, fy + 29, 8, 2, "#fff");                 // kulkas es
      P(X + 4, fy + 28, 8, 6, "#a06a38"); P(X + 8, fy + 30, 8, 5, "#b27a45");                 // peti
      door(c, dx, dy);
      b.wins.push({ x: X + 6, y: fy + 10, w: 84, h: 12 });
    }
  }

  function worldObjects(c, m) {
    const P = pen(c);
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
      const tp = m.t[j][i], x = i * TS, y = j * TS;
      if (tp === T.TREE) { c.fillStyle = "rgba(10,50,25,.28)"; for (let d = -3; d <= 3; d++) { const w = Math.round(9 * Math.sqrt(1 - (d * d) / 14)); c.fillRect(x + 9 - w, y + 13 + d, w * 2, 1); } }
      if (tp === T.FENCE) {
        P(x, y + 6, TS, 2, "#b0804f"); P(x, y + 11, TS, 2, "#a8774a"); P(x + 1, y + 3, 3, 12, "#8a5e36"); P(x + 10, y + 3, 3, 12, "#8a5e36");
        P(x + 1, y + 3, 3, 1, "#c99a68"); P(x + 10, y + 3, 3, 1, "#c99a68"); P(x, y + 15, TS, 2, "rgba(0,0,0,.18)");
      }
      if (tp === T.WATER) {
        for (const s of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
          const n = at(m, i + s[0], j + s[1]);
          if (n === T.WATER || n === -1 || hash(i, j, 60 + s[0] * 3 + s[1]) % 2) continue;
          const rx = s[0] ? (s[0] < 0 ? 0 : 12) : 4 + (hash(i, j, 61) % 8), ry = s[1] ? (s[1] < 0 ? 2 : 10) : 4 + (hash(i, j, 62) % 7);
          P(x + rx, y + ry, 1, 8, "#5f8f3a"); P(x + rx + 2, y + ry + 2, 1, 6, "#4f7f30"); P(x + rx - 1, y + ry - 2, 3, 4, "#6b4423");
        }
        if (hash(i, j, 63) % 4 === 0 && [[0, -1], [0, 1], [-1, 0], [1, 0]].every((s) => at(m, i + s[0], j + s[1]) === T.WATER)) {
          const lx = x + 3 + (hash(i, j, 64) % 6), ly = y + 4 + (hash(i, j, 65) % 6);
          P(lx, ly, 6, 4, "#3f9a52"); P(lx + 3, ly + 1, 3, 1, "#3b82b8"); P(lx + 1, ly, 2, 1, "#f7a8c4");
        }
      }
      if (tp === T.TREE || tp === T.GRASS) {
        const q = hash(i, j, 70);
        if (tp === T.GRASS && q % 40 === 0) { P(x + 3, y + 10, 5, 4, "#8e8e98"); P(x + 3, y + 10, 5, 1, "#b8b8c4"); P(x + 5, y + 13, 5, 1, "rgba(0,0,0,.2)"); }   // batu
        if (tp === T.GRASS && q % 53 === 1) { P(x + 6, y + 9, 1, 4, "#e8dcc0"); P(x + 4, y + 7, 5, 3, "#d9473a"); P(x + 5, y + 8, 1, 1, "#fff"); P(x + 7, y + 8, 1, 1, "#fff"); }  // jamur
      }
    }
    buildings.forEach((b) => drawBuilding(c, b));
    // papan nama sekolah & tiang pagar sawah
    for (let j = 24; j < 32; j += 1) { P(106 * TS - 3, j * TS + 3, 2, 10, "#8a5e36"); }
    // halaman sekolah: paving & garis lapangan upacara, tiang gerbang
    if (!POLISH.world) {
      for (let i = 106; i <= 122; i++) P(i * TS, 12 * TS, 1, 4 * TS, "rgba(120,100,70,.12)");
      for (let j = 12; j <= 15; j++) P(106 * TS, j * TS, 17 * TS, 1, "rgba(120,100,70,.12)");
      P(106 * TS + 4, 14 * TS - 1, 17 * TS - 8, 1, "rgba(255,255,255,.4)");
    } else {
      P(106 * TS + 8, 12 * TS + 10, 17 * TS - 16, 1, "rgba(255,255,255,.4)"); P(106 * TS + 8, 16 * TS - 10, 17 * TS - 16, 1, "rgba(255,255,255,.4)");   // list inlay halaman
      P(106 * TS + 8, 12 * TS + 10, 1, 4 * TS - 20, "rgba(255,255,255,.4)"); P(123 * TS - 9, 12 * TS + 10, 1, 4 * TS - 20, "rgba(255,255,255,.4)");
    }
    [113, 115].forEach((gi) => { const gx = gi * TS; P(gx + 3, 16 * TS - 12, 10, 28, "#e8e0cc"); P(gx + 3, 16 * TS - 12, 1, 28, "#c9bfa5"); P(gx + 2, 16 * TS - 14, 12, 3, "#c9bfa5"); P(gx + 5, 16 * TS - 18, 6, 4, "#3f6aa3"); });
    if (POLISH.world) {
      // Gerbang utama SMA Nusa: batu lavender, besi tempa gelap, dan papan nama beraksen emas.
      const gateX = 114 * TS, gateY = 15 * TS;
      P(gateX - 17, gateY - 31, 34, 3, "rgba(28,20,44,.24)");
      P(gateX - 18, gateY - 35, 36, 7, "#342b4b");
      P(gateX - 16, gateY - 34, 32, 4, "#71658e");
      P(gateX - 14, gateY - 33, 28, 1, "#c6b6a0");
      P(gateX - 10, gateY - 31, 20, 1, "#e5c98d");
      c.font = "bold 6px monospace"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillStyle = "#fff0c8"; c.fillText("SMA NUSA", gateX, gateY - 31);
      c.textAlign = "start"; c.textBaseline = "alphabetic";
      // Lambang kecil pada puncak gerbang.
      P(gateX - 3, gateY - 42, 6, 6, "#d8bd79"); P(gateX - 2, gateY - 41, 4, 4, "#3f6aa3");
      P(gateX - 1, gateY - 40, 2, 2, "#f4e7c5");
      // Daun pagar terbuka di sisi jalur masuk, tidak menutup akses karakter.
      [-1, 1].forEach((side) => {
        const sx = gateX + side * 12;
        P(sx - 1, gateY - 23, 2, 21, "#30283f");
        P(sx - 1, gateY - 23, 2, 1, "#b7a8ce");
        for (let k = 0; k < 4; k++) P(sx + side * (k * 2), gateY - 20 + k * 4, 1, 2, "#9b8caf");
        P(sx - 2, gateY - 2, 4, 2, "#4b405f");
      });
      // Paving halaman: sambungan batu, aksen tepi, dan jejak pantulan matahari pagi.
      for (let j = 12; j <= 15; j++) for (let i = 106; i <= 122; i++) {
        const tx = i * TS, ty = j * TS, q = hash(i, j, 811);
        if ((i + j) % 2 === 0) P(tx + 3, ty + 4, 1, 1, "rgba(255,244,220,.32)");
        if (q % 7 === 0) P(tx + 8, ty + 11, 3, 1, "rgba(72,61,99,.14)");
      }
      P(106 * TS + 4, 12 * TS + 3, 17 * TS - 8, 1, "rgba(255,235,202,.28)");
      // Pot tanaman dan semak rendah di tepi halaman, menjaga koridor tengah tetap lapang.
      [[107, 13], [121, 13], [107, 15], [121, 15]].forEach((v, n) => {
        const px = v[0] * TS + 4, py = v[1] * TS + 5;
        P(px - 2, py + 7, 13, 3, "rgba(34,24,48,.20)");
        P(px, py + 2, 9, 8, "#57445f"); P(px + 1, py + 2, 7, 2, "#a98a86");
        P(px + 1, py + 4, 7, 4, "#806176"); P(px + 2, py + 1, 5, 2, "#477b58");
        P(px + 1, py - 1, 3, 3, n % 2 ? "#5c9569" : "#6ba276");
        P(px + 5, py - 2, 3, 3, "#83ad78"); P(px + 6, py - 1, 2, 2, "#e8b7c0");
      });
      // Lampu taman mungil di sisi jalur pejalan kaki.
      [[109, 14], [119, 14]].forEach((v) => {
        const lx = v[0] * TS + 8, ly = v[1] * TS + 7;
        P(lx, ly, 2, 15, "#51445f"); P(lx - 3, ly - 4, 8, 5, "#3a304e");
        P(lx - 2, ly - 3, 6, 3, "#f1d9a0"); P(lx - 1, ly - 2, 4, 1, "#fff2c9");
        P(lx - 4, ly + 14, 10, 2, "#756482");
      });
      // Bangku taman di sisi luar koridor, dengan bilah kayu dan kaki besi.
      const bx = 109 * TS, by = 12 * TS + 3 * TS;
      P(bx + 2, by + 8, 28, 3, "rgba(32,22,45,.2)");
      P(bx + 3, by + 2, 25, 3, "#76566a"); P(bx + 3, by + 2, 25, 1, "#c69a83");
      P(bx + 5, by + 5, 2, 6, "#40374d"); P(bx + 24, by + 5, 2, 6, "#40374d");
      P(bx + 3, by + 1, 25, 1, "#d8b08a");
    }
    // petak & bayangan di bawah warung
    P(8 * TS, 26 * TS, 6 * TS, 3, "rgba(0,0,0,.16)");
  }

  // hiasan dinding rumah Nenek (tiap ruangan punya ciri sendiri)
  function homeDeco(c, P) {
    const frame = (x, y, w, h, inner) => { P(x, y, w, h, "#6b4429"); P(x + 1, y + 1, w - 2, h - 2, inner); };
    const clock = (cx, cy) => { disc(c, cx, cy, 5, "#6b4429"); disc(c, cx, cy, 4, "#fff6e0"); P(cx, cy - 3, 1, 4, "#222"); P(cx, cy, 3, 1, "#222"); };
    const calendar = (x, y) => { P(x, y, 8, 9, "#f5f0e0"); P(x, y, 8, 2, "#c0392b"); P(x + 1, y + 3, 6, 1, "#bbb"); P(x + 1, y + 5, 6, 1, "#bbb"); P(x + 1, y + 7, 4, 1, "#bbb"); };
    // kamar Marco
    clock(1 * TS + 8, 7); frame(5 * TS + 2, 2, 12, 10, "#2d3a5e"); P(5 * TS + 4, 4, 8, 2, "#e8b06a"); P(5 * TS + 4, 7, 5, 1, "#c04a5a"); P(5 * TS + 4, 9, 7, 1, "#7ec3de");
    calendar(7 * TS + 4, 3);
    // kamar Nenek
    calendar(9 * TS + 4, 3); frame(10 * TS + 3, 3, 10, 8, "#d9c08a"); P(10 * TS + 6, 5, 4, 4, "#8a6a42"); clock(14 * TS + 8, 7);
    // kamar mandi: cermin di atas wastafel, handuk di dekat kloset
    frame(18 * TS + 2, 2, 12, 9, "#b9e0ee"); P(18 * TS + 4, 3, 3, 1, "#ffffff"); P(17 * TS + 4, 3, 8, 2, "#999"); P(17 * TS + 5, 5, 6, 7, "#e8a0a8");
    // ruang tengah & dapur: sisi depan sekat memanjang (y = 7)
    const wy = 7 * TS;
    frame(2 * TS + 10, wy + 3, 12, 9, "#d9c08a"); P(2 * TS + 13, wy + 5, 6, 5, "#8a6a42");
    clock(8 * TS + 8, wy + 7);
    frame(5 * TS + 2, wy + 2, 28, 11, "#a9d8f0"); P(5 * TS + 3, wy + 8, 26, 4, "#59a06a"); P(5 * TS + 12, wy + 6, 8, 3, "#4a9450");
    P(15 * TS + 2, wy + 3, 12, 1, "#555"); [3, 6, 9].forEach((k) => P(15 * TS + k, wy + 4, 1, 6, "#bbb"));
    disc(c, 21 * TS + 8, wy + 8, 5, "#3a3a44"); disc(c, 21 * TS + 8, wy + 8, 3, "#55555f");
  }

  function roomObjects(g, m, name) {
    const th = m.theme, polished = !!POLISH[th.name];
    const fl = document.createElement("canvas"); fl.width = g.canvas.width; fl.height = g.canvas.height;
    const fx = fl.getContext("2d"); fx.imageSmoothingEnabled = false;
    let c = polished ? fx : g;      // perabot di layer terpisah (untuk garis tepi & bayangan), lantai datar di g
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
      const tp = m.t[j][i];
      if (tp === T.FLOOR || tp === T.WALL || tp === T.DOOR) continue;
      const x = i * TS, y = j * TS, tg = polished && (tp === T.RUG || tp === T.ARCH || tp === T.STAIR) ? g : c, p = (a, b, w, h, col) => { tg.fillStyle = col; tg.fillRect(x + a, y + b, w, h); };
      if (tp === T.RUG) {
        const e = [[0, -1], [0, 1], [-1, 0], [1, 0]].map((s) => at(m, i + s[0], j + s[1]) !== T.RUG);
        p(0, 0, TS, TS, th.rug[0]); p(e[2] ? 2 : 0, e[0] ? 2 : 0, TS - (e[2] ? 2 : 0) - (e[3] ? 2 : 0), TS - (e[0] ? 2 : 0) - (e[1] ? 2 : 0), th.rug[1]);
        if (!e.some(Boolean) || (i + j) % 2 === 0) { p(6, 4, 4, 8, th.rug[2]); p(4, 6, 8, 4, th.rug[2]); }
        if (e[2]) p(0, 0, 1, TS, th.rug[2]); if (e[3]) p(15, 0, 1, TS, th.rug[2]);
        if (polished) rugDetail(p, e, th);
        continue;
      }
      if (tp === T.IDOOR) {
        // Pintu antar-ruangan: tertutup dan padat, dibuka dengan menekan E di depannya.
        const school = th.name === "class", gold = "#f0cf70";
        const wood = school ? "#a9794a" : "#9a6334", lt = school ? "#c18e5c" : "#b27a45", dk = school ? "#7f5634" : "#85532a", frame = "#3d2a1a";
        const hz = at(m, i - 1, j) === T.WALL && at(m, i + 1, j) === T.WALL;
        if (hz) {
          p(0, 0, TS, TS, frame); p(2, 2, 12, 14, wood);
          if (school) { p(3, 3, 10, 5, "#8ebfda"); p(3, 3, 10, 1, "#c8e8f6"); p(7, 3, 2, 5, wood); p(4, 4, 2, 1, "rgba(255,255,255,.55)"); }
          else { p(3, 3, 4, 5, lt); p(9, 3, 4, 5, lt); }
          p(3, 10, 10, 5, dk); p(3, 10, 10, 1, lt); p(11, 8, 2, 2, gold); p(11, 8, 2, 1, "#fff0b0"); p(1, 15, 14, 1, "rgba(0,0,0,.35)");
        } else {
          p(0, 0, TS, 3, frame); p(0, 13, TS, 3, frame); p(3, 0, 10, 2, "#6a5f8c");
          p(4, 3, 8, 10, wood); p(4, 3, 8, 1, lt); p(7, 3, 1, 10, dk); p(10, 3, 1, 10, dk); p(4, 12, 8, 1, dk); p(9, 7, 2, 2, gold);
        }
        continue;
      }
      if (tp === T.ARCH) {
        const hz = at(m, i - 1, j) === T.WALL && at(m, i + 1, j) === T.WALL;
        if (hz) { p(0, 0, 3, TS, "#7a5230"); p(13, 0, 3, TS, "#7a5230"); p(0, 0, TS, 3, "#7a5230"); p(0, 13, TS, 3, "rgba(90,58,32,.35)"); }
        else { p(0, 0, TS, 3, "#7a5230"); p(0, 13, TS, 3, "#7a5230"); }
        continue;
      }
      if (tp === T.STAIR) {
        const dir = m.stairs && m.stairs[i + "," + j] === "down" ? 1 : 0;
        p(0, 0, TS, TS, "#9a9aa4"); for (let k = 0; k < 4; k++) { p(0, k * 4, TS, 3, k % 2 ? "#b9b9c4" : "#d2d2dc"); p(0, k * 4 + 3, TS, 1, "#6f6f7a"); }
        p(0, 0, 2, TS, "#5d4a3c"); p(14, 0, 2, TS, "#5d4a3c");
        const ay = dir ? 11 : 3; p(7, ay + (dir ? -4 : 1), 2, 5, "#e8c25a"); p(5, ay + (dir ? 0 : -1), 6, 1, "#e8c25a"); p(6, ay + (dir ? 1 : -2), 4, 1, "#e8c25a"); p(7, ay + (dir ? 2 : -3), 2, 1, "#e8c25a");
        continue;
      }
      if (tp === T.BLEACH) {
        p(0, 0, TS, TS, "#5d4a3c");
        for (let k = 0; k < 3; k++) { p(0, 1 + k * 5, TS, 3, k % 2 ? "#d9a468" : "#c98f5f"); p(0, 4 + k * 5, TS, 1, "#7a5230"); }
        p(0, 0, TS, 1, "#8a6a4c");
        continue;
      }
      if (tp === T.HOOP) {
        p(7, 9, 2, 7, "#555"); p(3, 1, 10, 8, "#f5f5f0"); p(3, 1, 10, 1, "#999"); p(3, 8, 10, 1, "#bbb"); p(6, 3, 4, 4, "#d94a3a"); p(7, 4, 2, 2, "#f5f5f0");
        p(5, 9, 6, 1, "#e87a20"); p(6, 10, 4, 2, "rgba(255,255,255,.7)"); p(1, 14, 15, 2, "rgba(30,15,40,.2)");
        continue;
      }
      if (!polished) p(1, 14, 15, 4, "rgba(30,15,40,.22)");   // bayangan furnitur
      if (tp === T.BED || tp === T.BEDN) {
        const bl = tp === T.BEDN ? ["#b0507a", "#d078a0", "#8f3a62"] : ["#3d6fb0", "#5b8fd0", "#2f5a96"];
        if (at(m, i - 1, j) !== tp) { p(0, 1, 3, 14, "#5a3a20"); p(3, 3, 13, 11, "#f4efe6"); p(4, 4, 7, 8, "#ffffff"); p(4, 10, 7, 2, "#dcd6ce"); p(3, 2, 13, 1, "#7a5230"); }
        else { p(0, 3, 14, 11, "#f4efe6"); p(0, 6, 14, 8, bl[0]); p(0, 6, 14, 2, bl[1]); p(0, 10, 14, 1, bl[2]); p(0, 12, 14, 1, bl[2]); p(14, 2, 2, 13, "#5a3a20"); p(0, 2, 14, 1, "#7a5230"); }
      } else if (tp === T.SHELF) {
        if (th.name === "home") {
          p(0, 0, TS, 15, "#7a5230"); p(0, 0, TS, 1, "#a06a38");
          for (let s = 0; s < 3; s++) { p(1, 1 + s * 5, 14, 4, "#3b2616"); for (let k = 0; k < 7; k++) { const q = hash(i * 7 + k, s, 88); p(1 + k * 2, 1 + s * 5 + (q % 2), 2, 4 - (q % 2), ["#c0392b", "#2e7d9a", "#e0b040", "#5a8f4a", "#7a4f9a", "#e8e2d0"][q % 6]); } }
        } else {
          p(0, 1, TS, 14, "#9c6b3c"); p(0, 0, TS, 2, "#c08a52"); p(7, 2, 2, 13, "#6f4a28");
          p(2, 3, 4, 7, "#b9dfee"); p(10, 3, 4, 7, "#b9dfee"); p(2, 3, 1, 7, "#e8f6ff"); p(10, 3, 1, 7, "#e8f6ff"); p(6, 9, 1, 2, "#e8d9a0"); p(9, 9, 1, 2, "#e8d9a0"); p(3, 11, 10, 3, "#7a5230");
          for (let k = 0; k < 3; k++) p(3 + k * 2, 5, 1, 4, ["#c0392b", "#e0b040", "#2e7d9a"][(i + k) % 3]);
        }
      } else if (tp === T.KITCHEN) {
        p(0, 3, TS, 12, "#8c6a4a"); p(0, 3, TS, 5, "#e8e2d6"); p(0, 8, TS, 1, "#b8b0a0"); p(7, 10, 2, 4, "#6f4f33");
        if (i % 2) { p(2, 4, 12, 3, "#8fb3c9"); p(7, 1, 2, 3, "#aab"); p(7, 1, 4, 1, "#aab"); }
        else { p(2, 2, 12, 2, "#b9bec6"); p(3, 4, 10, 4, "#9aa0a8"); p(5, 1, 6, 2, "#6b4a2c"); }
      } else if (tp === T.DESK) {
        p(1, 3, 14, 8, "#b07a45"); p(1, 3, 14, 1, "#d9a066"); p(1, 11, 14, 3, "#7a5230");
        const q = hash(i, j, 90);
        if (th.name === "home") { if (i % 2) { p(10, 0, 2, 6, "#444"); p(8, 0, 6, 2, "#f2c14e"); p(2, 5, 6, 4, "#f5f0e0"); p(5, 5, 1, 4, "#c9c0a8"); } else { p(3, 5, 4, 5, "#2e7d9a"); p(10, 6, 3, 3, "#f5f5f0"); p(11, 5, 1, 1, "#a77b4a"); } }
        else { p(3, 12, 10, 4, "#2f5a96"); p(3, 12, 10, 1, "#4a7fc0"); if (q % 3) p(2, 4, 5, 5, ["#c0392b", "#2e7d9a", "#4caf50"][q % 3]); if (q % 2) p(9, 5, 4, 4, "#f5f5f0"); p(8, 5, 1, 4, "#e8c25a"); }
      } else if (tp === T.TEACHER) {
        p(0, 3, TS, 9, "#8a5a30"); p(0, 3, TS, 1, "#b57a45"); p(0, 12, TS, 4, "#5f3d20");
        if (i % 2 === 0) { p(2, 4, 5, 3, "#c0392b"); p(2, 6, 6, 2, "#2e7d9a"); p(10, 4, 3, 4, "#e8e2d0"); } else { p(3, 4, 4, 4, "#f5f5f0"); p(10, 4, 3, 3, "#d9473a"); p(10, 3, 3, 1, "#3f8f4a"); }
      } else if (tp === T.BOARD) {
        p(0, 1, TS, 14, "#8a5a30"); p(0, 3, TS, 10, "#2f5d46"); p(0, 3, TS, 1, "#244a38"); p(0, 13, TS, 2, "#b57a45");
        if (at(m, i - 1, j) !== T.BOARD) p(0, 3, 2, 10, "#8a5a30"); if (at(m, i + 1, j) !== T.BOARD) p(14, 3, 2, 10, "#8a5a30");
        p(2 + (hash(i, 1, 4) % 8), 11, 3, 1, "#fff"); p(0, 14, TS, 1, "rgba(0,0,0,.25)");
      } else if (tp === T.WARDROBE) {
        const L = at(m, i - 1, j) !== tp, Rt = at(m, i + 1, j) !== tp;
        p(0, 0, TS, 15, "#6b4429"); p(0, 0, TS, 1, "#8a5a38"); p(1, 1, 14, 13, "#8a5a30"); p(1, 1, 14, 1, "#a8703c");
        if (L && Rt) { p(2, 2, 5, 11, "#7a4d28"); p(9, 2, 5, 11, "#7a4d28"); p(6, 7, 1, 3, "#e8c25a"); p(9, 7, 1, 3, "#e8c25a"); }
        else if (L) { p(2, 2, 13, 11, "#7a4d28"); p(13, 7, 1, 3, "#e8c25a"); }
        else { p(1, 2, 13, 11, "#7a4d28"); p(2, 7, 1, 3, "#e8c25a"); }
      } else if (tp === T.TOILET) {
        p(3, 0, 10, 5, "#e9eef0"); p(3, 0, 10, 1, "#ffffff"); p(11, 1, 2, 2, "#b0b8bc");
        p(2, 5, 12, 8, "#f6f8f8"); p(3, 6, 10, 6, "#dfe8ea"); p(4, 7, 8, 4, "#9fc4d2"); p(2, 12, 12, 1, "#b8c4c8");
      } else if (tp === T.SINK) {
        p(2, 4, 12, 8, "#eef2f4"); p(3, 5, 10, 5, "#9ec9dc"); p(3, 5, 10, 1, "#7fb2c8"); p(7, 1, 2, 4, "#aeb4b8"); p(6, 1, 4, 1, "#aeb4b8"); p(5, 12, 6, 3, "#d8dde0");
      } else if (tp === T.TUB) {
        const L = at(m, i - 1, j) !== tp, Rt = at(m, i + 1, j) !== tp, a = L ? 1 : 0, b = Rt ? 1 : 0;
        p(a, 2, TS - a - b, 13, "#4f8fa8"); p(a, 2, TS - a - b, 1, "#7fb8cc"); p(L ? 3 : 0, 4, TS - (L ? 3 : 0) - (Rt ? 3 : 0), 9, "#7ec3de"); p(L ? 3 : 0, 4, TS - (L ? 3 : 0) - (Rt ? 3 : 0), 2, "#a9dcef");
        if (Rt) { p(5, 7, 4, 3, "#e05050"); p(8, 6, 5, 1, "#e05050"); }
      } else if (tp === T.FRIDGE) {
        p(2, 0, 12, 15, "#d9e1e6"); p(2, 0, 12, 1, "#f2f6f8"); p(2, 6, 12, 1, "#8a949a"); p(11, 2, 1, 3, "#7a848a"); p(11, 8, 1, 4, "#7a848a"); p(4, 8, 3, 3, "#e0584a"); p(4, 2, 3, 2, "#ffd54a");
      } else if (tp === T.TABLE) {
        const L = at(m, i - 1, j) !== tp, Rt = at(m, i + 1, j) !== tp, a = L ? 1 : 0, b = Rt ? 1 : 0;
        p(a, 2, TS - a - b, 11, "#b07a45"); p(a, 2, TS - a - b, 1, "#d9a066"); p(a, 11, TS - a - b, 2, "#7a5230"); p(L ? 2 : 0, 13, 2, 2, "#5f3d20"); p(Rt ? 12 : 14, 13, 2, 2, "#5f3d20");
        if (L) { p(3, 3, 10, 6, "#e8d8a8"); p(3, 3, 10, 1, "#f6ecc8"); p(7, 2, 3, 1, "#a08040"); }
        else { p(2, 4, 5, 4, "#f5f5f0"); p(3, 5, 3, 2, "#c0392b"); p(10, 4, 3, 5, "#2e7d9a"); }
      } else if (tp === T.SOFA) {
        const L = at(m, i - 1, j) !== tp, Rt = at(m, i + 1, j) !== tp;
        p(0, 2, TS, 9, "#b5654f"); p(0, 2, TS, 1, "#cf8570"); p(1, 4, TS - 2, 5, "#c47661"); p(0, 10, TS, 5, "#8a4a3a"); p(0, 10, TS, 1, "#a8604d");
        if (L) p(0, 2, 3, 13, "#8a4a3a"); if (Rt) p(13, 2, 3, 13, "#8a4a3a");
      } else if (tp === T.TV) {
        p(1, 9, 14, 6, "#7a5230"); p(1, 9, 14, 1, "#a06a38"); p(2, 0, 12, 10, "#26262e"); p(3, 1, 10, 7, "#4b7aa8"); p(3, 1, 10, 2, "#6c9bc8"); p(11, 4, 1, 1, "#e8e8e8");
      } else if (tp === T.CUPBOARD) {
        p(0, 1, TS, 12, "#9c6b3c"); p(0, 1, TS, 1, "#c08a52"); p(1, 2, 6, 10, "#8a5a30"); p(9, 2, 6, 10, "#8a5a30"); p(6, 6, 1, 3, "#e8c25a"); p(9, 6, 1, 3, "#e8c25a"); p(0, 13, TS, 1, "#6f4a28");
      } else if (tp === T.PLANT) {
        p(4, 9, 8, 6, "#b5623a"); p(3, 8, 10, 2, "#c97a4a"); disc(c, x + 8, y + 5, 4, "#2f8a3f"); disc(c, x + 5, y + 6, 3, "#3fae4f"); disc(c, x + 11, y + 4, 3, "#58c25a");
      }
      if (polished) furnDetail(p, c, tp, i, j, m, x, y);
    }
    if (polished) { mergeLayer(g, fl); c = g; }
    const P = pen(c);
    if (polished && name === "home") homeFloorDeco(P);
    // jendela & hiasan dinding
    (m.windows || []).forEach((i) => {
      const x = i * TS;
      if (polished && th.name === "home") { homeWindow(P, x); return; }
      if (polished && th.name === "class") {
        P(x, 1, 16, 13, "#596575"); P(x + 1, 2, 14, 11, "#293b55");
        P(x + 2, 3, 12, 9, "#9bbbd0"); P(x + 2, 3, 12, 4, "#c8e0e9");
        P(x + 3, 4, 4, 2, "rgba(255,255,255,.65)"); P(x + 2, 8, 12, 1, "#52677c");
        P(x + 7, 3, 2, 9, "#596575"); P(x + 1, 13, 14, 2, "#e4e0d6");
        return;
      }
      P(x + 1, 2, 14, 11, "#5a3a20"); P(x + 2, 3, 12, 9, "#9fd3ee"); P(x + 2, 3, 12, 4, "#c6e8f6"); P(x + 7, 3, 2, 9, "#5a3a20"); P(x + 2, 7, 12, 1, "#5a3a20"); P(x, 13, 16, 2, "#efe5cf");
      if (th.name === "home") { P(x + 2, 3, 3, 9, "#c0536a"); P(x + 11, 3, 3, 9, "#c0536a"); P(x + 2, 3, 3, 1, "#e0788d"); P(x + 11, 3, 3, 1, "#e0788d"); }
    });
    if (th.name === "home") {
      homeDeco(c, P);
    } else {
      const frame = (x, y, w, h, inner) => { P(x, y, w, h, "#6b4429"); P(x + 1, y + 1, w - 2, h - 2, inner); };
      const clock = (cx, cy) => { disc(c, cx, cy, 5, "#6b4429"); disc(c, cx, cy, 4, "#fff6e0"); P(cx, cy - 3, 1, 4, "#222"); P(cx, cy, 3, 1, "#222"); };
      (m.signs || []).forEach((sg) => plaque(c, sg.text, sg.cx, sg.y));
      if (th.name === "class") {
        // Papan pengumuman, poster kegiatan, dan panel ventilasi di atas ruang kelas.
        (m.rooms || []).forEach((r) => {
          const ox = r.ox, left = ox * TS + 3, top = 2;
          if (r.kind === "class") {
            P(left, top, 15, 10, "#65727c"); P(left + 1, top + 1, 13, 8, "#e6e0cf");
            P(left + 2, top + 2, 11, 1, "#8798a8");
            P(left + 2, top + 4, 4, 1, "#8b9b83"); P(left + 2, top + 6, 8, 1, "#b7a68c");
            P(left + 2, top + 8, 6, 1, "#b7a68c");
            P((ox + 5) * TS + 4, top + 1, 9, 8, "#667d91");
            P((ox + 5) * TS + 5, top + 2, 7, 6, "#d7e3e4");
            P((ox + 5) * TS + 6, top + 3, 5, 1, "#91a8a8");
            P((ox + 6) * TS + 6, top + 5, 3, 2, "#c5ad78");
          } else if (r.kind === "guru") {
            P(left, top, 13, 9, "#5d6b79"); P(left + 1, top + 1, 11, 7, "#d9e0dd");
            P(left + 2, top + 3, 9, 1, "#839a9c"); P(left + 2, top + 5, 6, 1, "#b2a88f");
          }
        });
      }
      if (m.court) {
        const W = "#f5f5f0", L = (x, y, w, h) => P(x, y, w, h, W);
        const arc = (cx, cy, r, a0, a1, ok) => { for (let a = a0; a <= a1; a += 1 / r) { const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r); if (!ok || ok(x, y)) P(x, y, 2, 2, W); } };
        P(136, 32, 96, 48, "rgba(40,100,200,.8)"); P(136, 176, 96, 48, "rgba(40,100,200,.8)");           // area bawah ring
        L(48, 32, 272, 2); L(48, 222, 272, 2); L(48, 32, 2, 192); L(318, 32, 2, 192); L(48, 127, 272, 2);   // garis tepi & tengah
        arc(184, 128, 24, 0, Math.PI * 2);
        L(136, 32, 2, 48); L(230, 32, 2, 48); L(136, 78, 96, 2); L(136, 176, 2, 48); L(230, 176, 2, 48); L(136, 176, 96, 2);
        arc(184, 80, 16, 0, Math.PI); arc(184, 176, 16, Math.PI, Math.PI * 2);                                 // lingkaran lemparan bebas
        arc(184, 36, 64, 0, Math.PI, (x, y) => y >= 34); L(120, 32, 2, 6); L(246, 32, 2, 6);
        arc(184, 220, 64, Math.PI, Math.PI * 2, (x, y) => y <= 222); L(120, 218, 2, 6); L(246, 218, 2, 6);
        // papan skor di tembok atas
        P(9 * TS + 4, 2, 56, 12, "#222"); P(9 * TS + 5, 3, 54, 10, "#3a3a44"); c.font = "bold 7px monospace"; c.fillStyle = "#ff4a3a"; c.fillText("21  17", 9 * TS + 11, 11);
      }
      (m.rooms || []).forEach((r) => {
        const ox = r.ox;
        // papan nama ruangan di sisi depan sekat lorong
        plaque(c, r.label, (ox + 5) * TS + 8, 7 * TS + 3);
        if (r.kind === "kepsek" || r.kind === "wakepsek") {
          // bendera, Garuda & foto presiden, jam, papan nama di atas meja
          P(ox * TS + 2, 2, 1, 12, "#8a5a30"); P(ox * TS + 3, 3, 11, 4, "#d94a3a"); P(ox * TS + 3, 7, 11, 4, "#f5f5f0");
          frame((ox + 2) * TS + 5, 3, 10, 11, "#2a3a5e"); P((ox + 2) * TS + 8, 5, 4, 4, "#e8c25a"); P((ox + 2) * TS + 7, 10, 6, 2, "#e8c25a");
          frame((ox + 3) * TS + 5, 3, 10, 11, "#d9c08a"); disc(c, (ox + 3) * TS + 10, 7, 2, "#c98f5f"); P((ox + 3) * TS + 7, 9, 6, 4, "#222");
          clock((ox + 4) * TS + 8, 7);
          P((ox + 3) * TS + 4, 3 * TS + 2, 8, 3, "#e8c25a"); P((ox + 3) * TS + 5, 3 * TS + 3, 6, 1, "#6b4429");
          P((ox + 2) * TS + 3, 3 * TS + 3, 4, 4, "#f5f5f0"); P((ox + 4) * TS + 8, 3 * TS + 4, 5, 3, "#2e7d9a");
        } else if (r.kind === "guru") {
          // jadwal pelajaran, foto guru, jam
          frame((ox + 3) * TS - 8, 2, 28, 12, "#f5f0e0");
          for (let a = 0; a < 3; a++) for (let b = 0; b < 6; b++) P((ox + 3) * TS - 6 + b * 4, 4 + a * 3, 3, 2, ["#e0693a", "#4caf50", "#3a8fe0", "#e0b040", "#b9b9c4"][(a * 2 + b) % 5]);
          frame(ox * TS + 3, 3, 10, 11, "#d9c08a"); disc(c, ox * TS + 8, 7, 2, "#c98f5f"); P(ox * TS + 5, 9, 6, 4, "#3a4a6e");
          clock((ox + 6) * TS + 8, 7);
        } else if (r.kind === "uks") {
          // palang merah, bagan tes mata, jam
          frame((ox + 3) * TS + 1, 2, 14, 12, "#f5f5f0"); P((ox + 3) * TS + 7, 4, 2, 8, "#d93030"); P((ox + 3) * TS + 4, 7, 8, 2, "#d93030");
          frame(ox * TS + 3, 2, 10, 12, "#f5f5f0"); [[5, 6], [6, 4], [7, 3], [8, 2]].forEach((l, n) => P(ox * TS + 7 - Math.floor(l[1] / 2), 4 + n * 2, l[1], 1, "#333"));
          clock((ox + 6) * TS + 8, 7);
        } else {
          clock((ox + 6) * TS + 8, 7);
          if (r.label === "XII-A") { c.font = "5px monospace"; c.fillStyle = "rgba(255,255,255,.85)"; c.fillText("(x+2)(x+3)", (ox + 1) * TS + 2, 10); }
        }
      });
    }
  }

  // ---------- bake ----------
  const baked = {};
  function bake(name) {
    const m = maps[name], cv = document.createElement("canvas");
    cv.width = m.w * TS; cv.height = m.h * TS;
    const c = cv.getContext("2d"); c.imageSmoothingEnabled = false;
    const g = name === "world" ? worldGround : roomGround;
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) g(c, m, i, j);
    if (name === "world") worldObjects(c, m); else { if (POLISH[m.theme.name]) ambient(c, m); roomObjects(c, m, name); }
    baked[name] = cv;
  }

  // ---------- objek yang diurutkan (pohon, lampu, dll) ----------
  const treeList = [], propList = [];
  (() => {
    const m = maps.world;
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
      const tp = m.t[j][i];
      if (tp === T.TREE) { const q = hash(i, j, 100) % 10, edge = i === 0 || j === 0 || i === m.w - 1 || j === m.h - 1; treeList.push({ i, j, k: q < 2 ? "palm" : q < 3 && !edge ? "bush" : "oak", v: hash(i, j, 101) % 4 }); }
      else if (tp === T.POST) propList.push({ i, j, k: props[i + "," + j] });
      else if (tp === T.BENCH && at(m, i - 1, j) !== T.BENCH) propList.push({ i, j, k: "bench" });
    }
  })();

  function drawTree(c, o, t) {
    const x = o.i * TS, by = (o.j + 1) * TS, sw = Math.sin(t * 1.6 + o.i * 0.7 + o.j) , P = pen(c);
    if (o.k === "palm") {
      const lean = o.v % 2 ? 1 : -1;
      for (let k = 0; k < 13; k++) { const px = x + 7 + Math.round(Math.sin(k / 13 * 1.3) * 4 * lean), py = by - 2 - k * 2; P(px, py, 3, 2, k % 2 ? "#8a6a45" : "#a07c52"); }
      const tx = x + 8 + Math.round(Math.sin(1.3) * 4 * lean) + Math.round(sw), ty = by - 30;
      for (let a = 0; a < 8; a++) {
        const ang = a * Math.PI / 4 + 0.3, col = a % 2 ? "#2f8f3f" : "#43b052";
        for (let s = 1; s <= 8; s++) P(Math.round(tx + Math.cos(ang) * s * 1.7 + sw * s * 0.08), Math.round(ty + Math.sin(ang) * s * 0.9 + s * s * 0.1), 2, 2, col);
      }
      P(tx - 1, ty + 1, 3, 3, "#6b4423"); P(tx + 2, ty + 2, 3, 3, "#7a5230");
      return;
    }
    if (o.k === "bush") { disc(c, x + 8, by - 5, 6, "#2a7a3a"); disc(c, x + 7 + sw * 0.5, by - 7, 5, "#3a9246"); disc(c, x + 5, by - 9, 2, "#58b85c"); P(x + 10, by - 7, 2, 2, "#e0485a"); P(x + 5, by - 4, 2, 2, "#e0485a"); return; }
    P(x + 6, by - 12, 4, 12, "#6b4423"); P(x + 9, by - 12, 1, 12, "#553419"); P(x + 5, by - 2, 6, 2, "#6b4423");
    const cx = x + 8 + sw * 0.8, cy = by - 22;
    disc(c, cx + 1, cy + 3, 11, "#1f5f31"); disc(c, cx, cy, 10, "#2f7a3a"); disc(c, cx - 2, cy - 3, 7, "#3a9246"); disc(c, cx - 4, cy - 5, 3, "#58b85c");
    for (let k = 0; k < 6; k++) { const q = hash(o.i, o.j, 110 + k); P(Math.round(cx) - 8 + (q % 16), cy - 8 + ((q >>> 6) % 16), 2, 1, k % 2 ? "#2a6a33" : "#4fa954"); }
    if (o.v === 0) { P(Math.round(cx) + 4, cy + 2, 2, 2, "#e0485a"); P(Math.round(cx) - 5, cy - 2, 2, 2, "#e0485a"); }
  }

  function drawProp(c, o, t, dusk) {
    const x = o.i * TS, by = (o.j + 1) * TS, P = pen(c);
    if (o.k && o.k.indexOf("district:") === 0) {
      const label = o.k.split(":")[1], palettes = { ELIT: ["#d7c59a", "#465d7c"], PADAT: ["#c78b61", "#61443a"], MALAM: ["#d59acb", "#49345f"], KOTA: ["#d8d4c5", "#4b5369"] }, pal = palettes[label] || palettes.KOTA;
      P(x + 1, by - 2, 18, 2, "rgba(0,0,0,.2)"); P(x + 7, by - 39, 3, 38, "#594b45"); P(x - 9, by - 48, 35, 13, pal[1]); P(x - 8, by - 47, 33, 10, pal[0]);
      c.fillStyle = pal[1]; c.font = "bold 5px monospace"; c.textAlign = "center"; c.fillText(label, x + 8, by - 41); c.textAlign = "start";
    } else if (o.k === "halte") {
      P(x + 1, by - 2, 14, 2, "rgba(0,0,0,.22)"); P(x + 3, by - 30, 2, 29, "#51465f"); P(x + 11, by - 30, 2, 29, "#51465f"); P(x + 1, by - 33, 14, 4, "#3f6aa3"); P(x + 2, by - 32, 12, 2, "#f1d8a1"); P(x + 4, by - 25, 8, 11, "#d7d0c3"); P(x + 5, by - 24, 6, 8, "#8fb3c9"); c.fillStyle = "#fff2d0"; c.font = "bold 5px monospace"; c.fillText("A", x + 6, by - 28);
    } else if (o.k === "lamp") {
      P(x + 4, by - 2, 8, 2, "rgba(0,0,0,.25)"); P(x + 7, by - 32, 2, 31, "#33343f"); P(x + 5, by - 3, 6, 3, "#2a2b35"); P(x + 6, by - 32, 5, 2, "#33343f");
      P(x + 4, by - 38, 8, 6, "#2a2a35"); P(x + 5, by - 37, 6, 4, dusk > 0.3 ? "#ffd890" : "#aab4c0"); P(x + 3, by - 39, 10, 2, "#3a3b47");
    } else if (o.k === "signal") {
      const ph = Math.floor(t / 3) % 3;
      P(x + 4, by - 2, 8, 2, "rgba(0,0,0,.25)"); P(x + 7, by - 22, 2, 21, "#33343f"); P(x + 4, by - 36, 8, 15, "#222");
      ["#ff4040", "#ffd040", "#40e060"].forEach((col, k) => { P(x + 6, by - 34 + k * 4, 4, 3, k === ph ? col : "#444"); });
    } else if (o.k === "flag") {
      P(x + 3, by - 2, 10, 2, "rgba(0,0,0,.25)"); P(x + 6, by - 2, 4, 2, "#8a8a92"); P(x + 7, by - 46, 2, 45, "#d8d8de"); disc(c, x + 8, by - 47, 2, "#e8c25a");
      for (let k = 0; k < 18; k++) { const w = Math.round(Math.sin(t * 3 + k * 0.5) * 1.5); P(x + 9 + k, by - 45 + w, 1, 5, "#d93030"); P(x + 9 + k, by - 40 + w, 1, 5, "#f5f5f5"); }
    } else if (o.k === "scarecrow") {
      const sw = Math.round(Math.sin(t * 1.5) * 1);
      P(x + 4, by - 2, 8, 2, "rgba(0,0,0,.25)"); P(x + 7, by - 26, 2, 25, "#8a5e36"); P(x, by - 21, 16, 2, "#8a5e36");
      P(x + 3 + sw, by - 20, 10, 9, "#c0562f"); P(x + 3 + sw, by - 20, 10, 2, "#a0431f"); P(x + 2 + sw, by - 12, 3, 3, "#d9c070"); P(x + 11 + sw, by - 12, 3, 3, "#d9c070");
      disc(c, x + 8, by - 26, 4, "#f0d8a0"); P(x + 2, by - 31, 12, 2, "#b8924a"); P(x + 5, by - 36, 6, 5, "#c9a45a"); P(x + 6, by - 27, 1, 1, "#222"); P(x + 9, by - 27, 1, 1, "#222");
    } else if (o.k === "parasol") {
      P(x + 2, by - 2, 14, 2, "rgba(0,0,0,.22)"); P(x + 7, by - 20, 2, 18, "#d8d0c0"); P(x + 2, by - 10, 12, 3, "#9a6334"); P(x + 3, by - 10, 10, 1, "#c58a50");
      P(x - 3, by - 6, 4, 5, "#e8a020"); P(x + 15, by - 6, 4, 5, "#e8a020");
      for (let k = -9; k <= 9; k++) { const w = 9 - Math.abs(k) * 0.4; P(x + 8 + k, by - 26 + Math.abs(k) * 0.4, 1, 6, k % 4 < 2 ? "#e0483a" : "#f5ead0"); }
    } else if (/^bike/.test(o.k)) {
      const col = ["#c0392b", "#2f6fb0", "#e8b020"][+o.k.slice(4)];
      P(x, by - 2, 16, 2, "rgba(0,0,0,.25)"); P(x + 1, by - 8, 4, 6, "#222"); P(x + 11, by - 8, 4, 6, "#222"); P(x + 2, by - 7, 2, 4, "#999"); P(x + 12, by - 7, 2, 4, "#999");
      P(x + 3, by - 12, 10, 4, col); P(x + 10, by - 16, 4, 5, col); P(x + 11, by - 18, 3, 2, "#888"); P(x + 3, by - 14, 6, 2, "#222"); P(x + 11, by - 15, 2, 2, "#fff6b0");
    } else if (o.k === "bench") {
      P(x + 1, by - 2, 30, 2, "rgba(0,0,0,.22)"); P(x + 2, by - 14, 28, 2, "#7a5230"); P(x + 2, by - 11, 28, 2, "#8a5e36"); P(x + 2, by - 8, 28, 3, "#a8774a");
      P(x + 3, by - 5, 3, 5, "#3a3b47"); P(x + 26, by - 5, 3, 5, "#3a3b47"); P(x + 2, by - 14, 2, 8, "#3a3b47"); P(x + 28, by - 14, 2, 8, "#3a3b47");
    }
  }

  // ---------- cahaya & waktu ----------
  const KEYS = [[0, 255, 245, 220, 0.05], [0.25, 255, 255, 255, 0], [0.5, 255, 180, 135, 0.12], [0.65, 105, 100, 155, 0.34], [0.9, 75, 75, 135, 0.38], [1, 255, 225, 175, 0.08]];
  function tint(p) {
    p = clamp(p, 0, 1);
    for (let k = 1; k < KEYS.length; k++) {
      if (p <= KEYS[k][0]) {
        const a = KEYS[k - 1], b = KEYS[k], f = (p - a[0]) / (b[0] - a[0]), v = (n) => Math.round(a[n] + (b[n] - a[n]) * f);
        return "rgba(" + v(1) + "," + v(2) + "," + v(3) + "," + (a[4] + (b[4] - a[4]) * f).toFixed(3) + ")";
      }
    }
    return "rgba(120,70,140,.3)";
  }
  const dusk = (p) => clamp((p - 0.5) / 0.15, 0, 1);

  function vignette(ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, w * 0.66);
    g.addColorStop(0, "rgba(10,5,25,0)"); g.addColorStop(1, "rgba(10,5,25,.38)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // ---------- lapisan dinamis ----------
  const waterTiles = [], paddyTiles = [];
  for (let j = 0; j < maps.world.h; j++) for (let i = 0; i < maps.world.w; i++) { const tp = maps.world.t[j][i]; if (tp === T.WATER) waterTiles.push([i, j]); if (tp === T.PADDY) paddyTiles.push([i, j]); }

  function under(ctx, name, t, view, dsk) {
    if (!baked[name]) bake(name);
    ctx.drawImage(baked[name], 0, 0);
    if (name !== "world") return;
    const P = pen(ctx), f = Math.floor(t * 1.4);
    waterTiles.forEach((p) => {
      if (hash(p[0], p[1], f) % 5 === 0) P(p[0] * TS + 3 + (hash(p[0], p[1], f + 1) % 8), p[1] * TS + 4 + (hash(p[0], p[1], f + 2) % 8), 4, 1, "rgba(255,255,255,.35)");
    });
    paddyTiles.forEach((p) => {
      const w = Math.sin(t * 1.2 + p[0] * 0.5 + p[1] * 0.3);
      if (w > 0.82) P(p[0] * TS, p[1] * TS + 4, TS, 2, "rgba(255,255,220,.13)");
    });
    for (let k = 0; k < 2; k++) {
      const a = t * 0.3 + k * 3, cx = 17.5 * TS + Math.cos(a) * 22, cy = 5.5 * TS + Math.sin(t * 0.4 + k * 2) * 15, dir = Math.sin(a) > 0 ? -1 : 1;
      P(cx - 4, cy + 3, 12, 1, "rgba(255,255,255,.3)"); P(cx, cy, 7, 4, "#f4efe0"); P(cx + (dir > 0 ? 5 : -2), cy - 3, 3, 4, "#2f7a4a"); P(cx + (dir > 0 ? 8 : -4), cy - 1, 2, 1, "#f0a030"); P(cx + (dir > 0 ? 0 : 5), cy, 2, 2, "#d8d0bc");
    }
  }

  function sortables(ctx, name, t, view, dsk) {
    if (name !== "world") return [];
    const out = [], vx0 = view.x - 28, vx1 = view.x + view.w + 28, vy0 = view.y - 10, vy1 = view.y + view.h + 60;
    treeList.forEach((o) => { const px = o.i * TS, py = (o.j + 1) * TS; if (px > vx0 && px < vx1 && py > vy0 && py < vy1) out.push({ y: py - 1, f: () => drawTree(ctx, o, t) }); });
    propList.forEach((o) => { const px = o.i * TS, py = (o.j + 1) * TS; if (px > vx0 && px < vx1 && py > vy0 && py < vy1) out.push({ y: py - 1, f: () => drawProp(ctx, o, t, dsk) }); });
    return out;
  }

  function glow(ctx, cx, cy, r, a, col) {
    for (let k = 3; k >= 1; k--) disc(ctx, cx, cy, Math.round(r * k / 3), "rgba(" + col + "," + (a / k * 0.9).toFixed(3) + ")");
  }

  // Cahaya lampu meja, kilau TV, dan lampu ruang tengah (menguat menjelang malam).
  function homeLight(ctx, t, dsk) {
    const a = clamp((dsk - 0.1) / 0.5, 0, 1);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    glow(ctx, 9 * TS + 8, 9 * TS + 10, 34, 0.09 + 0.035 * Math.sin(t * 7) * Math.sin(t * 2.3), "110,160,255");   // TV berkedip
    if (a > 0) {
      [5, 9].forEach((i, k) => glow(ctx, i * TS + 11, 2 * TS + 2, 30, 0.13 * a * (0.95 + 0.05 * Math.sin(t * 3 + k)), "255,196,110"));
      glow(ctx, 6 * TS, 10 * TS, 58, 0.06 * a, "255,190,110");
      glow(ctx, 18 * TS, 10 * TS + 8, 40, 0.05 * a, "255,200,130");
    }
    ctx.restore();
  }

  function over(ctx, name, t, view, dsk) {
    const P = pen(ctx);
    ctx.save();
    if (name === "world") {
      if (POLISH.world) P(0, 0, maps.world.w * TS, maps.world.h * TS, "rgba(112,92,170,.035)");   // grading ungu senja
      // bayangan awan
      for (let k = 0; k < 7; k++) {
        const cx = ((t * 7 + k * 530) % (maps.world.w * TS + 300)) - 150, cy = 90 + k * 310;
        ctx.fillStyle = "rgba(20,30,60,.07)";
        disc(ctx, cx, cy, 30, "rgba(20,30,60,.07)"); disc(ctx, cx + 34, cy + 6, 24, "rgba(20,30,60,.07)"); disc(ctx, cx - 30, cy + 8, 20, "rgba(20,30,60,.07)");
      }
      // asap cerobong rumah nenek
      for (let k = 0; k < 5; k++) {
        const ph = ((t * 0.5 + k / 5) % 1), sx = 6 * TS + 104 + Math.sin(ph * 6 + k) * 3 + ph * 8, sy = 7 * TS - 14 - ph * 30;
        disc(ctx, sx, sy, 2 + Math.round(ph * 3), "rgba(235,235,240," + (0.5 * (1 - ph)).toFixed(2) + ")");
      }
      // daun jatuh
      for (let k = 0; k < 36; k++) {
        const q = hash(k, 3, 200), sp = 8 + (q % 8), lx = ((q % (maps.world.w * TS)) + t * sp * 0.8 + Math.sin(t + k) * 6) % (maps.world.w * TS), ly = ((q >>> 8) % (maps.world.h * TS) + t * sp) % (maps.world.h * TS);
        P(Math.round(lx), Math.round(ly), 2, 1, k % 3 ? "#8fcf6a" : "#e0b040");
      }
      // kupu-kupu (siang)
      if (dsk < 0.5) for (let k = 0; k < 4; k++) {
        const cx = [90, 150, 640, 700][k], cy = [380, 140, 160, 470][k], bx = cx + Math.sin(t * 0.7 + k) * 40, by = cy + Math.sin(t * 1.3 + k * 2) * 20, fl = Math.floor(t * 10 + k) % 2;
        const col = ["#f7a8c4", "#ffe066", "#a8d0ff", "#ffffff"][k];
        P(Math.round(bx) - 2, Math.round(by) - fl, 2, 2 + fl, col); P(Math.round(bx) + 1, Math.round(by) - fl, 2, 2 + fl, col); P(Math.round(bx), Math.round(by), 1, 2, "#333");
      }
      // cahaya jendela & lampu jalan menjelang malam
      if (dsk > 0.2) {
        ctx.globalCompositeOperation = "lighter";
        const a = clamp((dsk - 0.2) / 0.5, 0, 1);
        buildings.forEach((b) => b.wins.forEach((w) => { P(w.x, w.y, w.w, w.h, "rgba(255,170,70," + (0.45 * a).toFixed(2) + ")"); P(w.x - 3, w.y - 3, w.w + 6, w.h + 6, "rgba(255,160,60," + (0.08 * a).toFixed(2) + ")"); }));
        propList.filter((o) => o.k === "lamp").forEach((o) => glow(ctx, o.i * TS + 8, (o.j + 1) * TS - 35, 34, 0.12 * a, "255,190,90"));
        if (dsk > 0.4) for (let k = 0; k < 16; k++) {
          const q = hash(k, 7, 300), fx = (q % 780) + Math.sin(t * 0.6 + k) * 18, fy = ((q >>> 10) % 500) + Math.cos(t * 0.5 + k * 2) * 14, bl = Math.sin(t * 2 + k * 1.7);
          if (bl > -0.2) { P(Math.round(fx), Math.round(fy), 1, 1, "rgba(220,255,120," + (0.5 + bl * 0.4).toFixed(2) + ")"); glow(ctx, fx, fy, 3, 0.12, "220,255,120"); }
        }
        ctx.globalCompositeOperation = "source-over";
      }
      // jemuran di gang sempit
      const lx = 17 * TS, ly = 25 * TS;
      P(lx - 2, ly - 4, 2, 20, "#6b4a2c"); P(lx + 2 * TS, ly - 4, 2, 20, "#6b4a2c");
      for (let s = 0; s < 2 * TS; s++) P(lx + s, ly + Math.round(Math.sin(s / (2 * TS) * Math.PI) * 3), 1, 1, "#444");
      [["#e0483a", 4], ["#f5ead0", 11], ["#3a8fe0", 19], ["#f0c040", 26]].forEach((cl, k) => { const sw = Math.round(Math.sin(t * 2 + k)); P(lx + cl[1], ly + Math.round(Math.sin(cl[1] / (2 * TS) * Math.PI) * 3) + 1, 5, 6 + (k % 2), cl[0]); P(lx + cl[1] + sw, ly + 6 + (k % 2), 5, 1, "rgba(0,0,0,.15)"); });
    } else {
      const m = maps[name], a = name === "home" ? 1 : 0.85, warm = dsk > 0.4 ? "255,170,90" : "255,236,170";
      if (POLISH[m.theme.name]) { ctx.fillStyle = "rgba(112,92,170,.06)"; ctx.fillRect(0, 0, m.w * TS, m.h * TS); }   // grading ungu senja
      ctx.beginPath(); ctx.rect(TS, TS, (m.w - 2) * TS, (m.h - 2) * TS); ctx.clip();   // cahaya hanya jatuh di dalam ruangan
      ctx.fillStyle = "rgba(" + warm + "," + ((dsk > 0.4 ? 0.13 : 0.09) * a + Math.sin(t * 0.8) * 0.012).toFixed(3) + ")";
      (m.windows || []).forEach((i, n) => {
        const x0 = i * TS + 3;
        if (POLISH[m.theme.name]) {
          const al = (dsk > 0.4 ? 0.13 : 0.09) * a + Math.sin(t * 0.8) * 0.012, gr = ctx.createLinearGradient(x0 + 4, 14, x0 + 36, 96);
          gr.addColorStop(0, "rgba(" + warm + "," + (al * 1.9).toFixed(3) + ")"); gr.addColorStop(1, "rgba(" + warm + ",0)"); ctx.fillStyle = gr;
        }
        ctx.beginPath(); ctx.moveTo(x0, 14); ctx.lineTo(x0 + 10, 14); ctx.lineTo(x0 + 48, 96); ctx.lineTo(x0 + 24, 96); ctx.closePath(); ctx.fill();
        for (let k = 0; k < 7; k++) {
          const q = hash(k, n, 400), ph = (t * 0.1 + (q % 100) / 100) % 1;
          P(Math.round(x0 + 4 + ph * 26 + Math.sin(t + k) * 3), Math.round(18 + ph * 70), 1, 1, "rgba(255,255,235,.55)");
        }
      });
      if (name === "home") homeLight(ctx, t, dsk);
      if (name === "home") for (let k = 0; k < 4; k++) { const ph = (t * 0.6 + k / 4) % 1; disc(ctx, 14 * TS + 8 + Math.sin(ph * 5 + k) * 2, 8 * TS + 6 - ph * 16, 1 + Math.round(ph * 2), "rgba(245,245,250," + (0.5 * (1 - ph)).toFixed(2) + ")"); }
    }
    ctx.restore();
  }

  // ---------- kendaraan ----------
  // Ukuran disesuaikan dengan sprite pemain (tinggi 38 px): sedan ~76 px, angkot ~96 px, pickup ~92 px, motor ~36 px + pengendara.
  const OUT = "#2a2038", GLASS = "#cfe8ff";
  const CAR_W = { sedan: 76, angkot: 98, truk: 92, motor: 38 };
  const CAR_H = 30;     // tinggi total dari atap sampai dasar roda (dipakai untuk urutan gambar)
  function wheel(ctx, cx, cy, r) { disc(ctx, cx, cy, r, "#1a1a20"); disc(ctx, cx, cy, Math.max(1, r - 3), "#9a9aa8"); disc(ctx, cx, cy, 1, "#55556a"); }
  function car(ctx, c, t) {
    const k = c.k || (c.angkot ? "angkot" : "sedan"), W = CAR_W[k], dir = c.v > 0 ? 1 : -1, b = Math.floor(t * 9 + c.x * 0.1) % 6 === 0 ? 1 : 0;
    ctx.save(); ctx.translate(Math.round(c.x) + (dir < 0 ? W : 0), Math.round(c.y)); ctx.scale(dir, 1);
    const P = pen(ctx), body = c.c, dk = sh(body, -45), lt = sh(body, 35);
    P(2, 27, W - 2, 4, "rgba(20,10,40,.28)");   // bayangan jalan
    if (k === "sedan") {
      P(-1, 11 - b, W + 2, 14, OUT); P(13, 0 - b, 50, 13, OUT);
      P(0, 12 - b, W, 11, body); P(0, 19 - b, W, 4, dk); P(0, 12 - b, W, 2, lt);
      P(15, 1 - b, 46, 11, body); P(15, 1 - b, 46, 1, lt);
      [18, 32, 46].forEach((x, n) => { P(x, 3 - b, 12, 8, GLASS); P(x + 1, 4 - b, 2, 3, "#fff"); });
      P(37, 5 - b, 4, 6, "#4a3a58");                                               // kepala pengemudi
      P(31, 3 - b, 1, 9, body); P(45, 3 - b, 1, 9, body); P(31, 12 - b, 1, 10, dk); P(45, 12 - b, 1, 10, dk); P(35, 15 - b, 3, 1, lt);
      P(W - 4, 14 - b, 4, 3, "#fff6b0"); P(0, 14 - b, 3, 3, "#e03030"); P(W - 3, 19 - b, 3, 4, "#c8c8d0"); P(0, 20 - b, 3, 3, "#c8c8d0");
      wheel(ctx, 15, 24, 5); wheel(ctx, W - 16, 24, 5);
    } else if (k === "angkot") {
      P(-1, 9 - b, W + 2, 17, OUT); P(7, -3 - b, W - 22, 14, OUT);
      P(0, 10 - b, W, 14, body); P(0, 20 - b, W, 4, dk); P(0, 10 - b, W, 2, lt); P(0, 16 - b, W, 2, "#f5f5f5");
      P(8, -2 - b, W - 24, 13, body); P(8, -2 - b, W - 24, 1, lt);
      for (let n = 0; n < 5; n++) { P(11 + n * 15, 0 - b, 12, 8, GLASS); P(12 + n * 15, 1 - b, 2, 3, "#fff"); }
      P(20, 2 - b, 3, 6, "#4a3a58"); P(66, 2 - b, 3, 6, "#4a3a58");               // penumpang
      P(10, -6 - b, W - 28, 2, "#6b4a2c"); P(22, -11 - b, 20, 5, "#8a5e36"); P(46, -9 - b, 12, 3, "#a8774a");   // bagasi di atap
      P(W - 4, 12 - b, 4, 3, "#fff6b0"); P(0, 12 - b, 3, 3, "#e03030"); P(W - 3, 19 - b, 3, 4, "#c8c8d0"); P(0, 20 - b, 3, 3, "#c8c8d0");
      wheel(ctx, 17, 24, 5); wheel(ctx, W - 18, 24, 5);
    } else if (k === "truk") {
      P(-1, 9 - b, W + 2, 17, OUT); P(51, -2 - b, 35, 13, OUT);
      P(0, 12 - b, W, 11, body); P(0, 19 - b, W, 4, dk); P(0, 12 - b, W, 2, lt);
      P(52, -1 - b, 31, 12, body); P(52, -1 - b, 31, 1, lt); P(56, 1 - b, 13, 8, GLASS); P(71, 1 - b, 10, 8, GLASS); P(57, 2 - b, 2, 3, "#fff"); P(60, 4 - b, 4, 5, "#4a3a58");
      P(0, 7 - b, 49, 5, dk); P(0, 7 - b, 49, 1, lt); P(4, 0 - b, 16, 8, "#b0804f"); P(4, 0 - b, 16, 1, "#d9a066"); P(24, 2 - b, 14, 6, "#9a6b3c"); P(10, 3 - b, 1, 5, "#7a5230");   // muatan
      P(W - 4, 14 - b, 4, 3, "#fff6b0"); P(0, 14 - b, 3, 3, "#e03030"); P(W - 3, 19 - b, 3, 4, "#c8c8d0");
      wheel(ctx, 15, 24, 5); wheel(ctx, W - 15, 24, 5);
    } else {   // motor + pengendara (setinggi pemain)
      const shirt = sh(body, 0), skin = "#f0c8a0";
      P(11, -7 - b, 12, 9, OUT); P(12, -6 - b, 10, 7, "#e8c25a");               // helm
      disc(ctx, 18, -1 - b, 4, skin); P(18, -3 - b, 5, 3, "#2a2038");            // wajah + visor
      P(11, 3 - b, 11, 13, OUT); P(12, 4 - b, 9, 11, shirt); P(12, 4 - b, 9, 2, sh(shirt, 30)); P(12, 12 - b, 9, 3, dk);
      P(20, 7 - b, 10, 3, OUT); P(21, 7 - b, 9, 2, shirt); P(29, 7 - b, 2, 2, skin);   // lengan ke setang
      P(14, 15 - b, 8, 6, "#3a4a6e"); P(21, 17 - b, 3, 5, "#3a4a6e");               // kaki
      P(5, 18 - b, W - 14, 4, OUT); P(6, 19 - b, W - 16, 2, body); P(W - 14, 14 - b, 8, 8, OUT); P(W - 13, 15 - b, 6, 6, body);
      P(9, 16 - b, 12, 3, "#222"); P(W - 10, 11 - b, 2, 13, "#999"); P(W - 12, 10 - b, 6, 2, "#333");
      P(W - 5, 16 - b, 3, 3, "#fff6b0"); P(1, 17 - b, 2, 2, "#e03030");
      wheel(ctx, 7, 25, 5); wheel(ctx, W - 7, 25, 5);
    }
    ctx.restore();
  }

  function districtName(px, py) {
    const x = px / TS, y = py / TS;
    if (x >= 150 && y >= 80) return "Distrik Malam";
    if (x >= 150 && y < 80) return "Distrik Elit";
    if (y >= 80 && x < 100) return "Distrik Pinggiran";
    if (x >= 100 && y >= 55 && y < 80) return "Pusat Kota";
    if (x >= 100 && y >= 80) return "Pusat Kota";
    return "Kampung Senja";
  }
  return { TS, T, SOLID, maps, doors, props, buildings, under, sortables, over, car, CAR_H, CAR_W, tint, dusk, vignette, roomName, districtName, school: { entranceX: SCHOOL_ENTRANCE_X, width: SW, gymX: GYM_X, canteenX: CANTEEN_X, yardY: YARD_Y } };
})();
